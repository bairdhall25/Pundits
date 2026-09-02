import { describe, expect, it } from "vitest";
import {
  changedIndexNowUrls,
  extractSitemapUrls,
  indexNowKeyMatches,
  indexNowManifest,
} from "./indexnow-lib.mjs";

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

  it("submits only added, changed, and deleted page URLs", () => {
    const previous = indexNowManifest([
      ["https://pundits.pro/", "old home"],
      ["https://pundits.pro/deleted/", "deleted"],
      ["https://pundits.pro/same/", "same"],
    ]);
    const current = indexNowManifest([
      ["https://pundits.pro/", "new home"],
      ["https://pundits.pro/new/", "new"],
      ["https://pundits.pro/same/", "same"],
    ]);
    expect(changedIndexNowUrls(current, previous)).toEqual([
      "https://pundits.pro/",
      "https://pundits.pro/deleted/",
      "https://pundits.pro/new/",
    ]);
  });

  it("accepts line-ending whitespace around the published key only", () => {
    expect(indexNowKeyMatches("abc123\r\n", "abc123")).toBe(true);
    expect(indexNowKeyMatches("wrong\r\n", "abc123")).toBe(false);
  });
});
