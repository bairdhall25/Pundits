import { describe, expect, it } from "vitest";
import {
  assertNewsSitemapFresh,
  isNewsPublicationFresh,
  parseNewsFreshnessArgs,
  parseNewsSitemap,
} from "./news-sitemap-freshness.mjs";

const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

function sitemap(date, loc = "https://pundits.pro/picks/newer-2026/voice/") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
<url>
<loc>${loc}</loc>
<news:news>
<news:publication><news:name>PUNDITS</news:name><news:language>en</news:language></news:publication>
<news:publication_date>${date}</news:publication_date>
<news:title>Voice picks Away over Home</news:title>
</news:news>
</url>
</urlset>`;
}

describe("news sitemap freshness", () => {
  const now = new Date("2026-09-08T18:00:00Z");

  it("allows an empty news sitemap", () => {
    expect(assertNewsSitemapFresh(empty, now)).toEqual({ urls: 0, empty: true });
    expect(parseNewsSitemap(empty)).toEqual([]);
  });

  it("accepts a receipt first published inside the two-day window", () => {
    expect(isNewsPublicationFresh("2026-09-08", now)).toBe(true);
    expect(assertNewsSitemapFresh(sitemap("2026-09-07"), now).urls).toBe(1);
  });

  it("rejects unknown-window, future, and non-receipt URLs", () => {
    expect(isNewsPublicationFresh("2026-09-06", now)).toBe(false);
    expect(isNewsPublicationFresh("2026-09-09", now)).toBe(false);
    expect(() => assertNewsSitemapFresh(sitemap("2026-09-01"), now)).toThrow(/outside the 2-day window/);
    expect(() =>
      assertNewsSitemapFresh(sitemap("2026-09-08", "https://pundits.pro/ncaaf/2026/week-0/"), now)
    ).toThrow(/not a pick receipt/);
  });

  it("treats the same publication as stale after the clock leaves the two-day window", () => {
    const xml = sitemap("2026-09-08");
    const rebuildSlot = new Date("2026-09-10T10:30:00Z");
    expect(isNewsPublicationFresh("2026-09-08", now)).toBe(true);
    expect(assertNewsSitemapFresh(xml, now).urls).toBe(1);
    expect(isNewsPublicationFresh("2026-09-08", rebuildSlot)).toBe(false);
    expect(() => assertNewsSitemapFresh(xml, rebuildSlot)).toThrow(/outside the 2-day window/);
    expect(assertNewsSitemapFresh(empty, rebuildSlot)).toEqual({ urls: 0, empty: true });
  });

  it("parses a fixed --now clock without treating it as a source path", () => {
    expect(parseNewsFreshnessArgs(["--now", "2026-09-10T10:30:00Z"])).toEqual({
      source: "--live",
      now: new Date("2026-09-10T10:30:00Z"),
    });
    expect(parseNewsFreshnessArgs(["out/news-sitemap.xml", "--now", "2026-09-10T10:30:00Z"])).toEqual({
      source: "out/news-sitemap.xml",
      now: new Date("2026-09-10T10:30:00Z"),
    });
    expect(parseNewsFreshnessArgs(["--live", "--now", "2026-09-10T10:30:00Z"]).source).toBe("--live");
    expect(parseNewsFreshnessArgs([])).toEqual({ source: "--live", now: null });
    expect(() => parseNewsFreshnessArgs(["--now"])).toThrow(/--now requires an ISO timestamp/);
    expect(() => parseNewsFreshnessArgs(["--now", "not-a-date"])).toThrow(/not a valid timestamp/);
  });
});
