import { createHash } from "node:crypto";

const XML_ENTITIES = {
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeXml(value) {
  return value.replace(/&(amp|quot|apos|lt|gt);/g, (entity) => XML_ENTITIES[entity]);
}

export function extractSitemapUrls(xml, limit = 10_000) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .slice(0, limit)
    .map((match) => decodeXml(match[1].trim()));
}

export function indexNowContentHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function indexNowManifest(entries) {
  const pages = Object.fromEntries(
    [...entries]
      .map(([url, content]) => [url, indexNowContentHash(content)])
      .sort(([left], [right]) => left.localeCompare(right))
  );
  return { version: 1, pages };
}

export function changedIndexNowUrls(current, previous, limit = 10_000) {
  const currentPages = current?.pages ?? {};
  const previousPages = previous?.pages ?? {};
  const urls = new Set([...Object.keys(currentPages), ...Object.keys(previousPages)]);
  return [...urls]
    .filter((url) => currentPages[url] !== previousPages[url])
    .sort()
    .slice(0, limit);
}

export function indexNowKeyMatches(body, key) {
  return body.trim() === key;
}
