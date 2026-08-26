import { describe, expect, it } from "vitest";
import {
  callsForEvent,
  eventHasFight,
  eventKind,
  getBoard,
  getFuturesPeek,
  getHomeEvents,
  getSlateGames,
  getWeekend,
  impliedOpenDollars,
  loadCalls,
  loadEvents,
  mappedCalls,
} from "./data";
import type { Call, Event } from "./types";

describe("v1 mapped book", () => {
  it("maps the Indiana title fight both ways", () => {
    const calls = loadCalls();
    expect(eventHasFight("indiana-title", calls)).toBe(true);
    expect(callsForEvent("indiana-title", calls, "yes").map((c) => c.punditId)).toContain(
      "thamel"
    );
    expect(callsForEvent("indiana-title", calls, "no").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["finebaum", "herbstreit"])
    );
  });

  it("does not map weasels onto the board", () => {
    const slugs = new Set(mappedCalls(loadCalls()).map((c) => c.id));
    expect(slugs.has("herbstreit-nd-title-lean")).toBe(false);
    expect(slugs.has("herbstreit-michigan-b1g")).toBe(false);
    expect(slugs.has("saban-uga-texas-cfp")).toBe(false);
    expect(slugs.has("mcelroy-oklahoma-title")).toBe(false);
    expect(slugs.has("thamel-usc-binary")).toBe(false);
    expect(slugs.has("mcafee-wvu-title")).toBe(false);
  });

  it("puts fights first on the home list", () => {
    const home = getHomeEvents(loadEvents(), loadCalls());
    expect(home[0].slug).toBe("indiana-title");
    expect(home.every((e) => e.onHome)).toBe(true);
  });

  it("counts Finebaum open $100 per mapped pending call", () => {
    const n = mappedCalls(loadCalls()).filter(
      (c) => c.punditId === "finebaum" && c.status === "pending"
    ).length;
    expect(impliedOpenDollars("finebaum", loadCalls())).toBe(n * 100);
    expect(n).toBeGreaterThanOrEqual(4);
  });
});

describe("Top 10 boards", () => {
  it("exposes 10 NCAAF home events and 10 NFL home events", () => {
    const events = loadEvents();
    const calls = loadCalls();
    const ncaaf = getBoard("ncaaf", events, calls);
    const nfl = getBoard("nfl", events, calls);
    expect(ncaaf).toHaveLength(10);
    expect(nfl).toHaveLength(10);
    expect(ncaaf.every((e) => e.sport === "ncaaf" && e.onHome)).toBe(true);
    expect(nfl.every((e) => e.sport === "nfl" && e.onHome)).toBe(true);
  });

  it("maps Herbstreit's Nonstop title bracket as clear leans", () => {
    const calls = loadCalls();
    expect(callsForEvent("nd-title", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["coughlin", "herbstreit"])
    );
    expect(callsForEvent("osu-title", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-title", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("osu-cfp", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-cfp", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });

  it("maps first-person NFL Super Bowl leans, not McAfee-show guests as Pat", () => {
    const calls = loadCalls();
    expect(eventHasFight("rams-sb", calls)).toBe(true);
    expect(callsForEvent("rams-sb", calls, "yes").map((c) => c.punditId)).toContain(
      "butler"
    );
    expect(callsForEvent("rams-sb", calls, "no").map((c) => c.punditId)).toContain("hawk");
    expect(callsForEvent("bills-sb", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["skip", "hawk"])
    );
    expect(
      mappedCalls(calls).filter((c) => c.punditId === "mcafee" && c.eventSlug?.endsWith("-sb"))
    ).toHaveLength(0);
  });

  it("keeps LSU title and Tech CFP off the Top 10 even when mapped", () => {
    const ncaaf = getBoard("ncaaf", loadEvents(), loadCalls());
    expect(ncaaf.map((e) => e.slug)).not.toContain("lsu-title");
    expect(ncaaf.map((e) => e.slug)).not.toContain("tech-cfp");
    expect(callsForEvent("lsu-title", loadCalls(), "no").map((c) => c.punditId)).toContain(
      "finebaum"
    );
    expect(callsForEvent("tech-cfp", loadCalls(), "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });
});

describe("weekend home", () => {
  it("lists Week 1 games separately from futures", () => {
    const events = loadEvents();
    const ncaaf = getWeekend("ncaaf", events);
    const nfl = getWeekend("nfl", events);
    expect(ncaaf.map((e) => e.slug)).toEqual(["clemson-at-lsu"]);
    expect(nfl.map((e) => e.slug)).toEqual([
      "patriots-at-seahawks",
      "49ers-vs-rams",
      "bills-at-texans",
    ]);
    expect(ncaaf.every((e) => eventKind(e) === "game")).toBe(true);
    expect(getBoard("ncaaf", events, loadCalls()).every((e) => eventKind(e) === "future")).toBe(
      true
    );
  });

  it("keeps off-home games on the full sport slate", () => {
    const ncaaf = getSlateGames("ncaaf", loadEvents());
    expect(ncaaf[0].onHome).toBe(true);
    expect(ncaaf.map((e) => e.slug)).toContain("wisconsin-vs-nd");
  });

  it("does not put a faceless game on the weekend board", () => {
    const events = loadEvents();
    const calls = loadCalls();
    for (const e of [...getWeekend("ncaaf", events), ...getWeekend("nfl", events)]) {
      expect(callsForEvent(e.slug, calls).length, e.slug).toBeGreaterThan(0);
    }
  });

  it("freezes Kalshi moneylines on the marquee games we could source", () => {
    const bySlug = Object.fromEntries(loadEvents().map((e) => [e.slug, e]));
    expect(bySlug["clemson-at-lsu"].yesCents).toBe(24);
    expect(bySlug["clemson-at-lsu"].noCents).toBe(78);
    expect(bySlug["wisconsin-vs-nd"].yesCents).toBe(8);
    expect(bySlug["wisconsin-vs-nd"].noCents).toBe(93);
    expect(bySlug["patriots-at-seahawks"].yesCents).toBe(38.5);
    expect(bySlug["patriots-at-seahawks"].noCents).toBe(62.5);
    expect(bySlug["49ers-vs-rams"].yesCents).toBe(36.5);
    expect(bySlug["49ers-vs-rams"].noCents).toBe(62.5);
    expect(bySlug["bills-at-texans"].yesCents).toBe(48.5);
    expect(bySlug["bills-at-texans"].noCents).toBe(50);
  });

  it("does not invent game leans from title futures", () => {
    // Self-contained fixture (not live data — capture runs legitimately grow
    // mapped game calls over time, so this must test behavior, not a
    // snapshot count). A pundit's mapped futures/title pick on a team, plus
    // an unmapped soft take about that same team, must never leak onto that
    // team's actual game event just because the team/pundit overlaps.
    const gameEvent: Event = {
      slug: "avent-at-bteam", kind: "game", title: "A at B",
      contractName: "A vs B — moneyline", awayTeam: "A", homeTeam: "B",
      yesCents: 50, noCents: 50, sourceUrl: "https://example.com", sourcedAt: "2026-08-25",
      onHome: true, sport: "ncaaf", homeRank: 1,
    };
    const futuresCall: Call = {
      id: "x1", punditId: "finebaum",
      claim: "A is going to win the national championship this year, no doubt about it.",
      source: "t", sourceUrl: "https://example.com/a", sourceDate: "2026-08-20",
      kind: "hard", subject: "A", paysOn: "2026 CFP national championship", status: "pending",
      eventSlug: "a-title", side: "yes",
    };
    const softCall: Call = {
      id: "x2", punditId: "finebaum",
      claim: "A looks really good heading into the opener against B this year.",
      source: "t", sourceUrl: "https://example.com/b", sourceDate: "2026-08-21",
      kind: "soft", subject: "A", paysOn: "2026 season", status: "pending",
    };
    const calls = [futuresCall, softCall];
    expect(callsForEvent(gameEvent.slug, calls)).toHaveLength(0);
    expect(eventHasFight(gameEvent.slug, calls)).toBe(false);
  });

  it("peeks a short futures strip that still prefers fights", () => {
    const peek = getFuturesPeek("ncaaf", loadEvents(), loadCalls(), 5);
    expect(peek).toHaveLength(5);
    expect(peek[0].slug).toBe("indiana-title");
    expect(peek.every((e) => eventKind(e) === "future")).toBe(true);
  });
});
