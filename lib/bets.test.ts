import { describe, expect, it } from "vitest";
import {
  callsForEvent,
  eventHasFight,
  eventKind,
  eventScanStatus,
  getBoard,
  getFuturesPeek,
  getHomeEvents,
  getSlateGames,
  getWeekend,
  impliedOpenDollars,
  loadCalls,
  loadEvents,
  mappedCalls,
  marqueeGame,
  partitionFutures,
  partitionGames,
} from "./data";
import type { Call, Event } from "./types";
import { fixtureFuture, fixtureGame, fixturePick } from "./test-fixtures";

describe("v1 mapped book", () => {
  it("maps the Indiana title fight both ways", () => {
    const calls = loadCalls();
    expect(eventHasFight("indiana-title-2026", calls)).toBe(true);
    expect(callsForEvent("indiana-title-2026", calls, "yes").map((c) => c.punditId)).toContain(
      "thamel"
    );
    expect(callsForEvent("indiana-title-2026", calls, "no").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["finebaum", "herbstreit"])
    );
  });

  it("maps Fallica miss-CFP opposite Herbstreit on Texas", () => {
    const calls = loadCalls();
    expect(eventHasFight("texas-cfp-2026", calls)).toBe(true);
    expect(callsForEvent("texas-cfp-2026", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("texas-cfp-2026", calls, "no").map((c) => c.punditId)).toEqual(["fallica"]);
    expect(calls.filter((c) => c.punditId === "herbstreit" && c.eventSlug === "texas-cfp-2026")).toHaveLength(1);
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
    const fight = fixtureGame("fight-game-2026", { homeRank: 1 });
    const lonely = fixtureGame("lonely-game-2026", { homeRank: 9 });
    const title = fixtureFuture("title-2026", { homeRank: 2 });
    const homeCalls = [
      fixturePick({ eventSlug: fight.slug, punditId: "yes-voice", side: "yes" }),
      fixturePick({ eventSlug: fight.slug, punditId: "no-voice", side: "no" }),
      fixturePick({ eventSlug: lonely.slug, punditId: "yes-voice", side: "yes" }),
      fixturePick({ eventSlug: title.slug, punditId: "yes-voice", side: "yes" }),
      fixturePick({ eventSlug: title.slug, punditId: "no-voice", side: "no" }),
    ];
    const home = getHomeEvents([lonely, title, fight], homeCalls);
    expect(home.map((e) => e.slug)).toEqual([fight.slug, title.slug, lonely.slug]);
    expect(home.every((e) => e.onHome)).toBe(true);
  });

  it("counts $100 per mapped pending call", () => {
    const pending = [
      fixturePick({ eventSlug: "game-a-2026", punditId: "voice", side: "yes" }),
      fixturePick({ eventSlug: "game-b-2026", punditId: "voice", side: "no" }),
      fixturePick({ eventSlug: "game-c-2026", punditId: "other", side: "yes" }),
      { ...fixturePick({ eventSlug: "game-d-2026", punditId: "voice", side: "yes", status: "hit" }), id: "voice-hit" },
    ];
    expect(impliedOpenDollars("voice", pending)).toBe(200);
  });
});

describe("Top 10 boards", () => {
  it("exposes only onHome futures for a sport board", () => {
    const events = [
      fixtureFuture("ncaaf-title-2026", { sport: "ncaaf", homeRank: 1 }),
      fixtureFuture("ncaaf-cfp-2026", { sport: "ncaaf", homeRank: 2 }),
      fixtureFuture("nfl-sb-2026", { sport: "nfl", homeRank: 1 }),
      fixtureGame("ncaaf-game-2026", { sport: "ncaaf", homeRank: 0 }),
      fixtureFuture("ncaaf-offhome-2026", { sport: "ncaaf", onHome: false, homeRank: 3 }),
    ];
    const ncaaf = getBoard("ncaaf", events, []);
    const nfl = getBoard("nfl", events, []);
    expect(ncaaf.map((e) => e.slug)).toEqual(["ncaaf-title-2026", "ncaaf-cfp-2026"]);
    expect(nfl.map((e) => e.slug)).toEqual(["nfl-sb-2026"]);
    expect(ncaaf.every((e) => e.sport === "ncaaf" && e.onHome && eventKind(e) === "future")).toBe(true);
    expect(nfl.every((e) => e.sport === "nfl" && e.onHome && eventKind(e) === "future")).toBe(true);
  });

  it("keeps live sport boards as onHome futures", () => {
    const ncaaf = getBoard("ncaaf", loadEvents(), loadCalls());
    const nfl = getBoard("nfl", loadEvents(), loadCalls());
    expect(ncaaf.length).toBeGreaterThan(0);
    expect(nfl.length).toBeGreaterThan(0);
    expect(ncaaf.every((e) => e.sport === "ncaaf" && e.onHome && eventKind(e) === "future")).toBe(true);
    expect(nfl.every((e) => e.sport === "nfl" && e.onHome && eventKind(e) === "future")).toBe(true);
  });

  it("maps Herbstreit's Nonstop title bracket as clear leans", () => {
    const calls = loadCalls();
    expect(callsForEvent("nd-title-2026", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["coughlin", "herbstreit"])
    );
    expect(callsForEvent("osu-title-2026", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-title-2026", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("osu-cfp-2026", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-cfp-2026", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });

  it("maps first-person NFL Super Bowl leans, not McAfee-show guests as Pat", () => {
    const calls = loadCalls();
    expect(eventHasFight("rams-sb-2026", calls)).toBe(true);
    expect(callsForEvent("rams-sb-2026", calls, "yes").map((c) => c.punditId)).toContain(
      "butler"
    );
    expect(callsForEvent("rams-sb-2026", calls, "no").map((c) => c.punditId)).toContain("hawk");
    expect(callsForEvent("bills-sb-2026", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["skip", "hawk"])
    );
    expect(
      mappedCalls(calls).filter((c) => c.punditId === "mcafee" && /-sb-\d{4}$/.test(c.eventSlug ?? ""))
    ).toHaveLength(0);
  });

  it("keeps LSU title and Tech CFP off the Top 10 even when mapped", () => {
    const ncaaf = getBoard("ncaaf", loadEvents(), loadCalls());
    expect(ncaaf.map((e) => e.slug)).not.toContain("lsu-title-2026");
    expect(ncaaf.map((e) => e.slug)).not.toContain("tech-cfp-2026");
    expect(callsForEvent("lsu-title-2026", loadCalls(), "no").map((c) => c.punditId)).toContain(
      "finebaum"
    );
    expect(callsForEvent("tech-cfp-2026", loadCalls(), "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });
});

describe("weekend home", () => {
  it("lists onHome games separately from futures, ranked for the homepage", () => {
    const events = [
      fixtureGame("later-ncaaf-2026", { sport: "ncaaf", homeRank: 2 }),
      fixtureGame("earlier-ncaaf-2026", { sport: "ncaaf", homeRank: 1 }),
      fixtureGame("nfl-opener-2026", { sport: "nfl", homeRank: 1 }),
      fixtureFuture("ncaaf-title-2026", { sport: "ncaaf", homeRank: 0 }),
      fixtureGame("offhome-ncaaf-2026", { sport: "ncaaf", onHome: false, homeRank: 0 }),
    ];
    const ncaaf = getWeekend("ncaaf", events);
    const nfl = getWeekend("nfl", events);
    expect(ncaaf.map((e) => e.slug)).toEqual(["earlier-ncaaf-2026", "later-ncaaf-2026"]);
    expect(nfl.map((e) => e.slug)).toEqual(["nfl-opener-2026"]);
    expect(ncaaf.every((e) => e.onHome && e.sport === "ncaaf" && eventKind(e) === "game")).toBe(
      true
    );
    expect(nfl.every((e) => e.onHome && e.sport === "nfl" && eventKind(e) === "game")).toBe(true);
    expect(getBoard("ncaaf", events, []).every((e) => eventKind(e) === "future")).toBe(true);
  });

  it("keeps live weekend boards as onHome games", () => {
    const ncaaf = getWeekend("ncaaf", loadEvents());
    const nfl = getWeekend("nfl", loadEvents());
    expect(ncaaf.every((e) => e.onHome && e.sport === "ncaaf" && eventKind(e) === "game")).toBe(true);
    expect(nfl.every((e) => e.onHome && e.sport === "nfl" && eventKind(e) === "game")).toBe(true);
  });

  it("keeps off-home games on the full sport slate", () => {
    const ncaaf = getSlateGames("ncaaf", loadEvents());
    expect(ncaaf[0].onHome).toBe(true);
    expect(ncaaf.map((e) => e.slug)).toContain("wisconsin-vs-nd-2026");
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
    expect(bySlug["clemson-at-lsu-2026"].yesCents).toBe(23);
    expect(bySlug["clemson-at-lsu-2026"].noCents).toBe(78);
    expect(bySlug["ncsu-at-uva-2026"].yesCents).toBe(34);
    expect(bySlug["ncsu-at-uva-2026"].noCents).toBe(66);
    expect(bySlug["wisconsin-vs-nd-2026"].yesCents).toBe(8);
    expect(bySlug["wisconsin-vs-nd-2026"].noCents).toBe(93);
    expect(bySlug["patriots-at-seahawks-2026"].yesCents).toBe(38.5);
    expect(bySlug["patriots-at-seahawks-2026"].noCents).toBe(62.5);
    expect(bySlug["49ers-vs-rams-2026"].yesCents).toBe(36.5);
    expect(bySlug["49ers-vs-rams-2026"].noCents).toBe(62.5);
    expect(bySlug["bills-at-texans-2026"].yesCents).toBe(48.5);
    expect(bySlug["bills-at-texans-2026"].noCents).toBe(50);
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
    const fight = fixtureFuture("fight-title-2026", { homeRank: 4 });
    const lonely = fixtureFuture("lonely-title-2026", { homeRank: 1 });
    const extra = fixtureFuture("extra-title-2026", { homeRank: 2 });
    const peekCalls = [
      fixturePick({ eventSlug: fight.slug, punditId: "yes-voice", side: "yes" }),
      fixturePick({ eventSlug: fight.slug, punditId: "no-voice", side: "no" }),
      fixturePick({ eventSlug: lonely.slug, punditId: "yes-voice", side: "yes" }),
      fixturePick({ eventSlug: extra.slug, punditId: "no-voice", side: "no" }),
    ];
    const peek = getFuturesPeek("ncaaf", [lonely, extra, fight], peekCalls, 5);
    expect(peek.map((e) => e.slug)).toEqual([fight.slug, lonely.slug, extra.slug]);
    expect(peek.every((e) => eventKind(e) === "future")).toBe(true);
  });

  it("never peeks a future with no mapped pick", () => {
    const faced = fixtureFuture("faced-sb-2026", { sport: "nfl", homeRank: 1 });
    const waiting = fixtureFuture("waiting-sb-2026", { sport: "nfl", homeRank: 2 });
    const peekCalls = [fixturePick({ eventSlug: faced.slug, punditId: "voice", side: "yes" })];
    const nfl = getFuturesPeek("nfl", [faced, waiting], peekCalls, 10);
    expect(nfl.map((e) => e.slug)).toEqual([faced.slug]);
    expect(nfl.some((e) => e.slug === waiting.slug)).toBe(false);
  });

  it("splits NFL futures into faced cards and a waiting list", () => {
    const faced = fixtureFuture("faced-sb-2026", { sport: "nfl", homeRank: 1 });
    const waitingEvent = fixtureFuture("waiting-sb-2026", { sport: "nfl", homeRank: 2 });
    const { withPicks, waiting } = partitionFutures(
      "nfl",
      [faced, waitingEvent],
      [fixturePick({ eventSlug: faced.slug, punditId: "voice", side: "yes" })]
    );
    expect(withPicks.map((e) => e.slug)).toEqual([faced.slug]);
    expect(waiting.map((e) => e.slug)).toEqual([waitingEvent.slug]);
  });

  it("features the next open game, not a finished card", () => {
    const openEarly = fixtureGame("open-early-2026", { homeRank: 2, kickoffDate: "2026-09-05" });
    const openLate = fixtureGame("open-late-2026", { homeRank: 3, kickoffDate: "2026-09-06" });
    const finished = fixtureGame("finished-2026", {
      homeRank: 1,
      kickoffDate: "2026-08-29",
      awayScore: 15,
      homeScore: 10,
    });
    const slate = [finished, openEarly, openLate];
    const slateCalls = [
      fixturePick({ eventSlug: openEarly.slug, punditId: "voice", side: "no" }),
      fixturePick({ eventSlug: openLate.slug, punditId: "voice", side: "yes" }),
      fixturePick({ eventSlug: finished.slug, punditId: "voice", side: "no", status: "miss" }),
    ];
    const marquee = marqueeGame(slate, [], slateCalls);
    expect(marquee?.slug).toBe(openEarly.slug);
    const { open, grading, final } = partitionGames(slate, slateCalls);
    expect(open.map((e) => e.slug)).toEqual([openEarly.slug, openLate.slug]);
    expect([...open, ...grading].map((e) => e.slug)).toContain(marquee!.slug);
    expect(grading).toEqual([]);
    expect(final.map((e) => e.slug)).toEqual([finished.slug]);
  });

  it("does not fall back to a final game when nothing is open", () => {
    const events = loadEvents();
    const calls = loadCalls();
    const ncaaf = getWeekend("ncaaf", events).filter(
      (e) => eventScanStatus(e, calls) === "final"
    );
    expect(marqueeGame(ncaaf, [], calls)).toBeUndefined();
  });
});
