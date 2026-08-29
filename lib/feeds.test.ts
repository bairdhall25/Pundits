import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { newsSitemap, recentNewsTakes, rssFeed } from "./feeds";
import { mappedTakes } from "./seo";

describe("editorial feeds", () => {
  it("publishes take stories in RSS with canonical URLs", () => {
    const xml = rssFeed(loadCalls(), loadEvents(), loadPundits());
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("https://pundits.pro/picks/unc-vs-tcu-2026/patterson/");
    expect(xml).toContain(
      "Chip Patterson picked North Carolina over TCU — and hit"
    );
  });

  it("limits the news sitemap to the newest two publication days", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const recent = recentNewsTakes(takes);
    expect(recent.length).toBeGreaterThan(0);
    expect(recent.every((take) => take.call.sourceDate >= "2026-08-26")).toBe(true);
    const xml = newsSitemap(loadCalls(), loadEvents(), loadPundits());
    expect(xml).toContain("xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\"");
    expect(xml).toContain("<news:name>PUNDITS</news:name>");
  });
});
