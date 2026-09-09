import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { newsSitemap, recentNewsTakes, rssFeed } from "./feeds";
import { mappedTakes } from "./seo";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

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
});
