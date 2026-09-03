import { describe, expect, it } from "vitest";
import { gamesForWeek } from "../archive";
import {
  loadCalls,
  loadEvents,
  loadPundits,
  loadTeams,
  sidesForCard,
} from "../data";
import { mappedTakes } from "../seo";
import type { Call, Event, Pundit, Team } from "../types";
import {
  quoteExcerpt,
  socialPeopleGroup,
  type SocialPerson,
} from "./model";
import {
  PORTRAIT_PRESENTATIONS,
  isNormalizedPortraitFocus,
  portraitPresentationFor,
} from "./portraits";
import {
  resolveEventSocialCard,
  resolvePageSocialCard,
  resolvePunditSocialCard,
  resolveTakeSocialCard,
  resolveTeamSocialCard,
  resolveWeekSocialCard,
  type SocialPageKey,
} from "./resolver";

const calls = loadCalls();
const events = loadEvents();
const pundits = loadPundits();
const teams = loadTeams();

function fixtureEvent(overrides: Partial<Event> = {}): Event {
  return {
    slug: "away-at-home-2026",
    title: "Away at Home",
    contractName: "Away at Home winner",
    yesCents: 45,
    noCents: 55,
    sourceUrl: "https://example.com/market",
    sourcedAt: "2026-09-01T12:00:00Z",
    onHome: true,
    sport: "ncaaf",
    homeRank: 0,
    kind: "game",
    awayTeam: "Away",
    homeTeam: "Home",
    awayTeamId: "away",
    homeTeamId: "home",
    season: 2026,
    week: 1,
    ...overrides,
  };
}

function fixturePundit(id: string): Pundit {
  return {
    id,
    name: `Person ${id}`,
    outlet: "Fixture Network",
    photo: `/photos/${id}.jpg`,
    sport: "ncaaf",
  };
}

function fixtureCall(
  id: string,
  punditId: string,
  side: "yes" | "no",
  overrides: Partial<Call> = {}
): Call {
  return {
    id,
    punditId,
    claim: `${punditId} picks ${side}`,
    source: "Fixture Network",
    sourceUrl: "https://example.com/source",
    sourceDate: "2026-09-01",
    kind: "hard",
    subject: "Fixture",
    paysOn: "Fixture result",
    status: "pending",
    eventSlug: "away-at-home-2026",
    side,
    ...overrides,
  };
}

const fixtureTeams: Team[] = [
  {
    id: "away",
    name: "Away",
    abbr: "AWAY",
    primary: "#ff4d4f",
    ink: "#ffffff",
    sport: "ncaaf",
  },
  {
    id: "home",
    name: "Home",
    abbr: "HOME",
    primary: "#461b78",
    ink: "#ffffff",
    sport: "ncaaf",
  },
];

describe("social-card portrait presentation", () => {
  it("keeps every focal point normalized and outside editorial JSON", () => {
    for (const presentation of Object.values(PORTRAIT_PRESENTATIONS)) {
      expect(isNormalizedPortraitFocus(presentation.focus)).toBe(true);
    }
    expect(portraitPresentationFor("pate").focus).toEqual({ x: 0.5, y: 0.53 });
    expect(portraitPresentationFor("finebaum").focus).toEqual({ x: 0.5, y: 0.24 });
    expect(portraitPresentationFor("butler").focus).toEqual({ x: 0.5, y: 0.28 });
    expect(portraitPresentationFor("unknown-person")).toEqual({
      punditId: "unknown-person",
    });
    expect(JSON.stringify(loadPundits())).not.toMatch(/portraitFocus|featuredScale/);
  });
});

describe("social-card model utilities", () => {
  it("makes overflow explicit instead of silently slicing people", () => {
    const people = Array.from({ length: 6 }, (_, index) => ({
      punditId: `p${index}`,
      name: `Person ${index}`,
      outlet: "Fixture",
      portrait: null,
    })) satisfies SocialPerson[];
    expect(socialPeopleGroup(people, 4)).toMatchObject({
      total: 6,
      overflow: 2,
    });
    expect(socialPeopleGroup(people, 4).people).toHaveLength(4);
  });

  it("clips long quotes deterministically at a readable boundary", () => {
    const longest = calls
      .filter((call) => call.eventSlug && call.side)
      .sort((a, b) => b.claim.length - a.claim.length)[0];
    const excerpt = quoteExcerpt(longest.claim, 160);
    expect(longest.claim.length).toBe(370);
    expect(excerpt.length).toBeLessThanOrEqual(160);
    expect(excerpt).not.toMatch(/\s…$/);
    expect(quoteExcerpt(longest.claim, 160)).toBe(excerpt);
  });
});

describe("page social-card resolver", () => {
  it("uses live corpus counts and real portraits on distribution pages", () => {
    const card = resolvePageSocialCard("stories", "landscape", {
      events,
      calls,
      pundits,
    });
    expect(card.metrics.find((metric) => metric.label === "Mapped picks")?.value).toBe(
      String(calls.filter((call) => call.eventSlug && call.side).length)
    );
    expect(card.people?.people.length).toBe(3);
    expect(card.people?.people.every((person) => person.portrait)).toBe(true);
  });

  it("keeps trust and utility cards text-first", () => {
    const data = { events, calls, pundits };
    for (const key of ["about", "methodology", "privacy", "terms"] as const) {
      expect(resolvePageSocialCard(key, "landscape", data).people).toBeNull();
    }
  });
});

describe("event social-card resolver", () => {
  it("resolves Clemson–LSU as the approved 1–4 Split card", () => {
    const event = events.find((candidate) => candidate.slug === "clemson-at-lsu-2026")!;
    const card = resolveEventSocialCard(event, calls, pundits, teams);
    expect(card.archetype).toBe("split");
    if (card.archetype !== "split") throw new Error("expected split card");
    expect(card.mode).toBe("game");
    expect(card.state).toBe("pending");
    expect(card.sides.map((side) => side.label)).toEqual(["Clemson", "LSU"]);
    expect(card.sides.map((side) => side.people.total)).toEqual([1, 4]);
    expect(card.sides.map((side) => side.people.overflow)).toEqual([0, 0]);
    expect(card.sides[1].people.people.map((person) => person.name)).toEqual([
      "Josh Pate",
      "Paul Finebaum",
      "Andy Staples",
      "Greg McElroy",
    ]);
    expect(card.sides[1].people.people[0].portraitFocus).toEqual({
      x: 0.5,
      y: 0.53,
    });
  });

  it("keeps a real one-sided event honest", () => {
    const event = events.find((candidate) => {
      const sideCounts = sidesForCard(candidate, calls).map(
        (side) => side.calls.length
      );
      return sideCounts.filter((count) => count === 0).length === 1;
    });
    expect(event).toBeTruthy();
    const card = resolveEventSocialCard(event!, calls, pundits, teams);
    expect(card.archetype).toBe("split");
    if (card.archetype !== "split") throw new Error("expected split card");
    expect(card.sides.filter((side) => side.empty)).toHaveLength(1);
    const empty = card.sides.find((side) => side.empty)!;
    expect(empty.people).toEqual({ people: [], total: 0, overflow: 0 });
  });

  it("uses an editorial event-information fallback when both sides are empty", () => {
    const card = resolveEventSocialCard(
      fixtureEvent(),
      [],
      [],
      fixtureTeams
    );
    expect(card).toMatchObject({
      archetype: "editorial",
      mode: "event-empty",
      state: "pending",
      people: null,
    });
    expect(card.proof).toContain("No mapped picks yet");
  });

  it("uses named-outcome semantics for a future, never away/home or YES/NO", () => {
    const event = events.find((candidate) => candidate.slug === "nd-title-2026")!;
    const card = resolveEventSocialCard(event, calls, pundits, teams);
    expect(card.archetype).toBe("split");
    if (card.archetype !== "split") throw new Error("expected split card");
    expect(card.mode).toBe("future");
    expect(card.sides.map((side) => side.label)).toEqual([
      "Notre Dame",
      "The field",
    ]);
    expect(card.sides.map((side) => side.label).join(" ")).not.toMatch(
      /\b(?:yes|no|away|home)\b/i
    );
  });

  it("carries an explicit +2 overflow for a synthetic six-person side", () => {
    const fixturePundits = Array.from({ length: 7 }, (_, index) =>
      fixturePundit(`p${index}`)
    );
    const fixtureCalls = [
      fixtureCall("c0", "p0", "yes"),
      ...Array.from({ length: 6 }, (_, index) =>
        fixtureCall(`c${index + 1}`, `p${index + 1}`, "no")
      ),
    ];
    const card = resolveEventSocialCard(
      fixtureEvent(),
      fixtureCalls,
      fixturePundits,
      fixtureTeams
    );
    expect(card.archetype).toBe("split");
    if (card.archetype !== "split") throw new Error("expected split card");
    expect(card.sides[1].people).toMatchObject({ total: 6, overflow: 2 });
    expect(card.sides[1].people.people).toHaveLength(4);
  });
});

describe("Quote social-card resolvers", () => {
  it("preserves the full Orlovsky quote while supplying a bounded excerpt", () => {
    const take = mappedTakes(calls, events, pundits).find(
      (candidate) => candidate.call.id === "orlovsky-rams-sb-20260515"
    )!;
    const card = resolveTakeSocialCard(take, calls, pundits, teams);
    expect(card.archetype).toBe("quote");
    expect(card.mode).toBe("take");
    expect(card.quote).toHaveLength(370);
    expect(card.quoteExcerpt!.length).toBeLessThanOrEqual(160);
    expect(card.subject.name).toBe("Dan Orlovsky");
  });

  it("keeps hit and miss as states of the same Quote template", () => {
    const base = mappedTakes(calls, events, pundits).find(
      (candidate) => candidate.event.slug === "unc-vs-tcu-2026"
    )!;
    const hit = resolveTakeSocialCard(
      { ...base, call: { ...base.call, status: "hit" } },
      calls,
      pundits,
      teams
    );
    const miss = resolveTakeSocialCard(
      { ...base, call: { ...base.call, status: "miss" } },
      calls,
      pundits,
      teams
    );
    expect(hit).toMatchObject({ archetype: "quote", mode: "take", state: "hit" });
    expect(hit.result?.tone).toBe("hit");
    expect(miss).toMatchObject({ archetype: "quote", mode: "take", state: "miss" });
    expect(miss.result?.tone).toBe("miss");
  });

  it("handles the longest live pundit name and a missing-photo fallback", () => {
    const fallica = pundits.find((pundit) => pundit.id === "fallica")!;
    const longName = resolvePunditSocialCard(fallica, calls);
    expect(longName.headline).toBe('Chris "The Bear" Fallica');
    expect(longName.metrics.find((metric) => metric.label === "2026 record")?.value).toBe("—");

    const missingPhoto = resolvePunditSocialCard(
      { ...fallica, id: "no-photo", photo: "" },
      []
    );
    expect(missingPhoto.subject.portrait).toBeNull();
  });
});

describe("Editorial social-card resolvers", () => {
  it("resolves the Clemson team archive into with/against groups", () => {
    const team = teams.find((candidate) => candidate.id === "clemson")!;
    const card = resolveTeamSocialCard(team, events, calls, pundits);
    expect(card).toMatchObject({ archetype: "editorial", mode: "team" });
    expect(card.groups.map((group) => [group.label, group.count])).toEqual([
      ["With", 1],
      ["Against", 4],
    ]);
    expect(card.feature).toMatchObject({
      kicker: "George Wrighster",
      headline: "Lone Clemson call",
    });
  });

  it("resolves an open week around its strongest disagreement", () => {
    const card = resolveWeekSocialCard(
      "ncaaf",
      2026,
      1,
      events,
      calls,
      pundits
    );
    expect(card).toMatchObject({
      archetype: "editorial",
      mode: "week",
      state: "pending",
      headline: "Week 1",
      context: "8 picks · 4 games",
    });
    expect(card.feature).toMatchObject({
      headline: "Clemson at LSU",
      context: "1 — 4 expert pick split",
    });
    expect(card.people?.total).toBe(5);
  });

  it("distinguishes partial and final week states", () => {
    const weekGames = gamesForWeek("ncaaf", 2026, 1, events);
    const weekSlugs = new Set(weekGames.map((game) => game.slug));
    const weekCalls = calls.filter(
      (call) => call.eventSlug && weekSlugs.has(call.eventSlug)
    );
    expect(weekCalls.length).toBeGreaterThan(1);

    const partialCalls = weekCalls.map((call, index) => ({
      ...call,
      status: index === 0 ? ("hit" as const) : ("pending" as const),
    }));
    expect(
      resolveWeekSocialCard(
        "ncaaf",
        2026,
        1,
        events,
        partialCalls,
        pundits
      ).state
    ).toBe("partial");

    const finalCalls = weekCalls.map((call, index) => ({
      ...call,
      status: index % 2 === 0 ? ("hit" as const) : ("miss" as const),
    }));
    expect(
      resolveWeekSocialCard(
        "ncaaf",
        2026,
        1,
        events,
        finalCalls,
        pundits
      ).state
    ).toBe("final");
  });

  it("gives every shareable collection and trust route an Editorial model", () => {
    const keys: SocialPageKey[] = [
      "home",
      "stories",
      "book",
      "leaderboard",
      "ncaaf",
      "nfl",
      "submit",
      "about",
      "methodology",
      "privacy",
      "terms",
    ];
    for (const key of keys) {
      const card = resolvePageSocialCard(key);
      expect(card).toMatchObject({
        archetype: "editorial",
        mode: "page",
        state: "evergreen",
      });
      expect(card.headline.length).toBeGreaterThan(0);
      expect(card.proof.length).toBeGreaterThan(0);
      expect([card.headline, card.context, ...card.proof].join(" ")).not.toMatch(
        /\bYES\b|\bNO\b/
      );
    }
  });
});
