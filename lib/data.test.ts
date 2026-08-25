import { describe, expect, it } from "vitest";
import {
  accuracyPct,
  seasonFromCalls,
  getLeaderboard,
  getPundit,
  callsForPundit,
} from "./data";
import type { Call, Pundit } from "./types";

const pundits: Pundit[] = [
  {
    id: "saban",
    name: "Nick Saban",
    outlet: "ESPN / GameDay",
    photo: "/photos/saban.jpg",
    estimated2025: { wins: 31, losses: 18 },
  },
  {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "Finebaum / ESPN",
    photo: "/photos/finebaum.jpg",
    estimated2025: { wins: 21, losses: 24 },
  },
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

describe("accuracyPct", () => {
  it("returns 0 when there are no games", () => {
    expect(accuracyPct(0, 0)).toBe(0);
  });
  it("rounds to nearest integer percent", () => {
    expect(accuracyPct(31, 18)).toBe(63);
  });
});

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

describe("getLeaderboard", () => {
  it("sorts by 2025 accuracy descending", () => {
    const board = getLeaderboard(pundits, calls);
    expect(board.map((p) => p.id)).toEqual(["saban", "finebaum"]);
    expect(board[0].accuracy2025).toBe(63);
    expect(board[1].season2026.pending).toBe(1);
  });
});

describe("getPundit", () => {
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
