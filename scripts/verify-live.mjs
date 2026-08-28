import assert from "node:assert/strict";

const origin = (process.env.PUNDITS_LIVE_ORIGIN ?? "https://pundits.pro").replace(/\/$/, "");
const routes = [
  "/",
  "/stories/",
  "/book/",
  "/leaderboard/",
  "/ncaaf/",
  "/nfl/",
  "/picks/unc-vs-tcu-2026/",
  "/picks/unc-vs-tcu-2026/finebaum/",
  "/picks/ncsu-at-uva-2026/kanell/",
  "/og/takes/ncsu-at-uva-2026--kanell.png",
  "/pundits/herbstreit/",
  "/sitemap.xml",
];

for (const route of routes) {
  const response = await fetch(`${origin}${route}`, {
    headers: { "user-agent": "pundits-release-verifier/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `${route} returned ${response.status}`);
}

const home = await (await fetch(`${origin}/`, { signal: AbortSignal.timeout(15_000) })).text();
assert.match(home, /<link rel="canonical" href="https:\/\/pundits\.pro\/"/);
assert(!home.includes("/Pundits/"), "live output must not contain the retired GitHub Pages base path");

const redirect = await fetch(`${origin}/picks/unc-vs-tcu/`, {
  redirect: "manual",
  signal: AbortSignal.timeout(15_000),
});
assert.equal(redirect.status, 301, `bare matchup redirect returned ${redirect.status}`);
assert.equal(
  new URL(redirect.headers.get("location"), origin).href,
  `${origin}/picks/unc-vs-tcu-2026/`
);

console.log(`Live verification passed (${routes.length} routes and one redirect).`);
