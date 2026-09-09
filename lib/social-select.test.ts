import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { socialIndex } from "./social";
import {
  RESOLUTION_WINDOW_DAYS,
  countsTowardDailyCap,
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

  it("counts the daily cap on the Eastern calendar day, not the novelty lookback", () => {
    const nextMorning = new Date("2026-09-09T08:00:00-04:00");
    expect(countsTowardDailyCap("2026-09-08T23:40:00-04:00", nextMorning)).toBe(false);
    expect(countsTowardDailyCap("2026-09-09T00:10:00-04:00", nextMorning)).toBe(true);
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

function postedRecord(
  destination: string,
  text: string,
  subject: "take" | "event",
  postedAt = "2026-09-08T23:40:00-04:00"
) {
  return {
    destination,
    state: inferCoverageState(text, subject),
    postedAt,
  };
}

describe("fail-closed coverage inference", () => {
  const destination = "https://pundits.pro/picks/49ers-vs-rams-2026/";
  const campaignDestination =
    "https://pundits.pro/picks/49ers-vs-rams-2026/?utm_source=x&utm_medium=social&utm_campaign=organic-original&utm_content=game";
  const seattlePregame = "Nick Wright picks Seattle to win 27–17 before kickoff";
  const seattleScoreOnly = "Seattle to win 27–17 before kickoff";

  it("does not treat a predicted score as an event result that reopens the same pregame destination", () => {
    const inferred = inferCoverageState(seattlePregame, "event");
    expect(inferred).toBe("pregame");
    expect(inferCoverageState(seattleScoreOnly, "event")).toBe("pregame");
    expect(inferCoverageState(seattleScoreOnly, "take")).toBe("pending");
    const decision = decideNovelty(destination, "pregame", {
      established: true,
      records: [postedRecord(destination, seattlePregame, "event")],
    });
    expect(decision).toMatchObject({ action: "skip", reason: "duplicate" });
  });

  it("does not treat final 27–17 as proof that an individual pick hit", () => {
    const inferred = inferCoverageState("final 27–17", "take");
    expect(inferred).toBe("unknown");
    const decision = decideNovelty(destination, "hit", {
      established: true,
      records: [postedRecord(destination, "final 27–17", "take")],
    });
    expect(decision).toMatchObject({ action: "skip", reason: "coverage-unknown" });
    expect(decideNovelty(destination, "pending", {
      established: true,
      records: [postedRecord(destination, "final 27–17", "take")],
    })).toMatchObject({ action: "skip", reason: "coverage-unknown" });
  });

  it("returns unknown for contradictory language and skips rather than allowing", () => {
    expect(inferCoverageState("Straight-up hit and miss before kickoff.", "take")).toBe(
      "unknown"
    );
    expect(inferCoverageState("Final 27–17 before kickoff", "event")).toBe("unknown");
    const decision = decideNovelty(destination, "result", {
      established: true,
      records: [postedRecord(destination, "Final 27–17 before kickoff", "event")],
    });
    expect(decision).toMatchObject({ action: "skip", reason: "coverage-unknown" });
  });

  it("keeps explicit verified hit and miss decisions, including miss without extra result words", () => {
    expect(inferCoverageState("Chip Patterson. Straight-up hit.", "take")).toBe("hit");
    expect(inferCoverageState("Straight-up miss.", "take")).toBe("miss");
    expect(
      inferCoverageState("Final: North Carolina 15, TCU 10. Straight-up hit.", "take")
    ).toBe("hit");
    expect(
      decideNovelty(destination, "hit", {
        established: true,
        records: [postedRecord(destination, "Chip Patterson. Straight-up hit.", "take")],
      })
    ).toMatchObject({ action: "skip", reason: "duplicate" });
    expect(
      decideNovelty(destination, "miss", {
        established: true,
        records: [postedRecord(destination, "Straight-up miss.", "take")],
      })
    ).toMatchObject({ action: "skip", reason: "duplicate" });
    expect(inferCoverageState("Seattle came up short 27–17.", "take")).toBe("unknown");
  });

  it("skips a duplicate pregame post even when the prior URL carries campaign query params", () => {
    const decision = decideNovelty(destination, "pregame", {
      established: true,
      records: [postedRecord(campaignDestination, seattleScoreOnly, "event")],
    });
    expect(decision).toMatchObject({ action: "skip", reason: "duplicate" });
  });

  it("still allows a genuine later result after a pregame score prediction", () => {
    const inferred = inferCoverageState(seattlePregame, "event");
    expect(inferred).toBe("pregame");
    expect(
      decideNovelty(destination, "result", {
        established: true,
        records: [postedRecord(destination, seattlePregame, "event")],
      })
    ).toMatchObject({ action: "allow" });
  });

  it("does not let an unknown inferred state become allow through selectStories", () => {
    const now = new Date("2026-09-09T12:00:00-04:00");
    const index = socialIndex(pendingRams, [rams], [brandt, cowherd, eisen]);
    const selected = selectStories(index, {
      now,
      scan: {
        established: true,
        records: [postedRecord(destination, "final 27–17", "take")],
      },
    });
    expect(selected.post).toEqual([]);
    expect(selected.skipped[0]?.reason).toMatch(/coverage could not be established/i);
  });

  it("selects a supported later result after a pregame score-prediction post", () => {
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
    const selected = selectStories(index, {
      now: new Date("2026-09-11T12:00:00-04:00"),
      scan: {
        established: true,
        records: [
          postedRecord(
            destination,
            "Kyle Brandt picks the 49ers to win 27–17 before kickoff",
            "event"
          ),
        ],
      },
    });
    expect(selected.post[0]).toMatchObject({
      priority: "postgame-resolution",
      state: "result",
      eventSlug: rams.slug,
    });
  });

  it("keeps connector failure unavailable rather than dry or novel in selectStories", () => {
    const now = new Date("2026-09-09T12:00:00-04:00");
    const index = socialIndex(pendingRams, [rams], [brandt, cowherd, eisen]);
    const selected = selectStories(index, {
      now,
      scan: { established: false, records: [], detail: "X search unavailable" },
    });
    expect(selected.post).toEqual([]);
    expect(selected.skipped[0]?.reason).toMatch(/coverage could not be established/i);
  });

  it("does not block a different destination when another post's state is unknown", () => {
    expect(
      decideNovelty(destination, "pregame", {
        established: true,
        records: [
          postedRecord(
            "https://pundits.pro/picks/unc-vs-tcu-2026/",
            "final 27–17",
            "take"
          ),
        ],
      })
    ).toMatchObject({ action: "allow" });
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

  it("keeps the 3 ET-day resolution window in the playbook Poster follows", () => {
    expect(RESOLUTION_WINDOW_DAYS).toBe(3);
    const window = `${RESOLUTION_WINDOW_DAYS} ET days`;
    const files = [
      "docs/social/post-patterns.md",
      "bots/poster.md",
      "docs/social/schedule.md",
    ];
    for (const file of files) {
      const text = readFileSync(path.join(process.cwd(), file), "utf8");
      expect(text, file).toContain(window);
    }
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
