import { readFileSync } from "node:fs";
import path from "node:path";
import {
  captureMetrics,
  formatCaptureReport,
  parseCaptureProductivityInput,
  type CaptureTargetRow,
} from "../lib/capture-metrics";
import { loadCalls, loadEvents } from "../lib/data";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function main() {
  const asOf = argValue("--as-of") ?? new Date().toISOString().slice(0, 10);
  const reportPath = argValue("--report");
  const fromFile = reportPath
    ? parseCaptureProductivityInput(JSON.parse(readFileSync(path.resolve(reportPath), "utf8")))
    : {};
  const start = argValue("--start") ?? fromFile.interval?.start;
  const end = argValue("--end") ?? fromFile.interval?.end;
  const hoursRaw = argValue("--source-hours");
  if (hoursRaw != null && hoursRaw !== "" && !Number.isFinite(Number(hoursRaw))) {
    throw new Error("--source-hours must be a number");
  }
  const sourceHours =
    hoursRaw != null && hoursRaw !== "" ? Number(hoursRaw) : fromFile.sourceHours ?? null;
  const doc = JSON.parse(
    readFileSync(path.join(process.cwd(), "docs", "capture-targets.json"), "utf8")
  ) as { targets: CaptureTargetRow[] };
  const metrics = captureMetrics({
    calls: loadCalls(),
    events: loadEvents(),
    targets: doc.targets,
    sourceHours,
    asOf,
    interval: start || end ? { start: start ?? "", end: end ?? "" } : fromFile.interval,
    evidence: fromFile.evidence,
    runIds: fromFile.runIds,
  });

  console.log(formatCaptureReport(metrics));
}

main();
