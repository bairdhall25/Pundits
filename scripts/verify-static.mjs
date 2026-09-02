import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { CORE_PAGES, STATIC_ONLY_FILES } from "./required-routes.mjs";
import { validateStaticPreviews } from "./preview-validation.mjs";

const root = process.cwd();
const out = path.join(root, "out");

const requiredFiles = [
  ...CORE_PAGES.map((page) => page.file),
  ...STATIC_ONLY_FILES,
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
assert.match(home, /Chip Patterson|Greg McElroy/);
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
// Take pages lead with the receipt: mono byline, stamp, grade sheet, tape.
assert.match(story, /Source published Aug 25, 2026.*Graded Aug 29, 2026/);
assert.match(story, /receipt-stamp verdict-miss/);
assert.match(story, /grade-sheet/);
assert.match(story, /Full record →/);
assert.match(story, /Final <b>North Carolina 15, TCU 10<\/b>/);
assert.match(story, /\"about\":\{\"@type\":\"Thing\"/);
assert.doesNotMatch(story, /\"@type\":\"SportsEvent\"|\"@type\":\"Event\"/);
assert.match(story, /\"@type\":\"NewsArticle\"/);
assert.match(story, /\"name\":\"PUNDITS Staff\"/);

const chipTake = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/patterson/index.html"),
  "utf8"
);
assert.match(chipTake, /Chip Patterson pick(s|ed) North Carolina over TCU/);
assert.match(
  chipTake,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/unc-vs-tcu-2026--patterson\.png\?v=[a-z0-9]+"/
);

const pickDetail = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(pickDetail, /Get the next verified pick\./);
assert.match(pickDetail, /Open on Kalshi/);
assert.match(pickDetail, /data-kickoff="2026-08-29"/);
assert.match(pickDetail, /KXNCAAFGAME-26AUG29NCSTUVA/);
assert.match(
  pickDetail,
  /href="https:\/\/kalshi\.com\/markets\/kxncaafgame\/college-football-game\/kxncaafgame-26aug29ncstuva"/
);

const dublinDetail = await readFile(path.join(out, "picks/unc-vs-tcu-2026/index.html"), "utf8");
assert.match(dublinDetail, /Open on Kalshi/);
assert.match(dublinDetail, /data-kickoff="2026-08-29"/);
assert.match(dublinDetail, /KXNCAAFGAME-26AUG29UNCTCU/);
assert.match(dublinDetail, /\"@type\":\"WebPage\"/);
assert.doesNotMatch(dublinDetail, /\"@type\":\"SportsEvent\"|\"@type\":\"Event\"/);

const punditProfile = await readFile(path.join(out, "pundits/kanell/index.html"), "utf8");
assert.match(punditProfile, /Get new Danny Kanell picks\./);
assert.match(punditProfile, /Request pick alerts/);
assert.match(
  punditProfile,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/pundits\/kanell\.png\?v=[a-z0-9]+"/
);
assert.doesNotMatch(punditProfile, /2026 record 0–0/);
assert.doesNotMatch(punditProfile, />0–0</);
assert.doesNotMatch(punditProfile, /No unmapped takes on file/);
assert.doesNotMatch(punditProfile, /at risk/i);
assert.doesNotMatch(punditProfile, />hard</i);
assert.match(punditProfile, /Hypothetical \$100 at the frozen Kalshi price/);
assert(
  punditProfile.indexOf("Tracked picks") < punditProfile.indexOf("Hypothetical record"),
  "pundit profile must put tracked picks before hypothetical totals"
);

const herbstreitProfile = await readFile(
  path.join(out, "pundits/herbstreit/index.html"),
  "utf8"
);
assert.match(herbstreitProfile, /No graded picks yet/);
assert.doesNotMatch(herbstreitProfile, />0–0</);

const book = await readFile(path.join(out, "book/index.html"), "utf8");
assert.doesNotMatch(book, /\$100 at risk/);
assert.doesNotMatch(book, /· <b[^>]*>YES<\/b>|· <b[^>]*>NO<\/b>/);
assert.match(book, /hypothetical \$100/);

const finebaum = await readFile(path.join(out, "pundits/finebaum/index.html"), "utf8");
assert.doesNotMatch(finebaum, /Open at risk/);
assert.match(finebaum, /Open · hypothetical \$100/);

const leaderboard = await readFile(path.join(out, "leaderboard/index.html"), "utf8");
assert.match(leaderboard, /Sample sizes are small/);
assert.match(leaderboard, /2026 results/);
assert.match(leaderboard, /Open picks/);
assert.match(leaderboard, />Open picks</);
assert.doesNotMatch(leaderboard, />Live picks</);
assert.match(leaderboard, /lb-rank[^>]*>01</);

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
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/unc-vs-tcu-2026--finebaum\.png\?v=[a-z0-9]+"/
);
assert.doesNotMatch(story, /property="og:image" content="https:\/\/pundits\.pro\/og\.png"/);

const methodology = await readFile(path.join(out, "methodology/index.html"), "utf8");
assert.match(methodology, /"@type":"FAQPage"/);
assert.match(methodology, /What counts as a verified pick/);

const kanell = await readFile(
  path.join(out, "picks/ncsu-at-uva-2026/kanell/index.html"),
  "utf8"
);
assert.match(kanell, /Danny Kanell pick(s|ed) NC State over Virginia/);
assert.match(
  kanell,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/ncsu-at-uva-2026--kanell\.png\?v=[a-z0-9]+"/
);

const ncsu = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(
  ncsu,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/events\/ncsu-at-uva-2026\.png\?v=[a-z0-9]+"/
);

const emptyEvent = await readFile(
  path.join(out, "picks/miami-at-stanford-2026/index.html"),
  "utf8"
);
assert.match(emptyEvent, /name="robots" content="noindex, follow"/);
assert.doesNotMatch(emptyEvent, /Join the early list/);
assert.match(
  emptyEvent,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/picks\/miami-at-stanford-2026\/"/
);

const lambeau = await readFile(
  path.join(out, "picks/wisconsin-vs-nd-2026/index.html"),
  "utf8"
);
assert.doesNotMatch(lambeau, /name="robots" content="noindex, follow"/);
assert.match(
  lambeau,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/picks\/wisconsin-vs-nd-2026\/"/
);

const ndTake = await readFile(
  path.join(out, "picks/wisconsin-vs-nd-2026/staples/index.html"),
  "utf8"
);
assert.match(ndTake, /Wisconsin vs Notre Dame\./);
assert.doesNotMatch(ndTake, /Wisconsin at Notre Dame/);

const dublinTake = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/mcelroy/index.html"),
  "utf8"
);
assert.match(dublinTake, /North Carolina vs TCU\./);
assert.doesNotMatch(dublinTake, /North Carolina at TCU/);
assert.match(dublinTake, />Takes</);

const pateTake = await readFile(
  path.join(out, "picks/clemson-at-lsu-2026/pate/index.html"),
  "utf8"
);
assert.match(pateTake, />Takes</);

assert.doesNotMatch(finebaum, />ncaaf</);
assert.match(finebaum, /College football/);

let notFoundPage;
try {
  notFoundPage = await readFile(path.join(out, "404.html"), "utf8");
} catch {
  notFoundPage = await readFile(path.join(out, "404/index.html"), "utf8");
}
assert.match(notFoundPage, /No page here/);

const teamPage = await readFile(path.join(out, "teams/tcu/index.html"), "utf8");
assert.match(
  teamPage,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/teams\/tcu\.png\?v=[a-z0-9]+"/
);
assert.match(teamPage, /"@type":"SportsTeam"/);

const week0 = await readFile(path.join(out, "ncaaf/2026/week-0/index.html"), "utf8");
assert.match(
  week0,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/weeks\/ncaaf-2026-week-0\.png\?v=[a-z0-9]+"/
);
assert.match(week0, /"@type":"CollectionPage"/);

const pageCardFiles = {
  "index.html": "home",
  "stories/index.html": "stories",
  "book/index.html": "book",
  "leaderboard/index.html": "leaderboard",
  "ncaaf/index.html": "ncaaf",
  "nfl/index.html": "nfl",
  "about/index.html": "about",
  "methodology/index.html": "methodology",
  "privacy/index.html": "privacy",
  "terms/index.html": "terms",
};
for (const [file, key] of Object.entries(pageCardFiles)) {
  const html = await readFile(path.join(out, file), "utf8");
  assert.match(
    html,
    new RegExp(
      `property="og:image" content="https:\\/\\/pundits\\.pro\\/og\\/pages\\/${key}\\.png\\?v=[a-z0-9]+"`
    ),
    `${file} must use its registered social card`
  );
}

const sitemap = await readFile(path.join(out, "sitemap.xml"), "utf8");
for (const url of [
  "https://pundits.pro/",
  "https://pundits.pro/stories/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/",
  "https://pundits.pro/picks/unc-vs-tcu-2026/patterson/",
  "https://pundits.pro/picks/wisconsin-vs-nd-2026/",
  "https://pundits.pro/picks/wisconsin-vs-nd-2026/wasserman/",
  "https://pundits.pro/picks/wisconsin-vs-nd-2026/staples/",
  "https://pundits.pro/picks/clemson-at-lsu-2026/staples/",
  "https://pundits.pro/pundits/herbstreit/",
  "https://pundits.pro/teams/tcu/",
  "https://pundits.pro/ncaaf/2026/week-0/",
  "https://pundits.pro/privacy/",
  "https://pundits.pro/about/",
  "https://pundits.pro/methodology/",
  "https://pundits.pro/terms/",
]) {
  assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap must contain ${url}`);
}
assert(
  !sitemap.includes("https://pundits.pro/picks/miami-at-stanford-2026/"),
  "empty event shells stay out of the sitemap until a mapped pick lands"
);

function sitemapLastModified(url) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sitemap.match(
    new RegExp(`<loc>${escaped}</loc>\\s*<lastmod>([^<]+)</lastmod>`)
  );
  assert(match, `sitemap must include lastmod for ${url}`);
  return match[1];
}

for (const punditId of ["finebaum", "patterson"]) {
  const profile = `https://pundits.pro/pundits/${punditId}/`;
  const receipt = `https://pundits.pro/picks/unc-vs-tcu-2026/${punditId}/`;
  assert(
    sitemapLastModified(profile) >= sitemapLastModified(receipt),
    `${profile} must be at least as fresh as its graded receipt`
  );
}
assert(
  sitemapLastModified("https://pundits.pro/teams/tcu/") >=
    sitemapLastModified("https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/"),
  "team pages must refresh when a take on that team grades"
);
assert(
  sitemapLastModified("https://pundits.pro/") >= "2026-08-29",
  "hub pages must refresh when a pick grades"
);

const robots = await readFile(path.join(out, "robots.txt"), "utf8");
assert(robots.includes("Sitemap: https://pundits.pro/sitemap.xml"));
assert(robots.includes("Sitemap: https://pundits.pro/news-sitemap.xml"));
assert(robots.includes("Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference"));

const newsSitemap = await readFile(path.join(out, "news-sitemap.xml"), "utf8");
assert.match(newsSitemap, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/);
assert.match(newsSitemap, /<news:name>PUNDITS<\/news:name>/);
assert.match(newsSitemap, /\/picks\/clemson-at-lsu-2026\/staples\//);
assert.match(newsSitemap, /\/picks\/wisconsin-vs-nd-2026\//);
assert.doesNotMatch(newsSitemap, /\/ncaaf\/2026\/week-0\//);
assert.doesNotMatch(newsSitemap, /\/teams\//);

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

const socialCards = JSON.parse(
  await readFile(path.join(out, "social/cards.json"), "utf8")
);
assert(socialCards.schemaVersion === 2, "social index must publish schema version 2");
assert(socialCards.site === "https://pundits.pro", "social index must carry the site origin");
assert(Array.isArray(socialCards.takes) && socialCards.takes.length > 0, "social index must list takes");
assert(Array.isArray(socialCards.events) && socialCards.events.length > 0, "social index must list events");
for (const take of socialCards.takes) {
  const rel = take.ogCard.replace("https://pundits.pro/", "");
  const info = await stat(path.join(out, rel));
  assert(info.size > 0, `social index points at missing card ${rel}`);
}
for (const row of [
  ...socialCards.teams,
  ...socialCards.weeks,
  ...socialCards.pages,
]) {
  const rel = row.ogCard.replace("https://pundits.pro/", "");
  const info = await stat(path.join(out, rel));
  assert(info.size > 0, `social index points at missing card ${rel}`);
}

const previewSummary = await validateStaticPreviews({ outDir: out });
console.log(
  `Preview verification passed (${previewSummary.pages} pages, ${previewSummary.images} decoded images).`
);
