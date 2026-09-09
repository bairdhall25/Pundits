import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { scoreSlate, formatDispatch } from "./scout-density-lib.mjs";
import { loadCaptureTargets } from "./scout-targets-lib.mjs";
import { parseRunFile, validateRunContents } from "./validate-run.mjs";
import { rowIdentity, promoteReadyRows, approvalStillValid } from "./scout-handoff-lib.mjs";
import { classifyItem, recordEpisodeInspection } from "./scout-feeds-lib.mjs";

const now = new Date("2026-09-08T23:30:00-04:00");
const read = p => JSON.parse(readFileSync(p, "utf8"));
describe("Scout acceptance workflow", () => {
  it("takes a selected unpublished matchup through Dispatch and unmapped Audit without minting", () => {
    const events = read("data/events.json").events;
    const calls = read("data/calls.json");
    const original = JSON.stringify({ events, calls });
    const targets = loadCaptureTargets(read("docs/capture-targets.json"));
    const college = targets.targets.filter(t => t.sport === "ncaaf");
    college.forEach(t => t.state = "proposed");
    expect(scoreSlate({ events, calls, targets, now: +now }).filter(r => r.sport === "ncaaf")).toHaveLength(0);
    college.forEach(t => t.state = "approved");
    const rows = scoreSlate({ events, calls, targets, now: +now });
    expect(rows.filter(r => r.sport === "ncaaf")).toHaveLength(4);
    expect(rows.filter(r => r.sport === "ncaaf").every(r => !r.eventSlug && r.targetId && r.matchup)).toBe(true);
    expect(formatDispatch(rows, { events, targets, now: +now })).toContain("gameday, cover3");
    const text = `## Shows pass\n### Intake\n\n| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n| fixture | | | I pick Oklahoma. | | Oklahoma at Michigan, 2026 | fixture | https://example.org/pick | 2026-09-08 | hard | ncaaf-w2-oklahoma-at-michigan | Oklahoma at Michigan, 2026 |`;
    const lanes = "\n## Lane status\n\n| lane | status | asOf | note |\n|---|---|---|---|\n| Shows | completed | 2026-09-08 | fixture |\n| X | not-run | | |\n| News | not-run | | |";
    expect(validateRunContents(text + lanes, { eventSlugs: events.map(e => e.slug) })).toEqual([]);
    const [intake] = parseRunFile(text);
    const audit = { ...intake, rowId: rowIdentity(intake), verdict: "ok-unmapped" };
    expect(approvalStillValid(audit, intake)).toBe(true);
    expect(promoteReadyRows([audit], [intake]).ready).toHaveLength(0);
    expect(promoteReadyRows([audit], [intake]).blocked[0].reason).toMatch(/explicit operator mint/);
    expect(approvalStillValid(audit, { ...intake, matchup: "Oklahoma at Texas, 2026" })).toBe(false);
    college[0].state = "deferred";
    college[1].expires = "2026-09-07";
    college[2].kickoffDate = "2026-09-07";
    expect(scoreSlate({ events, calls, targets, now: +now }).filter(r => r.sport === "ncaaf")).toHaveLength(1);
    expect(JSON.stringify({ events, calls })).toBe(original);
  });

  const row = { pundit: "fixture", eventSlug: "game-2026", side: "yes", verbatimQuote: "Away will win.", sourceUrl: "https://example.org/pick", sourceDate: "2026-09-08", reasoning: "Better defense." };
  it.each(["pundit", "eventSlug", "side", "verbatimQuote", "sourceUrl", "sourceDate", "reasoning"])("rejects changed %s at promotion", field => {
    const audit = { ...row, rowId: rowIdentity(row), verdict: "ok" };
    expect(promoteReadyRows([audit], [{ ...row, [field]: "changed" }]).ready).toEqual([]);
  });
  it("preserves approval for harmless formatting/metadata and rejects legacy approvals", () => {
    const audit = { ...row, rowId: rowIdentity(row), verdict: "ok" };
    expect(approvalStillValid(audit, { ...row, reasoning: " Better  defense. ", note: "routing", stagedAt: now.toISOString() })).toBe(true);
    expect(approvalStillValid({ ...row, verdict: "ok" }, row)).toBe(false);
    expect(approvalStillValid({ ...audit, rowId: "old-version" }, row)).toBe(false);
  });

  it.each(["hit", "opened", "dry"])("reopens %s once and preserves segment coverage", outcome => {
    const item = { title: "Week 2 picks", url: "https://example.org/episode", published: now.toISOString() };
    const id = "factory:https://example.org/episode";
    const ledger = { version: 1, episodes: [{ id, inspected: true, outcome, coverage: [{ targetId: "old", locator: "00:01", status: "completed" }] }] };
    const options = { factoryId: "factory", sport: "ncaaf", ledger };
    expect(["today", "unprocessed"]).not.toContain(classifyItem(item, now, options).status);
    ledger.episodes[0].reopenReason = "New approved target; inspect second speaker at 00:20";
    expect(classifyItem(item, now, options).status).toBe("unprocessed");
    const updated = recordEpisodeInspection(ledger, id, { outcome: "hit", inspectedAt: now.toISOString(), coverage: [{ targetId: "new", locator: "00:20", status: "completed" }] });
    expect(updated.episodes[0].coverage).toHaveLength(2);
    expect(updated.episodes[0].inspections[0].reopenReason).toContain("second speaker");
    expect(updated.episodes[0].reopenReason).toBeUndefined();
    expect(classifyItem(item, now, { ...options, ledger: updated }).status).toBe("inspected");
    expect(ledger.episodes[0].coverage).toHaveLength(1);
  });
});
