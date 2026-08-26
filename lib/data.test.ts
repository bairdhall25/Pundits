import { describe, expect, it } from "vitest";
import {
  seasonFromCalls,
  getActivityBoard,
  getPundit,
  callsForPundit,
  sidesForCard,
  latestCalls,
  formatAsOf,
} from "./data";
import type { Call, Event, Pundit } from "./types";

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
      wins: 1,
      losses: 0,
      pending: 0,
    });
  });
});

describe("getActivityBoard", () => {
  it("ranks by mapped pending picks, then total calls, then name", () => {
    // fixture calls: finebaum has 1 mapped pending hard call, saban has 0 mapped
    const board = getActivityBoard(pundits, calls);
    expect(board.map((p) => p.id)).toEqual(["finebaum", "saban"]);
    expect(board[0].mappedPending).toBe(1);
    expect(board[0].totalCalls).toBeGreaterThan(0);
  });
  it("exposes season2026 derived from hard calls only", () => {
    const board = getActivityBoard(pundits, calls);
    const saban = board.find((p) => p.id === "saban")!;
    expect(saban.season2026).toEqual({ wins: 1, losses: 0, pending: 0 });
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
    expect(list.map((c) => c.id)).toEqual(["c1", "c2"]);
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
