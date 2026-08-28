import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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
  "robots.txt",
  "sitemap.xml",
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
assert.match(story, /Paul Finebaum picks TCU over North Carolina/);

const chipTake = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/patterson/index.html"),
  "utf8"
);
assert.match(chipTake, /Chip Patterson picks North Carolina over TCU/);
assert.match(
  chipTake,
  /property="og:image" content="https:\/\/pundits\.pro\/og\/takes\/unc-vs-tcu-2026--patterson\.png"/
);

const pickDetail = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(pickDetail, /Get the next verified pick\./);

const punditProfile = await readFile(path.join(out, "pundits/kanell/index.html"), "utf8");
assert.match(punditProfile, /Get new Danny Kanell picks\./);

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

const sourceRedirects = await readFile(path.join(root, "public/_redirects"), "utf8");
const outputRedirects = await readFile(path.join(out, "_redirects"), "utf8");
assert.equal(outputRedirects, sourceRedirects, "Cloudflare redirects must survive the static export");
assert.match(outputRedirects, /\/picks\/unc-vs-tcu\/ \/picks\/unc-vs-tcu-2026\/ 301/);

console.log(`Static verification passed (${requiredFiles.length} required files).`);
