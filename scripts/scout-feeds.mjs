import {
  FACTORIES,
  appleLookupUrl,
  classifyItem,
  formatFeeds,
  latestUsable,
  parseAppleLookup,
  parseYoutubeAtom,
  youtubeFeedUrl,
} from "./scout-feeds-lib.mjs";

const UA = "Pundits.Pro scout-feeds (+https://pundits.pro/)";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "application/json, application/atom+xml, text/xml, */*" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function loadFactory(factory) {
  if (factory.kind === "apple") {
    const json = JSON.parse(await fetchText(appleLookupUrl(factory.appleId)));
    return parseAppleLookup(json);
  }
  const xml = await fetchText(youtubeFeedUrl(factory.channelId));
  return parseYoutubeAtom(xml);
}

const now = new Date();
const rows = [];
for (const factory of FACTORIES) {
  try {
    const items = await loadFactory(factory);
    const item = latestUsable(items, { sport: factory.sport });
    if (!item) {
      rows.push({
        factory: factory.name,
        droppedEt: "",
        title: "(none)",
        status: "error",
        hunt: "feed empty",
        url: "",
      });
      continue;
    }
    const classified = classifyItem(item, now, { sport: factory.sport });
    rows.push({ factory: factory.name, ...classified });
  } catch (err) {
    rows.push({
      factory: factory.name,
      droppedEt: "",
      title: "(error)",
      status: "error",
      hunt: String(err?.message ?? err).slice(0, 80),
      url: "",
    });
  }
}

console.log(formatFeeds(rows, now));
for (const row of rows) {
  if (row.url) console.log(`<!-- ${row.factory}: ${row.url} -->`);
}
