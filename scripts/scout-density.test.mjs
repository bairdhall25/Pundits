import { describe, expect, it } from "vitest";
import {
  densityStatus,
  formatDispatch,
  huntHint,
  isGameEvent,
  isSettledGame,
  loadBringOntoHome,
  mappedHardForEvent,
  scoreSlate,
} from "./scout-density-lib.mjs";

const clemson = {
  slug: "clemson-at-lsu-2026",
  kind: "game",
  onHome: true,
  sport: "ncaaf",
  awayTeam: "Clemson",
  homeTeam: "LSU",
  kickoffDate: "2026-09-05",
};

const lambeau = {
  slug: "wisconsin-vs-nd-2026",
  kind: "game",
  onHome: false,
  sport: "ncaaf",
  awayTeam: "Wisconsin",
  homeTeam: "Notre Dame",
  kickoffDate: "2026-09-06",
};

const pats = {
  slug: "patriots-at-seahawks-2026",
  kind: "game",
  onHome: true,
  sport: "nfl",
  awayTeam: "Patriots",
  homeTeam: "Seahawks",
  kickoffDate: "2026-09-09",
};

const indianaTitle = {
  slug: "indiana-title-2026",
  kind: "future",
  onHome: true,
  sport: "ncaaf",
  teamId: "indiana",
};

const hard = (punditId, eventSlug, side) => ({
  id: `${punditId}-${eventSlug}-${side}`,
  punditId,
  kind: "hard",
  eventSlug,
  side,
});

describe("isGameEvent", () => {
  it("accepts kind=game", () => {
    expect(isGameEvent(clemson)).toBe(true);
  });

  it("rejects futures even when onHome", () => {
    expect(isGameEvent(indianaTitle)).toBe(false);
  });

  it("accepts a kickoff game with no kind field", () => {
    expect(
      isGameEvent({
        slug: "miami-at-stanford-2026",
        onHome: true,
        sport: "ncaaf",
        awayTeam: "Miami",
        homeTeam: "Stanford",
        kickoffDate: "2026-09-04",
      })
    ).toBe(true);
  });
});

describe("mappedHardForEvent", () => {
  it("ignores soft rows and unmapped hards", () => {
    const calls = [
      { punditId: "pate", kind: "soft", eventSlug: "clemson-at-lsu-2026", side: "no" },
      { punditId: "herbstreit", kind: "hard", eventSlug: "indiana-title-2026", side: "yes" },
      hard("pate", "clemson-at-lsu-2026", "no"),
    ];
    expect(mappedHardForEvent(calls, "clemson-at-lsu-2026")).toEqual({
      yes: [],
      no: ["pate"],
    });
  });
});

describe("densityStatus", () => {
  it("empty-side when either side is 0", () => {
    expect(densityStatus(["a"], [], {})).toBe("empty-side");
    expect(densityStatus([], ["a", "b"], {})).toBe("empty-side");
  });

  it("thin when both sides have at least one and total < 3", () => {
    expect(densityStatus(["a"], ["b"], {})).toBe("thin");
  });

  it("dense at 3+ with both sides filled", () => {
    expect(densityStatus(["a"], ["b", "c"], {})).toBe("dense");
  });

  it("off-home only when flagged and nobody is mapped", () => {
    expect(densityStatus([], [], { offHome: true })).toBe("off-home");
    expect(densityStatus(["a"], [], { offHome: true })).toBe("empty-side");
  });
});

describe("huntHint", () => {
  it("names the empty away side then a third voice for 0-2", () => {
    expect(huntHint(clemson, [], ["pate", "finebaum"], "empty-side")).toBe(
      "Clemson YES first, then a third voice"
    );
  });

  it("skips dense", () => {
    expect(huntHint(clemson, ["a"], ["b", "c"], "dense")).toBe("skip");
  });
});

describe("scoreSlate", () => {
  it("scores mixed NFL and NCAAF home games and ignores futures", () => {
    const rows = scoreSlate({
      events: [clemson, pats, indianaTitle, lambeau],
      calls: [
        hard("pate", "clemson-at-lsu-2026", "no"),
        hard("finebaum", "clemson-at-lsu-2026", "no"),
        hard("cowherd", "patriots-at-seahawks-2026", "no"),
      ],
      bringOntoHome: ["wisconsin-vs-nd-2026"],
    });
    expect(rows.map((r) => r.eventSlug)).toEqual([
      "clemson-at-lsu-2026",
      "patriots-at-seahawks-2026",
      "wisconsin-vs-nd-2026",
    ]);
    expect(rows[0].status).toBe("empty-side");
    expect(rows[1].sport).toBe("nfl");
    expect(rows[2].status).toBe("off-home");
  });

  it("does not treat an onHome slug as off-home even if listed", () => {
    const rows = scoreSlate({
      events: [{ ...lambeau, onHome: true }],
      calls: [],
      bringOntoHome: ["wisconsin-vs-nd-2026"],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("empty-side");
  });

  it("omits settled games even when onHome and empty-side", () => {
    const dublin = {
      slug: "unc-vs-tcu-2026",
      kind: "game",
      onHome: true,
      sport: "ncaaf",
      awayTeam: "North Carolina",
      homeTeam: "TCU",
      kickoffDate: "2026-08-29",
      awayScore: 15,
      homeScore: 10,
    };
    const rows = scoreSlate({
      events: [clemson, dublin],
      calls: [hard("pate", "clemson-at-lsu-2026", "no")],
      bringOntoHome: [],
    });
    expect(rows.map((r) => r.eventSlug)).toEqual(["clemson-at-lsu-2026"]);
  });
});

describe("isSettledGame", () => {
  it("requires both scores", () => {
    expect(isSettledGame({ awayScore: 15, homeScore: 10 })).toBe(true);
    expect(isSettledGame({ awayScore: 15 })).toBe(false);
    expect(isSettledGame(clemson)).toBe(false);
  });
});

describe("formatDispatch", () => {
  it("prints the coordinator table", () => {
    const md = formatDispatch([
      {
        eventSlug: "clemson-at-lsu-2026",
        sport: "ncaaf",
        yes: [],
        no: ["pate", "finebaum"],
        status: "empty-side",
        hunt: "Clemson YES first, then a third voice",
      },
    ]);
    expect(md).toContain("## Dispatch");
    expect(md).toContain("| clemson-at-lsu-2026 | ncaaf | (none) | pate, finebaum | empty-side | Clemson YES first, then a third voice |");
  });
});

describe("loadBringOntoHome", () => {
  it("accepts a slug array", () => {
    expect(loadBringOntoHome(["wisconsin-vs-nd-2026"])).toEqual([
      "wisconsin-vs-nd-2026",
    ]);
  });

  it("rejects a non-array", () => {
    expect(() => loadBringOntoHome({ slug: "wisconsin-vs-nd-2026" })).toThrow(
      /array of slugs/
    );
  });
});
