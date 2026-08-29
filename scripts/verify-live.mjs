import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const origin = (process.env.PUNDITS_LIVE_ORIGIN ?? "https://pundits.pro").replace(/\/$/, "");
const calls = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "calls.json"), "utf8")
);
const mappedHardCalls = calls.filter(
  (call) => call.kind === "hard" && call.eventSlug && call.punditId && call.side
);

const routes = new Set([
  "/",
  "/stories/",
  "/book/",
  "/leaderboard/",
  "/ncaaf/",
  "/nfl/",
  "/picks/unc-vs-tcu-2026/",
  "/picks/unc-vs-tcu-2026/finebaum/",
  "/picks/ncsu-at-uva-2026/kanell/",
  "/picks/unc-vs-tcu-2026/patterson/",
  "/og/takes/ncsu-at-uva-2026--kanell.png",
  "/pundits/herbstreit/",
  "/privacy/",
  "/about/",
  "/terms/",
  "/sitemap.xml",
]);

for (const call of mappedHardCalls) {
  routes.add(`/picks/${call.eventSlug}/`);
  routes.add(`/picks/${call.eventSlug}/${call.punditId}/`);
  routes.add(`/og/takes/${call.eventSlug}--${call.punditId}.png`);
}

for (const route of routes) {
  const response = await fetch(`${origin}${route}`, {
    headers: { "user-agent": "pundits-release-verifier/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `${route} returned ${response.status}`);
}

const home = await (await fetch(`${origin}/`, { signal: AbortSignal.timeout(15_000) })).text();
assert.match(home, /<link rel="canonical" href="https:\/\/pundits\.pro\/"/);
assert.match(home, /Created by Indie Labs LLC\. © 2026 Indie Labs LLC\./);
assert.match(home, /mailto:bairdhall25@gmail.com/);
assert.match(home, />Contact</);
assert.doesNotMatch(home, />bairdhall25@gmail.com</);
assert.match(home, /"legalName":"Indie Labs LLC"/);
assert(!home.includes("/Pundits/"), "live output must not contain the retired GitHub Pages base path");

const kickoffTags = ["Today", "Tomorrow"].filter((tag) =>
  new RegExp(`>${tag}<`).test(home)
);

const redirect = await fetch(`${origin}/picks/unc-vs-tcu/`, {
  redirect: "manual",
  signal: AbortSignal.timeout(15_000),
});
assert.equal(redirect.status, 301, `bare matchup redirect returned ${redirect.status}`);
assert.equal(
  new URL(redirect.headers.get("location"), origin).href,
  `${origin}/picks/unc-vs-tcu-2026/`
);

console.log(
  `Live verification passed (${routes.size} routes, ${mappedHardCalls.length} mapped hard stories, and one redirect).`
);
console.log(`Live kickoff tags: ${kickoffTags.length ? kickoffTags.join(", ") : "none"}.`);
