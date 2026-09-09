import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { newsSitemap, recentNewsTakes, rssFeed } from "./feeds";
import { mappedTakes } from "./seo";
import { canonicalUrl, takePath } from "./site";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";
import { assertNewsSitemapFresh } from "../scripts/news-sitemap-freshness.mjs";

describe("editorial feeds", () => {
  it("publishes take stories in RSS with canonical URLs", () => {
    const pundit = fixturePundit("patterson", { name: "Chip Patterson" });
    const event = fixtureGame("unc-vs-tcu-2026", {
      awayTeam: "North Carolina",
      homeTeam: "TCU",
    });
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      status: "hit",
      claim: "Tarheels to come back with the win.",
    });
    const xml = rssFeed([call], [event], [pundit]);
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("https://pundits.pro/picks/unc-vs-tcu-2026/patterson/");
    expect(xml).toMatch(/<title>[^<]* picks? [^<]+ over [^<]+<\/title>|<title>[^<]* picked [^<]+ over [^<]+<\/title>/);
  });

  it("keeps live RSS items well-formed as the ledger grows", () => {
    const xml = rssFeed(loadCalls(), loadEvents(), loadPundits());
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toMatch(/<item>/);
    expect(xml).toMatch(/<title>[^<]* picks? [^<]+ over [^<]+<\/title>|<title>[^<]* picked [^<]+ over [^<]+<\/title>/);
  });

  it("limits the news sitemap to firstPublishedAt inside the current two days", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const older = fixtureGame("older-2026", { awayTeam: "A", homeTeam: "B" });
    const newer = fixtureGame("newer-2026", { awayTeam: "C", homeTeam: "D" });
    const now = new Date("2026-09-01T18:00:00Z");
    const calls = [
      fixturePick({
        eventSlug: older.slug,
        punditId: pundit.id,
        side: "yes",
        sourceDate: "2026-08-20",
        firstPublishedAt: "2026-08-20",
      }),
      fixturePick({
        eventSlug: newer.slug,
        punditId: pundit.id,
        side: "no",
        sourceDate: "2026-06-23",
        firstPublishedAt: "2026-09-01",
      }),
    ];
    const takes = mappedTakes(calls, [older, newer], [pundit]);
    const recent = recentNewsTakes(takes, 2, now);
    expect(recent.map((take) => take.event.slug)).toEqual(["newer-2026"]);
    const xml = newsSitemap(calls, [older, newer], [pundit], now);
    expect(xml).toContain("xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\"");
    expect(xml).toContain("<news:name>PUNDITS</news:name>");
    expect(xml).toContain("/picks/newer-2026/voice/");
    expect(xml).not.toContain("/picks/older-2026/voice/");
  });

  it("keeps a quiet-period news sitemap empty rather than aging sourceDate rows", () => {
    const xml = newsSitemap(loadCalls(), loadEvents(), loadPundits(), new Date("2026-09-20T12:00:00Z"));
    expect(xml).toContain("xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\"");
    expect(xml).not.toContain("<url>");
  });

  it("rebuilds a valid empty news sitemap after eligible receipts expire without dropping ordinary URLs", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("newer-2026", { awayTeam: "C", homeTeam: "D" });
    const unknown = fixtureGame("unknown-2026", { awayTeam: "E", homeTeam: "F" });
    const future = fixtureGame("future-2026", { awayTeam: "G", homeTeam: "H" });
    const calls = [
      fixturePick({
        eventSlug: event.slug,
        punditId: pundit.id,
        side: "no",
        sourceDate: "2026-06-23",
        firstPublishedAt: "2026-09-08",
      }),
      fixturePick({
        eventSlug: unknown.slug,
        punditId: pundit.id,
        side: "yes",
        sourceDate: "2026-09-08",
      }),
      fixturePick({
        eventSlug: future.slug,
        punditId: pundit.id,
        side: "yes",
        sourceDate: "2026-09-08",
        firstPublishedAt: "2026-09-11",
      }),
    ];
    const events = [event, unknown, future];
    const inWindow = new Date("2026-09-08T18:00:00Z");
    const rebuildSlot = new Date("2026-09-10T10:30:00Z");
    const receipt = canonicalUrl(takePath(event.slug, pundit.id));

    const xmlInWindow = newsSitemap(calls, events, [pundit], inWindow);
    expect(recentNewsTakes(mappedTakes(calls, events, [pundit]), 2, inWindow).map((take) => take.event.slug)).toEqual([
      "newer-2026",
    ]);
    expect(xmlInWindow).toContain(receipt);
    expect(xmlInWindow).not.toContain("/picks/unknown-2026/voice/");
    expect(xmlInWindow).not.toContain("/picks/future-2026/voice/");
    expect(assertNewsSitemapFresh(xmlInWindow, inWindow)).toEqual({ urls: 1, empty: false });

    const xmlExpired = newsSitemap(calls, events, [pundit], rebuildSlot);
    expect(recentNewsTakes(mappedTakes(calls, events, [pundit]), 2, rebuildSlot)).toEqual([]);
    expect(xmlExpired).toContain("xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\"");
    expect(xmlExpired).not.toContain("<url>");
    expect(xmlExpired).not.toContain(receipt);
    expect(assertNewsSitemapFresh(xmlExpired, rebuildSlot)).toEqual({ urls: 0, empty: true });

    expect(receipt).toBe("https://pundits.pro/picks/newer-2026/voice/");
    const ordinary = sitemap().map((entry) => entry.url);
    expect(ordinary).toContain("https://pundits.pro/picks/clemson-at-lsu-2026/finebaum/");
    expect(ordinary).toContain("https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/");
    expect(ordinary.some((url) => url.includes("/picks/"))).toBe(true);

    const liveNews = newsSitemap(loadCalls(), loadEvents(), loadPundits(), rebuildSlot);
    expect(liveNews).not.toContain("<url>");
    expect(assertNewsSitemapFresh(liveNews, rebuildSlot)).toEqual({ urls: 0, empty: true });
  });
});
