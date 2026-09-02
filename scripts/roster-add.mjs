import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const PHOTO = /^\/photos\/[a-z0-9-]+\.(jpg|png)$/;
const SPORTS = new Set(["ncaaf", "nfl", "both"]);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function photoPath(root, photo) {
  return path.join(root, "public", photo.replace(/^\//, ""));
}

function assertManifest(manifest, root) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("roster-add: manifest required");
  }
  if (manifest.eligibility !== "association") {
    throw new Error("roster-add: eligibility must be association");
  }
  if (typeof manifest.id !== "string" || !/^[a-z0-9-]+$/.test(manifest.id)) {
    throw new Error("roster-add: invalid id");
  }
  if (typeof manifest.name !== "string" || !manifest.name.trim()) {
    throw new Error("roster-add: name required");
  }
  if (typeof manifest.outlet !== "string" || !manifest.outlet.trim()) {
    throw new Error("roster-add: outlet required");
  }
  if (!SPORTS.has(manifest.sport)) {
    throw new Error("roster-add: sport must be ncaaf, nfl, or both");
  }
  if (typeof manifest.photo !== "string" || !PHOTO.test(manifest.photo)) {
    throw new Error("roster-add: photo must be /photos/{id}.jpg or .png");
  }
  if (!existsSync(photoPath(root, manifest.photo))) {
    throw new Error(`roster-add: photo file missing at public${manifest.photo}`);
  }
  if (typeof manifest.xHandle !== "string" || !manifest.xHandle.trim()) {
    throw new Error("roster-add: xHandle required");
  }
  if (typeof manifest.factory !== "string" || !manifest.factory.trim()) {
    throw new Error("roster-add: factory required");
  }
  if (!Array.isArray(manifest.calls)) {
    throw new Error("roster-add: calls must be an array");
  }
}

function upsertPundit(pundits, manifest) {
  if (pundits.some((pundit) => pundit.id === manifest.id)) return pundits;
  pundits.push({
    id: manifest.id,
    name: manifest.name,
    outlet: manifest.outlet,
    photo: manifest.photo,
    sport: manifest.sport,
  });
  return pundits;
}

function callId(manifest, call) {
  const slug = call.eventSlug.replace(/-20\d{2}$/, "").replace(/[^a-z0-9]+/g, "-");
  const day = (call.sourceDate || "").replaceAll("-", "");
  return `${manifest.id}-${slug}-${day}`.replace(/-+/g, "-");
}

function appendCalls(calls, manifest) {
  for (const staged of manifest.calls) {
    if (!staged.eventSlug || (staged.side !== "yes" && staged.side !== "no")) {
      throw new Error("roster-add: each call needs eventSlug and side yes|no");
    }
    if (!staged.claim || !staged.sourceUrl || !ISO_DAY.test(staged.sourceDate)) {
      throw new Error("roster-add: each call needs claim, sourceUrl, sourceDate");
    }
    const dup = calls.some(
      (call) => call.punditId === manifest.id && call.eventSlug === staged.eventSlug
    );
    if (dup) continue;
    const row = {
      id: callId(manifest, staged),
      punditId: manifest.id,
      claim: staged.claim,
      source: staged.source,
      sourceUrl: staged.sourceUrl,
      sourceDate: staged.sourceDate,
      kind: "hard",
      subject: staged.subject,
      paysOn: staged.paysOn,
      status: "pending",
      eventSlug: staged.eventSlug,
      side: staged.side,
    };
    if (staged.reasoning) row.reasoning = staged.reasoning;
    calls.push(row);
  }
  return calls;
}

function insertScoutXRow(markdown, manifest) {
  const row = `| ${manifest.id} | ${manifest.name} | ${manifest.xHandle} |`;
  if (markdown.includes(`| ${manifest.id} |`)) return markdown;
  const needle = "|---|---|---|";
  const at = markdown.indexOf(needle);
  if (at === -1) throw new Error("roster-add: scout-x.md roster table missing");
  const afterHeader = at + needle.length;
  const nextNl = markdown.indexOf("\n", afterHeader);
  const insertAt = nextNl === -1 ? markdown.length : nextNl + 1;
  return `${markdown.slice(0, insertAt)}${row}\n${markdown.slice(insertAt)}`;
}

function insertPickShowsVoice(markdown, manifest) {
  const tick = `\`${manifest.id}\``;
  if (markdown.includes(tick)) return markdown;
  const lines = markdown.split("\n");
  const factory = manifest.factory.toLowerCase();
  const index = lines.findIndex(
    (line) => line.startsWith("|") && line.toLowerCase().includes(factory)
  );
  if (index === -1) {
    throw new Error(`roster-add: factory "${manifest.factory}" not in pick-shows.md`);
  }
  const cols = lines[index].split("|");
  const voiceCol = cols.findIndex((col) => /`[a-z][a-z0-9-]*`/.test(col));
  if (voiceCol === -1) {
    throw new Error("roster-add: pick-shows row has no roster-id cell");
  }
  const cell = cols[voiceCol];
  const ids = [...cell.matchAll(/`([a-z][a-z0-9-]*)`/g)].map((match) => match[1]);
  if (ids.includes(manifest.id)) return markdown;
  const last = ids[ids.length - 1];
  if (!last) {
    throw new Error("roster-add: pick-shows row has no roster-id cell");
  }
  cols[voiceCol] = cell.replace(`\`${last}\``, `\`${last}\`, ${tick}`);
  lines[index] = cols.join("|");
  return lines.join("\n");
}

function upsertLedger(ledger, manifest) {
  const row = {
    id: manifest.id,
    xHandle: manifest.xHandle,
    factory: manifest.factory,
    photoSource: manifest.photoSource ?? null,
  };
  const index = ledger.findIndex((item) => item.id === manifest.id);
  if (index === -1) ledger.push(row);
  else ledger[index] = row;
  return ledger;
}

export function applyRosterAdd(manifest, root) {
  assertManifest(manifest, root);
  const punditsFile = path.join(root, "data", "pundits.json");
  const callsFile = path.join(root, "data", "calls.json");
  const ledgerFile = path.join(root, "docs", "roster-pipeline.json");
  const scoutXFile = path.join(root, "bots", "scout-x.md");
  const pickShowsFile = path.join(root, "docs", "pick-shows.md");

  const pundits = readJson(punditsFile);
  if (!pundits.some((pundit) => pundit.id === manifest.id)) {
    writeJson(punditsFile, upsertPundit(pundits, manifest));
  }

  const calls = readJson(callsFile);
  const before = calls.length;
  appendCalls(calls, manifest);
  if (calls.length !== before) writeJson(callsFile, calls);

  const scoutX = readFileSync(scoutXFile, "utf8");
  const nextX = insertScoutXRow(scoutX, manifest);
  if (nextX !== scoutX) writeFileSync(scoutXFile, nextX);

  const pickShows = readFileSync(pickShowsFile, "utf8");
  const nextShows = insertPickShowsVoice(pickShows, manifest);
  if (nextShows !== pickShows) writeFileSync(pickShowsFile, nextShows);

  writeJson(ledgerFile, upsertLedger(readJson(ledgerFile), manifest));
}

export function checkRosterPipeline(root) {
  const ledger = readJson(path.join(root, "docs", "roster-pipeline.json"));
  if (!Array.isArray(ledger)) {
    throw new Error("roster-add: roster-pipeline.json must be an array");
  }
  const pundits = readJson(path.join(root, "data", "pundits.json"));
  const punditIds = new Set(pundits.map((pundit) => pundit.id));
  const scoutX = readFileSync(path.join(root, "bots", "scout-x.md"), "utf8");
  const pickShows = readFileSync(path.join(root, "docs", "pick-shows.md"), "utf8");
  const ids = [];
  for (const row of ledger) {
    if (!row?.id) throw new Error("roster-add: ledger row missing id");
    if (!punditIds.has(row.id)) {
      throw new Error(`roster-add: ${row.id} missing from pundits.json`);
    }
    const pundit = pundits.find((item) => item.id === row.id);
    if (!existsSync(photoPath(root, pundit.photo))) {
      throw new Error(`roster-add: ${row.id} photo file missing`);
    }
    if (!scoutX.includes(`| ${row.id} |`)) {
      throw new Error(`roster-add: ${row.id} missing from scout-x.md`);
    }
    if (!pickShows.includes(`\`${row.id}\``)) {
      throw new Error(`roster-add: ${row.id} missing from pick-shows.md`);
    }
    ids.push(row.id);
  }
  return { ok: true, ids };
}

function loadManifest(rel) {
  const file = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  return readJson(file);
}

function main(argv) {
  const [cmd, target] = argv;
  const root = process.cwd();
  if (cmd === "check") {
    const result = checkRosterPipeline(root);
    if (target && !result.ids.includes(target)) {
      throw new Error(`roster-add: ${target} is not on the ledger`);
    }
    console.log(`roster-add check ok (${result.ids.join(", ") || "empty ledger"})`);
    return;
  }
  if (cmd === "apply" && target) {
    applyRosterAdd(loadManifest(target), root);
    checkRosterPipeline(root);
    console.log(`roster-add apply ok (${loadManifest(target).id})`);
    return;
  }
  throw new Error("usage: node scripts/roster-add.mjs apply <manifest.json> | check [id]");
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
