import { describe, expect, it } from "vitest";
import {
  coverageTier,
  displayTier,
  getHomepageFeaturedGames,
  getLeagueGames,
  getLeagueSlate,
  getWeekArchiveGames,
  loadFeaturedPin,
  parseKickoffMinutes,
  sortBySchedule,
  sortFeaturedGames,
} from "./featured";
import { eventScanStatus, loadCalls, loadEvents, loadPundits } from "./data";
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
    expect(featured.ncaaf).toEqual([]);
    expect(featured.nflCompact.map((event) => event.slug)).toEqual([
      opener.slug,
    ]);
  });

  it("derives featured, full, and compact tiers without using onHome", () => {
    const pinned = game("pinned", "ncaaf", "2026-09-05", {
      onHome: false,
    });
    const full = game("full", "ncaaf", "2026-09-05", { onHome: false });
    const compact = game("compact", "ncaaf", "2026-09-05", {
      onHome: true,
    });
    const events = [compact, full, pinned];
    const calls = [
      pick(pinned.slug, "face-1", "yes"),
      pick(full.slug, "face-2", "no"),
      pick(full.slug, "face-3", "no"),
      pick(compact.slug, "face-4", "no"),
    ];
    const pin = { slug: pinned.slug, until: "2026-09-05" };

    expect(displayTier(pinned, events, calls, pundits, pin, "2026-09-01")).toBe(
      "featured"
    );
    expect(displayTier(full, events, calls, pundits, pin, "2026-09-01")).toBe(
      "full"
    );
    expect(
      displayTier(compact, events, calls, pundits, pin, "2026-09-01")
    ).toBe("compact");
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
    expect(featured.nflCompact.map((event) => event.slug)).toContain(opener.slug);
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
        null,
        "2026-09-01"
      ).ncaafCompact.map((event) => event.slug)
    ).toContain(wisconsin.slug);
    expect(
      getHomepageFeaturedGames(
        events,
        calls,
        pundits,
        { slug: wisconsin.slug, until: "2026-09-06" },
        "2026-09-01"
      ).hero?.slug
    ).toBe(wisconsin.slug);
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

  it("keeps full-card overflow on home by rendering it compactly", () => {
    const pinned = game("pinned", "ncaaf", "2026-09-01");
    const dense = Array.from({ length: 4 }, (_, index) =>
      game(`dense-${index}`, "ncaaf", `2026-09-0${index + 2}`)
    );
    const events = [pinned, ...dense];
    const calls = [
      ...twoSided(pinned.slug),
      ...dense.flatMap((event, index) => twoSided(event.slug, index + 3)),
    ];
    const featured = getHomepageFeaturedGames(
      events,
      calls,
      pundits,
      { slug: pinned.slug, until: "2026-09-05" },
      "2026-09-01",
      3
    );

    expect(featured.ncaaf.map((event) => event.slug)).toEqual([
      "dense-0",
      "dense-1",
      "dense-2",
    ]);
    expect(featured.ncaafCompact.map((event) => event.slug)).toEqual([
      "dense-3",
    ]);
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
    const duplicate = game("duplicate-face", "ncaaf", "2026-09-05", {
      onHome: true,
    });
    const denser = game("two-faces", "ncaaf", "2026-09-05", {
      onHome: false,
    });
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

  it("does not put a final game in the live hero when an open game exists", () => {
    const liveCalls = loadCalls();
    const featured = getHomepageFeaturedGames(
      loadEvents(),
      liveCalls,
      loadPundits(),
      loadFeaturedPin(),
      "2026-09-01"
    );
    if (!featured.hero) return;
    expect(eventScanStatus(featured.hero, liveCalls)).not.toBe("final");
  });

  it("caps leftover compact teasers at two per sport", () => {
    const events = Array.from({ length: 5 }, (_, index) =>
      game(`thin-${index}`, "ncaaf", `2026-09-0${index + 2}`)
    );
    const calls = events.map((event, index) =>
      pick(event.slug, `face-${index + 1}`, "no")
    );
    const featured = getHomepageFeaturedGames(
      events,
      calls,
      pundits,
      null,
      "2026-09-01"
    );
    expect(featured.ncaaf).toEqual([]);
    expect(featured.hero?.slug).toBe("thin-0");
    expect(featured.ncaafCompact.map((event) => event.slug)).toEqual([
      "thin-1",
      "thin-2",
    ]);
  });

  it("caps Finals at two latest per sport", () => {
    const finals = [
      game("old", "ncaaf", "2026-08-29", { awayScore: 1, homeScore: 2 }),
      game("mid", "ncaaf", "2026-08-30", { awayScore: 1, homeScore: 2 }),
      game("new", "ncaaf", "2026-08-31", { awayScore: 1, homeScore: 2 }),
    ];
    const calls = finals.map((event, index) =>
      pick(event.slug, `face-${index + 1}`, "yes", "hit")
    );
    const featured = getHomepageFeaturedGames(
      finals,
      calls,
      pundits,
      null,
      "2026-09-01"
    );
    expect(featured.ncaafFinal.map((event) => event.slug)).toEqual([
      "new",
      "mid",
    ]);
  });

  it("keeps leftover full-tier overflow in schedule order with compact-tier", () => {
    const friday = game("friday-thin", "ncaaf", "2026-09-04", {
      kickoff: "Fri 9:00 ET",
    });
    const saturdayFull = [
      game("full-a", "ncaaf", "2026-09-05", { kickoff: "Sat 12:00 ET" }),
      game("full-b", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" }),
      game("full-c", "ncaaf", "2026-09-05", { kickoff: "Sat 7:30 ET" }),
      game("full-d", "ncaaf", "2026-09-05", { kickoff: "Sat 9:00 ET" }),
    ];
    const events = [friday, ...saturdayFull];
    const calls = [
      pick(friday.slug, "face-1", "no"),
      ...saturdayFull.flatMap((event, index) => twoSided(event.slug, index + 2)),
    ];
    const featured = getHomepageFeaturedGames(
      events,
      calls,
      pundits,
      null,
      "2026-09-01"
    );
    expect(featured.hero?.slug).toBe("full-a");
    expect(featured.ncaaf.map((event) => event.slug)).toEqual([
      "full-b",
      "full-c",
      "full-d",
    ]);
    expect(featured.ncaafCompact.map((event) => event.slug)).toEqual([
      friday.slug,
    ]);
  });
});

describe("coverageTier", () => {
  it("is full when both sides have a carded pick", () => {
    const event = game("fight", "ncaaf", "2026-09-05");
    expect(coverageTier(event, twoSided(event.slug), pundits)).toBe("full");
  });

  it("is full when two faces pick the same side", () => {
    const event = game("stack", "ncaaf", "2026-09-05");
    const calls = [
      pick(event.slug, "face-1", "no"),
      pick(event.slug, "face-2", "no"),
    ];
    expect(coverageTier(event, calls, pundits)).toBe("full");
  });

  it("is compact for one carded face", () => {
    const event = game("thin", "ncaaf", "2026-09-05");
    expect(coverageTier(event, [pick(event.slug, "face-1", "no")], pundits)).toBe(
      "compact"
    );
  });

  it("does not count a photo-less pundit as a face", () => {
    const event = game("no-photo", "ncaaf", "2026-09-05");
    const calls = [
      pick(event.slug, "face-1", "yes"),
      pick(event.slug, "face-2", "no"),
    ];
    const noPhoto = pundits.map((pundit) =>
      pundit.id === "face-2" ? { ...pundit, photo: "" } : pundit
    );
    expect(coverageTier(event, calls, noPhoto)).toBe("compact");
  });
});

describe("parseKickoffMinutes", () => {
  it("treats 12:00 as noon", () => {
    expect(parseKickoffMinutes("Sat 12:00 ET")).toBe(720);
    expect(parseKickoffMinutes("12:30 ET")).toBe(750);
  });

  it("treats hours 1 through 11 as PM", () => {
    expect(parseKickoffMinutes("Sun 1:00 ET")).toBe(780);
    expect(parseKickoffMinutes("Sat 3:30 ET")).toBe(930);
    expect(parseKickoffMinutes("Sat 7:30 ET")).toBe(1170);
    expect(parseKickoffMinutes("Fri 9:00 ET")).toBe(1260);
    expect(parseKickoffMinutes("Mon 10:30 ET")).toBe(1350);
  });

  it("ignores the day-of-week token", () => {
    expect(parseKickoffMinutes("Fri 9:00 ET")).toBe(
      parseKickoffMinutes("Sat 9:00 ET")
    );
  });

  it("returns null for missing and unparseable strings", () => {
    expect(parseKickoffMinutes(undefined)).toBeNull();
    expect(parseKickoffMinutes("")).toBeNull();
    expect(parseKickoffMinutes("TBD")).toBeNull();
    expect(parseKickoffMinutes("Sat Night ET")).toBeNull();
    expect(parseKickoffMinutes("13:00 ET")).toBeNull();
  });
});

describe("sortBySchedule", () => {
  it("ranks same-date clocks 1:00 then 3:30 then 7:30 then 9:00 then 10:30", () => {
    const events = [
      game("night", "ncaaf", "2026-09-05", { kickoff: "Sat 10:30 ET" }),
      game("nine", "ncaaf", "2026-09-05", { kickoff: "Sat 9:00 ET" }),
      game("evening", "ncaaf", "2026-09-05", { kickoff: "Sat 7:30 ET" }),
      game("afternoon", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" }),
      game("early", "ncaaf", "2026-09-05", { kickoff: "Sat 1:00 ET" }),
    ];
    const calls = events.flatMap((event) => twoSided(event.slug));
    expect(sortBySchedule(events, calls, pundits).map((event) => event.slug)).toEqual([
      "early",
      "afternoon",
      "evening",
      "nine",
      "night",
    ]);
  });

  it("ranks 12:00 noon before 1:00 PM on the same date", () => {
    const noon = game("noon", "ncaaf", "2026-09-05", { kickoff: "Sat 12:00 ET" });
    const one = game("one", "ncaaf", "2026-09-05", { kickoff: "Sat 1:00 ET" });
    const calls = [...twoSided(noon.slug), ...twoSided(one.slug, 3)];
    expect(sortBySchedule([one, noon], calls, pundits).map((event) => event.slug)).toEqual([
      noon.slug,
      one.slug,
    ]);
  });

  it("puts missing or unparseable kickoff last on that date", () => {
    const timed = game("timed", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" });
    const missing = game("missing", "ncaaf", "2026-09-05", { kickoff: undefined });
    const tbd = game("tbd", "ncaaf", "2026-09-05", { kickoff: "TBD" });
    const calls = [timed, missing, tbd].flatMap((event) => twoSided(event.slug));
    expect(
      sortBySchedule([tbd, missing, timed], calls, pundits).map((event) => event.slug)
    ).toEqual([timed.slug, missing.slug, tbd.slug]);
  });

  it("lets kickoffDate beat clock", () => {
    const friday = game("friday", "ncaaf", "2026-09-04", { kickoff: "Fri 9:00 ET" });
    const saturday = game("saturday", "ncaaf", "2026-09-05", {
      kickoff: "Sat 3:30 ET",
    });
    const calls = [...twoSided(friday.slug), ...twoSided(saturday.slug, 3)];
    expect(
      sortBySchedule([saturday, friday], calls, pundits).map((event) => event.slug)
    ).toEqual([friday.slug, saturday.slug]);
  });

  it("keeps a Friday compact game above a Sunday full game", () => {
    const friday = game("friday-thin", "ncaaf", "2026-09-04", {
      kickoff: "Fri 9:00 ET",
    });
    const sunday = game("sunday-dense", "ncaaf", "2026-09-06", {
      kickoff: "Sun 7:30 ET",
    });
    const calls = [
      pick(friday.slug, "face-1", "no"),
      ...twoSided(sunday.slug, 2),
      pick(sunday.slug, "face-4", "no"),
    ];
    expect(
      sortBySchedule([sunday, friday], calls, pundits).map((event) => event.slug)
    ).toEqual([friday.slug, sunday.slug]);
  });
});

describe("getLeagueSlate", () => {
  it("does not inherit onHome sort on the league slate", () => {
    const friday = game("friday-off", "ncaaf", "2026-09-04", {
      onHome: false,
      week: 1,
      season: 2026,
      kickoff: "Fri 9:00 ET",
    });
    const saturday = game("saturday-on", "ncaaf", "2026-09-05", {
      onHome: true,
      homeRank: 0,
      week: 1,
      season: 2026,
      kickoff: "Sat 7:30 ET",
    });
    const calls = [
      pick(friday.slug, "face-1", "no"),
      ...twoSided(saturday.slug, 2),
    ];
    const slate = getLeagueSlate("ncaaf", [saturday, friday], calls, pundits);
    expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
      friday.slug,
      saturday.slug,
    ]);
  });

  it("omits a settled previous week from live weeks and teases it", () => {
    const week0 = game("week0", "ncaaf", "2026-08-29", {
      week: 0,
      season: 2026,
      awayScore: 10,
      homeScore: 7,
    });
    const week1 = game("week1", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
    });
    const calls = [
      pick(week0.slug, "face-1", "yes", "hit"),
      pick(week1.slug, "face-2", "no"),
    ];
    const slate = getLeagueSlate("ncaaf", [week0, week1], calls, pundits);
    expect(slate.weeks.map((block) => block.week)).toEqual([1]);
    expect(slate.previous).toMatchObject({
      week: 0,
      season: 2026,
      href: "/ncaaf/2026/week-0/",
    });
    expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([week1.slug]);
  });

  it("shows a later week below the current week when it already has picks", () => {
    const week1 = game("w1", "ncaaf", "2026-09-05", { week: 1, season: 2026 });
    const week2 = game("w2", "ncaaf", "2026-09-12", { week: 2, season: 2026 });
    const calls = [
      pick(week1.slug, "face-1", "no"),
      pick(week2.slug, "face-2", "yes"),
    ];
    const slate = getLeagueSlate("ncaaf", [week2, week1], calls, pundits);
    expect(slate.weeks.map((block) => block.week)).toEqual([1, 2]);
  });

  it("keeps the most recently settled week when nothing is open", () => {
    const week0 = game("w0", "ncaaf", "2026-08-29", {
      week: 0,
      season: 2026,
      awayScore: 1,
      homeScore: 2,
    });
    const week1 = game("w1", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
      awayScore: 3,
      homeScore: 4,
    });
    const calls = [
      pick(week0.slug, "face-1", "yes", "hit"),
      pick(week1.slug, "face-2", "no", "miss"),
    ];
    const slate = getLeagueSlate("ncaaf", [week0, week1], calls, pundits);
    expect(slate.weeks.map((block) => block.week)).toEqual([1]);
    expect(slate.weeks[0].open).toEqual([]);
    expect(slate.weeks[0].final.map((event) => event.slug)).toEqual([week1.slug]);
    expect(slate.previous?.week).toBe(0);
  });

  it("keeps unpriced mapped games on the league slate", () => {
    const unpriced = game("unpriced", "ncaaf", "2026-09-04", {
      yesCents: null,
      noCents: null,
      sourceUrl: null,
      week: 1,
      season: 2026,
    });
    const calls = [pick(unpriced.slug, "face-1", "yes")];
    const slate = getLeagueSlate("ncaaf", [unpriced], calls, pundits);
    expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
      unpriced.slug,
    ]);
  });

  it("lists unscheduled mapped games separately", () => {
    const scheduled = game("scheduled", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
    });
    const stray = game("stray", "ncaaf", "2026-09-06", {
      week: undefined,
      season: undefined,
    });
    const calls = [
      pick(scheduled.slug, "face-1", "no"),
      pick(stray.slug, "face-2", "yes"),
    ];
    const slate = getLeagueSlate("ncaaf", [scheduled, stray], calls, pundits);
    expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
      scheduled.slug,
    ]);
    expect(slate.unscheduled.map((event) => event.slug)).toEqual([stray.slug]);
  });

  it("uses schedule order on week archives and drops zero-pick games", () => {
    const late = game("late", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
      kickoff: "Sat 7:30 ET",
      homeRank: 0,
    });
    const early = game("early", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
      kickoff: "Sat 12:00 ET",
      homeRank: 1,
    });
    const empty = game("empty", "ncaaf", "2026-09-05", {
      week: 1,
      season: 2026,
    });
    const calls = [
      pick(late.slug, "face-1", "no"),
      pick(early.slug, "face-2", "yes"),
    ];
    expect(
      getWeekArchiveGames(
        "ncaaf",
        2026,
        1,
        [late, early, empty],
        calls,
        pundits
      ).map((event) => event.slug)
    ).toEqual([early.slug, late.slug]);
  });
});
