import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  FACTORIES,
  appleLookupUrl,
  classifyQueue,
  formatFeeds,
  inspectableEpisodes,
  loadEpisodeLedger,
  parseAppleLookup,
  parseYoutubeAtom,
  youtubeFeedUrl,
} from "./scout-feeds-lib.mjs";

const UA = "Pundits.Pro scout-feeds (+https://pundits.pro/)";
const dryRun = process.argv.includes("--dry-run");

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

const root = process.cwd();
const ledger = loadEpisodeLedger(
  JSON.parse(await readFile(path.join(root, "docs", "scout-episodes.json"), "utf8"))
);
const now = new Date();
const rows = [];
for (const factory of FACTORIES) {
  try {
    const items = await loadFactory(factory);
    const classified = classifyQueue(items, now, {
      sport: factory.sport,
      ledger,
      factoryId: factory.id,
      windowDays: ledger.windowDays,
    });
    const inspectable = inspectableEpisodes(classified);
    if (inspectable.length === 0) {
      const fallback = classified[0];
      rows.push({
        factory: factory.name,
        droppedEt: fallback?.droppedEt ?? "",
        title: fallback?.title ?? "(none)",
        status: fallback?.status ?? "error",
        hunt: fallback?.hunt ?? "feed empty",
        url: fallback?.url ?? "",
      });
      continue;
    }
    for (const item of inspectable) {
      rows.push({ factory: factory.name, ...item });
    }
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
if (dryRun) {
  console.error("dry-run: printed Factory feeds only; did not write data/*.json or mark episodes inspected");
}
