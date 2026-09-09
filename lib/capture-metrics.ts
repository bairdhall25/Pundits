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

export type ReportingInterval = {
  start: string;
  end: string;
};

export type UnavailableMetric = {
  value: "n/a";
  reason: string;
  sample?: number;
  excluded?: number;
};

export type LeadTimeMetric = {
  value: number;
  sample: number;
  excluded: number;
  unit: "hours";
  precision: "datetime";
  note: string;
};

export type ProductivityMetric = {
  value: number;
  sourceHours: number;
  promoted: number;
  interval: ReportingInterval;
};

export type CountMetric = {
  value: number;
  callIds: string[];
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
  unpublished: boolean;
};

export type CaptureProductivityInput = {
  interval?: ReportingInterval | null;
  sourceHours?: number | null;
  evidence?: string[];
  runIds?: string[];
};

export type CaptureMetrics = {
  asOf: string;
  interval: ReportingInterval | UnavailableMetric;
  measuredSourceHours: number | UnavailableMetric;
  newlyPromotedMapped: CountMetric | UnavailableMetric;
  approvedTargets: number;
  proposedTargets: number;
  mappedHardOnApproved: number;
  picksPerSourceHour: UnavailableMetric | ProductivityMetric;
  sourceToLive: UnavailableMetric | LeadTimeMetric;
  preKickoffLead: UnavailableMetric | LeadTimeMetric;
  rework: UnavailableMetric;
  missingLocators: { callId: string; eventSlug: string }[];
  coverage: TargetCoverage[];
  evidence: string[];
  runIds: string[];
};

/** ISO datetime with an explicit Z or numeric offset. Date-only and zone-less stamps are not instants. */
const PRECISE_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;

const MISSING_INTERVAL_REASON =
  "No timezone-qualified [start, end) interval. asOf is a label, not a measurement window.";
const INVALID_INTERVAL_REASON =
  "Interval start/end must be timezone-qualified instants with start < end.";
const MISSING_HOURS_REASON =
  "No measured source-hours in this window. Duration is not inferred from a run file existing, episode runtime, or elapsed wall-clock time.";
const INVALID_HOURS_REASON =
  "sourceHours must be a positive finite number. Zero or invalid effort cannot produce a rate.";
const INCOMPATIBLE_SCOPE_REASON =
  "Measured source-hours exceed the reporting interval; scopes are incompatible.";
const UNCERTAIN_NUMERATOR_REASON =
  "Numerator is uncertain: publication timestamps are missing or imprecise within the interval. Do not backfill publication times.";

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

function uniqueCalls(calls: Call[]): Call[] {
  const seen = new Set<string>();
  const unique: Call[] = [];
  for (const call of calls) {
    if (seen.has(call.id)) continue;
    seen.add(call.id);
    unique.push(call);
  }
  return unique;
}

function hoursBetween(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / 3_600_000;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function parsePreciseInstant(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!PRECISE_INSTANT.test(trimmed)) return null;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

function datePrefix(value: string): string | null {
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
  return match?.[1] ?? null;
}

function utcDayRange(day: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const start = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;
  if (start.toISOString().slice(0, 10) !== day) return null;
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

function dayOverlapsInterval(day: string, start: Date, end: Date): boolean {
  const range = utcDayRange(day);
  if (!range) return true;
  return range.start < end && start < range.end;
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

export function parseCaptureProductivityInput(raw: unknown): CaptureProductivityInput {
  if (raw == null || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  const nested = record.interval;
  let interval: ReportingInterval | undefined;
  if (nested && typeof nested === "object") {
    const start = (nested as Record<string, unknown>).start;
    const end = (nested as Record<string, unknown>).end;
    if (typeof start === "string" && typeof end === "string") {
      interval = { start, end };
    }
  } else if (typeof record.start === "string" && typeof record.end === "string") {
    interval = { start: record.start, end: record.end };
  }
  let sourceHours: number | null | undefined;
  if (record.sourceHours === null) {
    sourceHours = null;
  } else if (typeof record.sourceHours === "number") {
    sourceHours = record.sourceHours;
  } else if (typeof record.sourceHours === "string" && record.sourceHours !== "") {
    sourceHours = Number(record.sourceHours);
  }
  return {
    interval,
    sourceHours,
    evidence: stringList(record.evidence),
    runIds: stringList(record.runIds),
  };
}

function resolveInterval(
  interval?: { start?: string | null; end?: string | null } | null
):
  | { ok: true; start: Date; end: Date; value: ReportingInterval }
  | { ok: false; reason: string } {
  if (interval == null || (interval.start == null && interval.end == null)) {
    return { ok: false, reason: MISSING_INTERVAL_REASON };
  }
  const startRaw = interval.start?.trim() ?? "";
  const endRaw = interval.end?.trim() ?? "";
  if (!startRaw && !endRaw) {
    return { ok: false, reason: MISSING_INTERVAL_REASON };
  }
  const start = parsePreciseInstant(startRaw);
  const end = parsePreciseInstant(endRaw);
  if (!start || !end || !(start.getTime() < end.getTime())) {
    return { ok: false, reason: INVALID_INTERVAL_REASON };
  }
  return { ok: true, start, end, value: { start: startRaw, end: endRaw } };
}

function resolveSourceHours(
  sourceHours: number | null | undefined
): { ok: true; hours: number } | { ok: false; reason: string } {
  if (sourceHours == null) {
    return { ok: false, reason: MISSING_HOURS_REASON };
  }
  if (typeof sourceHours !== "number" || !Number.isFinite(sourceHours) || sourceHours <= 0) {
    return { ok: false, reason: INVALID_HOURS_REASON };
  }
  return { ok: true, hours: sourceHours };
}

function promotedInInterval(
  calls: Call[],
  start: Date,
  end: Date
): { ok: true; callIds: string[] } | { ok: false; reason: string } {
  const callIds: string[] = [];
  for (const call of calls) {
    const raw = call.firstPublishedAt?.trim();
    if (!raw) return { ok: false, reason: UNCERTAIN_NUMERATOR_REASON };
    const precise = parsePreciseInstant(raw);
    if (precise) {
      if (precise.getTime() >= start.getTime() && precise.getTime() < end.getTime()) {
        callIds.push(call.id);
      }
      continue;
    }
    const day = datePrefix(raw);
    if (day && !dayOverlapsInterval(day, start, end)) continue;
    return { ok: false, reason: UNCERTAIN_NUMERATOR_REASON };
  }
  return { ok: true, callIds };
}

function summarizeExclusionReasons(excluded: string[]): string {
  const counts = new Map<string, number>();
  for (const reason of excluded) {
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return [...counts.entries()].map(([reason, count]) => `${count} ${reason}`).join("; ");
}

function summarizeLead(
  samples: number[],
  excluded: string[],
  missingReason: string
): UnavailableMetric | LeadTimeMetric {
  if (samples.length === 0) {
    const extra =
      excluded.length > 0
        ? ` Excluded ${excluded.length}: ${summarizeExclusionReasons(excluded)}. Date-only stamps are not parsed as midnight.`
        : "";
    return {
      value: "n/a",
      reason: `${missingReason}${extra}`,
      sample: 0,
      excluded: excluded.length,
    };
  }
  return {
    value: Math.round(median(samples) * 10) / 10,
    sample: samples.length,
    excluded: excluded.length,
    unit: "hours",
    precision: "datetime",
    note:
      excluded.length > 0
        ? `Hour-level median uses timezone-qualified instants only. Excluded ${excluded.length}: ${summarizeExclusionReasons(excluded)}. Date-only stamps are not parsed as midnight.`
        : "Computed from timezone-qualified instants.",
  };
}

function collectSourceToLive(calls: Call[]): { samples: number[]; excluded: string[] } {
  const samples: number[] = [];
  const excluded: string[] = [];
  for (const call of calls) {
    const publishedRaw = call.firstPublishedAt?.trim();
    const sourceRaw = call.sourceDate?.trim();
    if (!publishedRaw) {
      excluded.push("missing endpoint");
      continue;
    }
    if (!sourceRaw) {
      excluded.push("missing endpoint");
      continue;
    }
    const published = parsePreciseInstant(publishedRaw);
    const source = parsePreciseInstant(sourceRaw);
    if (!published || !source) {
      excluded.push("date-only or missing timezone");
      continue;
    }
    const hours = hoursBetween(published, source);
    if (hours < 0) {
      excluded.push("inconsistent source-to-live (negative)");
      continue;
    }
    samples.push(hours);
  }
  return { samples, excluded };
}

function collectPreKickoff(
  calls: Call[],
  eventsBySlug: Map<string, Event>
): { samples: number[]; excluded: string[] } {
  const samples: number[] = [];
  const excluded: string[] = [];
  for (const call of calls) {
    const publishedRaw = call.firstPublishedAt?.trim();
    if (!publishedRaw) {
      excluded.push("missing endpoint");
      continue;
    }
    const event = call.eventSlug ? eventsBySlug.get(call.eventSlug) : undefined;
    const kickoffRaw = event?.kickoffDate?.trim();
    if (!kickoffRaw) {
      excluded.push("missing endpoint");
      continue;
    }
    const published = parsePreciseInstant(publishedRaw);
    const kickoff = parsePreciseInstant(kickoffRaw);
    if (!published || !kickoff) {
      excluded.push("date-only or missing timezone");
      continue;
    }
    samples.push(hoursBetween(kickoff, published));
  }
  return { samples, excluded };
}

export function captureMetrics(input: {
  calls: Call[];
  events: Event[];
  targets: CaptureTargetRow[];
  sourceHours?: number | null;
  asOf?: string;
  interval?: { start?: string | null; end?: string | null } | null;
  evidence?: string[];
  runIds?: string[];
}): CaptureMetrics {
  const asOf = input.asOf ?? "unknown";
  const evidence = input.evidence ?? [];
  const runIds = input.runIds ?? [];
  const approved = input.targets.filter((target) => target.state === "approved");
  const proposed = input.targets.filter((target) => target.state === "proposed");
  const coverage: TargetCoverage[] = approved.map((target) => {
    const eventSlug = target.eventSlug ?? null;
    const unpublished = !eventSlug;
    const mapped = eventSlug ? uniqueCalls(mappedHardFor(eventSlug, input.calls)) : [];
    const yes = mapped.filter((call) => call.side === "yes").length;
    const no = mapped.filter((call) => call.side === "no").length;
    const emptySides: string[] = [];
    if (!unpublished && yes === 0) emptySides.push("yes");
    if (!unpublished && no === 0) emptySides.push("no");
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
      unpublished,
    };
  });

  const approvedMapped = uniqueCalls(
    coverage.flatMap((row) => (row.eventSlug ? mappedHardFor(row.eventSlug, input.calls) : []))
  );
  const missingLocators = approvedMapped
    .filter((call) => !hasLocator(call) && call.eventSlug)
    .map((call) => ({ callId: call.id, eventSlug: call.eventSlug as string }));

  const anyFirstPublished = approvedMapped.some((call) => Boolean(call.firstPublishedAt?.trim()));
  const eventsBySlug = new Map(input.events.map((event) => [event.slug, event]));
  const sourceToLive = collectSourceToLive(approvedMapped);
  const preKickoff = collectPreKickoff(approvedMapped, eventsBySlug);

  const resolvedInterval = resolveInterval(input.interval);
  const resolvedHours = resolveSourceHours(input.sourceHours);
  const interval: ReportingInterval | UnavailableMetric = resolvedInterval.ok
    ? resolvedInterval.value
    : { value: "n/a", reason: resolvedInterval.reason };
  const measuredSourceHours: number | UnavailableMetric = resolvedHours.ok
    ? resolvedHours.hours
    : { value: "n/a", reason: resolvedHours.reason };

  let newlyPromotedMapped: CountMetric | UnavailableMetric;
  if (!resolvedInterval.ok) {
    newlyPromotedMapped = { value: "n/a", reason: resolvedInterval.reason };
  } else {
    const promoted = promotedInInterval(approvedMapped, resolvedInterval.start, resolvedInterval.end);
    newlyPromotedMapped = promoted.ok
      ? { value: promoted.callIds.length, callIds: promoted.callIds }
      : { value: "n/a", reason: promoted.reason };
  }

  let picksPerSourceHour: UnavailableMetric | ProductivityMetric;
  if (!resolvedInterval.ok) {
    picksPerSourceHour = { value: "n/a", reason: resolvedInterval.reason };
  } else if (newlyPromotedMapped.value === "n/a") {
    picksPerSourceHour = { value: "n/a", reason: newlyPromotedMapped.reason };
  } else if (!resolvedHours.ok) {
    picksPerSourceHour = { value: "n/a", reason: resolvedHours.reason };
  } else {
    const intervalHours = hoursBetween(resolvedInterval.end, resolvedInterval.start);
    if (resolvedHours.hours > intervalHours + 1e-9) {
      picksPerSourceHour = { value: "n/a", reason: INCOMPATIBLE_SCOPE_REASON };
    } else {
      picksPerSourceHour = {
        value: newlyPromotedMapped.value / resolvedHours.hours,
        sourceHours: resolvedHours.hours,
        promoted: newlyPromotedMapped.value,
        interval: resolvedInterval.value,
      };
    }
  }

  return {
    asOf,
    interval,
    measuredSourceHours,
    newlyPromotedMapped,
    approvedTargets: approved.length,
    proposedTargets: proposed.length,
    mappedHardOnApproved: approvedMapped.length,
    picksPerSourceHour,
    sourceToLive: summarizeLead(
      sourceToLive.samples,
      sourceToLive.excluded,
      anyFirstPublished
        ? "Lead-time hours need both firstPublishedAt and a comparable source timestamp with explicit timezone/offset; do not backfill either."
        : "firstPublishedAt is absent on approved-target rows. sourceDate is not a live-publication time."
    ),
    preKickoffLead: summarizeLead(
      preKickoff.samples,
      preKickoff.excluded,
      anyFirstPublished
        ? "Pre-kickoff lead needs firstPublishedAt and a timezone-qualified kickoff instant. Display kickoff strings, date-only kickoffDate, and sourceDate are not used."
        : "Pre-kickoff lead needs firstPublishedAt and kickoff. Unknown publication time is not treated as on-time."
    ),
    rework: {
      value: "n/a",
      reason:
        "Rework is not a calls.json field. Count Audit restage/correction rows in the week's run files; missing notes are not zero rework.",
    },
    missingLocators,
    coverage,
    evidence,
    runIds,
  };
}

export function formatCoverageEmpty(row: Pick<TargetCoverage, "eventSlug" | "emptySides" | "unpublished">): string {
  if (row.unpublished || !row.eventSlug) return "unpublished; no mapped coverage";
  return row.emptySides.join(",") || "none";
}

export function formatUnavailable(
  metric: UnavailableMetric | LeadTimeMetric | ProductivityMetric | CountMetric | { value: number }
): string {
  if (typeof metric.value !== "number") return `n/a (${metric.reason})`;
  if ("unit" in metric && metric.unit === "hours") {
    return `${metric.value} hours (median of ${metric.sample} precise; ${metric.excluded} excluded)`;
  }
  if ("promoted" in metric && "sourceHours" in metric && "interval" in metric) {
    return `${metric.value} (${metric.promoted} newly promoted / ${metric.sourceHours}h; [${metric.interval.start}, ${metric.interval.end}))`;
  }
  return String(metric.value);
}

function formatInterval(interval: ReportingInterval | UnavailableMetric): string {
  if ("value" in interval) return formatUnavailable(interval);
  return `[${interval.start}, ${interval.end})`;
}

function formatHours(hours: number | UnavailableMetric): string {
  return typeof hours === "number" ? String(hours) : formatUnavailable(hours);
}

export function formatCaptureReport(metrics: CaptureMetrics): string {
  const lines = [
    "# Capture metrics",
    "",
    `asOf: ${metrics.asOf}`,
    `Interval: ${formatInterval(metrics.interval)}`,
    `Measured source-hours: ${formatHours(metrics.measuredSourceHours)}`,
    `Newly promoted mapped picks: ${formatUnavailable(metrics.newlyPromotedMapped)}`,
    `Approved targets: ${metrics.approvedTargets}`,
    `Proposed targets (not hunted as a board): ${metrics.proposedTargets}`,
    `Mapped hard picks on approved targets: ${metrics.mappedHardOnApproved}`,
    `Picks per source-hour: ${formatUnavailable(metrics.picksPerSourceHour)}`,
    `Source-to-live: ${formatUnavailable(metrics.sourceToLive)}`,
    `Pre-kickoff lead: ${formatUnavailable(metrics.preKickoffLead)}`,
    `Rework: ${formatUnavailable(metrics.rework)}`,
    `Missing locators: ${metrics.missingLocators.length}`,
  ];
  if (metrics.evidence.length) {
    lines.push(`Evidence (labels only; hours are not inferred): ${metrics.evidence.join(", ")}`);
  }
  if (metrics.runIds.length) {
    lines.push(`Run IDs (labels only; hours are not inferred): ${metrics.runIds.join(", ")}`);
  }
  lines.push("");
  lines.push("| target | eventSlug | mapped | yes | no | both sides | empty | missing locators |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const row of metrics.coverage) {
    lines.push(
      `| ${row.id} | ${row.eventSlug ?? "n/a"} | ${row.mappedHard} | ${row.yes} | ${row.no} | ${row.bothSides ? "yes" : "no"} | ${formatCoverageEmpty(row)} | ${row.missingLocators} |`
    );
  }
  return lines.join("\n");
}
