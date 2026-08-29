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
