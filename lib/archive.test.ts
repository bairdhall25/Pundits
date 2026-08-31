import { describe, expect, it } from "vitest";
import {
  parseWeekParam,
  archiveWeeks,
  gamesForWeek,
  latestGradedWeekRecap,
  takesOnTeam,
  teamHasTakes,
  weekArchivePath,
  weekRecord,
  weekResults,
} from "./archive";
import { loadCalls, loadEvents, loadPundits } from "./data";
import type { Call, Event, Pundit } from "./types";

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

describe("weekResults", () => {
  it("returns graded takes with hits first, then pundit name", () => {
    const calls = [
      call({
        id: "c1", punditId: "patterson", eventSlug: "unc-vs-tcu-2026",
        side: "yes", status: "miss",
      }),
      call({
        id: "c2", punditId: "finebaum", eventSlug: "unc-vs-tcu-2026",
        side: "no", status: "hit",
      }),
      call({
        id: "c3", punditId: "adams", eventSlug: "unc-vs-tcu-2026",
        side: "no", status: "hit",
      }),
      call({
        id: "c4", punditId: "pending", eventSlug: "unc-vs-tcu-2026",
        side: "yes", status: "pending",
      }),
    ];
    const pundits = [
      { id: "patterson", name: "Chip Patterson" },
      { id: "finebaum", name: "Paul Finebaum" },
      { id: "adams", name: "Amy Adams" },
      { id: "pending", name: "Pending Person" },
    ] as Pundit[];

    expect(
      weekResults(gamesForWeek("ncaaf", 2026, 0, events), calls, pundits)
    ).toEqual([
      expect.objectContaining({
        status: "hit", pundit: expect.objectContaining({ name: "Amy Adams" }),
        pickLabel: "TCU over North Carolina", cents: 50,
      }),
      expect.objectContaining({
        status: "hit", pundit: expect.objectContaining({ name: "Paul Finebaum" }),
        pickLabel: "TCU over North Carolina", cents: 50,
      }),
      expect.objectContaining({
        status: "miss", pundit: expect.objectContaining({ name: "Chip Patterson" }),
        pickLabel: "North Carolina over TCU", cents: 50,
      }),
    ]);
  });

  it("returns nothing before a week has graded takes", () => {
    expect(
      weekResults(
        gamesForWeek("ncaaf", 2026, 0, events),
        [call({ eventSlug: "unc-vs-tcu-2026", side: "no" })],
        [{ id: "finebaum", name: "Paul Finebaum" } as Pundit]
      )
    ).toEqual([]);
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

describe("weekArchivePath", () => {
  it("builds the week archive path with a trailing slash", () => {
    expect(weekArchivePath("ncaaf", 2026, 0)).toBe("/ncaaf/2026/week-0/");
  });
});

describe("latestGradedWeekRecap", () => {
  it("recaps the latest graded week in sports copy", () => {
    const recap = latestGradedWeekRecap(
      loadEvents(),
      loadCalls(),
      loadPundits()
    );
    expect(recap).not.toBeNull();
    expect(recap!.href).toBe("/ncaaf/2026/week-0/");
    expect(recap!.line).toBe(
      "Week 0: experts went 2–4. Chip Patterson and Greg McElroy hit on North Carolina."
    );
  });

  it("recaps graded week 0 when a newer complete week has no grades", () => {
    const week0 = ev({
      slug: "unc-vs-tcu-2026",
      week: 0,
      kickoffDate: "2026-08-30",
      awayTeamId: "unc",
      homeTeamId: "tcu",
      awayTeam: "North Carolina",
      homeTeam: "TCU",
      awayScore: 10,
      homeScore: 48,
    });
    const week1 = ev({
      slug: "clemson-at-lsu-2026",
      week: 1,
      kickoffDate: "2026-09-06",
      awayTeamId: "clemson",
      homeTeamId: "lsu",
      awayTeam: "Clemson",
      homeTeam: "LSU",
      awayScore: 10,
      homeScore: 24,
    });
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "no", status: "hit" }),
      call({
        id: "c2",
        punditId: "patterson",
        eventSlug: "unc-vs-tcu-2026",
        side: "yes",
        status: "miss",
      }),
    ];
    const pundits = [
      { id: "finebaum", name: "Paul Finebaum" },
      { id: "patterson", name: "Chip Patterson" },
    ] as Pundit[];

    const recap = latestGradedWeekRecap([week0, week1], calls, pundits);
    expect(recap).not.toBeNull();
    expect(recap!.week).toBe(0);
    expect(recap!.href).toBe("/ncaaf/2026/week-0/");
    expect(recap!.line).toBe(
      "Week 0: experts went 1–1. Paul Finebaum hit on TCU."
    );
  });
});
