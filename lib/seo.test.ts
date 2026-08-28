import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
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
    expect(story.dek).toContain("North Carolina is the underdog at 27¢");
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
    expect(story.dek).toContain("NC State is the underdog at 34¢");
    expect(story.paragraphs.join(" ")).toContain("give me the Wolfpack");
    expect(story.paragraphs.join(" ")).not.toMatch(/Chip Patterson|Tarheels/i);
  });

  it("does not print YES · YES on futures chips", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "texas-cfp-2026" && t.pundit.id === "fallica"
    );
    expect(take).toBeTruthy();
    expect(sideChip(take!.event, "no")).toBe("Against");
    expect(toStoryCard(take!).sideChip).toBe("Against");
    const dublin = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026"
    )!;
    expect(toStoryCard(dublin).sideChip).toBe("TCU");
  });
});

describe("pick copy", () => {
  it("says so when a market has no mapped face", () => {
    const event = loadEvents().find((e) => e.slug === "wisconsin-vs-nd-2026");
    expect(event).toBeTruthy();
    expect(pickLede(event!, loadCalls(), loadPundits())).toMatch(/no verified expert pick/i);
  });
});

describe("json-ld", () => {
  it("publishes Organization and WebSite", () => {
    const graph = organizationGraph();
    const types = graph["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });

  it("marks a take as an Article with an author", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026"
    );
    expect(take).toBeTruthy();
    const json = articleJsonLd(take!);
    expect(json["@type"]).toBe("Article");
    expect(json.headline).toBe("Paul Finebaum picks TCU over North Carolina");
    expect(json.author).toMatchObject({ name: "Paul Finebaum" });
  });
});
