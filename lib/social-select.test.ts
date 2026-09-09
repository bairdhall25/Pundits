import { describe, expect, it } from "vitest";
import { socialIndex } from "./social";
import {
  coverageKey,
  decideNovelty,
  inferCoverageState,
  isRoutineFavoriteWin,
  isThinRecord,
  rankStories,
  selectStories,
  snapshotPhrase,
} from "./social-select";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

const brandt = fixturePundit("brandt", { name: "Kyle Brandt" });
const cowherd = fixturePundit("cowherd", { name: "Colin Cowherd" });
const eisen = fixturePundit("eisen", { name: "Rich Eisen" });
const ndFan = fixturePundit("staples", { name: "Andy Staples" });

const rams = fixtureGame("49ers-vs-rams-2026", {
  title: "49ers vs Rams",
  awayTeam: "49ers",
  homeTeam: "Rams",
  kickoffDate: "2026-09-10",
  kickoff: "2026-09-10T20:15:00-04:00",
  yesCents: 36,
  noCents: 65,
  sourcedAt: "2026-09-08",
});

const irish = fixtureGame("wisconsin-vs-nd-2026", {
  title: "Wisconsin vs Notre Dame",
  awayTeam: "Wisconsin",
  homeTeam: "Notre Dame",
  kickoffDate: "2026-09-06",
  kickoff: "2026-09-06T19:30:00-04:00",
  yesCents: 8,
  noCents: 93,
  sourcedAt: "2026-08-26",
  awayScore: 13,
  homeScore: 41,
});

const unc = fixtureGame("unc-vs-tcu-2026", {
  title: "North Carolina vs TCU",
  awayTeam: "North Carolina",
  homeTeam: "TCU",
  kickoffDate: "2026-08-29",
  kickoff: "2026-08-29T12:00:00-04:00",
  yesCents: 26,
  noCents: 75,
  sourcedAt: "2026-08-28",
  awayScore: 15,
  homeScore: 10,
});

const pendingRams = [
  fixturePick({
    eventSlug: rams.slug,
    punditId: "brandt",
    side: "yes",
    claim: "The niners will beat the Rams in the opener.",
  }),
  fixturePick({
    eventSlug: rams.slug,
    punditId: "cowherd",
    side: "no",
    claim: "Lean Los Angeles.",
  }),
  fixturePick({
    eventSlug: rams.slug,
    punditId: "eisen",
    side: "no",
    claim: "Rams. They're number one.",
  }),
];

describe("lifecycle novelty", () => {
  const destination = "https://pundits.pro/picks/49ers-vs-rams-2026/";

  it("skips the same pending take after midnight instead of resetting at 12:00am ET", () => {
    const scan = {
      established: true,
      records: [
        {
          destination,
          state: "pregame" as const,
          postedAt: "2026-09-08T23:40:00-04:00",
          postId: "pregame-1",
        },
      ],
    };
    const nextMorning = decideNovelty(destination, "pregame", scan);
    expect(nextMorning).toMatchObject({ action: "skip", reason: "duplicate" });
    expect(coverageKey(destination, "pregame")).toBe(
      coverageKey("https://pundits.pro/picks/49ers-vs-rams-2026", "pregame")
    );
  });

  it("treats a newly graded result as distinct from the original pending post", () => {
    const scan = {
      established: true,
      records: [
        {
          destination,
          state: "pregame" as const,
          postedAt: "2026-09-08T23:40:00-04:00",
        },
      ],
    };
    expect(decideNovelty(destination, "result", scan)).toMatchObject({ action: "allow" });
    expect(decideNovelty(destination, "pregame", scan)).toMatchObject({
      action: "skip",
      reason: "duplicate",
    });
  });

  it("skips rather than assuming novelty when live coverage cannot be established", () => {
    const decision = decideNovelty(destination, "pregame", {
      established: false,
      records: [],
      detail: "X search unavailable",
    });
    expect(decision).toMatchObject({ action: "skip", reason: "coverage-unknown" });
  });

  it("infers pending vs result language without inventing coverage", () => {
    expect(
      inferCoverageState(
        "Kyle Brandt picks the 49ers. Cowherd and Eisen pick the Rams. In the book.",
        "event"
      )
    ).toBe("pregame");
    expect(
      inferCoverageState("Final: North Carolina 15, TCU 10. Straight-up hit.", "event")
    ).toBe("result");
    expect(inferCoverageState("", "take")).toBe("unknown");
  });
});

describe("editorial selection", () => {
  const now = new Date("2026-09-09T12:00:00-04:00");

  it("leads with pregame disagreement and skips a routine favorite win", () => {
    const index = socialIndex(
      [
        ...pendingRams,
        fixturePick({
          eventSlug: irish.slug,
          punditId: "staples",
          side: "no",
          status: "hit",
          claim: "Notre Dame.",
        }),
      ],
      [rams, irish],
      [brandt, cowherd, eisen, ndFan],
      "2026-09-09T16:00:00.000Z"
    );
    const ranked = rankStories(index, now);
    expect(ranked[0]).toMatchObject({
      priority: "pregame-disagreement",
      eventSlug: rams.slug,
      cardUrl: index.events.find((event) => event.slug === rams.slug)?.ogCard,
    });
    const favorite = ranked.find((row) => row.eventSlug === irish.slug);
    expect(favorite?.skipReason).toMatch(/routine favorite/i);
    expect(
      isRoutineFavoriteWin(
        index.events.find((event) => event.slug === irish.slug)!,
        index.takes.filter((take) => take.eventSlug === irish.slug)
      )
    ).toBe(true);
  });

  it("selects a postgame resolution after the same disagreement grades", () => {
    const gradedRams = {
      ...rams,
      awayScore: 17,
      homeScore: 24,
    };
    const index = socialIndex(
      pendingRams.map((call, i) => ({
        ...call,
        status: i === 0 ? "miss" : "hit",
        gradedAt: "2026-09-11",
      })),
      [gradedRams],
      [brandt, cowherd, eisen],
      "2026-09-11T08:00:00.000Z"
    );
    const ranked = rankStories(index, new Date("2026-09-11T12:00:00-04:00"));
    expect(ranked[0]).toMatchObject({
      priority: "postgame-resolution",
      state: "result",
      eventSlug: rams.slug,
    });
  });

  it("replays a fixture timeline crossing midnight and does not fill leftover cap", () => {
    const index = socialIndex(
      pendingRams,
      [rams],
      [brandt, cowherd, eisen],
      "2026-09-09T16:00:00.000Z"
    );
    const scan = {
      established: true,
      records: [
        {
          destination: "https://pundits.pro/picks/49ers-vs-rams-2026/",
          state: "pregame" as const,
          postedAt: "2026-09-08T23:50:00-04:00",
        },
      ],
    };
    const selected = selectStories(index, { now, scan, postsToday: 0, dailyCap: 6 });
    expect(selected.post).toEqual([]);
    expect(selected.skipped[0]?.reason).toMatch(/already posted pregame/i);
  });

  it("keeps leftover daily cap empty when nothing new remains", () => {
    const index = socialIndex(pendingRams, [rams], [brandt, cowherd, eisen]);
    const selected = selectStories(index, {
      now,
      scan: { established: true, records: [] },
      postsToday: 6,
      dailyCap: 6,
    });
    expect(selected.post).toEqual([]);
    expect(selected.skipped.some((row) => /cap/i.test(row.reason))).toBe(true);
  });

  it("does not treat a 1-0 record as a story by itself", () => {
    expect(isThinRecord({ wins: 1, losses: 0 })).toBe(true);
    expect(isThinRecord({ wins: 5, losses: 2 })).toBe(false);
  });

  it("does not backfill stale settled disagreements onto a later day's cap", () => {
    const graded = {
      ...unc,
      awayScore: 15,
      homeScore: 10,
    };
    const index = socialIndex(
      [
        fixturePick({
          eventSlug: unc.slug,
          punditId: "brandt",
          side: "yes",
          status: "hit",
          gradedAt: "2026-08-30",
        }),
        fixturePick({
          eventSlug: unc.slug,
          punditId: "cowherd",
          side: "no",
          status: "miss",
          gradedAt: "2026-08-30",
        }),
      ],
      [graded],
      [brandt, cowherd]
    );
    const ranked = rankStories(index, new Date("2026-09-09T12:00:00-04:00"));
    expect(ranked.filter((row) => row.eventSlug === unc.slug)).toEqual([]);
  });
});

describe("snapshot wording", () => {
  it("refuses a price without a snapshot date", () => {
    expect(snapshotPhrase(36, null)).toBeNull();
    expect(snapshotPhrase(36, "2026-09-08")).toBe(
      "Kalshi snapshot: 36¢, as of Sep 8, 2026"
    );
  });
});
