import { describe, expect, it } from "vitest";
import {
  parseWeekParam,
  archiveWeeks,
  gamesForWeek,
  takesOnTeam,
  teamHasTakes,
  weekRecord,
} from "./archive";
import type { Call, Event } from "./types";

const ev = (over: Partial<Event>): Event =>
  ({
    slug: "x",
    title: "X",
    contractName: "X",
    yesCents: 50,
    noCents: 50,
    sourceUrl: "https://example.com",
    sourcedAt: "2026-08-26",
    onHome: true,
    sport: "ncaaf",
    homeRank: 0,
    kind: "game",
    season: 2026,
    ...over,
  }) as Event;

const call = (over: Partial<Call>): Call =>
  ({
    id: "c",
    punditId: "finebaum",
    claim: "quote",
    source: "First Take",
    sourceDate: "2026-08-25",
    kind: "hard",
    status: "pending",
    ...over,
  }) as Call;

const events: Event[] = [
  ev({ slug: "unc-vs-tcu-2026", week: 0, awayTeamId: "unc", homeTeamId: "tcu", awayTeam: "North Carolina", homeTeam: "TCU" }),
  ev({ slug: "clemson-at-lsu-2026", week: 1, awayTeamId: "clemson", homeTeamId: "lsu", awayTeam: "Clemson", homeTeam: "LSU" }),
  ev({ slug: "bills-at-texans-2026", week: 1, sport: "nfl", awayTeamId: "bills", homeTeamId: "texans", awayTeam: "Bills", homeTeam: "Texans" }),
  ev({ slug: "lsu-title-2026", kind: "future", teamId: "lsu", title: "LSU wins the national title" }),
];

describe("archiveWeeks", () => {
  it("lists each sport/season/week once, ordered", () => {
    expect(archiveWeeks(events)).toEqual([
      { sport: "ncaaf", season: 2026, week: 0 },
      { sport: "ncaaf", season: 2026, week: 1 },
      { sport: "nfl", season: 2026, week: 1 },
    ]);
  });
});

describe("gamesForWeek", () => {
  it("returns only that sport-season-week's games", () => {
    expect(gamesForWeek("ncaaf", 2026, 1, events).map((e) => e.slug)).toEqual([
      "clemson-at-lsu-2026",
    ]);
    expect(gamesForWeek("nfl", 2026, 0, events)).toEqual([]);
  });
});

describe("weekRecord", () => {
  it("counts graded takes on the week's games", () => {
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "no", status: "hit" }),
      call({ id: "c2", punditId: "patterson", eventSlug: "unc-vs-tcu-2026", side: "yes", status: "miss" }),
      call({ id: "c3", eventSlug: "clemson-at-lsu-2026", side: "no", status: "pending" }),
    ];
    expect(weekRecord(gamesForWeek("ncaaf", 2026, 0, events), calls)).toEqual({
      hits: 1,
      misses: 1,
      pending: 0,
    });
  });
});

describe("takesOnTeam", () => {
  const calls = [
    call({ eventSlug: "clemson-at-lsu-2026", side: "no", status: "pending" }), // LSU home
    call({ id: "c2", punditId: "pate", eventSlug: "clemson-at-lsu-2026", side: "yes" }), // Clemson away
    call({ id: "c3", punditId: "klatt", eventSlug: "lsu-title-2026", side: "no" }), // against LSU future
  ];

  it("splits believers and faders across games and futures", () => {
    const lsu = takesOnTeam("lsu", events, calls);
    expect(lsu.for.map((c) => c.id)).toEqual(["c"]);
    // picking the opponent fades the team, as does a "no" on their future
    expect(lsu.against.map((c) => c.id)).toEqual(["c2", "c3"]);
    const clemson = takesOnTeam("clemson", events, calls);
    expect(clemson.for.map((c) => c.id)).toEqual(["c2"]);
    expect(clemson.against.map((c) => c.id)).toEqual(["c"]);
  });

  it("gates team pages on having at least one take", () => {
    expect(teamHasTakes("lsu", events, calls)).toBe(true);
    expect(teamHasTakes("bills", events, calls)).toBe(false);
  });
});

describe("parseWeekParam", () => {
  it("parses week-N slugs and rejects junk", () => {
    expect(parseWeekParam("week-0")).toBe(0);
    expect(parseWeekParam("week-12")).toBe(12);
    expect(parseWeekParam("week-")).toBeNull();
    expect(parseWeekParam("0")).toBeNull();
    expect(parseWeekParam("week-1x")).toBeNull();
  });
});
