import { describe, expect, it } from "vitest";
import {
  FACTORIES,
  classifyItem,
  easternDay,
  formatFeeds,
  isOffTopic,
  isShortLink,
  isWrongYear,
  latestUsable,
  parseAppleLookup,
  parseYoutubeAtom,
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
  it("marks Friday Finebaum as waiting on Monday", () => {
    const row = classifyItem(
      {
        title: "Hour 4: Week Zero",
        published: "2026-08-28T22:23:00Z",
        url: "https://podcasts.apple.com/us/podcast/hour-4-week-zero/id687989405?i=1",
      },
      mondayEt
    );
    expect(row.status).toBe("waiting");
    expect(row.hunt).toMatch(/do not burn tokens/i);
    expect(row.droppedEt).toBe("2026-08-28");
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

  it("skips YouTube shorts", () => {
    const row = classifyItem(
      {
        title: "Brandon has concerns with the Texas Longhorns",
        published: "2026-08-31T16:00:01Z",
        url: "https://www.youtube.com/shorts/A1uhHd1eM1A",
      },
      mondayEt
    );
    expect(row.status).toBe("short");
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

  it("prefers the latest long episode over a flood of shorts", () => {
    const picked = latestUsable([
      {
        title: "short",
        published: "2026-08-31T19:00:25Z",
        url: "https://www.youtube.com/shorts/jm9iHg1Z82Q",
      },
      {
        title: "SEC & Big 12 Predictions | The BFW Show 8.27.26",
        published: "2026-08-27T23:00:05Z",
        url: "https://www.youtube.com/watch?v=xqh7eqmhPnk",
      },
    ]);
    expect(picked.url).toContain("xqh7eqmhPnk");
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
});
