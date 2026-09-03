import { describe, expect, it } from "vitest";
import {
  getHomepageFeaturedGames,
  getLeagueGames,
  loadFeaturedPin,
  sortFeaturedGames,
} from "./featured";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { homeHeroLede } from "./share";
import type { Call, Event, Pundit, Side, Sport } from "./types";

const pundits: Pundit[] = Array.from({ length: 10 }, (_, index) => ({
  id: `face-${index + 1}`,
  name: `Face ${index + 1}`,
  outlet: "Fixture Network",
  photo: `/photos/face-${index + 1}.jpg`,
  sport: "both",
}));

function game(
  slug: string,
  sport: Sport,
  kickoffDate: string,
  patch: Partial<Event> = {}
): Event {
  return {
    slug,
    title: slug,
    contractName: slug,
    yesCents: 40,
    noCents: 60,
    sourceUrl: "https://example.com/freeze",
    sourcedAt: "2026-09-01",
    onHome: true,
    sport,
    homeRank: 10,
    kind: "game",
    awayTeam: "Away",
    homeTeam: "Home",
    kickoffDate,
    kickoff: "Sat 7:30 ET",
    network: "ABC",
    ...patch,
  };
}

function pick(
  eventSlug: string,
  punditId: string,
  side: Side,
  status: Call["status"] = "pending"
): Call {
  return {
    id: `${eventSlug}-${punditId}-${side}`,
    punditId,
    claim: `${punditId} takes ${side}`,
    source: "Fixture Network",
    sourceUrl: "https://example.com/pick",
    sourceDate: "2026-09-01",
    kind: "hard",
    subject: eventSlug,
    paysOn: eventSlug,
    status,
    eventSlug,
    side,
  };
}

function twoSided(eventSlug: string, firstFace = 1): Call[] {
  return [
    pick(eventSlug, `face-${firstFace}`, "yes"),
    pick(eventSlug, `face-${firstFace + 1}`, "no"),
  ];
}

describe("featured game display", () => {
  it("lets an inclusive pin beat a sooner one-sided NFL opener", () => {
    const clemson = game("clemson-at-lsu-2026", "ncaaf", "2026-09-05");
    const opener = game("nfl-opener", "nfl", "2026-09-03");
    const calls = [...twoSided(clemson.slug), pick(opener.slug, "face-3", "no")];
    const featured = getHomepageFeaturedGames(
      [opener, clemson],
      calls,
      pundits,
      { slug: clemson.slug, until: "2026-09-05" },
      "2026-09-05"
    );

    expect(featured.hero?.slug).toBe(clemson.slug);
  });

  it("ignores an expired pin", () => {
    const earlier = game("earlier", "ncaaf", "2026-09-04");
    const pinned = game("pinned", "ncaaf", "2026-09-05");
    const calls = [...twoSided(earlier.slug), ...twoSided(pinned.slug, 3)];
    const featured = getHomepageFeaturedGames(
      [pinned, earlier],
      calls,
      pundits,
      { slug: pinned.slug, until: "2026-09-05" },
      "2026-09-06"
    );

    expect(featured.hero?.slug).toBe(earlier.slug);
  });

  it("ignores an invalid pin slug without crashing", () => {
    const earlier = game("earlier", "ncaaf", "2026-09-04");
    const later = game("later", "ncaaf", "2026-09-05");
    const calls = [...twoSided(earlier.slug), ...twoSided(later.slug, 3)];

    expect(
      getHomepageFeaturedGames(
        [later, earlier],
        calls,
        pundits,
        { slug: "missing", until: "2026-09-10" },
        "2026-09-01"
      ).hero?.slug
    ).toBe(earlier.slug);
  });

  it("keeps an empty-side card out of the hero when a two-sided card exists", () => {
    const opener = game("one-sided-opener", "nfl", "2026-09-03");
    const fight = game("two-sided-fight", "ncaaf", "2026-09-05");
    const calls = [pick(opener.slug, "face-1", "no"), ...twoSided(fight.slug, 2)];
    const featured = getHomepageFeaturedGames(
      [opener, fight],
      calls,
      pundits,
      null,
      "2026-09-01"
    );

    expect(featured.hero?.slug).toBe(fight.slug);
    expect(featured.nfl.map((event) => event.slug)).toContain(opener.slug);
  });

  it("keeps unpriced games off home but allows them on a league board", () => {
    const unpriced = game("unpriced", "ncaaf", "2026-09-04", {
      yesCents: null,
      noCents: null,
      sourceUrl: null,
      onHome: false,
    });
    const calls = [pick(unpriced.slug, "face-1", "yes")];

    const featured = getHomepageFeaturedGames(
      [unpriced],
      calls,
      pundits,
      null,
      "2026-09-01"
    );
    expect(featured.ncaaf).toEqual([]);
    expect(featured.ncaafFinal).toEqual([]);
    expect(getLeagueGames("ncaaf", [unpriced], calls).map((event) => event.slug)).toEqual([
      unpriced.slug,
    ]);
  });

  it("requires a rostered face with a photo for a complete homepage card", () => {
    const event = game("missing-photo", "ncaaf", "2026-09-04");
    const calls = [pick(event.slug, "face-1", "yes")];
    const noPhoto = pundits.map((pundit) =>
      pundit.id === "face-1" ? { ...pundit, photo: "" } : pundit
    );

    expect(
      getHomepageFeaturedGames(
        [event],
        calls,
        noPhoto,
        null,
        "2026-09-01"
      ).ncaaf
    ).toEqual([]);
    expect(getLeagueGames("ncaaf", [event], calls)).toEqual([event]);
  });

  it("excludes games with zero mapped hard picks from home and league boards", () => {
    const empty = game("empty", "ncaaf", "2026-09-04");
    const soft: Call = { ...pick(empty.slug, "face-1", "yes"), kind: "soft" };

    expect(
      getHomepageFeaturedGames([empty], [soft], pundits, null, "2026-09-01").ncaaf
    ).toEqual([]);
    expect(getLeagueGames("ncaaf", [empty], [soft])).toEqual([]);
  });

  it("lets an off-home mapped game reach league immediately and home only by the waterfall", () => {
    const leaders = [
      game("leader-1", "ncaaf", "2026-09-02"),
      game("leader-2", "ncaaf", "2026-09-03"),
      game("leader-3", "ncaaf", "2026-09-04"),
    ];
    const wisconsin = game("wisconsin-style", "ncaaf", "2026-09-06", {
      onHome: false,
    });
    const events = [...leaders, wisconsin];
    const calls = [
      ...twoSided(leaders[0].slug),
      ...twoSided(leaders[1].slug, 3),
      ...twoSided(leaders[2].slug, 5),
      pick(wisconsin.slug, "face-7", "no"),
    ];

    expect(getLeagueGames("ncaaf", events, calls).map((event) => event.slug)).toContain(
      wisconsin.slug
    );
    expect(
      getHomepageFeaturedGames(events, calls, pundits, null, "2026-09-01").ncaaf.map(
        (event) => event.slug
      )
    ).not.toContain(wisconsin.slug);
    expect(
      getHomepageFeaturedGames(
        events,
        calls,
        pundits,
        { slug: wisconsin.slug, until: "2026-09-06" },
        "2026-09-01"
      ).ncaaf.map((event) => event.slug)
    ).toContain(wisconsin.slug);
  });

  it("fills College and NFL independently", () => {
    const college = Array.from({ length: 4 }, (_, index) =>
      game(`college-${index}`, "ncaaf", `2026-09-0${index + 2}`)
    );
    const nfl = [
      game("nfl-1", "nfl", "2026-09-08"),
      game("nfl-2", "nfl", "2026-09-09"),
    ];
    const calls = [...college, ...nfl].flatMap((event, index) =>
      twoSided(event.slug, (index % 4) + 1)
    );
    const featured = getHomepageFeaturedGames(
      [...college, ...nfl],
      calls,
      pundits,
      null,
      "2026-09-01"
    );

    expect(featured.ncaaf).toHaveLength(3);
    expect(featured.nfl).toHaveLength(2);
  });

  it("keeps settled games in Final rather than featured slots", () => {
    const settled = game("settled", "ncaaf", "2026-08-29", {
      awayScore: 24,
      homeScore: 17,
    });
    const calls = [pick(settled.slug, "face-1", "yes", "hit")];
    const featured = getHomepageFeaturedGames(
      [settled],
      calls,
      pundits,
      null,
      "2026-09-01"
    );

    expect(featured.hero).toBeUndefined();
    expect(featured.ncaaf).toEqual([]);
    expect(featured.ncaafFinal.map((event) => event.slug)).toEqual([
      settled.slug,
    ]);
    expect(getLeagueGames("ncaaf", [settled], calls)).toEqual([settled]);
  });

  it("puts an off-home settled complete card in homepage Final", () => {
    const wisconsin = game("wisconsin-settled", "ncaaf", "2026-09-06", {
      onHome: false,
      awayScore: 10,
      homeScore: 24,
    });
    const onHomeFinal = game("week0-final", "ncaaf", "2026-08-29", {
      awayScore: 15,
      homeScore: 10,
    });
    const calls = [
      pick(wisconsin.slug, "face-1", "no", "hit"),
      pick(onHomeFinal.slug, "face-2", "yes", "hit"),
    ];
    const featured = getHomepageFeaturedGames(
      [wisconsin, onHomeFinal],
      calls,
      pundits,
      null,
      "2026-09-07"
    );

    expect(featured.ncaafFinal.map((event) => event.slug)).toEqual([
      wisconsin.slug,
      onHomeFinal.slug,
    ]);
  });

  it("sorts by date without penalizing a Melbourne kickoff", () => {
    const melbourne = game("melbourne", "nfl", "2026-09-04", {
      kickoff: "Thu 8:35 ET",
      network: "Netflix · Melbourne",
    });
    const usPrimetime = game("us-primetime", "nfl", "2026-09-05", {
      network: "NBC",
    });
    const calls = [...twoSided(melbourne.slug), ...twoSided(usPrimetime.slug, 3)];

    expect(
      sortFeaturedGames(
        [usPrimetime, melbourne],
        calls,
        pundits,
        null,
        "2026-09-01"
      ).map((event) => event.slug)
    ).toEqual([melbourne.slug, usPrimetime.slug]);
  });

  it("uses unique pundits for the coverage tie-break", () => {
    const duplicate = game("duplicate-face", "ncaaf", "2026-09-05");
    const denser = game("two-faces", "ncaaf", "2026-09-05");
    const calls = [
      pick(duplicate.slug, "face-1", "no"),
      { ...pick(duplicate.slug, "face-1", "no"), id: "duplicate-call" },
      pick(denser.slug, "face-2", "no"),
      pick(denser.slug, "face-3", "no"),
    ];

    expect(
      sortFeaturedGames([duplicate, denser], calls, pundits, null, "2026-09-01")[0]
        .slug
    ).toBe(denser.slug);
  });

  it("matches this week's Clemson hero and lede from live data", () => {
    const calls = loadCalls();
    const livePundits = loadPundits();
    const featured = getHomepageFeaturedGames(
      loadEvents(),
      calls,
      livePundits,
      loadFeaturedPin(),
      "2026-09-01"
    );

    expect(featured.hero?.slug).toBe("clemson-at-lsu-2026");
    expect(homeHeroLede(featured.hero!, calls, livePundits)).toBe(
      "Josh Pate, Paul Finebaum, Andy Staples, and Greg McElroy pick LSU. George Wrighster and Danny Kanell pick Clemson."
    );
    expect(featured.ncaaf.map((event) => event.slug)).toEqual([
      "clemson-at-lsu-2026",
      "ucla-at-cal-2026",
      "baylor-vs-auburn-2026",
    ]);
    expect(featured.ncaafFinal.map((event) => event.slug)).toEqual([
      "ncsu-at-uva-2026",
      "unc-vs-tcu-2026",
    ]);
    expect(featured.nfl.map((event) => event.slug)).toEqual([
      "patriots-at-seahawks-2026",
      "49ers-vs-rams-2026",
      "bills-at-texans-2026",
    ]);
    expect(featured.nflFinal).toEqual([]);
  });
});
