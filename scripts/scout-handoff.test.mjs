import { describe, expect, it } from "vitest";
import {
  approvalStillValid,
  callFieldsForPromotion,
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

describe("rationale vs pick validity", () => {
  const intake = {
    pundit: "pate",
    eventSlug: "alabama-at-kentucky-2026",
    side: "yes",
    verbatimQuote: "I think Alabama's going to win this game.",
    sourceUrl: "https://podcasts.apple.com/us/podcast/id1485905502?i=1000788580117",
    sourceDate: "2026-09-08",
    reasoning: "Separates SU (Alabama) from ATS (Kentucky +10.5); explicit win-the-game language.",
  };

  it("treats a changed rationale as a new identity that cannot reuse the old approval", () => {
    const audit = { ...intake, rowId: rowIdentity(intake), verdict: "ok" };
    const changed = { ...intake, reasoning: "Alabama's offensive line should wear Kentucky down." };
    expect(rowIdentity(changed)).not.toBe(rowIdentity(intake));
    expect(approvalStillValid(audit, changed)).toBe(false);
    expect(promoteReadyRows([audit], [changed]).ready).toEqual([]);
    expect(promoteReadyRows([audit], [changed]).blocked[0].reason).toMatch(/changed/i);
  });

  it("omits a rejected capsule on no-reasoning promotion while keeping the quote", () => {
    const audit = { ...intake, rowId: rowIdentity(intake), verdict: "ok-no-reasoning" };
    const { ready } = promoteReadyRows([audit], [intake]);
    expect(ready).toHaveLength(1);
    expect(ready[0].intake.verbatimQuote).toBe(intake.verbatimQuote);
    const fields = callFieldsForPromotion(audit, intake);
    expect(fields).not.toHaveProperty("reasoning");
    expect(fields.claim).toBe(intake.verbatimQuote);
    expect(fields.punditId).toBe("pate");
  });

  it("copies an approved capsule and omits an unmapped no-reasoning capsule", () => {
    const approved = { ...intake, reasoning: "Kentucky's pass rush will not hold for four quarters." };
    const okAudit = { ...approved, rowId: rowIdentity(approved), verdict: "ok" };
    expect(callFieldsForPromotion(okAudit, approved).reasoning).toBe(approved.reasoning);
    const unmapped = { ...intake, eventSlug: "", side: "" };
    const unmappedAudit = {
      ...unmapped,
      rowId: rowIdentity(unmapped),
      verdict: "ok-unmapped-no-reasoning",
    };
    const omitted = callFieldsForPromotion(unmappedAudit, unmapped);
    expect(omitted).not.toHaveProperty("reasoning");
    expect(omitted.claim).toBe(intake.verbatimQuote);
    expect(promoteReadyRows([unmappedAudit], [unmapped]).ready).toEqual([]);
    expect(promoteReadyRows([unmappedAudit], [unmapped]).blocked[0].reason).toMatch(/explicit operator mint/);
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
