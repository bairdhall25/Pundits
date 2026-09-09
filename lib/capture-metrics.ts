import { isMapped } from "./data";
import { parsePublicationInstant } from "./publication";
import type { Call, Event } from "./types";

export type CaptureTargetRow = {
  id: string;
  state: string;
  eventSlug?: string | null;
  kickoffDate?: string;
  kickoff?: string;
  away?: string;
  home?: string;
  sport?: string;
};

export type UnavailableMetric = {
  value: "n/a";
  reason: string;
};

export type LeadTimeMetric = {
  value: number;
  sample: number;
  unit: "hours";
  precision: "date-only" | "datetime" | "mixed";
  note: string;
};

export type TargetCoverage = {
  id: string;
  state: string;
  eventSlug: string | null;
  mappedHard: number;
  yes: number;
  no: number;
  bothSides: boolean;
  emptySides: string[];
  missingLocators: number;
};

export type CaptureMetrics = {
  asOf: string;
  approvedTargets: number;
  proposedTargets: number;
  mappedHardOnApproved: number;
  picksPerSourceHour: UnavailableMetric | { value: number; sourceHours: number };
  sourceToLive: UnavailableMetric | LeadTimeMetric;
  preKickoffLead: UnavailableMetric | LeadTimeMetric;
  rework: UnavailableMetric;
  missingLocators: { callId: string; eventSlug: string }[];
  coverage: TargetCoverage[];
};

function mappedHardFor(eventSlug: string, calls: Call[]): Call[] {
  return calls.filter(
    (call) => call.kind === "hard" && isMapped(call) && call.eventSlug === eventSlug
  );
}

function hasLocator(call: Call): boolean {
  const locator = call.sourceLocator;
  if (!locator) return false;
  return Boolean(locator.timestamp || locator.section || locator.transcriptUrl);
}

function isDateOnlyStamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function hoursBetween(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / 3_600_000;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

type LeadPrecision = LeadTimeMetric["precision"];
type LeadSample = { hours: number; precision: LeadPrecision };

function pairPrecision(left: string, right: string): LeadPrecision {
  const leftDateOnly = isDateOnlyStamp(left);
  const rightDateOnly = isDateOnlyStamp(right);
  if (leftDateOnly && rightDateOnly) return "date-only";
  if (!leftDateOnly && !rightDateOnly) return "datetime";
  return "mixed";
}

function summarizeLead(samples: LeadSample[], missingReason: string): UnavailableMetric | LeadTimeMetric {
  if (samples.length === 0) {
    return { value: "n/a", reason: missingReason };
  }
  const dateOnlyCount = samples.filter((sample) => sample.precision === "date-only").length;
  const datetimeCount = samples.filter((sample) => sample.precision === "datetime").length;
  const precision: LeadPrecision =
    dateOnlyCount === samples.length ? "date-only" : datetimeCount === samples.length ? "datetime" : "mixed";
  const note =
    precision === "datetime"
      ? "Computed from stored datetimes."
      : precision === "mixed"
        ? "Some stamps are date-only (UTC day start); hours are not minute-precise for those rows."
        : "Date-only stamps use UTC day start; hours are 24-hour multiples.";
  return {
    value: Math.round(median(samples.map((sample) => sample.hours)) * 10) / 10,
    sample: samples.length,
    unit: "hours",
    precision,
    note,
  };
}

export function captureMetrics(input: {
  calls: Call[];
  events: Event[];
  targets: CaptureTargetRow[];
  sourceHours?: number | null;
  asOf?: string;
}): CaptureMetrics {
  const asOf = input.asOf ?? "unknown";
  const approved = input.targets.filter((target) => target.state === "approved");
  const proposed = input.targets.filter((target) => target.state === "proposed");
  const coverage: TargetCoverage[] = approved.map((target) => {
    const eventSlug = target.eventSlug ?? null;
    const mapped = eventSlug ? mappedHardFor(eventSlug, input.calls) : [];
    const yes = mapped.filter((call) => call.side === "yes").length;
    const no = mapped.filter((call) => call.side === "no").length;
    const emptySides: string[] = [];
    if (eventSlug && yes === 0) emptySides.push("yes");
    if (eventSlug && no === 0) emptySides.push("no");
    return {
      id: target.id,
      state: target.state,
      eventSlug,
      mappedHard: mapped.length,
      yes,
      no,
      bothSides: yes > 0 && no > 0,
      emptySides,
      missingLocators: mapped.filter((call) => !hasLocator(call)).length,
    };
  });

  const approvedMapped = coverage.flatMap((row) =>
    row.eventSlug ? mappedHardFor(row.eventSlug, input.calls) : []
  );
  const missingLocators = approvedMapped
    .filter((call) => !hasLocator(call) && call.eventSlug)
    .map((call) => ({ callId: call.id, eventSlug: call.eventSlug as string }));

  const anyFirstPublished = approvedMapped.some((call) => Boolean(call.firstPublishedAt?.trim()));
  const eventsBySlug = new Map(input.events.map((event) => [event.slug, event]));
  const sourceToLiveSamples: LeadSample[] = [];
  const preKickoffSamples: LeadSample[] = [];
  for (const call of approvedMapped) {
    const publishedRaw = call.firstPublishedAt?.trim();
    const published = parsePublicationInstant(publishedRaw);
    if (!published || !publishedRaw) continue;
    const sourceRaw = call.sourceDate?.trim();
    const source = parsePublicationInstant(sourceRaw);
    if (source && sourceRaw) {
      sourceToLiveSamples.push({
        hours: hoursBetween(published, source),
        precision: pairPrecision(publishedRaw, sourceRaw),
      });
    }
    const event = call.eventSlug ? eventsBySlug.get(call.eventSlug) : undefined;
    const kickoffRaw = event?.kickoffDate?.trim();
    const kickoff = parsePublicationInstant(kickoffRaw);
    if (kickoff && kickoffRaw) {
      preKickoffSamples.push({
        hours: hoursBetween(kickoff, published),
        precision: pairPrecision(publishedRaw, kickoffRaw),
      });
    }
  }

  const sourceHours = input.sourceHours;
  const picksPerSourceHour =
    sourceHours == null || !(sourceHours > 0)
      ? {
          value: "n/a" as const,
          reason:
            "No measured source-hours in this window. Duration is not inferred from a run file existing.",
        }
      : { value: approvedMapped.length / sourceHours, sourceHours };

  return {
    asOf,
    approvedTargets: approved.length,
    proposedTargets: proposed.length,
    mappedHardOnApproved: approvedMapped.length,
    picksPerSourceHour,
    sourceToLive: summarizeLead(
      sourceToLiveSamples,
      anyFirstPublished
        ? "Lead-time hours need both firstPublishedAt and a comparable source timestamp; do not backfill either."
        : "firstPublishedAt is absent on approved-target rows. sourceDate is not a live-publication time."
    ),
    preKickoffLead: summarizeLead(
      preKickoffSamples,
      anyFirstPublished
        ? "Pre-kickoff lead needs firstPublishedAt and event kickoffDate. Display kickoff strings and sourceDate are not used."
        : "Pre-kickoff lead needs firstPublishedAt and kickoff. Unknown publication time is not treated as on-time."
    ),
    rework: {
      value: "n/a",
      reason:
        "Rework is not a calls.json field. Count Audit restage/correction rows in the week's run files; missing notes are not zero rework.",
    },
    missingLocators,
    coverage,
  };
}

export function formatUnavailable(
  metric: UnavailableMetric | LeadTimeMetric | { value: number }
): string {
  if (typeof metric.value !== "number") return `n/a (${metric.reason})`;
  if ("unit" in metric && metric.unit === "hours") {
    return `${metric.value} hours (median of ${metric.sample}; ${metric.precision})`;
  }
  return String(metric.value);
}
