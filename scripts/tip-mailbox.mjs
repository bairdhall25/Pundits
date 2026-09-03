import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildTipSubmission, tipQueueKey } from "../lib/tip-submission.ts";
import { insertCommunityTips } from "./tip-mailbox-lib.mjs";

const args = process.argv.slice(2);
const mode = args[0];

function option(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function dateArg() {
  const value = option("date", new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("--date must be YYYY-MM-DD");
  return value;
}

function wrangler(commandArgs) {
  const binary = process.platform === "win32" ? "npx.cmd" : "npx";
  return execFileSync(binary, ["wrangler", ...commandArgs], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function updateRun(date, tips) {
  const runPath = path.join(process.cwd(), "docs", "runs", `${date}.md`);
  let current;
  try {
    current = await readFile(runPath, "utf8");
  } catch {
    throw new Error(`Run file does not exist: ${runPath}. Run Coordinator first.`);
  }
  const next = insertCommunityTips(current, tips);
  if (next !== current) await writeFile(runPath, next);
  return { runPath, imported: tips.filter((tip) => !current.includes(`| ${tip.id} |`)).length };
}

async function pull() {
  const keys = JSON.parse(
    wrangler(["kv", "key", "list", "--binding", "PUNDITS_TIPS", "--remote", "--prefix", "tip:"])
  );
  const tips = keys.map(({ name }) => {
    const value = wrangler([
      "kv",
      "key",
      "get",
      name,
      "--binding",
      "PUNDITS_TIPS",
      "--remote",
      "--text",
    ]);
    return JSON.parse(value);
  });
  const result = await updateRun(dateArg(), tips);
  console.log(`Community tips: imported ${result.imported} into ${result.runPath}`);
}

async function add() {
  const now = new Date().toISOString();
  const tip = buildTipSubmission(
    {
      discovery: "x-dm",
      placement: "direct",
      sourceUrl: option("source-url"),
      punditHint: option("pundit"),
      eventHint: option("event"),
      eventSlugHint: option("event-slug"),
      sideHint: option("side"),
      timestampHint: option("where"),
    },
    { id: crypto.randomUUID(), receivedAt: now }
  );
  const result = await updateRun(dateArg(), [tip]);
  console.log(`Community tips: added ${tipQueueKey(tip)} to ${result.runPath}`);
}

try {
  if (mode === "pull") await pull();
  else if (mode === "add") await add();
  else throw new Error("Usage: tip-mailbox.mjs <pull|add> [options]");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
