import { describe, expect, it } from "vitest";
import {
  approvalStillValid,
  dayLevelFailBlocksReadyMappedRows,
  laneStatusErrors,
  loadDecisionQueue,
  pendingDecisions,
  promoteReadyRows,
  rejectSourceDateBackfill,
  rowIdentity,
  supersededByQuoteChange,
} from "./scout-handoff-lib.mjs";

const howard = {
  pundit: "howard",
  eventSlug: "clemson-at-lsu-2026",
  side: "no",
  verbatimQuote: "LSU over Clemson",
  sourceUrl: "https://gamedaycole.com/week-1",
};

const portnoy = {
  pundit: "portnoy",
  eventSlug: "",
  side: "",
  verbatimQuote: "Indiana win by a million",
  sourceUrl: "https://youtube.com/watch?v=wIBg-tDzA8g",
};

describe("row identity", () => {
  it("changes when the quote changes", () => {
    const original = rowIdentity(howard);
    const edited = rowIdentity({ ...howard, verbatimQuote: "LSU over Clemson, I think" });
    expect(original).not.toBe(edited);
  });

  it("is stable for the same mapped row", () => {
    expect(rowIdentity(howard)).toBe(rowIdentity({ ...howard }));
  });
});

describe("row-specific approval", () => {
  it("does not let an unrelated failed row block an approved mapped row", () => {
    const auditRows = [
      { ...howard, rowId: rowIdentity(howard), verdict: "ok" },
      { ...portnoy, rowId: rowIdentity(portnoy), verdict: "fail" },
    ];
    const { ready, blocked } = promoteReadyRows(auditRows, [howard, portnoy]);
    expect(ready.map((row) => row.intake.pundit)).toEqual(["howard"]);
    expect(blocked.some((row) => row.intake?.pundit === "portnoy")).toBe(true);
    expect(dayLevelFailBlocksReadyMappedRows()).toBe(false);
  });

  it("invalidates approval when the quote is modified", () => {
    const audit = { ...howard, rowId: rowIdentity(howard), verdict: "ok" };
    const modified = { ...howard, verbatimQuote: "Give me LSU" };
    expect(approvalStillValid(audit, modified)).toBe(false);
    expect(supersededByQuoteChange(audit, modified)).toBe(true);
    const { ready, blocked } = promoteReadyRows([audit], [modified]);
    expect(ready).toEqual([]);
    expect(blocked[0].reason).toMatch(/quote changed/i);
  });
});

describe("lane status", () => {
  it("rejects a missing run labeled dry and a connector-failure sweep", () => {
    const contents = `## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | dry | 2026-09-08 | not run this pass |
| X | completed | 2026-09-08 | client-not-enrolled |
| News | not-run | 2026-09-08 | |
`;
    const errors = laneStatusErrors(contents).join("\n");
    expect(errors).toMatch(/missing run is not a dry hunt/i);
    expect(errors).toMatch(/connector failure/i);
  });

  it("errors when a required Lane status table is omitted", () => {
    expect(laneStatusErrors("## Shows pass", { required: true }).join("\n")).toMatch(
      /Lane status table is required/i
    );
    expect(laneStatusErrors("## Shows pass", { required: false })).toEqual([]);
  });

  it("accepts completed, dry, blocked, and not-run", () => {
    const contents = `## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-09-08 | opened GMFB |
| X | blocked | 2026-09-08 | client-not-enrolled |
| News | not-run | 2026-09-08 | not scheduled this window |
`;
    expect(laneStatusErrors(contents)).toEqual([]);
  });
});

describe("decision queue", () => {
  it("lists pending operator decisions without auto-roster", () => {
    const doc = loadDecisionQueue({
      version: 1,
      reviewCadence: "Tue/Fri",
      items: [
        { id: "ncaaf-week2-shortlist", kind: "target-selection", status: "pending", needed: "Approve college shortlist" },
        { id: "done", kind: "roster-candidate", status: "closed", needed: "already decided" },
      ],
    });
    expect(pendingDecisions(doc).map((item) => item.id)).toEqual(["ncaaf-week2-shortlist"]);
  });
});

describe("milestones", () => {
  it("refuses to treat sourceDate as first publication", () => {
    expect(
      rejectSourceDateBackfill(
        { stagedAt: "2026-06-23", promotedAt: "unknown", verifiedLiveAt: "unknown", auditedAt: "unknown" },
        "2026-06-23"
      )
    ).toEqual(["stagedAt must not be backfilled from sourceDate"]);
  });
});
