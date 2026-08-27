import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import {
  mappedTakes,
  pickLede,
  takeHeadline,
  takePath,
  organizationGraph,
  articleJsonLd,
} from "./seo";
import { canonicalUrl } from "./site";

describe("canonical URLs", () => {
  it("always points at pundits.pro", () => {
    expect(canonicalUrl("/")).toBe("https://pundits.pro/");
    expect(canonicalUrl("/picks/unc-vs-tcu")).toBe(
      "https://pundits.pro/picks/unc-vs-tcu/"
    );
    expect(canonicalUrl("/og.png")).toBe("https://pundits.pro/og.png");
  });
});

describe("mapped takes", () => {
  it("includes Finebaum on Dublin as a unique take", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const dublin = takes.find(
      (t) => t.event.slug === "unc-vs-tcu" && t.pundit.id === "finebaum"
    );
    expect(dublin).toBeTruthy();
    expect(takeHeadline(dublin!.pundit, dublin!.event, dublin!.call)).toBe(
      "Paul Finebaum picks TCU"
    );
    expect(takePath("unc-vs-tcu", "finebaum")).toBe(
      "/picks/unc-vs-tcu/finebaum"
    );
  });

  it("is unique per event and pundit", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const keys = takes.map((t) => `${t.event.slug}/${t.pundit.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("pick copy", () => {
  it("says so when a market has no mapped face", () => {
    const event = loadEvents().find((e) => e.slug === "ncsu-at-uva");
    expect(event).toBeTruthy();
    expect(pickLede(event!, loadCalls(), loadPundits())).toMatch(/no roster-voice/i);
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
      (t) => t.event.slug === "unc-vs-tcu"
    );
    expect(take).toBeTruthy();
    const json = articleJsonLd(take!);
    expect(json["@type"]).toBe("Article");
    expect(json.headline).toBe("Paul Finebaum picks TCU");
    expect(json.author).toMatchObject({ name: "Paul Finebaum" });
  });
});
