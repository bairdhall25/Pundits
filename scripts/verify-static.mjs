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
  "pundits/herbstreit/index.html",
  "privacy/index.html",
  "og/takes/unc-vs-tcu-2026--finebaum.png",
  "og/takes/ncsu-at-uva-2026--kanell.png",
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
assert.match(home, /Never miss a verified pick\./);
assert.match(home, /Email signup is temporarily unavailable\./);
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

const pickDetail = await readFile(path.join(out, "picks/ncsu-at-uva-2026/index.html"), "utf8");
assert.match(pickDetail, /Get the next verified pick\./);

const punditProfile = await readFile(path.join(out, "pundits/kanell/index.html"), "utf8");
assert.match(punditProfile, /Get new Danny Kanell picks\./);

const privacy = await readFile(path.join(out, "privacy/index.html"), "utf8");
assert.match(
  privacy,
  /<link rel="canonical" href="https:\/\/pundits\.pro\/privacy\/"/
);
assert.match(privacy, /Email collection is not active/);
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
  "https://pundits.pro/pundits/herbstreit/",
  "https://pundits.pro/privacy/",
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
