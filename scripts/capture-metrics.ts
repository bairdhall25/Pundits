import { readFileSync } from "node:fs";
import path from "node:path";
import { captureMetrics, formatUnavailable, type CaptureTargetRow } from "../lib/capture-metrics";
import { loadCalls, loadEvents } from "../lib/data";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function main() {
  const asOf = argValue("--as-of") ?? new Date().toISOString().slice(0, 10);
  const hoursRaw = argValue("--source-hours");
  const sourceHours = hoursRaw != null && hoursRaw !== "" ? Number(hoursRaw) : null;
  if (hoursRaw != null && !Number.isFinite(sourceHours)) {
    throw new Error("--source-hours must be a number");
  }
  const doc = JSON.parse(
    readFileSync(path.join(process.cwd(), "docs", "capture-targets.json"), "utf8")
  ) as { targets: CaptureTargetRow[] };
  const metrics = captureMetrics({
    calls: loadCalls(),
    events: loadEvents(),
    targets: doc.targets,
    sourceHours,
    asOf,
  });

  console.log(`# Capture metrics`);
  console.log("");
  console.log(`asOf: ${metrics.asOf}`);
  console.log(`Approved targets: ${metrics.approvedTargets}`);
  console.log(`Proposed targets (not hunted as a board): ${metrics.proposedTargets}`);
  console.log(`Mapped hard picks on approved targets: ${metrics.mappedHardOnApproved}`);
  console.log(`Picks per source-hour: ${formatUnavailable(metrics.picksPerSourceHour)}`);
  console.log(`Source-to-live: ${formatUnavailable(metrics.sourceToLive)}`);
  console.log(`Pre-kickoff lead: ${formatUnavailable(metrics.preKickoffLead)}`);
  console.log(`Rework: ${formatUnavailable(metrics.rework)}`);
  console.log(`Missing locators: ${metrics.missingLocators.length}`);
  console.log("");
  console.log("| target | eventSlug | mapped | yes | no | both sides | empty | missing locators |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const row of metrics.coverage) {
    console.log(
      `| ${row.id} | ${row.eventSlug ?? "n/a"} | ${row.mappedHard} | ${row.yes} | ${row.no} | ${row.bothSides ? "yes" : "no"} | ${row.emptySides.join(",") || "none"} | ${row.missingLocators} |`
    );
  }
}

main();
