import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APPLEBOT_USER_AGENT, sitemapUrls } from "./preview-validation.mjs";

function redirectSources(contents) {
  return new Set(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/\s+/)[0])
  );
}

async function isFile(candidate) {
  return stat(candidate)
    .then((info) => info.isFile())
    .catch(() => false);
}

export async function missingProductionUrls({ urls, outDir, redirects }) {
  const sources = redirectSources(redirects);
  const missing = [];
  for (const url of urls) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const relative = pathname.replace(/^\//, "");
    const asFile = path.join(outDir, relative);
    const asDirectory = path.join(outDir, relative, "index.html");
    const redirected = sources.has(pathname) || sources.has(pathname.replace(/\/$/, ""));
    if (!(await isFile(asFile)) && !(await isFile(asDirectory)) && !redirected) {
      missing.push(url);
    }
  }
  return missing;
}

export async function verifyProductionPermalinks({
  origin = process.env.PUNDITS_LIVE_ORIGIN ?? "https://pundits.pro",
  outDir = path.join(process.cwd(), "out"),
} = {}) {
  const response = await fetch(`${origin.replace(/\/$/, "")}/sitemap.xml`, {
    headers: { "user-agent": APPLEBOT_USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `production sitemap returned ${response.status}`);
  const urls = sitemapUrls(await response.text());
  const redirects = await readFile(path.join(outDir, "_redirects"), "utf8");
  const missing = await missingProductionUrls({ urls, outDir, redirects });
  assert.equal(
    missing.length,
    0,
    `Candidate build would remove production URLs:\n${missing.join("\n")}`
  );
  console.log(`Production URL guard passed (${urls.length} current sitemap URLs preserved).`);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await verifyProductionPermalinks();
}
