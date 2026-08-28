import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits, loadTeams } from "./data";
import { mappedTakes } from "./seo";
import {
  eventOgCard,
  ogEventPath,
  ogImageFor,
  ogTakePath,
  takeOgCard,
  takeTweetText,
} from "./og";
import { pageMeta } from "./site";

describe("og paths", () => {
  it("keeps take and event images on stable public URLs", () => {
    expect(ogTakePath("ncsu-at-uva-2026", "kanell")).toBe(
      "/og/takes/ncsu-at-uva-2026--kanell.png"
    );
    expect(ogEventPath("ncsu-at-uva-2026")).toBe("/og/events/ncsu-at-uva-2026.png");
    const image = ogImageFor("/og/takes/ncsu-at-uva-2026--kanell.png", "Danny Kanell picks NC State over Virginia");
    expect(image.url).toBe("https://pundits.pro/og/takes/ncsu-at-uva-2026--kanell.png");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.alt).toBe("Danny Kanell picks NC State over Virginia");
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
    expect(card.headline).toBe("Danny Kanell picks NC State over Virginia");
    expect(card.quote).toMatch(/give me the Wolfpack/i);
    expect(card.photo).toBe("/photos/kanell.jpg");
    expect(card.sides[0].label).toBe("NC State");
    expect(card.sides[0].picked).toBe(true);
    expect(card.sides[0].chip?.abbr).toBe("NCST");
    expect(card.sides[0].cents).toBe("34¢");
    expect(card.sides[1].label).toBe("Virginia");
    expect(card.sides[1].empty).toBe(true);
    expect(card.sides[1].picked).toBe(false);
    expect(JSON.stringify(card)).not.toMatch(/\bYES\b/);
    const tweet = takeTweetText(card, "ncsu-at-uva-2026", "kanell");
    expect(tweet).toContain("Danny Kanell picks NC State over Virginia");
    expect(tweet).toMatch(/give me the Wolfpack/i);
    expect(tweet).toContain("NC State 34¢");
    expect(tweet).toContain("https://pundits.pro/picks/ncsu-at-uva-2026/kanell/");
    expect(tweet).not.toMatch(/@/);
    expect(tweet.length).toBeLessThanOrEqual(280);
  });
});

describe("event cards", () => {
  it("shows Finebaum on TCU and an empty UNC side", () => {
    const event = loadEvents().find((e) => e.slug === "unc-vs-tcu-2026")!;
    const card = eventOgCard(event, loadCalls(), loadPundits(), loadTeams());
    expect(card.file).toBe("/og/events/unc-vs-tcu-2026.png");
    expect(card.title).toBe("North Carolina vs TCU");
    expect(card.sides[0].empty).toBe(true);
    expect(card.sides[0].chip?.abbr).toBe("UNC");
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
  });
});
