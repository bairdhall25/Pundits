import { describe, expect, it } from "vitest";
import { extractSitemapUrls } from "./indexnow-lib.mjs";

describe("IndexNow sitemap extraction", () => {
  it("extracts canonical loc values and decodes XML entities", () => {
    const xml = `
      <urlset>
        <url><loc>https://pundits.pro/</loc></url>
        <url><loc>https://pundits.pro/picks/example/?a=1&amp;b=2</loc></url>
      </urlset>`;
    expect(extractSitemapUrls(xml)).toEqual([
      "https://pundits.pro/",
      "https://pundits.pro/picks/example/?a=1&b=2",
    ]);
  });

  it("caps submissions at the IndexNow batch limit", () => {
    const xml = `<urlset>${Array.from(
      { length: 10_001 },
      (_, i) => `<url><loc>https://pundits.pro/${i}/</loc></url>`
    ).join("")}</urlset>`;
    expect(extractSitemapUrls(xml)).toHaveLength(10_000);
  });
});
