import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  approvedHuntSlugs,
  flagProposedCap,
  loadCaptureTargets,
  ncaafAbsenceFlag,
  proposedTargets,
} from "./scout-targets-lib.mjs";

const live = JSON.parse(
  readFileSync(path.join(process.cwd(), "docs", "capture-targets.json"), "utf8")
);

describe("loadCaptureTargets", () => {
  it("loads the live versioned queue and keeps proposed college unlabeled as hunt", () => {
    const doc = loadCaptureTargets(live);
    expect(doc.version).toBe(1);
    expect(approvedHuntSlugs(doc)).toEqual([
      "patriots-at-seahawks-2026",
      "49ers-vs-rams-2026",
      "bills-at-texans-2026",
    ]);
    expect(proposedTargets(doc, { sport: "ncaaf" }).every((row) => row.state === "proposed")).toBe(
      true
    );
    expect(proposedTargets(doc, { sport: "ncaaf" }).length).toBeGreaterThan(0);
    expect(flagProposedCap(doc)).toEqual([]);
  });

  it("still accepts a legacy slug array so tests and old loaders do not fork a second queue", () => {
    const doc = loadCaptureTargets(["wisconsin-vs-nd-2026"]);
    expect(approvedHuntSlugs(doc)).toEqual(["wisconsin-vs-nd-2026"]);
    expect(doc.legacy).toBe(true);
  });
});

describe("NCAAF absence", () => {
  it("flags current-main upcoming college absence using the live file", () => {
    const events = JSON.parse(
      readFileSync(path.join(process.cwd(), "data", "events.json"), "utf8")
    ).events;
    const flag = ncaafAbsenceFlag(events, loadCaptureTargets(live), {
      now: Date.parse("2026-09-08T16:00:00Z"),
    });
    expect(flag).toMatch(/upcoming NCAAF game events: 0/i);
    expect(flag).toMatch(/Proposed Week 2 shortlist/i);
  });
});
