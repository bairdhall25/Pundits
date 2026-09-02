import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  metaValues,
  outputFileForUrl,
  previewImageFromHtml,
  sitemapUrls,
  validatePreviewImage,
} from "./preview-validation.mjs";

function previewHtml(image = "https://pundits.pro/og/takes/example.png?v=abc123") {
  return `<!doctype html><head>
    <meta property="og:title" content="Example pick">
    <meta property="og:image" content="${image}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Example pick card">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${image}">
  </head>`;
}

describe("preview metadata validation", () => {
  it("extracts sitemap and metadata values", () => {
    expect(sitemapUrls("<loc>https://pundits.pro/</loc>")).toEqual([
      "https://pundits.pro/",
    ]);
    expect(metaValues(previewHtml()).get("og:title")).toBe("Example pick");
    expect(outputFileForUrl("out", "https://pundits.pro/picks/example/")).toMatch(
      /out[\\/]picks[\\/]example[\\/]index\.html$/
    );
  });

  it("requires generated card URLs to be content-versioned", () => {
    expect(() =>
      previewImageFromHtml(
        previewHtml("https://pundits.pro/og/takes/example.png"),
        "https://pundits.pro/picks/example/"
      )
    ).toThrow(/content-versioned/);
  });

  it("rejects the generic emergency fallback for shareable routes", () => {
    expect(() =>
      previewImageFromHtml(
        previewHtml("https://pundits.pro/og.png"),
        "https://pundits.pro/new-content-type/"
      )
    ).toThrow(/route-specific social card/);
  });

  it("accepts a complete, versioned preview contract", () => {
    expect(
      previewImageFromHtml(previewHtml(), "https://pundits.pro/picks/example/").href
    ).toBe("https://pundits.pro/og/takes/example.png?v=abc123");
  });
});

describe("preview image validation", () => {
  it("decodes a visible opaque 1200 by 630 PNG", async () => {
    const image = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: "#0a0a0a" },
    })
      .composite([
        {
          input: Buffer.from(
            '<svg width="600" height="630"><rect width="600" height="630" fill="#39ff14"/></svg>'
          ),
          left: 600,
          top: 0,
        },
      ])
      .png()
      .toBuffer();
    await expect(validatePreviewImage(image, "card.png")).resolves.toMatchObject({
      width: 1200,
      height: 630,
    });
  });

  it("rejects a blank card", async () => {
    const blank = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: "#0a0a0a" },
    })
      .png()
      .toBuffer();
    await expect(validatePreviewImage(blank, "blank.png")).rejects.toThrow(
      /blank|variation/
    );
  });
});
