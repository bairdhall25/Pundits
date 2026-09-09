import { describe, expect, it } from "vitest";
import { prepareRosterProposals, needsScoutAudit } from "./roster-proposals.mjs";
import { parseRunFile } from "./validate-run.mjs";
import { rowIdentity, approvalStillValid, promoteReadyRows } from "./scout-handoff-lib.mjs";

const run = `<!-- hard=0 candidates=1 audit=pending -->
## Shows pass
### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory | xHandle | photoSource |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guest | Guest Analyst | other | Network | game-2026 | yes | Away will win. | | | https://example.org/pick | 2026-09-08 | https://example.org/photo.jpg | Independent guest on roster show | https://example.org/guest | The Herd | GuestAnalyst | Official talent photo, permission to be reviewed |
`;
const [candidate] = parseRunFile(run);
const audit = { proposedId: "guest", rowId: rowIdentity(candidate), verdict: "ok", auditedAt: "2026-09-08T23:00:00Z", eligibility: "association", eligibilityReason: "Verified independent guest role in the source introduction." };
describe("association roster handoff", () => {
  it("routes candidate-only runs to Audit and keeps unavailable evidence pending", () => {
    expect(needsScoutAudit(run)).toBe(true);
    expect(needsScoutAudit("## Shows pass\nNo discoveries.")).toBe(false);
    const [proposal] = prepareRosterProposals(run);
    expect(proposal.status).toBe("awaiting-audit");
    expect(proposal.owner).toBe("Audit");
    expect(proposal.rosterApproved).toBe(false);
  });
  it("prepares a complete review packet without granting photo or roster approval", () => {
    const [proposal] = prepareRosterProposals(run, [audit], { sourceRun: "run.md" });
    expect(proposal.status).toBe("ready-for-review");
    expect(proposal.sourceRun).toBe("run.md");
    expect(proposal.photoApproved).toBe(false);
    expect(promoteReadyRows([audit], [candidate]).ready).toEqual([]);
    expect(promoteReadyRows([audit], [candidate]).blocked[0].reason).toMatch(/candidate requires/);
  });
  it("does not fail valid picks because a photo is missing", () => {
    const missingPhoto = run.replace("https://example.org/photo.jpg", "needed");
    const [proposal] = prepareRosterProposals(missingPhoto, [audit]);
    expect(proposal.status).toBe("needs-evidence");
    expect(proposal.missing).toContain("Proposed usable photo URL");
    expect(proposal.audit.verdict).toBe("ok");
  });
  it("distinguishes an ineligible team analyst from an uncertain role", () => {
    expect(prepareRosterProposals(run, [{ ...audit, eligibility: "ineligible" }])[0].status).toBe("rejected");
    expect(prepareRosterProposals(run, [{ ...audit, eligibility: "uncertain" }])[0].status).toBe("needs-evidence");
  });
  it.each(["proposedId", "name", "association", "associationUrl"])("invalidates changed candidate %s", field => {
    expect(approvalStillValid(audit, { ...candidate, [field]: "another person or source" })).toBe(false);
  });
  it("never treats stale verdicts as a prepared decision", () => {
    expect(prepareRosterProposals(run, [{ ...audit, rowId: "old" }])[0].status).toBe("awaiting-audit");
  });
});
