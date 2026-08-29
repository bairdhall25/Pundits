import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");

const requiredFiles = [
  "index.html",
  "stories/index.html",
  "book/index.html",
  "leaderboard/index.html",
  "ncaaf/index.html",
  "nfl/index.html",
  "picks/unc-vs-tcu-2026/index.html",
  "picks/unc-vs-tcu-2026/finebaum/index.html",
  "picks/ncsu-at-uva-2026/kanell/index.html",
  "picks/unc-vs-tcu-2026/patterson/index.html",
  "pundits/herbstreit/index.html",
  "privacy/index.html",
  "about/index.html",
  "terms/index.html",
  "og/takes/unc-vs-tcu-2026--finebaum.png",
  "og/takes/ncsu-at-uva-2026--kanell.png",
  "og/takes/unc-vs-tcu-2026--patterson.png",
  "og/events/unc-vs-tcu-2026.png",
  "og/events/ncsu-at-uva-2026.png",
  "og/pundits/finebaum.png",
  "og/stories/takes/unc-vs-tcu-2026--finebaum.png",
  "og/stories/events/unc-vs-tcu-2026.png",
  "og/stories/pundits/finebaum.png",
  "robots.txt",
  "sitemap.xml",
  "news-sitemap.xml",
  "feed.xml",
  "_redirects",
];

for (const relative of requiredFiles) {
  const file = path.join(out, relative);
  const info = await stat(file);
  assert(info.isFile(), `${relative} must be a generated file`);
  assert(info.size > 0, `${relative} must not be empty`);
}

const home = await readFile(path.join(out, "index.html"), "utf8");
assert.match(home, /<link rel="canonical" href="https:\/\/pundits\.pro\/"/);
assert.match(home, /<title>PUNDITS\b/);
assert.match(home, /Created by Indie Labs LLC\. © 2026 Indie Labs LLC\./);
assert.match(home, /mailto:bairdhall25@gmail.com/);
assert.match(home, />Contact</);
assert.doesNotMatch(home, />bairdhall25@gmail.com</);
assert.match(home, /"legalName":"Indie Labs LLC"/);
assert.match(home, /"sameAs":\["https:\/\/x\.com\/Pundits_"\]/);
assert.match(home, /Get new picks — with the receipt\.|Never miss a verified pick\./);
assert.match(home, /Join the early list/);
assert.match(home, /Chip Patterson/);
assert.match(home, /Paul Finebaum/);
assert.match(home, /event-title-link/);
assert.doesNotMatch(home, /class="event-hit"/);
assert.match(home, /Most on record/);
assert.doesNotMatch(home, /class="scan-name[^"]*"[^>]*>Yes</);
assert.doesNotMatch(home, /class="scan-name[^"]*"[^>]*>No</);
assert.doesNotMatch(home, /Email signup is temporarily unavailable\./);
assert(!home.includes("/Pundits/"), "production output must not contain the GitHub Pages base path");

const story = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/finebaum/index.html"),
  "utf8"
);
assert.match(
  story,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/picks\/unc-vs-tcu-2026\/finebaum\/"/
);
// Tense flips to "picked … — and hit/missed" once the game grades.
assert.match(story, /Paul Finebaum pick(s|ed) TCU over North Carolina/);
assert.match(story, />Share</);
assert.match(story, /By PUNDITS Staff.*Source published/);
assert.match(story, /\"@type\":\"NewsArticle\"/);
assert.match(story, /\"name\":\"PUNDITS Staff\"/);

const chipTake = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/patterson/index.html"),
  "utf8"
);
assert.match(chipTake, /Chip Patterson pick(s|ed) North Carolina over TCU/);
assert.match(
  chipTake,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/unc-vs-tcu-2026--patterson\.png"/
);

const pickDetail = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(pickDetail, /Get the next verified pick\./);
assert.match(pickDetail, /Open on Kalshi/);
assert.match(pickDetail, /KXNCAAFGAME-26AUG29NCSTUVA/);
assert.match(
  pickDetail,
  /href="https:\/\/kalshi\.com\/markets\/kxncaafgame\/college-football-game\/kxncaafgame-26aug29ncstuva"/
);

const dublinDetail = await readFile(path.join(out, "picks/unc-vs-tcu-2026/index.html"), "utf8");
assert.match(dublinDetail, /Open on Kalshi/);
assert.match(dublinDetail, /KXNCAAFGAME-26AUG29UNCTCU/);

const punditProfile = await readFile(path.join(out, "pundits/kanell/index.html"), "utf8");
assert.match(punditProfile, /Get new Danny Kanell picks\./);
assert.match(
  punditProfile,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/pundits\/kanell\.png"/
);
assert.doesNotMatch(punditProfile, /2026 record 0–0/);
assert.doesNotMatch(punditProfile, />0–0</);
assert.match(punditProfile, /Hypothetical \$100 at the frozen Kalshi price/);

const leaderboard = await readFile(path.join(out, "leaderboard/index.html"), "utf8");
assert.match(leaderboard, /Listed by live picks until the first game grades/);
assert.doesNotMatch(leaderboard, /lb-rank[^>]*>01</);

const privacy = await readFile(path.join(out, "privacy/index.html"), "utf8");
assert.match(
  privacy,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/privacy\/"/
);
assert.match(privacy, /Pundits on Cloudflare/);
assert.match(privacy, /Google Analytics/);
assert.match(privacy, /mailto:bairdhall25@gmail.com/);
assert.doesNotMatch(privacy, />bairdhall25@gmail.com</);

const about = await readFile(path.join(out, "about/index.html"), "utf8");
assert.match(about, /project of Indie Labs LLC/);
assert.match(
  about,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/about\/"/
);

const terms = await readFile(path.join(out, "terms/index.html"), "utf8");
assert.match(terms, /not a sportsbook/);
assert.match(
  terms,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/terms\/"/
);
assert.match(
  story,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/unc-vs-tcu-2026--finebaum\.png"/
);
assert.doesNotMatch(story, /property="og:image" content="https:\/\/pundits\.pro\/og\.png"/);

const kanell = await readFile(
  path.join(out, "picks/ncsu-at-uva-2026/kanell/index.html"),
  "utf8"
);
assert.match(
  kanell,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/ncsu-at-uva-2026--kanell\.png"/
);

const ncsu = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(
  ncsu,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/events\/ncsu-at-uva-2026\.png"/
);

assert.match(home, /property="og:image" content="https:\/\/pundits\.pro\/og\.png"/);

const sitemap = await readFile(path.join(out, "sitemap.xml"), "utf8");
for (const url of [
  "https://pundits.pro/",
  "https://pundits.pro/stories/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/patterson/",
  "https://pundits.pro/pundits/herbstreit/",
  "https://pundits.pro/privacy/",
  "https://pundits.pro/about/",
  "https://pundits.pro/terms/",
]) {
  assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap must contain ${url}`);
}

const robots = await readFile(path.join(out, "robots.txt"), "utf8");
assert(robots.includes("Sitemap: https://pundits.pro/sitemap.xml"));
assert(robots.includes("Sitemap: https://pundits.pro/news-sitemap.xml"));

const newsSitemap = await readFile(path.join(out, "news-sitemap.xml"), "utf8");
assert.match(newsSitemap, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/);
assert.match(newsSitemap, /<news:name>PUNDITS<\/news:name>/);

const feed = await readFile(path.join(out, "feed.xml"), "utf8");
assert.match(feed, /<rss version="2\.0">/);
assert.match(feed, /Paul Finebaum pick(s|ed) TCU over North Carolina/);

const sourceRedirects = await readFile(path.join(root, "public/_redirects"), "utf8");
const outputRedirects = await readFile(path.join(out, "_redirects"), "utf8");
assert.equal(outputRedirects, sourceRedirects, "Cloudflare redirects must survive the static export");
assert.match(outputRedirects, /\/picks\/unc-vs-tcu\/ \/picks\/unc-vs-tcu-2026\/ 301/);

// --- Permalink permanence -------------------------------------------------
// Once a URL has shipped in the sitemap it must resolve forever: a page in
// out/, or a 301 in _redirects. Data files are append-only for the same
// reason — deleting a graded event or call would 404 its pages and burn the
// search equity they earned. New sitemap URLs are appended to the ledger
// automatically; nothing is ever removed from it.
const ledgerPath = path.join(root, "docs/seo/permalinks.txt");
let ledger = [];
try {
  // Tolerate CRLF: git autocrlf on Windows checkouts rewrites this file.
  ledger = (await readFile(ledgerPath, "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
} catch {
  // First run seeds the ledger from the current sitemap below.
}

async function isFile(candidate) {
  return stat(candidate).then((info) => info.isFile()).catch(() => false);
}

const redirectSources = new Set(
  outputRedirects
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0])
);

const gone = [];
for (const url of ledger) {
  const pathname = url.replace("https://pundits.pro", "");
  const asDir = path.join(out, pathname, "index.html");
  const asFile = path.join(out, pathname);
  const redirected =
    redirectSources.has(pathname) || redirectSources.has(pathname.replace(/\/$/, ""));
  if (!(await isFile(asDir)) && !(await isFile(asFile)) && !redirected) {
    gone.push(url);
  }
}
assert(
  gone.length === 0,
  `Published URLs disappeared from the build (add the page back or 301 it in public/_redirects):\n${gone.join("\n")}`
);

const known = new Set(ledger);
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const added = sitemapUrls.filter((url) => !known.has(url));
if (added.length) {
  await mkdir(path.dirname(ledgerPath), { recursive: true });
  await writeFile(ledgerPath, [...ledger, ...added].join("\n") + "\n");
  console.log(`Permalink ledger: +${added.length} new URLs (${ledger.length + added.length} total).`);
}

console.log(`Static verification passed (${requiredFiles.length} required files).`);
