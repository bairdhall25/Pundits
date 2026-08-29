import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import type { Event } from "./types";
import {
  mappedTakes,
  pickLede,
  pickStory,
  sideChip,
  takeHeadline,
  takePath,
  toStoryCard,
  organizationGraph,
  articleJsonLd,
} from "./seo";
import { canonicalUrl } from "./site";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("canonical URLs", () => {
  it("always points at pundits.pro", () => {
    expect(canonicalUrl("/")).toBe("https://pundits.pro/");
    expect(canonicalUrl("/picks/unc-vs-tcu-2026")).toBe(
      "https://pundits.pro/picks/unc-vs-tcu-2026/"
    );
    expect(canonicalUrl("/og.png")).toBe("https://pundits.pro/og.png");
  });

  it("301s pre-season pick URLs onto the 2026 slug", () => {
    const redirects = readFileSync(
      path.join(process.cwd(), "public", "_redirects"),
      "utf8"
    );
    expect(redirects).toContain(
      "/picks/clemson-at-lsu /picks/clemson-at-lsu-2026/ 301"
    );
    expect(redirects).toContain(
      "/picks/clemson-at-lsu/* /picks/clemson-at-lsu-2026/:splat 301"
    );
    expect(redirects).toContain(
      "/picks/texas-cfp /picks/texas-cfp-2026/ 301"
    );
    for (const e of loadEvents()) {
      expect(e.slug.endsWith(`-${e.season}`), e.slug).toBe(true);
    }
  });
});

describe("mapped takes", () => {
  it("includes Finebaum on Dublin as a unique take", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const dublin = takes.find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(dublin).toBeTruthy();
    expect(takeHeadline(dublin!.pundit, dublin!.event, dublin!.call)).toBe(
      "Paul Finebaum picks TCU over North Carolina"
    );
    expect(takePath("unc-vs-tcu-2026", "finebaum")).toBe(
      "/picks/unc-vs-tcu-2026/finebaum"
    );
  });

  it("includes Kanell on NC State at Virginia", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const ncsu = takes.find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(ncsu).toBeTruthy();
    expect(takeHeadline(ncsu!.pundit, ncsu!.event, ncsu!.call)).toBe(
      "Danny Kanell picks NC State over Virginia"
    );
    expect(takePath("ncsu-at-uva-2026", "kanell")).toBe(
      "/picks/ncsu-at-uva-2026/kanell"
    );
  });

  it("is unique per event and pundit", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const keys = takes.map((t) => `${t.event.slug}/${t.pundit.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("mints an over/under headline for every mapped game take", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const games = takes.filter((t) => t.event.awayTeam && t.event.homeTeam);
    expect(games.length).toBeGreaterThan(0);
    for (const take of games) {
      const h = takeHeadline(take.pundit, take.event, take.call);
      expect(h, take.call.id).toMatch(/ picks .+ over /);
      const story = pickStory(take);
      expect(story.paragraphs.join(" "), take.call.id).toContain(take.call.claim);
    }
  });
});

describe("pick stories", () => {
  it("announces Finebaum on Dublin from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe("Paul Finebaum picks TCU over North Carolina");
    expect(story.dek).toContain("North Carolina as the underdog at 26¢");
    expect(story.paragraphs.join(" ")).toContain("mass chaos in Chapel Hill");
    expect(story.paragraphs.join(" ")).not.toMatch(/McAfee|SMU/i);
  });

  it("announces Kanell on NC State from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe("Danny Kanell picks NC State over Virginia");
    expect(story.dek).toContain("NC State as the underdog at 34¢");
    expect(story.paragraphs.join(" ")).toContain("give me the Wolfpack");
    expect(story.paragraphs.join(" ")).not.toMatch(/Chip Patterson|Tarheels/i);
  });

  it("announces Patterson on UNC from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "patterson"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe("Chip Patterson picks North Carolina over TCU");
    expect(story.dek).toContain("North Carolina as the underdog at 26¢");
    expect(story.paragraphs.join(" ")).toContain("Tarheels to come back with the win");
    expect(story.paragraphs.join(" ")).not.toMatch(/Wolfpack|Kanell/i);
  });

  it("does not print YES · YES on futures chips", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "texas-cfp-2026" && t.pundit.id === "fallica"
    );
    expect(take).toBeTruthy();
    expect(sideChip(take!.event, "no")).toBe("Against");
    expect(toStoryCard(take!).sideChip).toBe("Against");
    const dublinNo = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    )!;
    expect(toStoryCard(dublinNo).sideChip).toBe("TCU");
    const dublinYes = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "patterson"
    )!;
    expect(toStoryCard(dublinYes).sideChip).toBe("North Carolina");
  });
});

describe("pick copy", () => {
  it("says so when a market has no mapped face", () => {
    const event: Event = {
      slug: "faceless-game-2026",
      kind: "game",
      title: "A vs B",
      contractName: "A vs B — moneyline",
      awayTeam: "A",
      homeTeam: "B",
      yesCents: 40,
      noCents: 60,
      sourceUrl: "https://example.com",
      sourcedAt: "2026-08-28",
      onHome: true,
      sport: "ncaaf",
      homeRank: 9,
    };
    expect(pickLede(event, [], [])).toMatch(/no verified expert pick/i);
  });
});

describe("json-ld", () => {
  it("publishes Organization and WebSite", () => {
    const graph = organizationGraph();
    const types = graph["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    const org = graph["@graph"].find((n: { "@type": string }) => n["@type"] === "Organization") as {
      legalName: string;
      sameAs: string[];
    };
    expect(org.legalName).toBe("Indie Labs LLC");
    expect(org.sameAs).toContain("https://x.com/Pundits_");
  });

  it("marks a take as a staff-written NewsArticle about the pundit", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(take).toBeTruthy();
    const json = articleJsonLd(take!);
    expect(json["@type"]).toBe("NewsArticle");
    expect(json.headline).toBe("Paul Finebaum picks TCU over North Carolina");
    expect(json.author).toMatchObject({ name: "PUNDITS Staff" });
    expect(json.mentions).toMatchObject({ name: "Paul Finebaum" });
    expect(json.image).toContain(
      "https://pundits.pro/og/takes/unc-vs-tcu-2026--finebaum.png"
    );
  });

  it("writes grammatical futures headlines", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const yes = takes.find(
      (t) => t.event.slug === "nd-title-2026" && t.pundit.id === "herbstreit"
    )!;
    const no = takes.find(
      (t) => t.event.slug === "indiana-title-2026" && t.pundit.id === "finebaum"
    )!;
    expect(takeHeadline(yes.pundit, yes.event, yes.call)).toBe(
      "Kirk Herbstreit picks Notre Dame to win the national title"
    );
    expect(takeHeadline(no.pundit, no.event, no.call)).toBe(
      "Paul Finebaum does not see Indiana winning the national title"
    );
  });
});

describe("graded take headlines", () => {
  const pundit = {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "ESPN",
    photo: "/photos/finebaum.jpg",
    sport: "ncaaf",
  } as never;
  const game = {
    slug: "unc-vs-tcu-2026",
    title: "North Carolina vs TCU",
    awayTeam: "North Carolina",
    homeTeam: "TCU",
    yesCents: 26,
    noCents: 75,
    sport: "ncaaf",
    kind: "game",
  } as Event;
  const future = {
    slug: "indiana-title-2026",
    title: "Indiana wins the national title",
    yesCents: 9,
    noCents: 91,
    sport: "ncaaf",
    kind: "future",
  } as Event;
  const call = (over: object) =>
    ({
      id: "c",
      punditId: "finebaum",
      claim: "quote",
      source: "First Take",
      sourceDate: "2026-08-25",
      kind: "hard",
      status: "pending",
      ...over,
    }) as never;

  it("keeps present tense while the pick is live", () => {
    expect(takeHeadline(pundit, game, call({ side: "no", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picks TCU over North Carolina"
    );
  });

  it("marks a graded game pick with the verdict", () => {
    expect(takeHeadline(pundit, game, call({ side: "no", status: "hit", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picked TCU over North Carolina — and hit"
    );
    expect(takeHeadline(pundit, game, call({ side: "yes", status: "miss", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picked North Carolina over TCU — and missed (TCU won)"
    );
  });

  it("marks graded future takes with the verdict", () => {
    expect(takeHeadline(pundit, future, call({ side: "yes", status: "hit", eventSlug: future.slug }))).toBe(
      "Paul Finebaum picked Indiana to win the national title — and hit"
    );
    expect(takeHeadline(pundit, future, call({ side: "no", status: "miss", eventSlug: future.slug }))).toBe(
      "Paul Finebaum did not see Indiana winning the national title — and missed"
    );
  });

  it("leads the graded story with the result", () => {
    const story = pickStory({
      pundit,
      event: game,
      call: call({ side: "no", status: "hit", eventSlug: game.slug }),
    });
    expect(story.paragraphs[0]).toContain("TCU won");
    expect(story.paragraphs[0]).toContain("hit");
  });
});
