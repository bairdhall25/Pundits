import { describe, expect, it } from "vitest";
import {
  seasonFromCalls,
  getActivityBoard,
  getPundit,
  callsForPundit,
} from "./data";
import type { Call, Pundit } from "./types";

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
