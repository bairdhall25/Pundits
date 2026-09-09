import { describe, expect, it } from "vitest";
import { captureMetrics } from "./capture-metrics";
import { loadCalls, loadEvents } from "./data";
import { fixtureGame, fixturePick } from "./test-fixtures";
import { readFileSync } from "node:fs";
import path from "node:path";

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

  it("reproduces live approved-target coverage from current JSON", () => {
    const doc = JSON.parse(
      readFileSync(path.join(process.cwd(), "docs", "capture-targets.json"), "utf8")
    ) as { targets: { id: string; state: string; eventSlug?: string | null }[] };
    const metrics = captureMetrics({
      calls: loadCalls(),
      events: loadEvents(),
      targets: doc.targets,
      asOf: "2026-09-08",
    });
    const byId = Object.fromEntries(metrics.coverage.map((row) => [row.id, row]));
    expect(metrics.approvedTargets).toBe(3);
    expect(byId["nfl-w1-patriots-at-seahawks"]?.mappedHard).toBe(1);
    expect(byId["nfl-w1-patriots-at-seahawks"]?.emptySides).toEqual(["yes"]);
    expect(byId["nfl-w1-49ers-vs-rams"]?.mappedHard).toBe(4);
    expect(byId["nfl-w1-49ers-vs-rams"]?.bothSides).toBe(true);
    expect(byId["nfl-w1-bills-at-texans"]?.mappedHard).toBe(2);
    expect(byId["nfl-w1-bills-at-texans"]?.emptySides).toEqual(["yes"]);
    expect(metrics.mappedHardOnApproved).toBe(7);
    expect(metrics.picksPerSourceHour.value).toBe("n/a");
  });
});
