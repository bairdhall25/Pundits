import { isMapped } from "./data";
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
  sourceToLive: UnavailableMetric;
  preKickoffLead: UnavailableMetric;
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

  const livePublished = approvedMapped.filter((call) => Boolean(call.firstPublishedAt?.trim()));
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
    sourceToLive:
      livePublished.length === 0
        ? {
            value: "n/a",
            reason:
              "firstPublishedAt is absent on approved-target rows. sourceDate is not a live-publication time.",
          }
        : {
            value: "n/a",
            reason:
              "Lead-time hours need both firstPublishedAt and a comparable source timestamp; do not backfill either.",
          },
    preKickoffLead:
      livePublished.length === 0
        ? {
            value: "n/a",
            reason:
              "Pre-kickoff lead needs firstPublishedAt and kickoff. Unknown publication time is not treated as on-time.",
          }
        : {
            value: "n/a",
            reason: "Pre-kickoff lead is not computed from sourceDate.",
          },
    rework: {
      value: "n/a",
      reason:
        "Rework is not a calls.json field. Count Audit restage/correction rows in the week's run files; missing notes are not zero rework.",
    },
    missingLocators,
    coverage,
  };
}

export function formatUnavailable(metric: UnavailableMetric | { value: number }): string {
  if (typeof metric.value === "number") return String(metric.value);
  return `n/a (${metric.reason})`;
}
