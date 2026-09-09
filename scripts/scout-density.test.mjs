import { describe, expect, it } from "vitest";
import {
  coverageFlags,
  densityStatus,
  formatDispatch,
  huntEligibility,
  huntHint,
  inFlipWindow,
  isGameEvent,
  isSettledGame,
  loadBringOntoHome,
  mappedHardForEvent,
  scoreEvent,
  scoreSlate,
} from "./scout-density-lib.mjs";
import { loadCaptureTargets } from "./scout-targets-lib.mjs";

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

  it("keeps off-home SUs off the homepage until an operator flip", () => {
    expect(huntHint(lambeau, [], [], "off-home")).toBe(
      "one roster SU (off-home until operator flip)"
    );
  });
});

describe("inFlipWindow", () => {
  const sep2 = Date.parse("2026-09-02T12:00:00Z");

  it("opens 3 calendar days before kickoffDate for onHome games", () => {
    expect(inFlipWindow(clemson, sep2)).toBe(true);
  });

  it("stays closed more than 72h out", () => {
    expect(inFlipWindow(pats, sep2)).toBe(false);
  });

  it("stays closed off home or without a kickoffDate", () => {
    expect(inFlipWindow(lambeau, Date.parse("2026-09-05T12:00:00Z"))).toBe(
      false
    );
    expect(inFlipWindow({ ...clemson, kickoffDate: undefined }, sep2)).toBe(
      false
    );
  });
});

describe("scoreEvent flip-check", () => {
  const denseCalls = [
    hard("wrighster", "clemson-at-lsu-2026", "yes"),
    hard("pate", "clemson-at-lsu-2026", "no"),
    hard("finebaum", "clemson-at-lsu-2026", "no"),
    hard("staples", "clemson-at-lsu-2026", "no"),
  ];

  it("dense onHome inside 3 calendar days hunts a flip-check, not a skip", () => {
    const row = scoreEvent(clemson, denseCalls, {
      now: Date.parse("2026-09-03T12:00:00Z"),
    });
    expect(row.status).toBe("dense");
    expect(row.hunt).toBe("flip-check carded pundits only (kickoff date ≤3 days)");
  });

  it("dense outside 3 calendar days still skips", () => {
    const row = scoreEvent(clemson, denseCalls, {
      now: Date.parse("2026-08-30T12:00:00Z"),
    });
    expect(row.status).toBe("dense");
    expect(row.hunt).toBe("skip");
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
      now: Date.parse("2026-09-01T16:00:00Z"),
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

  it("flags settled games for Grader instead of omitting them from the scorecard", () => {
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
      calls: [
        hard("pate", "clemson-at-lsu-2026", "no"),
        { ...hard("mcelroy", "unc-vs-tcu-2026", "yes"), status: "pending" },
      ],
      bringOntoHome: [],
      now: Date.parse("2026-09-04T16:00:00Z"),
    });
    expect(rows.map((r) => r.eventSlug)).toEqual([
      "clemson-at-lsu-2026",
      "unc-vs-tcu-2026",
    ]);
    expect(rows[1].queue).toBe("grader-flag");
    expect(rows[1].hunt).toMatch(/settled/i);
  });

  it("puts a same-day imminent target ahead of a later equal-priority empty game", () => {
    const bills = {
      slug: "bills-at-texans-2026",
      kind: "game",
      onHome: true,
      sport: "nfl",
      awayTeam: "Bills",
      homeTeam: "Texans",
      kickoffDate: "2026-09-13",
    };
    const targets = loadCaptureTargets({
      version: 1,
      targets: [
        {
          id: "pats",
          state: "approved",
          sport: "nfl",
          eventSlug: "patriots-at-seahawks-2026",
          kickoffDate: "2026-09-09",
          priority: 1,
        },
        {
          id: "bills",
          state: "approved",
          sport: "nfl",
          eventSlug: "bills-at-texans-2026",
          kickoffDate: "2026-09-13",
          priority: 1,
        },
      ],
    });
    const rows = scoreSlate({
      events: [bills, pats],
      calls: [],
      targets,
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(rows.map((r) => r.eventSlug)).toEqual([
      "patriots-at-seahawks-2026",
      "bills-at-texans-2026",
    ]);
  });

  it("does not let an empty-side coverage deficit jump a sooner higher-priority dense game", () => {
    const rams = {
      slug: "49ers-vs-rams-2026",
      kind: "game",
      onHome: true,
      sport: "nfl",
      awayTeam: "49ers",
      homeTeam: "Rams",
      kickoffDate: "2026-09-10",
    };
    const bills = {
      slug: "bills-at-texans-2026",
      kind: "game",
      onHome: true,
      sport: "nfl",
      awayTeam: "Bills",
      homeTeam: "Texans",
      kickoffDate: "2026-09-13",
    };
    const targets = loadCaptureTargets({
      version: 1,
      targets: [
        {
          id: "rams",
          state: "approved",
          sport: "nfl",
          eventSlug: "49ers-vs-rams-2026",
          kickoffDate: "2026-09-10",
          priority: 1,
        },
        {
          id: "bills",
          state: "approved",
          sport: "nfl",
          eventSlug: "bills-at-texans-2026",
          kickoffDate: "2026-09-13",
          priority: 2,
        },
      ],
    });
    const rows = scoreSlate({
      events: [bills, rams],
      calls: [
        hard("brandt", "49ers-vs-rams-2026", "yes"),
        hard("eisen", "49ers-vs-rams-2026", "no"),
        hard("cowherd", "49ers-vs-rams-2026", "no"),
      ],
      targets,
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(rows.map((r) => r.eventSlug)).toEqual([
      "49ers-vs-rams-2026",
      "bills-at-texans-2026",
    ]);
  });
});

describe("source completion vs density", () => {
  const denseCalls = [
    hard("wrighster", "clemson-at-lsu-2026", "yes"),
    hard("pate", "clemson-at-lsu-2026", "no"),
    hard("finebaum", "clemson-at-lsu-2026", "no"),
  ];

  it("still captures a newly available GameDay voice on an approved dense game", () => {
    const targets = loadCaptureTargets({
      version: 1,
      targets: [
        {
          id: "clemson",
          state: "approved",
          sport: "ncaaf",
          eventSlug: "clemson-at-lsu-2026",
          kickoffDate: "2026-09-05",
          priority: 1,
          highValueSources: ["gameday"],
        },
      ],
    });
    const row = scoreEvent(clemson, denseCalls, {
      now: Date.parse("2026-09-05T12:00:00Z"),
      targets,
    });
    expect(row.status).toBe("dense");
    expect(row.sourceComplete).toBe(true);
    expect(row.hunt).toMatch(/source-complete designated voices/i);
    expect(row.hunt).not.toBe("skip");
  });
});

describe("past and settled events are not pregame hunts", () => {
  it("does not treat a settled event as a pregame hunt", () => {
    const settled = {
      ...clemson,
      awayScore: 10,
      homeScore: 51,
    };
    expect(
      huntEligibility(settled, {
        now: Date.parse("2026-09-08T16:00:00Z"),
        pendingMapped: true,
      })
    ).toMatchObject({
      pregame: false,
      queue: "grader-flag",
    });
    expect(
      huntEligibility(settled, {
        now: Date.parse("2026-09-08T16:00:00Z"),
        pendingMapped: false,
      }).queue
    ).toBe("omit");
  });

  it("flags a past kickoff without a final for Grader, not Scout", () => {
    const overdue = { ...pats, kickoffDate: "2026-09-07" };
    const row = scoreEvent(overdue, [], {
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(row.queue).toBe("grader-flag");
    expect(row.hunt).toMatch(/past kickoff/i);
  });

  it("does not invent a live state from a missing kickoff", () => {
    const unknown = { ...clemson, kickoffDate: undefined };
    const eligibility = huntEligibility(unknown, {
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(eligibility.pregame).toBe(false);
    expect(eligibility.reason).toMatch(/not live/i);
  });
});

describe("upcoming NCAAF absence", () => {
  it("flags zero upcoming college games when none are approved", () => {
    const targets = loadCaptureTargets({
      version: 1,
      gaps: ["No PM-approved NCAAF Week 2 shortlist"],
      targets: [
        {
          id: "ou-mich",
          state: "proposed",
          sport: "ncaaf",
          away: "Oklahoma",
          home: "Michigan",
          eventSlug: null,
          kickoffDate: "2026-09-12",
          priority: 1,
        },
      ],
    });
    const flags = coverageFlags({
      events: [clemson, pats],
      targets,
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(flags.join("\n")).toMatch(/upcoming NCAAF game events: 0/i);
    expect(flags.join("\n")).toMatch(/Proposed Week 2 shortlist/i);
    expect(flags.join("\n")).toMatch(/Do not interpret this as no college work/i);
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
  it("prints the coordinator table with priority and kickoff", () => {
    const md = formatDispatch([
      {
        eventSlug: "clemson-at-lsu-2026",
        sport: "ncaaf",
        yes: [],
        no: ["pate", "finebaum"],
        status: "empty-side",
        hunt: "Clemson YES first, then a third voice",
        queue: "hunt",
        priority: 1,
        kickoffDate: "2026-09-05",
      },
    ]);
    expect(md).toContain("## Dispatch");
    expect(md).toContain(
      "| clemson-at-lsu-2026 | ncaaf | (none) | pate, finebaum | empty-side | Clemson YES first, then a third voice | 1 | 2026-09-05 |"
    );
  });
});

describe("loadBringOntoHome", () => {
  it("accepts a slug array", () => {
    expect(loadBringOntoHome(["wisconsin-vs-nd-2026"])).toEqual([
      "wisconsin-vs-nd-2026",
    ]);
  });

  it("rejects a malformed object", () => {
    expect(() => loadBringOntoHome({ slug: "wisconsin-vs-nd-2026" })).toThrow(
      /versioned object or a slug array|version must be/
    );
  });
});
