import { describe, expect, it } from "vitest";
import {
  FACTORIES,
  classifyItem,
  classifyQueue,
  easternDay,
  episodeId,
  formatFeeds,
  inspectableEpisodes,
  isOffTopic,
  isShortLink,
  isWrongYear,
  latestUsable,
  loadEpisodeLedger,
  mergeDiscoveredEpisodes,
  parseAppleLookup,
  parseYoutubeAtom,
  recordEpisodeInspection,
} from "./scout-feeds-lib.mjs";

const mondayEt = new Date("2026-08-31T20:00:00Z"); // 4pm ET

describe("easternDay", () => {
  it("uses the America/New_York calendar date", () => {
    expect(easternDay(new Date("2026-08-31T03:30:00Z"))).toBe("2026-08-30");
    expect(easternDay(new Date("2026-08-31T16:00:00Z"))).toBe("2026-08-31");
  });
});

describe("isShortLink", () => {
  it("flags YouTube shorts", () => {
    expect(isShortLink("https://www.youtube.com/shorts/A1uhHd1eM1A")).toBe(true);
    expect(isShortLink("https://www.youtube.com/watch?v=xqh7eqmhPnk")).toBe(false);
  });
});

describe("isWrongYear", () => {
  it("flags last season's LOCKS title", () => {
    expect(
      isWrongYear(
        "Week 1 LOCKS: Best Bets For College Football’s Opening Weekend | Texas-Ohio State | LSU-Clemson",
        "2025-08-28T17:09:00Z",
        mondayEt
      )
    ).toBe(true);
  });

  it("keeps this season's LOCKS", () => {
    expect(
      isWrongYear(
        "Week 0 LOCKS Best Bets, Against The Spread Picks, Moneyline Sprinkles & More!",
        "2026-08-27T16:36:43Z",
        mondayEt
      )
    ).toBe(false);
  });
});

describe("parseAppleLookup", () => {
  it("skips the collection row and keeps episode title, date, and url", () => {
    const items = parseAppleLookup({
      results: [
        { wrapperType: "track", collectionName: "The Paul Finebaum Show" },
        {
          wrapperType: "podcastEpisode",
          trackName: "Hour 4: Week Zero",
          releaseDate: "2026-08-28T22:23:00Z",
          trackViewUrl:
            "https://podcasts.apple.com/us/podcast/hour-4-week-zero/id687989405?i=1000786585441",
        },
      ],
    });
    expect(items).toEqual([
      {
        title: "Hour 4: Week Zero",
        published: "2026-08-28T22:23:00Z",
        url: "https://podcasts.apple.com/us/podcast/hour-4-week-zero/id687989405?i=1000786585441",
      },
    ]);
  });
});

describe("parseYoutubeAtom", () => {
  it("reads title, published, and link", () => {
    const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Which college football coach is the most likely to be fired first this season?</title>
    <published>2026-08-31T19:00:25+00:00</published>
    <link rel="alternate" href="https://www.youtube.com/shorts/jm9iHg1Z82Q"/>
  </entry>
  <entry>
    <title>SEC &amp; Big 12 Predictions + 1 on 1 with David Pollack | The BFW Show 8.27.26</title>
    <published>2026-08-27T23:00:05+00:00</published>
    <link rel="alternate" href="https://www.youtube.com/watch?v=xqh7eqmhPnk"/>
  </entry>
</feed>`;
    const items = parseYoutubeAtom(xml);
    expect(items[0].url).toContain("/shorts/");
    expect(items[1].title).toContain("The BFW Show 8.27.26");
  });
});

describe("classifyItem", () => {
  it("keeps an unseen yesterday episode inspectable", () => {
    const row = classifyItem(
      {
        title: "NFL Picks Hour",
        published: "2026-08-30T22:00:00Z",
        url: "https://podcasts.apple.com/us/podcast/nfl-picks/id1042368254?i=1001",
        factoryId: "herd",
      },
      mondayEt,
      { sport: "nfl", factoryId: "herd" }
    );
    expect(row.status).toBe("unprocessed");
    expect(row.hunt).toMatch(/open/i);
  });

  it("marks a five-day-old Finebaum hour as waiting", () => {
    const row = classifyItem(
      {
        title: "Hour 4: Week Zero",
        published: "2026-08-26T22:23:00Z",
        url: "https://podcasts.apple.com/us/podcast/hour-4-week-zero/id687989405?i=1",
      },
      mondayEt,
      { factoryId: "finebaum" }
    );
    expect(row.status).toBe("waiting");
    expect(row.hunt).toMatch(/outside the recent-unprocessed window/i);
    expect(row.droppedEt).toBe("2026-08-26");
  });

  it("marks a Herd 3 & Out fill-in as recap, not Colin locks", () => {
    const row = classifyItem(
      {
        title: "3 & Out - Aaron Donald is BACK on Rams, Bill Belichick & UNC",
        published: "2026-08-31T16:00:00Z",
        url: "https://podcasts.apple.com/us/podcast/3-out/id1042368254?i=1",
      },
      mondayEt,
      { sport: "nfl" }
    );
    expect(row.status).toBe("recap");
  });

  it("marks today's Cover 3 recap as recap, not LOCKS", () => {
    const row = classifyItem(
      {
        title:
          "Upon Further Review: Sell Your UNC Stock, Concern For Florida State, Memphis CFP Buzz & MORE!",
        published: "2026-08-31T16:51:14Z",
        url: "https://podcasts.apple.com/us/podcast/ufr/id1257913963?i=1",
      },
      mondayEt
    );
    expect(row.status).toBe("recap");
    expect(row.hunt).toMatch(/not LOCKS/i);
  });

  it("marks today's LOCKS as open", () => {
    const row = classifyItem(
      {
        title: "Week 1 LOCKS Best Bets, Moneyline Sprinkles | Cover 3",
        published: "2026-09-03T16:00:00Z",
        url: "https://podcasts.apple.com/us/podcast/locks/id1257913963?i=2",
      },
      new Date("2026-09-03T20:00:00Z")
    );
    expect(row.status).toBe("today");
    expect(row.hunt).toMatch(/open/i);
  });

  it("does not reject an official short clip for duration alone", () => {
    const row = classifyItem(
      {
        title: "Brandon locks Texas",
        published: "2026-08-31T16:00:01Z",
        url: "https://www.youtube.com/shorts/A1uhHd1eM1A",
      },
      mondayEt,
      { factoryId: "bfw" }
    );
    expect(row.status).toBe("today");
    expect(row.hunt).toMatch(/duration is not a reject/i);
    expect(row.short).toBe(true);
  });

  it("drops last year's LOCKS even if the title omits the year", () => {
    const row = classifyItem(
      {
        title:
          "Week 1 LOCKS: Best Bets For College Football’s Opening Weekend | Texas-Ohio State | LSU-Clemson",
        published: "2025-08-28T17:09:00Z",
        url: "https://www.youtube.com/watch?v=kxWhaOCc9RI",
      },
      mondayEt
    );
    expect(row.status).toBe("wrong-year");
  });
});

describe("isOffTopic", () => {
  it("skips a Herd NBA ranking hour", () => {
    expect(
      isOffTopic(
        "Hoops Tonight - NBA Player Rankings #8: Anthony Edwards / Minnesota Timberwolves",
        "nfl"
      )
    ).toBe(true);
  });
});

describe("latestUsable", () => {
  it("skips NBA hours when looking for NFL", () => {
    const picked = latestUsable(
      [
        {
          title:
            "Hoops Tonight - NBA Player Rankings #8: Anthony Edwards / Minnesota Timberwolves",
          published: "2026-08-31T16:00:00Z",
          url: "https://podcasts.apple.com/us/podcast/hoops/id1042368254?i=1",
        },
        {
          title: "THE HERD - Hour 1 - Aaron Donald is back on Rams",
          published: "2026-08-28T20:00:00Z",
          url: "https://podcasts.apple.com/us/podcast/herd/id1042368254?i=2",
        },
      ],
      { sport: "nfl" }
    );
    expect(picked.title).toMatch(/Donald/);
  });
});

describe("episode queue", () => {
  const nflPicks = {
    title: "NFL Picks Hour",
    published: "2026-08-30T22:00:00Z",
    url: "https://podcasts.apple.com/us/podcast/nfl-picks/id1042368254?i=1001",
  };
  const nbaHour = {
    title: "Hoops Tonight - NBA Player Rankings #8: Anthony Edwards / Minnesota Timberwolves",
    published: "2026-08-31T16:00:00Z",
    url: "https://podcasts.apple.com/us/podcast/hoops/id1042368254?i=2",
  };

  it("does not let a newer irrelevant episode hide a relevant one", () => {
    const classified = classifyQueue([nbaHour, nflPicks], mondayEt, {
      sport: "nfl",
      factoryId: "herd",
    });
    const inspectable = inspectableEpisodes(classified);
    expect(inspectable.map((row) => row.title)).toEqual(["NFL Picks Hour"]);
    expect(classified[0].status).toBe("off-topic");
  });

  it("does not reprocess a dry episode without a new reason", () => {
    const id = episodeId("herd", nflPicks);
    const ledger = loadEpisodeLedger({
      version: 1,
      episodes: [
        {
          id,
          factoryId: "herd",
          inspected: true,
          outcome: "dry",
          inspectedAt: "2026-08-30T23:00:00Z",
        },
      ],
    });
    const row = classifyItem(nflPicks, mondayEt, {
      sport: "nfl",
      factoryId: "herd",
      ledger,
    });
    expect(row.status).toBe("dry");
    expect(row.hunt).toMatch(/skip unless a new reason/i);
  });

  it("reopens a dry episode when a new reason is stated", () => {
    const id = episodeId("herd", nflPicks);
    const ledger = loadEpisodeLedger({
      version: 1,
      episodes: [
        {
          id,
          factoryId: "herd",
          inspected: true,
          outcome: "dry",
          reopenReason: "named winner chapter was added to show notes",
        },
      ],
    });
    const row = classifyItem(nflPicks, mondayEt, {
      sport: "nfl",
      factoryId: "herd",
      ledger,
    });
    expect(row.status).toBe("unprocessed");
  });
});

describe("episode inspection notes", () => {
  const item = {
    title: "Week 2 picks",
    url: "https://example.org/episode?i=1000788580117",
    published: mondayEt.toISOString(),
  };

  it("replaces the generated feed-check note after actual inspection", () => {
    const discovered = mergeDiscoveredEpisodes({ version: 1, episodes: [] }, "pate", [item]);
    expect(discovered.episodes[0].note).toBe("Feed check only. Not inspected.");
    expect(discovered.episodes[0].inspected).toBe(false);
    const id = discovered.episodes[0].id;
    const updated = recordEpisodeInspection(discovered, id, {
      outcome: "hit",
      inspectedAt: mondayEt.toISOString(),
      coverage: [{ targetId: "ncaaf-w2-alabama-at-kentucky", locator: "~57:03", status: "completed" }],
    });
    expect(updated.episodes[0].note).not.toBe("Feed check only. Not inspected.");
    expect(updated.episodes[0]).not.toHaveProperty("note");
    expect(updated.episodes[0].inspected).toBe(true);
    expect(updated.episodes[0].outcome).toBe("hit");
    expect(updated.episodes[0].id).toBe(id);
    expect(updated.episodes[0].url).toBe(item.url);
    expect(updated.episodes[0].coverage).toEqual([
      { targetId: "ncaaf-w2-alabama-at-kentucky", locator: "~57:03", status: "completed" },
    ]);
  });

  it("preserves a custom evidence note, coverage history, identity, and reopen consumption", () => {
    const id = episodeId("pate", item);
    const ledger = {
      version: 1,
      episodes: [
        {
          id,
          factoryId: "pate",
          title: item.title,
          published: item.published,
          url: item.url,
          locator: "i=1000788580117",
          inspected: true,
          outcome: "hit",
          note: "Staged pate Alabama SU. Do not reprocess without a new reason.",
          coverage: [{ targetId: "old", locator: "00:01", status: "completed" }],
          reopenReason: "New approved target; inspect second speaker at 00:20",
        },
      ],
    };
    const updated = recordEpisodeInspection(ledger, id, {
      outcome: "opened",
      inspectedAt: mondayEt.toISOString(),
      coverage: [{ targetId: "new", locator: "00:20", status: "partial" }],
    });
    expect(updated.episodes[0].note).toBe("Staged pate Alabama SU. Do not reprocess without a new reason.");
    expect(updated.episodes[0].coverage).toHaveLength(2);
    expect(updated.episodes[0].id).toBe(id);
    expect(updated.episodes[0].reopenReason).toBeUndefined();
    expect(updated.episodes[0].inspections[0].reopenReason).toContain("second speaker");
    expect(classifyItem(item, mondayEt, { factoryId: "pate", ledger: updated }).status).toBe("inspected");
    expect(ledger.episodes[0].coverage).toHaveLength(1);
    expect(ledger.episodes[0].reopenReason).toBeDefined();
  });
});

describe("formatFeeds", () => {
  it("prints a coordinator table", () => {
    const md = formatFeeds(
      [
        {
          factory: "Finebaum Show",
          droppedEt: "2026-08-28",
          title: "Hour 4: Week Zero",
          status: "waiting",
          hunt: "do not burn tokens",
          url: "https://example.com/a",
        },
      ],
      mondayEt
    );
    expect(md).toContain("## Factory feeds");
    expect(md).toContain(
      "| Finebaum Show | 2026-08-28 | Hour 4: Week Zero | waiting | do not burn tokens |"
    );
  });
});

describe("FACTORIES", () => {
  it("hunts BFW on Apple, not the dead Unnecessary Roughness YouTube RSS", () => {
    const bfw = FACTORIES.find((factory) => factory.id === "bfw");
    expect(bfw.kind).toBe("apple");
    expect(bfw.appleId).toBe("1375714621");
  });

  it("adds verified Apple ids for GMFB, See Ball Get Ball, and Clay Travis", () => {
    expect(FACTORIES.find((factory) => factory.id === "gmfb")).toMatchObject({
      appleId: "1171438277",
      kind: "apple",
    });
    expect(FACTORIES.find((factory) => factory.id === "see-ball")).toMatchObject({
      appleId: "1769665459",
      kind: "apple",
    });
    expect(FACTORIES.find((factory) => factory.id === "clay-travis")).toMatchObject({
      appleId: "1498106610",
      kind: "apple",
    });
  });
});
