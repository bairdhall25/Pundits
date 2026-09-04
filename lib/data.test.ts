import { describe, expect, it } from "vitest";
import {
  seasonFromCalls,
  getActivityBoard,
  sortActivityBoard,
  getPundit,
  callsForPundit,
  sidesForCard,
  settledLabel,
  settledSide,
  finalScoreLine,
  finalScoreParts,
  gameComplete,
  picksFinished,
  eventScanStatus,
  eventStatusLine,
  latestCalls,
  loadCalls,
  loadEvents,
  loadPundits,
  formatAsOf,
  otherTakes,
  hasGradedRecords,
  eventHasTakes,
} from "./data";
import { filterBook, emptyBookFilter } from "./book-filter";
import type { Call, Event, Pundit } from "./types";
import { fixtureCall, fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

const pundits: Pundit[] = [
  { id: "saban", name: "Nick Saban", outlet: "ESPN / GameDay", photo: "/photos/saban.jpg", sport: "ncaaf" },
  { id: "finebaum", name: "Paul Finebaum", outlet: "Finebaum / ESPN", photo: "/photos/finebaum.jpg", sport: "ncaaf" },
];

const calls: Call[] = [
  {
    id: "c1",
    punditId: "finebaum",
    claim: "Indiana is not winning the national championship this year.",
    source: "First Take",
    sourceUrl: null,
    sourceDate: "2026-08-18",
    kind: "hard",
    subject: "Indiana",
    paysOn: "2026 CFP national championship",
    status: "pending",
    eventSlug: "indiana-title",
    side: "no",
  },
  {
    id: "c2",
    punditId: "finebaum",
    claim: "Curt Cignetti is the best coach in college football.",
    source: "First Take",
    sourceUrl: null,
    sourceDate: "2026-08-18",
    kind: "soft",
    subject: "Curt Cignetti",
    paysOn: "2026 season",
    status: "pending",
  },
  {
    id: "c3",
    punditId: "saban",
    claim: "Georgia goes a long way in the playoff.",
    source: "The Pat McAfee Show",
    sourceUrl: null,
    sourceDate: "2026-08-21",
    kind: "hard",
    subject: "Georgia",
    paysOn: "2026 CFP",
    status: "hit",
  },
  {
    id: "c4",
    punditId: "finebaum",
    claim: "11 wins is the floor for the Irish.",
    source: "Always College Football",
    sourceUrl: null,
    sourceDate: "2026-08-13",
    kind: "hard",
    subject: "Notre Dame",
    paysOn: "2026 Notre Dame win total",
    status: "pending",
  },
];

describe("seasonFromCalls", () => {
  it("counts only hard hit/miss toward W-L and hard pending toward pending", () => {
    expect(seasonFromCalls("finebaum", calls)).toEqual({
      wins: 0,
      losses: 0,
      pending: 1,
    });
  });
  it("counts a hard hit as a win", () => {
    expect(seasonFromCalls("saban", calls)).toEqual({
      wins: 0,
      losses: 0,
      pending: 0,
    });
  });
  it("counts only mapped hard hit/miss/pending toward the 2026 record", () => {
    expect(seasonFromCalls("finebaum", calls)).toEqual({
      wins: 0,
      losses: 0,
      pending: 1, // c1 mapped; c4 unmapped hard pending is ignored
    });
    expect(seasonFromCalls("saban", calls)).toEqual({
      wins: 0, // c3 is an unmapped hard hit — not a public record
      losses: 0,
      pending: 0,
    });
  });
  it("does not treat unmapped hard takes as open picks", () => {
    expect(seasonFromCalls("finebaum", calls).pending).toBe(
      calls.filter(
        (c) =>
          c.punditId === "finebaum" &&
          c.kind === "hard" &&
          c.status === "pending" &&
          Boolean(c.eventSlug && c.side)
      ).length
    );
  });
});

describe("getActivityBoard", () => {
  it("defaults to open volume while nobody has a mapped graded pick", () => {
    // fixture calls: finebaum has 1 mapped pending hard call, saban has 0 mapped
    const board = getActivityBoard(pundits, calls);
    expect(board.map((p) => p.id)).toEqual(["finebaum", "saban"]);
    expect(board[0].mappedPending).toBe(1);
    expect(board[0].totalCalls).toBeGreaterThan(0);
  });
  it("defaults to results-first once anyone has a mapped graded pick", () => {
    const mappedHit: Call = {
      ...calls.find((c) => c.id === "c3")!,
      id: "c3-mapped",
      eventSlug: "georgia-cfp",
      side: "yes",
    };
    const board = getActivityBoard(pundits, [...calls, mappedHit]);
    expect(board.map((p) => p.id)).toEqual(["saban", "finebaum"]);
  });
  it("exposes season2026 derived from mapped hard calls only", () => {
    const board = getActivityBoard(pundits, calls);
    const saban = board.find((p) => p.id === "saban")!;
    expect(saban.season2026).toEqual({ wins: 0, losses: 0, pending: 0 });
  });
});

describe("sortActivityBoard", () => {
  it("ranks by mapped pending when sort is open", () => {
    const board = getActivityBoard(pundits, calls);
    expect(sortActivityBoard(board, "open").map((p) => p.id)).toEqual([
      "finebaum",
      "saban",
    ]);
  });

  it("puts sample size before hits when sort is results", () => {
    const mappedHit: Call = {
      ...calls.find((c) => c.id === "c3")!,
      id: "c3-mapped",
      eventSlug: "georgia-cfp",
      side: "yes",
    };
    const board = getActivityBoard(pundits, [...calls, mappedHit]);
    // saban now has a mapped hard hit; finebaum has none
    expect(sortActivityBoard(board, "results").map((p) => p.id)).toEqual([
      "saban",
      "finebaum",
    ]);
  });

  it("ranks a 1-1 sample ahead of a 1-0 sample when sort is results", () => {
    const people = [
      fixturePundit("bigger-sample", { name: "Bigger Sample" }),
      fixturePundit("hot-start", { name: "Hot Start" }),
      fixturePundit("unmapped", { name: "Unmapped" }),
    ];
    const boardCalls = [
      fixturePick({ eventSlug: "game-a-2026", punditId: "bigger-sample", side: "yes", status: "hit" }),
      fixturePick({ eventSlug: "game-b-2026", punditId: "bigger-sample", side: "no", status: "miss" }),
      fixturePick({ eventSlug: "game-a-2026", punditId: "hot-start", side: "yes", status: "hit" }),
      fixtureCall({ id: "soft-1", punditId: "unmapped", claim: "a lean", kind: "soft" }),
    ];
    const ids = sortActivityBoard(getActivityBoard(people, boardCalls), "results").map((p) => p.id);
    expect(ids.indexOf("bigger-sample")).toBeLessThan(ids.indexOf("hot-start"));
    expect(ids.indexOf("hot-start")).toBeLessThan(ids.indexOf("unmapped"));
  });
});

describe("getPundit", () => {
  it("returns an ActivityRecord for a known id", () => {
    const p = getPundit("finebaum", pundits, calls)!;
    expect(p.mappedPending).toBe(1);
  });
  it("returns null for an unknown id", () => {
    expect(getPundit("corso", pundits, calls)).toBeNull();
  });
});

describe("callsForPundit", () => {
  it("returns that pundit’s calls newest sourceDate first", () => {
    const list = callsForPundit("finebaum", calls);
    expect(list.map((c) => c.id)).toEqual(["c1", "c2", "c4"]);
  });
});

describe("sidesForCard", () => {
  const event: Event = {
    slug: "clemson-at-lsu", kind: "game", title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline", awayTeam: "Clemson", homeTeam: "LSU",
    yesCents: 24, noCents: 78, sourceUrl: "https://example.com", sourcedAt: "2026-08-25",
    onHome: true, sport: "ncaaf", homeRank: 1,
  };
  const lsuCall: Call = {
    id: "x1", punditId: "finebaum", claim: "Night game in Baton Rouge means the Tigers win this one.",
    source: "t", sourceUrl: "https://example.com/a", sourceDate: "2026-09-04",
    kind: "hard", subject: "LSU", paysOn: "Clemson at LSU", status: "pending",
    eventSlug: "clemson-at-lsu", side: "no",
  };

  it("always returns YES then NO regardless of call counts", () => {
    const [first, second] = sidesForCard(event, [lsuCall]);
    expect(first.side).toBe("yes");
    expect(first.label).toBe("Clemson");
    expect(first.calls).toHaveLength(0);
    expect(second.side).toBe("no");
    expect(second.label).toBe("LSU");
    expect(second.calls).toHaveLength(1);
  });

  it("keeps team labels when a side is empty", () => {
    const [yes, no] = sidesForCard(event, []);
    expect(yes.label).toBe("Clemson");
    expect(no.label).toBe("LSU");
  });

  it("uses fan-facing labels for a future", () => {
    const future: Event = {
      ...event,
      slug: "indiana-title-2026",
      kind: "future",
      awayTeam: undefined,
      homeTeam: undefined,
    };
    const [yes, no] = sidesForCard(future, []);
    expect(yes.label).toBe("Takes it");
    expect(no.label).toBe("Against");
  });
});

describe("settledSide", () => {
  const event: Event = {
    slug: "clemson-at-lsu", kind: "game", title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline", awayTeam: "Clemson", homeTeam: "LSU",
    yesCents: 24, noCents: 78, sourceUrl: "https://example.com", sourcedAt: "2026-08-25",
    onHome: true, sport: "ncaaf", homeRank: 1,
  };
  const noLive: Call = {
    id: "n1", punditId: "finebaum", claim: "LSU wins this one in Death Valley at night.",
    source: "t", sourceUrl: "https://example.com/a", sourceDate: "2026-09-04",
    kind: "hard", subject: "LSU", paysOn: "Clemson at LSU", status: "pending",
    eventSlug: "clemson-at-lsu", side: "no",
  };

  it("stays open while any mapped call is pending", () => {
    expect(settledSide(event, [noLive])).toBeNull();
    expect(settledLabel(event, [noLive])).toBeNull();
  });

  it("treats a hit on NO as the home team", () => {
    const hit = { ...noLive, status: "hit" as const };
    expect(settledSide(event, [hit])).toBe("no");
    expect(settledLabel(event, [hit])).toBe("LSU");
  });

  it("treats a miss on NO as the away team, without a new event field", () => {
    const miss = { ...noLive, status: "miss" as const };
    expect(settledSide(event, [miss])).toBe("yes");
    expect(settledLabel(event, [miss])).toBe("Clemson");
  });

  it("refuses to infer a winner when graded evidence conflicts", () => {
    const noHit = { ...noLive, status: "hit" as const };
    const yesHit: Call = {
      ...noLive,
      id: "y1",
      punditId: "patterson",
      subject: "Clemson",
      side: "yes",
      status: "hit",
    };

    expect(settledSide(event, [noHit, yesHit])).toBeNull();
    expect(settledLabel(event, [noHit, yesHit])).toBeNull();
  });
});

describe("finalScoreLine", () => {
  it("formats the final score winner-first when both scores exist", () => {
    const scored = fixtureGame("scored-2026", {
      awayTeam: "NC State",
      homeTeam: "Virginia",
      awayScore: 8,
      homeScore: 34,
    });
    const roadWin = fixtureGame("road-win-2026", {
      awayTeam: "North Carolina",
      homeTeam: "TCU",
      awayScore: 15,
      homeScore: 10,
    });
    const open = fixtureGame("open-2026");
    expect(finalScoreLine(scored, [])).toBe("Virginia 34, NC State 8");
    expect(finalScoreParts(scored, [])).toEqual({
      winner: "Virginia", loser: "NC State", winnerScore: 34, loserScore: 8,
    });
    expect(finalScoreLine(roadWin, [])).toBe("North Carolina 15, TCU 10");
    expect(finalScoreLine(open, [])).toBeNull();
  });

  it("keeps published Week 0 scores on the live ledger", () => {
    const uva = loadEvents().find((e) => e.slug === "ncsu-at-uva-2026")!;
    expect(uva.awayScore).toBe(8);
    expect(uva.homeScore).toBe(34);
    const dublin = loadEvents().find((e) => e.slug === "unc-vs-tcu-2026")!;
    expect(dublin.awayScore).toBe(15);
    expect(dublin.homeScore).toBe(10);
  });

  it("returns a score line for a scored event even when mapped calls are still pending", () => {
    const scored: Event = {
      slug: "clemson-at-lsu-2026",
      kind: "game",
      title: "Clemson at LSU",
      contractName: "Clemson vs LSU — moneyline",
      awayTeam: "Clemson",
      homeTeam: "LSU",
      yesCents: 24,
      noCents: 78,
      sourceUrl: "https://example.com",
      sourcedAt: "2026-08-25",
      onHome: true,
      sport: "ncaaf",
      homeRank: 2,
      awayScore: 17,
      homeScore: 24,
    };
    const pending: Call = {
      id: "n1",
      punditId: "finebaum",
      claim: "LSU",
      source: "t",
      sourceUrl: "https://example.com/a",
      sourceDate: "2026-09-04",
      kind: "hard",
      subject: "LSU",
      paysOn: "Clemson at LSU",
      status: "pending",
      eventSlug: "clemson-at-lsu-2026",
      side: "no",
    };
    expect(finalScoreParts(scored, [pending])).toEqual({
      winner: "LSU",
      loser: "Clemson",
      winnerScore: 24,
      loserScore: 17,
    });
    expect(finalScoreLine(scored, [pending])).toBe("LSU 24, Clemson 17");
  });
});

describe("event scan status", () => {
  const clemson: Event = {
    slug: "clemson-at-lsu-2026",
    kind: "game",
    title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline",
    awayTeam: "Clemson",
    homeTeam: "LSU",
    yesCents: 24,
    noCents: 78,
    sourceUrl: "https://example.com",
    sourcedAt: "2026-08-25",
    onHome: true,
    sport: "ncaaf",
    homeRank: 2,
  };
  const pending: Call = {
    id: "n1",
    punditId: "finebaum",
    claim: "LSU",
    source: "t",
    sourceUrl: "https://example.com/a",
    sourceDate: "2026-09-04",
    kind: "hard",
    subject: "LSU",
    paysOn: "Clemson at LSU",
    status: "pending",
    eventSlug: "clemson-at-lsu-2026",
    side: "no",
  };
  const scored = { ...clemson, awayScore: 17, homeScore: 24 };

  it("treats an unscored game as open even with pending picks", () => {
    expect(gameComplete(clemson)).toBe(false);
    expect(picksFinished(clemson, [pending])).toBe(false);
    expect(eventScanStatus(clemson, [pending])).toBe("open");
    expect(eventStatusLine(clemson, [pending])).toBe("Open");
  });

  it("treats a scored game with pending picks as grading", () => {
    expect(gameComplete(scored)).toBe(true);
    expect(picksFinished(scored, [pending])).toBe(false);
    expect(eventScanStatus(scored, [pending])).toBe("grading");
    expect(eventStatusLine(scored, [pending])).toBe("Final · Grading · LSU 24–17");
  });

  it("treats a scored, fully graded game as final", () => {
    const hit = { ...pending, status: "hit" as const };
    expect(eventScanStatus(scored, [hit])).toBe("final");
    expect(eventStatusLine(scored, [hit])).toBe("Final · LSU 24–17");
  });

  it("does not use grading for futures", () => {
    const future: Event = { ...clemson, kind: "future", slug: "lsu-title-2026" };
    const futurePending = { ...pending, eventSlug: "lsu-title-2026" };
    expect(eventScanStatus(future, [futurePending])).toBe("open");
    expect(eventScanStatus(future, [{ ...futurePending, status: "hit" }])).toBe("final");
  });

  it("keeps published Week 0 games final on the live ledger", () => {
    const events = loadEvents();
    const liveCalls = loadCalls();
    const tcu = events.find((e) => e.slug === "unc-vs-tcu-2026")!;
    expect(eventScanStatus(tcu, liveCalls)).toBe("final");
    expect(eventStatusLine(tcu, liveCalls)).toBe("Final · North Carolina 15–10");
  });
});

describe("otherTakes", () => {
  it("returns only unmapped calls for a pundit", () => {
    const rest = otherTakes("finebaum", calls);
    expect(rest.map((c) => c.id)).toEqual(["c2", "c4"]);
    expect(rest.every((c) => !c.eventSlug)).toBe(true);
  });
});

describe("filterBook", () => {
  it("composes sport, kind, mapping, and query", () => {
    const nflSoft = filterBook(calls, pundits, {
      ...emptyBookFilter,
      sport: "nfl",
      kind: "soft",
    });
    expect(nflSoft).toHaveLength(0);
    const mappedIndiana = filterBook(calls, pundits, {
      ...emptyBookFilter,
      mapping: "mapped",
      q: "indiana",
    });
    expect(mappedIndiana.map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("formatAsOf", () => {
  it("prints a freeze date without a timezone shift", () => {
    expect(formatAsOf("2026-08-26")).toBe("as of Aug 26, 2026");
    expect(formatAsOf(null)).toBeNull();
  });
});

describe("latestCalls", () => {
  it("peeks one call per pundit, newest first", () => {
    const peek = latestCalls(
      [
        ...calls,
        {
          ...calls[0],
          id: "c1-later",
          sourceDate: "2026-08-25",
          claim: "Indiana still isn't winning it, even later in the month.",
        },
      ],
      6
    );
    expect(peek.map((c) => c.id)).toEqual(["c1-later", "c3"]);
  });
});

describe("hasGradedRecords", () => {
  const rec = (wins: number, losses: number) =>
    ({ season2026: { wins, losses, pending: 0 } }) as never;

  it("is false while every record is 0-0", () => {
    expect(hasGradedRecords([rec(0, 0), rec(0, 0)])).toBe(false);
    expect(hasGradedRecords([])).toBe(false);
  });

  it("is true once any pick has graded", () => {
    expect(hasGradedRecords([rec(0, 0), rec(1, 0)])).toBe(true);
    expect(hasGradedRecords([rec(0, 2)])).toBe(true);
  });
});

describe("eventHasTakes", () => {
  it("treats an event as empty until a mapped pick lands", () => {
    const mapped = fixturePick({
      eventSlug: "mapped-game-2026",
      punditId: "voice",
      side: "yes",
    });
    expect(eventHasTakes("mapped-game-2026", [mapped])).toBe(true);
    expect(eventHasTakes("empty-future-2026", [mapped])).toBe(false);
  });

  it("keeps published mapped events non-empty on the live ledger", () => {
    const liveCalls = loadCalls();
    expect(eventHasTakes("unc-vs-tcu-2026", liveCalls)).toBe(true);
  });
});
