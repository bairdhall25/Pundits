import { describe, expect, it } from "vitest";
import {
  captureMetrics,
  formatCaptureReport,
  formatCoverageEmpty,
  formatUnavailable,
  parseCaptureProductivityInput,
} from "./capture-metrics";
import { fixtureGame, fixturePick } from "./test-fixtures";

const interval = {
  start: "2026-09-09T12:00:00Z",
  end: "2026-09-09T16:00:00Z",
};

function approvedTarget(id: string, eventSlug: string | null) {
  return { id, state: "approved" as const, eventSlug };
}

describe("capture metrics", () => {
  it("keeps unknown publication unavailable without confusing it with an empty window", () => {
    const event = fixtureGame("fixture-2026");
    const base = { events: [event], targets: [approvedTarget("target", event.slug)], interval, sourceHours: 2 };
    const known = fixturePick({ id: "known", punditId: "brandt", side: "yes", eventSlug: event.slug, firstPublishedAt: "2026-09-09T13:00:00Z" });
    for (const firstPublishedAt of [undefined, "", "  "]) {
      const unknown = fixturePick({ id: "unknown", punditId: "cowherd", side: "no", eventSlug: event.slug, firstPublishedAt });
      for (const calls of [[unknown], [known, unknown]]) {
        const metrics = captureMetrics({ ...base, calls });
        expect(metrics.picksPerSourceHour.value).toBe("n/a");
        expect(metrics.newlyPromotedMapped.value).toBe("n/a");
      }
      const metrics = captureMetrics({ ...base, calls: [unknown] });
      expect(metrics.sourceToLive).toMatchObject({ value: "n/a", excluded: 1 });
      expect(metrics.preKickoffLead).toMatchObject({ value: "n/a", excluded: 1 });
    }
    expect(captureMetrics({ ...base, calls: [] }).picksPerSourceHour).toMatchObject({ value: 0, promoted: 0 });
  });
  it("does not invent efficiency or lead time when duration and firstPublishedAt are missing", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      awayTeam: "Patriots",
      homeTeam: "Seahawks",
      kickoffDate: "2026-09-09",
    });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
        }),
      ],
      events: [event],
      targets: [
        {
          id: "nfl-w1-patriots-at-seahawks",
          state: "approved",
          eventSlug: event.slug,
          kickoffDate: "2026-09-09",
        },
      ],
      asOf: "2026-09-08",
    });
    expect(metrics.mappedHardOnApproved).toBe(1);
    expect(metrics.coverage[0]?.emptySides).toEqual(["yes"]);
    expect(metrics.picksPerSourceHour.value).toBe("n/a");
    expect(metrics.sourceToLive.value).toBe("n/a");
    expect(metrics.preKickoffLead.value).toBe("n/a");
    expect(metrics.rework.value).toBe("n/a");
    expect(metrics.missingLocators).toHaveLength(1);
  });

  it("keeps coverage inventory separate from period productivity when only hours are supplied", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({ eventSlug: event.slug, punditId: "brandt", side: "yes" }),
        fixturePick({ eventSlug: event.slug, punditId: "eisen", side: "no" }),
      ],
      events: [event],
      targets: [{ id: "rams", state: "approved", eventSlug: event.slug }],
      sourceHours: 2,
    });
    expect(metrics.mappedHardOnApproved).toBe(2);
    expect(metrics.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(metrics.picksPerSourceHour)).toMatch(/interval/i);
  });

  it("counts approved-target coverage from fixtures", () => {
    const patriots = fixtureGame("patriots-at-seahawks-2026", { kickoffDate: "2026-09-09" });
    const rams = fixtureGame("49ers-vs-rams-2026", { kickoffDate: "2026-09-10" });
    const bills = fixtureGame("bills-at-texans-2026", { kickoffDate: "2026-09-13" });
    const metrics = captureMetrics({
      calls: [
        fixturePick({ eventSlug: patriots.slug, punditId: "cowherd", side: "no" }),
        fixturePick({ eventSlug: rams.slug, punditId: "brandt", side: "yes" }),
        fixturePick({ eventSlug: rams.slug, punditId: "eisen", side: "no" }),
        fixturePick({ eventSlug: bills.slug, punditId: "herd", side: "no" }),
        fixturePick({ eventSlug: "ignored-2026", punditId: "eisen", side: "yes" }),
      ],
      events: [patriots, rams, bills],
      targets: [
        { id: "pats", state: "approved", eventSlug: patriots.slug },
        { id: "rams", state: "approved", eventSlug: rams.slug },
        { id: "bills", state: "approved", eventSlug: bills.slug },
        { id: "proposed", state: "proposed", eventSlug: "ignored-2026" },
      ],
    });
    const byId = Object.fromEntries(metrics.coverage.map((row) => [row.id, row]));
    expect(metrics.approvedTargets).toBe(3);
    expect(metrics.proposedTargets).toBe(1);
    expect(byId.pats?.mappedHard).toBe(1);
    expect(byId.pats?.emptySides).toEqual(["yes"]);
    expect(byId.rams?.mappedHard).toBe(2);
    expect(byId.rams?.bothSides).toBe(true);
    expect(byId.bills?.mappedHard).toBe(1);
    expect(byId.bills?.emptySides).toEqual(["yes"]);
    expect(metrics.mappedHardOnApproved).toBe(4);
    expect(metrics.coverage.find((row) => row.id === "proposed")).toBeUndefined();
    expect(formatCoverageEmpty(byId.rams!)).toBe("none");
    expect(formatCoverageEmpty(byId.pats!)).toBe("yes");
  });

  it("labels unpublished approved targets instead of empty=none", () => {
    const metrics = captureMetrics({
      calls: [],
      events: [],
      targets: [
        { id: "ncaaf-w2-oklahoma-at-michigan", state: "approved", eventSlug: null },
        { id: "ncaaf-w2-ohio-state-at-texas", state: "approved" },
      ],
    });
    expect(metrics.coverage).toHaveLength(2);
    for (const row of metrics.coverage) {
      expect(row.unpublished).toBe(true);
      expect(row.eventSlug).toBeNull();
      expect(row.mappedHard).toBe(0);
      expect(row.bothSides).toBe(false);
      expect(formatCoverageEmpty(row)).toBe("unpublished; no mapped coverage");
      expect(formatCoverageEmpty(row)).not.toBe("none");
    }
    const report = formatCaptureReport(metrics);
    expect(report).toContain("unpublished; no mapped coverage");
    expect(report).not.toMatch(/\|\s*n\/a\s*\|\s*0\s*\|\s*0\s*\|\s*0\s*\|\s*no\s*\|\s*none\s*\|/);
  });

  it("keeps n/a when a required timestamp is absent and never uses sourceDate as first publication", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09T20:00:00Z",
      kickoff: "Wed 8:20 ET",
    });
    const publishedWithoutKickoff = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01T00:00:00Z",
          firstPublishedAt: "2026-09-08T12:00:00Z",
        }),
      ],
      events: [],
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(publishedWithoutKickoff.sourceToLive).toMatchObject({
      value: 180,
      unit: "hours",
      sample: 1,
      precision: "datetime",
    });
    expect(publishedWithoutKickoff.preKickoffLead.value).toBe("n/a");

    const displayKickoffOnly = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01T00:00:00Z",
          firstPublishedAt: "2026-09-08T12:00:00Z",
        }),
      ],
      events: [{ ...event, kickoffDate: undefined, kickoff: "Wed 8:20 ET" }],
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(displayKickoffOnly.preKickoffLead.value).toBe("n/a");

    const sourceDateOnly = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01",
        }),
      ],
      events: [event],
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(sourceDateOnly.sourceToLive.value).toBe("n/a");
    expect(sourceDateOnly.preKickoffLead.value).toBe("n/a");
  });
});

describe("period productivity", () => {
  it("excludes a historical pick from a new interval's numerator", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-08T18:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 2,
    });
    expect(metrics.mappedHardOnApproved).toBe(1);
    expect(metrics.newlyPromotedMapped).toEqual({ value: 0, callIds: [] });
    expect(metrics.picksPerSourceHour).toMatchObject({
      value: 0,
      sourceHours: 2,
      promoted: 0,
      interval,
    });
  });

  it("yields 0.5 for two new qualifying picks over four measured hours", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-09T12:00:00Z",
        }),
        fixturePick({
          eventSlug: event.slug,
          punditId: "eisen",
          side: "no",
          firstPublishedAt: "2026-09-09T15:59:59Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 4,
    });
    expect(metrics.picksPerSourceHour).toMatchObject({
      value: 0.5,
      sourceHours: 4,
      promoted: 2,
      interval,
    });
    expect(metrics.newlyPromotedMapped).toMatchObject({ value: 2 });
    const report = formatCaptureReport(metrics);
    expect(report).toContain("[2026-09-09T12:00:00Z, 2026-09-09T16:00:00Z)");
    expect(report).toContain("Newly promoted mapped picks: 2");
    expect(report).toContain("Measured source-hours: 4");
    expect(report).toMatch(/Picks per source-hour: 0\.5\b/);
  });

  it("does not inflate the numerator when duplicate targets share a call", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const pick = fixturePick({
      eventSlug: event.slug,
      punditId: "brandt",
      side: "yes",
      firstPublishedAt: "2026-09-09T13:00:00Z",
    });
    const metrics = captureMetrics({
      calls: [pick, pick],
      events: [event],
      targets: [
        approvedTarget("rams", event.slug),
        approvedTarget("rams-repeat", event.slug),
      ],
      interval,
      sourceHours: 4,
    });
    expect(metrics.newlyPromotedMapped).toMatchObject({ value: 1 });
    expect(metrics.picksPerSourceHour).toMatchObject({ value: 0.25, promoted: 1, sourceHours: 4 });
    expect(metrics.mappedHardOnApproved).toBe(1);
  });

  it("reports 0 for a complete interval with positive effort and zero qualifying promotions", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-08T12:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 4,
    });
    expect(metrics.picksPerSourceHour).toMatchObject({ value: 0, promoted: 0, sourceHours: 4 });
    expect(formatUnavailable(metrics.picksPerSourceHour)).toMatch(/^0\b/);
  });

  it("uses a half-open [start, end) window", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: interval.start,
        }),
        fixturePick({
          eventSlug: event.slug,
          punditId: "eisen",
          side: "no",
          firstPublishedAt: interval.end,
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 4,
    });
    expect(metrics.newlyPromotedMapped).toMatchObject({ value: 1 });
    expect(metrics.picksPerSourceHour).toMatchObject({ value: 0.25, promoted: 1 });
  });

  it("does not count unmapped or soft rows as promoted picks", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          kind: "soft",
          firstPublishedAt: "2026-09-09T13:00:00Z",
        }),
        fixturePick({
          eventSlug: "unmapped-2026",
          punditId: "pate",
          side: "yes",
          firstPublishedAt: "2026-09-09T13:00:00Z",
        }),
      ],
      events: [event],
      targets: [
        approvedTarget("rams", event.slug),
        { id: "oklahoma", state: "approved", eventSlug: null },
      ],
      interval,
      sourceHours: 4,
    });
    expect(metrics.picksPerSourceHour).toMatchObject({ value: 0, promoted: 0 });
  });

  it("returns n/a with a reason when the interval or effort is missing or invalid", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const pick = fixturePick({
      eventSlug: event.slug,
      punditId: "brandt",
      side: "yes",
      firstPublishedAt: "2026-09-09T13:00:00Z",
    });
    const base = {
      calls: [pick],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
    };

    const missingInterval = captureMetrics({ ...base, sourceHours: 4 });
    expect(missingInterval.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(missingInterval.picksPerSourceHour)).toMatch(/interval/i);

    const dateOnlyInterval = captureMetrics({
      ...base,
      interval: { start: "2026-09-09", end: "2026-09-10" },
      sourceHours: 4,
    });
    expect(dateOnlyInterval.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(dateOnlyInterval.picksPerSourceHour)).toMatch(/timezone/i);

    const missingZone = captureMetrics({
      ...base,
      interval: { start: "2026-09-09T12:00:00", end: "2026-09-09T16:00:00" },
      sourceHours: 4,
    });
    expect(missingZone.picksPerSourceHour.value).toBe("n/a");

    const inverted = captureMetrics({
      ...base,
      interval: { start: interval.end, end: interval.start },
      sourceHours: 4,
    });
    expect(inverted.picksPerSourceHour.value).toBe("n/a");

    const missingHours = captureMetrics({ ...base, interval });
    expect(missingHours.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(missingHours.picksPerSourceHour)).toMatch(/source-hours|effort/i);
    expect(missingHours.newlyPromotedMapped).toMatchObject({ value: 1 });

    const zeroHours = captureMetrics({ ...base, interval, sourceHours: 0 });
    expect(zeroHours.picksPerSourceHour.value).toBe("n/a");

    const negativeHours = captureMetrics({ ...base, interval, sourceHours: -2 });
    expect(negativeHours.picksPerSourceHour.value).toBe("n/a");

    const inferredFromWallClock = captureMetrics({ ...base, interval });
    expect(inferredFromWallClock.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(inferredFromWallClock.picksPerSourceHour)).not.toMatch(/4h|0\.25/);
  });

  it("returns n/a when measured hours exceed the interval or imprecise publication overlaps it", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const tooMuchEffort = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-09T13:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 5,
    });
    expect(tooMuchEffort.picksPerSourceHour.value).toBe("n/a");
    expect(formatUnavailable(tooMuchEffort.picksPerSourceHour)).toMatch(/incompatible|exceed/i);

    const overlappingDateOnly = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-09",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 4,
    });
    expect(overlappingDateOnly.picksPerSourceHour.value).toBe("n/a");
    expect(overlappingDateOnly.newlyPromotedMapped.value).toBe("n/a");
    expect(formatUnavailable(overlappingDateOnly.picksPerSourceHour)).toMatch(/uncertain|firstPublishedAt|backfill/i);
  });

  it("does not treat a clearly earlier date-only publication as an overlapping numerator", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "brandt",
          side: "yes",
          firstPublishedAt: "2026-09-08",
        }),
      ],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      interval,
      sourceHours: 4,
    });
    expect(metrics.picksPerSourceHour).toMatchObject({ value: 0, promoted: 0 });
  });
});

describe("hour-level timestamps", () => {
  it("does not report -12 hours for a date-only September 9 kickoff versus noon publication", () => {
    const event = fixtureGame("fixture-2026", { kickoffDate: "2026-09-09" });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "fixture",
          side: "yes",
          sourceDate: "2026-08-01",
          firstPublishedAt: "2026-09-09T12:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("target", event.slug)],
    });
    expect(metrics.preKickoffLead.value).toBe("n/a");
    expect(metrics.preKickoffLead).not.toMatchObject({ value: -12 });
    expect(formatUnavailable(metrics.preKickoffLead)).not.toMatch(/-12/);
    expect(formatUnavailable(metrics.preKickoffLead)).toMatch(/date-only|timezone|midnight/i);
  });

  it("excludes date-only and timezone-less pairs from precise medians", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", { kickoffDate: "2026-09-09" });
    const dateOnly = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01",
          firstPublishedAt: "2026-09-08",
        }),
      ],
      events: [event],
      targets: [approvedTarget("pats", event.slug)],
    });
    expect(dateOnly.sourceToLive.value).toBe("n/a");
    expect(dateOnly.preKickoffLead.value).toBe("n/a");
    expect(dateOnly.sourceToLive).toMatchObject({ excluded: 1, sample: 0 });

    const mixed = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01",
          firstPublishedAt: "2026-09-08T12:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("pats", event.slug)],
    });
    expect(mixed.preKickoffLead.value).toBe("n/a");
    expect(mixed.preKickoffLead).not.toMatchObject({ value: 12 });
  });

  it("computes hour-level lead from timezone-qualified instants, including offsets", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09T20:00:00Z",
    });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-08T20:00:00-04:00",
          firstPublishedAt: "2026-09-09T08:00:00-04:00",
        }),
      ],
      events: [event],
      targets: [approvedTarget("pats", event.slug)],
    });
    expect(metrics.sourceToLive).toMatchObject({
      value: 12,
      sample: 1,
      excluded: 0,
      unit: "hours",
      precision: "datetime",
    });
    expect(metrics.preKickoffLead).toMatchObject({
      value: 8,
      sample: 1,
      excluded: 0,
      unit: "hours",
      precision: "datetime",
    });
    expect(formatUnavailable(metrics.sourceToLive)).toBe(
      "12 hours (median of 1 precise; 0 excluded)"
    );
  });

  it("allows a precise negative pre-kickoff lead for late publication", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09T12:00:00Z",
    });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-09T10:00:00Z",
          firstPublishedAt: "2026-09-09T14:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("pats", event.slug)],
    });
    expect(metrics.preKickoffLead).toMatchObject({ value: -2, sample: 1, excluded: 0 });
  });

  it("excludes a negative source-to-live interval as inconsistent evidence", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09T20:00:00Z",
    });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-09T14:00:00Z",
          firstPublishedAt: "2026-09-09T12:00:00Z",
        }),
      ],
      events: [event],
      targets: [approvedTarget("pats", event.slug)],
    });
    expect(metrics.sourceToLive.value).toBe("n/a");
    expect(metrics.sourceToLive).toMatchObject({ excluded: 1, sample: 0 });
    expect(formatUnavailable(metrics.sourceToLive)).toMatch(/inconsistent/i);
    expect(metrics.preKickoffLead).toMatchObject({ value: 8, sample: 1 });
  });

  it("medians only the precise pairs in a mixed population", () => {
    const early = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09T20:00:00Z",
    });
    const late = fixtureGame("49ers-vs-rams-2026", {
      kickoffDate: "2026-09-10T00:35:00Z",
    });
    const dateOnly = fixtureGame("bills-at-texans-2026", { kickoffDate: "2026-09-13" });
    const metrics = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: early.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-08T12:00:00Z",
          firstPublishedAt: "2026-09-09T12:00:00Z",
        }),
        fixturePick({
          eventSlug: late.slug,
          punditId: "brandt",
          side: "yes",
          sourceDate: "2026-09-09T00:00:00Z",
          firstPublishedAt: "2026-09-09T16:00:00Z",
        }),
        fixturePick({
          eventSlug: dateOnly.slug,
          punditId: "herd",
          side: "no",
          sourceDate: "2026-09-01",
          firstPublishedAt: "2026-09-08",
        }),
      ],
      events: [early, late, dateOnly],
      targets: [
        approvedTarget("pats", early.slug),
        approvedTarget("rams", late.slug),
        approvedTarget("bills", dateOnly.slug),
      ],
    });
    expect(metrics.sourceToLive).toMatchObject({
      value: 20,
      sample: 2,
      excluded: 1,
      precision: "datetime",
    });
    expect(metrics.preKickoffLead).toMatchObject({
      value: 8.3,
      sample: 2,
      excluded: 1,
    });
  });
});

describe("capture productivity input and report", () => {
  it("parses a validated reporting input without inferring hours from evidence paths", () => {
    const parsed = parseCaptureProductivityInput({
      interval,
      sourceHours: 4,
      evidence: ["docs/runs/2026-09-09.md"],
      runIds: ["2026-09-09-scout"],
    });
    expect(parsed).toMatchObject({
      interval,
      sourceHours: 4,
      evidence: ["docs/runs/2026-09-09.md"],
      runIds: ["2026-09-09-scout"],
    });
  });

  it("prints n/a reasons for missing interval and effort in the operator report", () => {
    const event = fixtureGame("49ers-vs-rams-2026");
    const metrics = captureMetrics({
      calls: [fixturePick({ eventSlug: event.slug, punditId: "brandt", side: "yes" })],
      events: [event],
      targets: [approvedTarget("rams", event.slug)],
      asOf: "2026-09-09",
    });
    const report = formatCaptureReport(metrics);
    expect(report).toMatch(/Interval: n\/a \(/);
    expect(report).toMatch(/Measured source-hours: n\/a \(/);
    expect(report).toMatch(/Newly promoted mapped picks: n\/a \(/);
    expect(report).toMatch(/Picks per source-hour: n\/a \(/);
  });
});
