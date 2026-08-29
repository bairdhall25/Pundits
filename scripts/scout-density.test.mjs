import { describe, expect, it } from "vitest";
import {
  densityStatus,
  formatDispatch,
  huntHint,
  isGameEvent,
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

const patriots = {
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
  it("accepts explicit and legacy game events", () => {
    expect(isGameEvent(clemson)).toBe(true);
    expect(isGameEvent({ ...clemson, kind: undefined })).toBe(true);
  });

  it("rejects futures even when they are on home", () => {
    expect(isGameEvent(indianaTitle)).toBe(false);
  });
});

describe("mappedHardForEvent", () => {
  it("ignores soft rows, unmapped rows, and other events", () => {
    const calls = [
      { punditId: "pate", kind: "soft", eventSlug: clemson.slug, side: "no" },
      { punditId: "unknown", kind: "hard" },
      hard("herbstreit", indianaTitle.slug, "yes"),
      hard("pate", clemson.slug, "no"),
    ];
    expect(mappedHardForEvent(calls, clemson.slug)).toEqual({
      yes: [],
      no: ["pate"],
    });
  });
});

describe("densityStatus", () => {
  it("classifies empty, thin, dense, and off-home cards", () => {
    expect(densityStatus(["a"], [])).toBe("empty-side");
    expect(densityStatus(["a"], ["b"])).toBe("thin");
    expect(densityStatus(["a"], ["b", "c"])).toBe("dense");
    expect(densityStatus([], [], { offHome: true })).toBe("off-home");
    expect(densityStatus(["a"], [], { offHome: true })).toBe("empty-side");
  });
});

describe("huntHint", () => {
  it("names the empty side and skips dense cards", () => {
    expect(huntHint(clemson, [], ["pate", "finebaum"], "empty-side")).toBe(
      "Clemson YES first, then a third voice"
    );
    expect(huntHint(clemson, ["a"], ["b", "c"], "dense")).toBe("skip");
  });
});

describe("scoreSlate", () => {
  it("scores mixed NFL and NCAAF games and excludes futures", () => {
    const rows = scoreSlate({
      events: [clemson, patriots, indianaTitle, lambeau],
      calls: [
        hard("pate", clemson.slug, "no"),
        hard("finebaum", clemson.slug, "no"),
        hard("cowherd", patriots.slug, "no"),
      ],
      bringOntoHome: [lambeau.slug],
    });

    expect(rows.map((row) => row.eventSlug)).toEqual([
      clemson.slug,
      patriots.slug,
      lambeau.slug,
    ]);
    expect(rows[0].status).toBe("empty-side");
    expect(rows[1].sport).toBe("nfl");
    expect(rows[2].status).toBe("off-home");
  });

  it("does not label a home card off-home", () => {
    const [row] = scoreSlate({
      events: [{ ...lambeau, onHome: true }],
      calls: [],
      bringOntoHome: [lambeau.slug],
    });
    expect(row.status).toBe("empty-side");
  });
});

describe("loadBringOntoHome", () => {
  it("accepts a slug array and rejects malformed input", () => {
    expect(loadBringOntoHome([lambeau.slug])).toEqual([lambeau.slug]);
    expect(() => loadBringOntoHome({ slug: lambeau.slug })).toThrow(/array of slugs/);
    expect(() => loadBringOntoHome([""])).toThrow(/array of slugs/);
  });
});

describe("formatDispatch", () => {
  it("prints the coordinator table", () => {
    const markdown = formatDispatch([
      {
        eventSlug: clemson.slug,
        sport: "ncaaf",
        yes: [],
        no: ["pate", "finebaum"],
        status: "empty-side",
        hunt: "Clemson YES first, then a third voice",
      },
    ]);
    expect(markdown).toContain("## Dispatch");
    expect(markdown).toContain(
      "| clemson-at-lsu-2026 | ncaaf | (none) | pate, finebaum | empty-side | Clemson YES first, then a third voice |"
    );
  });
});
