import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  formatDispatch,
  loadBringOntoHome,
  scoreSlate,
} from "./scout-density-lib.mjs";

const root = process.cwd();
const eventsFile = JSON.parse(
  await readFile(path.join(root, "data", "events.json"), "utf8")
);
const calls = JSON.parse(
  await readFile(path.join(root, "data", "calls.json"), "utf8")
);
const bringRaw = JSON.parse(
  await readFile(path.join(root, "docs", "bring-onto-home.json"), "utf8")
);
const events = Array.isArray(eventsFile) ? eventsFile : eventsFile.events;
const rows = scoreSlate({
  events,
  calls,
  bringOntoHome: loadBringOntoHome(bringRaw),
});
console.log(formatDispatch(rows));
