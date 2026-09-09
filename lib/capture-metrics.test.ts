import { describe, expect, it } from "vitest";
import { captureMetrics, formatUnavailable } from "./capture-metrics";
import { fixtureGame, fixturePick } from "./test-fixtures";

describe("capture metrics", () => {
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

  it("computes picks per source-hour only when duration is measured", () => {
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
    expect(metrics.picksPerSourceHour).toEqual({ value: 1, sourceHours: 2 });
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
  });

  it("emits lead-time hours when firstPublishedAt and kickoff both exist", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09",
    });
    const metrics = captureMetrics({
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
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(metrics.sourceToLive).toMatchObject({
      value: 168,
      sample: 1,
      unit: "hours",
      precision: "date-only",
    });
    expect(metrics.preKickoffLead).toMatchObject({
      value: 24,
      sample: 1,
      unit: "hours",
      precision: "date-only",
    });
    expect(formatUnavailable(metrics.sourceToLive)).toBe(
      "168 hours (median of 1; date-only)"
    );
  });

  it("keeps n/a when a required timestamp is absent and never uses sourceDate as first publication", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09",
      kickoff: "Wed 8:20 ET",
    });
    const publishedWithoutKickoff = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01",
          firstPublishedAt: "2026-09-08",
        }),
      ],
      events: [],
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(publishedWithoutKickoff.sourceToLive).toMatchObject({ value: 168, unit: "hours" });
    expect(publishedWithoutKickoff.preKickoffLead.value).toBe("n/a");

    const displayKickoffOnly = captureMetrics({
      calls: [
        fixturePick({
          eventSlug: event.slug,
          punditId: "cowherd",
          side: "no",
          sourceDate: "2026-09-01",
          firstPublishedAt: "2026-09-08",
        }),
      ],
      events: [{ ...event, kickoffDate: undefined }],
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

  it("notes mixed precision when a datetime is stored against a date-only kickoff", () => {
    const event = fixtureGame("patriots-at-seahawks-2026", {
      kickoffDate: "2026-09-09",
    });
    const metrics = captureMetrics({
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
      targets: [{ id: "pats", state: "approved", eventSlug: event.slug }],
    });
    expect(metrics.preKickoffLead).toMatchObject({
      value: 12,
      sample: 1,
      unit: "hours",
      precision: "mixed",
    });
  });
});
