import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  approvedHuntSlugs,
  approvedHuntTargets,
  flagProposedCap,
  loadCaptureTargets,
  ncaafAbsenceFlag,
} from "./scout-targets-lib.mjs";

const live = JSON.parse(
  readFileSync(path.join(process.cwd(), "docs", "capture-targets.json"), "utf8")
);

describe("loadCaptureTargets", () => {
  it("loads the live versioned queue and includes approved college staging targets", () => {
    const doc = loadCaptureTargets(live);
    expect(doc.version).toBe(1);
    expect(approvedHuntSlugs(doc, { now: Date.parse("2026-09-08T16:00:00Z") })).toEqual([
      "49ers-vs-rams-2026",
      "bills-at-texans-2026",
      "oklahoma-at-michigan-2026",
      "ohio-state-at-texas-2026",
      "arizona-state-at-texas-am-2026",
      "alabama-at-kentucky-2026",
    ]);
    expect(approvedHuntTargets(doc, { now: Date.parse("2026-09-08T16:00:00Z") }).filter(row => row.sport === "ncaaf")).toHaveLength(4);
    expect(flagProposedCap(doc)).toEqual([]);
  });

  it("still accepts a legacy slug array so tests and old loaders do not fork a second queue", () => {
    const doc = loadCaptureTargets(["wisconsin-vs-nd-2026"]);
    expect(approvedHuntSlugs(doc, { now: Date.parse("2026-09-08T16:00:00Z") })).toEqual(["wisconsin-vs-nd-2026"]);
    expect(doc.legacy).toBe(true);
  });
});

describe("NCAAF absence", () => {
  it("recognizes approved unpublished college coverage", () => {
    const events = JSON.parse(
      readFileSync(path.join(process.cwd(), "data", "events.json"), "utf8")
    ).events;
    const flag = ncaafAbsenceFlag(events, loadCaptureTargets(live), {
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(flag).toBeNull();
  });
});
