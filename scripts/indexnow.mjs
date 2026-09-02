import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  changedIndexNowUrls,
  extractSitemapUrls,
  indexNowKeyMatches,
  indexNowManifest,
} from "./indexnow-lib.mjs";
import { outputFileForUrl } from "./preview-validation.mjs";

const host = "pundits.pro";
const origin = `https://${host}`;
const key = "67331f0b77ebb132f94f513f0c380600";
const keyLocation = `${origin}/${key}.txt`;
const outDir = path.join(process.cwd(), "out");
const manifestPath = path.join(outDir, "indexnow-manifest.json");
const cacheDir = path.join(process.cwd(), "node_modules", ".cache", "pundits");
const pendingPath = path.join(cacheDir, "indexnow-pending.json");
const prepare = process.argv.includes("--prepare");

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function candidateManifest(sitemap) {
  const entries = await Promise.all(
    extractSitemapUrls(sitemap).map(async (url) => [
      url,
      await readFile(outputFileForUrl(outDir, url)),
    ])
  );
  return indexNowManifest(entries);
}

async function liveManifest() {
  try {
    const response = await fetch(`${origin}/indexnow-manifest.json`, {
      headers: { "cache-control": "no-cache" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return { version: 1, pages: {} };
    const manifest = await response.json();
    return manifest?.version === 1 && manifest?.pages
      ? manifest
      : { version: 1, pages: {} };
  } catch {
    return { version: 1, pages: {} };
  }
}

async function prepareSubmission() {
  const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");
  const current = await candidateManifest(sitemap);
  const previous = await liveManifest();
  const urlList = changedIndexNowUrls(current, previous);
  await writeFile(manifestPath, `${JSON.stringify(current, null, 2)}\n`);
  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    pendingPath,
    `${JSON.stringify({ version: 1, urlList }, null, 2)}\n`
  );
  console.log(
    `IndexNow: prepared ${urlList.length} changed URL${urlList.length === 1 ? "" : "s"} from ${Object.keys(current.pages).length} sitemap pages.`
  );
}

async function pendingUrls() {
  try {
    const pending = JSON.parse(await readFile(pendingPath, "utf8"));
    return Array.isArray(pending?.urlList) ? pending.urlList : [];
  } catch {
    const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");
    return extractSitemapUrls(sitemap);
  }
}

async function verifyLiveKey() {
  let lastError;
  for (const delay of [0, 2_000, 5_000]) {
    await wait(delay);
    try {
      const response = await fetch(keyLocation, {
        headers: { "cache-control": "no-cache" },
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.text();
      if (!response.ok) throw new Error(`key URL returned HTTP ${response.status}`);
      if (!indexNowKeyMatches(body, key)) {
        throw new Error("key URL content does not match the configured key");
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    `live key verification failed: ${lastError instanceof Error ? lastError.message : lastError}`
  );
}

async function postUrls(urlList) {
  return fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
    signal: AbortSignal.timeout(15_000),
  });
}

async function submit() {
  const urlList = await pendingUrls();
  if (!urlList.length) {
    console.log("IndexNow: no changed URLs to submit.");
    return;
  }
  await verifyLiveKey();
  let response = await postUrls(urlList);
  if (response.status === 403) {
    await wait(5_000);
    await verifyLiveKey();
    response = await postUrls(urlList);
  }
  if (!response.ok) {
    const body = (await response.text()).slice(0, 200);
    throw new Error(`HTTP ${response.status}${body ? ` — ${body}` : ""}`);
  }
  console.log(`IndexNow: submitted ${urlList.length} changed URLs.`);
}

try {
  if (prepare) await prepareSubmission();
  else await submit();
} catch (error) {
  console.warn(
    `IndexNow: ${prepare ? "preparation" : "submission"} skipped (${error instanceof Error ? error.message : error}).`
  );
}
