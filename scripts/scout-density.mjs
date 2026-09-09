import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  formatDispatch,
  loadCaptureTargets,
  scoreSlate,
} from "./scout-density-lib.mjs";
import {
  formatDecisionQueue,
  loadDecisionQueue,
} from "./scout-handoff-lib.mjs";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const eventsFile = JSON.parse(
  await readFile(path.join(root, "data", "events.json"), "utf8")
);
const calls = JSON.parse(
  await readFile(path.join(root, "data", "calls.json"), "utf8")
);
const targets = loadCaptureTargets(
  JSON.parse(
    await readFile(path.join(root, "docs", "capture-targets.json"), "utf8")
  )
);
const decisions = loadDecisionQueue(
  JSON.parse(
    await readFile(path.join(root, "docs", "capture-decisions.json"), "utf8")
  )
);
const events = Array.isArray(eventsFile) ? eventsFile : eventsFile.events;
const rows = scoreSlate({
  events,
  calls,
  targets,
});
console.log(formatDispatch(rows, { events, targets }));
console.log("");
console.log(formatDecisionQueue(decisions));
if (dryRun) {
  console.log("dry-run: printed Dispatch only; did not write data/*.json");
}
