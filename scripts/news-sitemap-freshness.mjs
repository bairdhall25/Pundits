import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const NEWS_DAYS = 2;
const LIVE_URL = "https://pundits.pro/news-sitemap.xml";

function isoDay(value) {
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function parseInstant(value) {
  const dayOnly = String(value).match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dayOnly) return new Date(`${dayOnly[1]}T00:00:00Z`);
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function utcDay(now) {
  return now.toISOString().slice(0, 10);
}

function addUtcDays(day, delta) {
  const instant = new Date(`${day}T00:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + delta);
  return instant.toISOString().slice(0, 10);
}

export function isNewsPublicationFresh(value, now = new Date(), days = NEWS_DAYS) {
  if (!value) return false;
  const instant = parseInstant(value);
  if (!instant) return false;
  if (instant.getTime() > now.getTime()) return false;
  const pubDay = isoDay(value);
  if (!pubDay) return false;
  const today = utcDay(now);
  if (pubDay > today) return false;
  const cutoff = addUtcDays(today, -(Math.max(1, days) - 1));
  return pubDay >= cutoff;
}

export function parseNewsSitemap(xml) {
  const urls = [];
  const blocks = String(xml).match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null;
    const published = block.match(/<news:publication_date>([^<]+)<\/news:publication_date>/)?.[1] ?? null;
    urls.push({ loc, published });
  }
  return urls;
}

export function assertNewsSitemapFresh(xml, now = new Date(), days = NEWS_DAYS) {
  assert.match(String(xml), /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/);
  const urls = parseNewsSitemap(xml);
  for (const url of urls) {
    assert(url.loc, "news sitemap URL is missing <loc>");
    assert(url.published, `${url.loc} is missing news:publication_date`);
    assert(
      isNewsPublicationFresh(url.published, now, days),
      `${url.loc} publication ${url.published} is outside the ${days}-day window`
    );
    assert.match(url.loc, /\/picks\/[^/]+\/[^/]+\//, `${url.loc} is not a pick receipt`);
  }
  return { urls: urls.length, empty: urls.length === 0 };
}

export async function readNewsSitemap(source) {
  if (source === "--live" || source === LIVE_URL) {
    const response = await fetch(LIVE_URL, { signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200, `${LIVE_URL} returned ${response.status}`);
    return response.text();
  }
  return readFile(source, "utf8");
}

export function parseNewsFreshnessArgs(argv = process.argv.slice(2)) {
  const args = [...argv];
  let now = null;
  const nowIndex = args.indexOf("--now");
  if (nowIndex >= 0) {
    const value = args[nowIndex + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("--now requires an ISO timestamp");
    }
    now = new Date(value);
    if (Number.isNaN(now.getTime())) {
      throw new Error(`--now is not a valid timestamp: ${value}`);
    }
    args.splice(nowIndex, 2);
  }
  if (args.length > 1) {
    throw new Error(`unexpected arguments: ${args.slice(1).join(" ")}`);
  }
  return { source: args[0] ?? "--live", now };
}

const isMain = process.argv[1] && process.argv[1].endsWith("news-sitemap-freshness.mjs");
if (isMain) {
  const { source, now: parsedNow } = parseNewsFreshnessArgs();
  const now = parsedNow ?? new Date();
  const xml = await readNewsSitemap(source);
  const result = assertNewsSitemapFresh(xml, now);
  const where = source === "--live" ? LIVE_URL : source;
  const clock = now.toISOString();
  console.log(
    result.empty
      ? `news sitemap empty and valid: ${where} at ${clock}`
      : `news sitemap fresh: ${result.urls} URL(s) in ${where} at ${clock}`
  );
}
