import { describe, expect, it } from "vitest";
import { getPundit, loadCalls, loadEvents, loadPundits, loadTeams } from "./data";
import { mappedTakes } from "./seo";
import {
  eventOgCard,
  ogEventPath,
  ogImageFor,
  ogPunditPath,
  ogQuote,
  ogStoryEventPath,
  ogStoryPunditPath,
  ogStoryTakePath,
  ogTakePath,
  ogTeamPath,
  ogWeekPath,
  punditOgCard,
  takeOgCard,
  takeTweetText,
  teamOgCard,
  weekOgCard,
} from "./og";
import { articleMeta, metaDescription, pageMeta } from "./site";

describe("og paths", () => {
  it("keeps take and event images on stable public URLs", () => {
    expect(ogTakePath("ncsu-at-uva-2026", "kanell")).toBe(
      "/og/takes/ncsu-at-uva-2026--kanell.png"
    );
    expect(ogEventPath("ncsu-at-uva-2026")).toBe("/og/events/ncsu-at-uva-2026.png");
    expect(ogStoryTakePath("ncsu-at-uva-2026", "kanell")).toBe(
      "/og/stories/takes/ncsu-at-uva-2026--kanell.png"
    );
    expect(ogStoryEventPath("unc-vs-tcu-2026")).toBe("/og/stories/events/unc-vs-tcu-2026.png");
    expect(ogStoryPunditPath("finebaum")).toBe("/og/stories/pundits/finebaum.png");
    const image = ogImageFor("/og/takes/ncsu-at-uva-2026--kanell.png", "Danny Kanell picks NC State over Virginia");
    expect(image.url).toBe("https://pundits.pro/og/takes/ncsu-at-uva-2026--kanell.png");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.alt).toBe("Danny Kanell picks NC State over Virginia");
  });

  it("versions generated preview URLs from their rendered content", () => {
    const open = ogImageFor("/og/takes/example.png", "Example pick", {
      status: "pending",
      cents: 24,
    });
    const same = ogImageFor("/og/takes/example.png", "Example pick", {
      status: "pending",
      cents: 24,
    });
    const graded = ogImageFor("/og/takes/example.png", "Example pick", {
      status: "hit",
      cents: 24,
    });
    expect(open.url).toMatch(
      /^https:\/\/pundits\.pro\/og\/takes\/example\.png\?v=[a-z0-9]+$/
    );
    expect(same.url).toBe(open.url);
    expect(graded.url).not.toBe(open.url);
  });
});

describe("take cards", () => {
  it("puts Kanell on NC State with chips, not YES tape", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(take).toBeTruthy();
    const card = takeOgCard(take!, loadCalls(), loadPundits(), loadTeams());
    expect(card.file).toBe("/og/takes/ncsu-at-uva-2026--kanell.png");
    expect(card.headline).toBe(
      "Danny Kanell picked NC State over Virginia — and missed (Virginia won)"
    );
    expect(card.quote).toMatch(/give me the Wolfpack/i);
    expect(card.photo).toBe("/photos/kanell.jpg");
    expect(card.sides[0].label).toBe("NC State");
    expect(card.sides[0].picked).toBe(true);
    expect(card.sides[0].chip?.abbr).toBe("NCST");
    expect(card.sides[0].cents).toBe("34¢");
    expect(card.sides[1].label).toBe("Virginia");
    expect(card.sides[1].picked).toBe(false);
    expect(card.status).toBe("miss");
    expect(card.result).toBe("Virginia 34, NC State 8");
    expect(JSON.stringify(card)).not.toMatch(/\bYES\b/);
    const tweet = takeTweetText(card, "ncsu-at-uva-2026", "kanell");
    expect(tweet).toContain(
      "Danny Kanell picked NC State over Virginia — and missed (Virginia won)"
    );
    expect(tweet).toMatch(/give me the Wolfpack/i);
    expect(tweet).toContain("NC State 34¢");
    expect(tweet).toContain("https://pundits.pro/picks/ncsu-at-uva-2026/kanell/");
    expect(tweet).not.toMatch(/@/);
    expect(tweet.length).toBeLessThanOrEqual(280);
  });

  it("clips a long quote on a word, not a short first sentence", () => {
    const claim =
      "It is mass chaos in Chapel Hill. I don't believe they'll win this game in Ireland, and I don't think Bill Belichick is going to survive until the end of the season.";
    const clipped = ogQuote(claim, 140);
    expect(clipped.length).toBeLessThanOrEqual(140);
    expect(clipped).not.toMatch(/don't\.\.\.$/);
    expect(clipped).not.toBe("It is mass chaos in Chapel Hill");
    expect(clipped).toMatch(/Ireland|Chapel Hill/);
  });
});

describe("event cards", () => {
  it("shows Patterson on UNC and Finebaum on TCU", () => {
    const event = loadEvents().find((e) => e.slug === "unc-vs-tcu-2026")!;
    const card = eventOgCard(event, loadCalls(), loadPundits(), loadTeams());
    expect(card.file).toBe("/og/events/unc-vs-tcu-2026.png");
    expect(card.title).toBe("North Carolina vs TCU");
    expect(card.sides[0].empty).toBe(false);
    expect(card.sides[0].chip?.abbr).toBe("UNC");
    expect(card.sides[0].faces.map((f) => f.name)).toContain("Chip Patterson");
    expect(card.sides[1].faces.map((f) => f.name)).toContain("Paul Finebaum");
    expect(card.sides[1].chip?.abbr).toBe("TCU");
  });
});

describe("page meta images", () => {
  it("uses the take image instead of the generic homepage card", () => {
    const image = ogImageFor(
      "/og/takes/ncsu-at-uva-2026--kanell.png",
      "Danny Kanell picks NC State over Virginia"
    );
    const meta = pageMeta(
      "Danny Kanell picks NC State over Virginia",
      "Danny Kanell picks NC State over Virginia. NC State is the underdog at 34¢ on Kalshi, as of Aug 28, 2026.",
      "/picks/ncsu-at-uva-2026/kanell",
      image
    );
    expect(meta.openGraph?.images).toEqual([image]);
    expect(meta.twitter?.images).toEqual([image.url]);
    const home = pageMeta("PUNDITS — Expert CFB and NFL picks", "See which teams");
    const homeImages = home.openGraph?.images as Array<{ url: string }>;
    expect(homeImages[0].url).toBe("https://pundits.pro/og.png");

    const article = articleMeta(
      "Danny Kanell picks NC State over Virginia",
      "The quote and market context.",
      "/picks/ncsu-at-uva-2026/kanell",
      image,
      "2026-08-27",
      "2026-08-28"
    );
    expect(article.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-08-27",
      modifiedTime: "2026-08-28",
    });
  });

  it("keeps generated search and social descriptions within snippet range", () => {
    const long = "Paul Finebaum picks TCU over North Carolina. ".repeat(8);
    const clipped = metaDescription(long);
    expect(clipped.length).toBeLessThanOrEqual(160);
    expect(clipped.endsWith("…")).toBe(true);
    expect(clipped).not.toMatch(/\s…$/);
    const meta = pageMeta("A title", long, "/stories");
    expect(meta.description).toBe(clipped);
    expect(meta.openGraph?.description).toBe(clipped);
    expect(meta.twitter?.description).toBe(clipped);
  });

  it("gives every pundit profile a stable custom card", () => {
    const calls = loadCalls();
    const pundit = getPundit("finebaum", loadPundits(), calls)!;
    const card = punditOgCard(
      pundit,
      calls.find((call) => call.punditId === pundit.id)
    );
    expect(ogPunditPath("finebaum")).toBe("/og/pundits/finebaum.png");
    expect(card).toMatchObject({
      file: "/og/pundits/finebaum.png",
      name: "Paul Finebaum",
      outlet: "Finebaum / ESPN",
    });
    expect(card.latestQuote).toBeTruthy();
    expect(card.recordLabel).toBe("0–1");
  });

  it("gives filled team pages a stable custom card", () => {
    const team = loadTeams().find((candidate) => candidate.id === "tcu")!;
    const card = teamOgCard(team, loadEvents(), loadCalls(), loadPundits());
    expect(ogTeamPath("tcu")).toBe("/og/teams/tcu.png");
    expect(card.file).toBe("/og/teams/tcu.png");
    expect(card.name).toBe("TCU");
    expect(card.withThem + card.against).toBeGreaterThan(0);
  });

  it("gives weekly archives a stable custom card", () => {
    const card = weekOgCard("ncaaf", 2026, 0, loadEvents(), loadCalls());
    expect(ogWeekPath("ncaaf", 2026, 0)).toBe("/og/weeks/ncaaf-2026-week-0.png");
    expect(card.file).toBe("/og/weeks/ncaaf-2026-week-0.png");
    expect(card.title).toMatch(/Week 0/);
    expect(card.line).toMatch(/2–4|2-4/);
  });
});
