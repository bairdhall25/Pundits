import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const APPLEBOT_USER_AGENT =
  "Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)";

// Apple TN3156: main resource <= 1 MB, associated resources <= 10 MB.
// https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages/
const MAX_PAGE_BYTES = 1_000_000;
const MAX_ASSOCIATED_RESOURCE_BYTES = 10_000_000;
const VERSIONED_CARD_PATH = /^\/og\/(takes|events|pundits|teams|weeks|pages)\//;

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeHtml(match[1].trim())
  );
}

export function metaValues(html) {
  const values = new Map();
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = new Map();
    for (const attribute of match[0].matchAll(/([:\w-]+)="([^"]*)"/g)) {
      attributes.set(attribute[1].toLowerCase(), decodeHtml(attribute[2]));
    }
    const key = attributes.get("property") ?? attributes.get("name");
    const value = attributes.get("content");
    if (key && value != null && !values.has(key)) values.set(key, value);
  }
  return values;
}

export function previewImageFromHtml(html, pageUrl) {
  assert(
    Buffer.byteLength(html) <= MAX_PAGE_BYTES,
    `${pageUrl} exceeds Apple's 1 MB preview-page guidance`
  );
  const meta = metaValues(html);
  const image = meta.get("og:image");
  assert(image, `${pageUrl} must publish og:image`);
  const imageUrl = new URL(image, pageUrl);
  assert.equal(imageUrl.protocol, "https:", `${pageUrl} og:image must use HTTPS`);
  assert.notEqual(
    imageUrl.pathname,
    "/og.png",
    `${pageUrl} must use a route-specific social card instead of the emergency fallback`
  );
  assert(meta.get("og:title"), `${pageUrl} must publish og:title`);
  assert.equal(
    meta.get("og:image:type"),
    "image/png",
    `${pageUrl} must publish PNG type`
  );
  assert.equal(
    meta.get("og:image:width"),
    "1200",
    `${pageUrl} must publish 1200 width`
  );
  assert.equal(
    meta.get("og:image:height"),
    "630",
    `${pageUrl} must publish 630 height`
  );
  assert(meta.get("og:image:alt"), `${pageUrl} must publish og:image:alt`);
  assert.equal(
    meta.get("twitter:card"),
    "summary_large_image",
    `${pageUrl} must publish a large Twitter card`
  );
  assert.equal(
    meta.get("twitter:image"),
    imageUrl.href,
    `${pageUrl} Twitter and Open Graph images must match`
  );
  if (VERSIONED_CARD_PATH.test(imageUrl.pathname)) {
    assert.match(
      imageUrl.search,
      /^\?v=[a-z0-9]+$/,
      `${pageUrl} generated preview image must be content-versioned`
    );
  }
  return imageUrl;
}

export async function validatePreviewImage(buffer, label) {
  assert(buffer.length > 0, `${label} must not be empty`);
  assert(
    buffer.length <= MAX_ASSOCIATED_RESOURCE_BYTES,
    `${label} exceeds Apple's 10 MB associated-resource guidance`
  );
  const image = sharp(buffer, { failOn: "error" });
  const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
  assert.equal(metadata.format, "png", `${label} must decode as PNG`);
  assert.equal(metadata.width, 1200, `${label} must decode at 1200 px wide`);
  assert.equal(metadata.height, 630, `${label} must decode at 630 px high`);
  assert(stats.isOpaque, `${label} must not contain transparent pixels`);
  assert(stats.entropy > 0.05, `${label} appears blank or nearly uniform`);
  const rgb = stats.channels.slice(0, 3);
  assert(
    rgb.some((channel) => channel.max - channel.min >= 24 && channel.stdev >= 1),
    `${label} lacks enough pixel variation for a visible preview`
  );
  return { bytes: buffer.length, width: metadata.width, height: metadata.height };
}

export function outputFileForUrl(outDir, url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const relative =
    pathname === "/" ? "index.html" : `${pathname.replace(/^\//, "")}index.html`;
  return path.join(outDir, relative);
}

export function outputAssetForUrl(outDir, url) {
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\//, "");
  return path.join(outDir, pathname);
}

export async function validateStaticPreviews({
  outDir,
  origin = "https://pundits.pro",
}) {
  const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");
  const pages = sitemapUrls(sitemap).filter((url) => new URL(url).origin === origin);
  const images = new Map();

  for (const pageUrl of pages) {
    const html = await readFile(outputFileForUrl(outDir, pageUrl), "utf8");
    const imageUrl = previewImageFromHtml(html, pageUrl);
    images.set(imageUrl.href, imageUrl);
  }

  for (const imageUrl of images.values()) {
    const buffer = await readFile(outputAssetForUrl(outDir, imageUrl));
    await validatePreviewImage(buffer, imageUrl.href);
  }

  return { pages: pages.length, images: images.size };
}

export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}
