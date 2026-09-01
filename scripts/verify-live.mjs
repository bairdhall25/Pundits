import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  APPLEBOT_USER_AGENT,
  mapLimit,
  outputFileForUrl,
  previewImageFromHtml,
  sitemapUrls,
  validatePreviewImage,
} from "./preview-validation.mjs";
import { CORE_PAGES } from "./required-routes.mjs";

const origin = (process.env.PUNDITS_LIVE_ORIGIN ?? "https://pundits.pro").replace(
  /\/$/,
  ""
);
const expectedOut = process.argv.includes("--expected-out")
  ? path.join(process.cwd(), "out")
  : null;
const attempts = Number(process.env.PUNDITS_LIVE_ATTEMPTS ?? (expectedOut ? 4 : 2));
const delays = [0, 2_000, 5_000, 10_000];
const imageCache = new Map();

async function wait(milliseconds) {
  if (milliseconds <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withRetry(label, action) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await wait(delays[Math.min(attempt, delays.length - 1)]);
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`${label}: ${lastError instanceof Error ? lastError.message : lastError}`);
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: { "user-agent": APPLEBOT_USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `${url} returned ${response.status}`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /text\/html/,
    `${url} must return HTML`
  );
  return response.text();
}

async function validateLiveImage(imageUrl) {
  if (!imageCache.has(imageUrl.href)) {
    const validation = (async () => {
      const response = await fetch(imageUrl, {
        headers: { "user-agent": APPLEBOT_USER_AGENT },
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, `${imageUrl.href} returned ${response.status}`);
      assert.equal(
        response.headers.get("content-type"),
        "image/png",
        `${imageUrl.href} must return image/png`
      );
      const buffer = Buffer.from(await response.arrayBuffer());
      await validatePreviewImage(buffer, imageUrl.href);
    })();
    imageCache.set(imageUrl.href, validation);
    validation.catch(() => imageCache.delete(imageUrl.href));
  }
  return imageCache.get(imageUrl.href);
}

async function expectedPreview(pageUrl) {
  if (!expectedOut) return null;
  const html = await readFile(outputFileForUrl(expectedOut, pageUrl), "utf8");
  return previewImageFromHtml(html, pageUrl).href;
}

async function validateLivePage(pageUrl) {
  const expectedImage = await expectedPreview(pageUrl);
  return withRetry(pageUrl, async () => {
    const html = await fetchPage(pageUrl);
    const imageUrl = previewImageFromHtml(html, pageUrl);
    if (expectedImage) {
      assert.equal(
        imageUrl.href,
        expectedImage,
        `${pageUrl} has not published the candidate preview yet`
      );
    }
    await validateLiveImage(imageUrl);
  });
}

async function liveSitemapUrls() {
  const response = await fetch(`${origin}/sitemap.xml`, {
    headers: { "user-agent": APPLEBOT_USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `live sitemap returned ${response.status}`);
  return sitemapUrls(await response.text());
}

const pageUrls = expectedOut
  ? sitemapUrls(await readFile(path.join(expectedOut, "sitemap.xml"), "utf8"))
  : await liveSitemapUrls();

await mapLimit(pageUrls, 6, validateLivePage);

for (const page of CORE_PAGES) {
  const response = await fetch(`${origin}${page.url}`, {
    headers: { "user-agent": APPLEBOT_USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `${page.url} returned ${response.status}`);
}

const home = await fetchPage(`${origin}/`);
assert.match(home, /<link rel="canonical" href="https:\/\/pundits\.pro\/"/);
assert.match(home, /Created by Indie Labs LLC\. © 2026 Indie Labs LLC\./);
assert(!home.includes("/Pundits/"), "live output must not contain the retired base path");

const redirect = await fetch(`${origin}/picks/unc-vs-tcu/`, {
  redirect: "manual",
  headers: { "user-agent": APPLEBOT_USER_AGENT },
  signal: AbortSignal.timeout(15_000),
});
assert.equal(redirect.status, 301, `bare matchup redirect returned ${redirect.status}`);
assert.equal(
  new URL(redirect.headers.get("location"), origin).href,
  `${origin}/picks/unc-vs-tcu-2026/`
);

console.log(
  `Live preview verification passed (${pageUrls.length} pages, ${imageCache.size} decoded images${
    expectedOut ? ", candidate metadata confirmed" : ""
  }).`
);
