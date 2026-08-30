import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractSitemapUrls } from "./indexnow-lib.mjs";

const host = "pundits.pro";
const key = "d86c0857c9c0449b9a7868f3e8ee1a7e";

try {
  const sitemap = await readFile(path.join(process.cwd(), "out", "sitemap.xml"), "utf8");
  const urlList = extractSitemapUrls(sitemap);
  if (!urlList.length) throw new Error("sitemap contains no URLs");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList,
    }),
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 200);
    throw new Error(`HTTP ${response.status}${body ? ` — ${body}` : ""}`);
  }
  console.log(`IndexNow: submitted ${urlList.length} URLs.`);
} catch (error) {
  console.warn(
    `IndexNow: submission skipped (${error instanceof Error ? error.message : error}).`
  );
}
