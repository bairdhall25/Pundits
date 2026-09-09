import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseRunFile } from "./validate-run.mjs";
import { rowIdentity, approvalStillValid } from "./scout-handoff-lib.mjs";

export function needsScoutAudit(contents) {
  return parseRunFile(contents).some(row => row.section === "Candidates" ||
    (row.section === "Intake" && row["hard/soft"] === "hard"));
}

// Audit owns the evidence verdict and association assessment. These functions never
// infer verification from a URL or authorize roster publication.
export function prepareRosterProposals(contents, audits = [], { sourceRun = "" } = {}) {
  return parseRunFile(contents).filter(row => row.section === "Candidates").map(candidate => {
    const rowId = rowIdentity(candidate);
    const audit = audits.find(a => a.rowId === rowId && approvalStillValid(a, candidate));
    const missing = [];
    if (!audit) missing.push("Independent Audit of current candidate evidence");
    const verified = ["ok", "ok-no-reasoning", "ok-unmapped", "ok-unmapped-no-reasoning"].includes(audit?.verdict);
    if (audit && !verified && audit.verdict !== "fail") missing.push("Pick evidence verdict");
    if (!audit?.auditedAt) missing.push("Known Audit timestamp");
    if (!candidate.name) missing.push("Named identity");
    if (!candidate.association || !candidate.associationUrl) missing.push("Association role and source URL");
    if (!audit?.eligibilityReason) missing.push("Evidence-backed eligibility explanation");
    if (audit?.eligibility !== "association") missing.push("Independent-pundit association verified");
    if (!candidate.xHandle) missing.push("Verified official X handle");
    if (!candidate.factory) missing.push("Future Scout source/factory");
    if (!candidate.photoUrl || candidate.photoUrl === "needed") missing.push("Proposed usable photo URL");
    if (!candidate.photoSource) missing.push("Photo provenance / permission basis for review");
    const rejected = audit?.verdict === "fail" || audit?.eligibility === "ineligible";
    return {
      id: `candidate-${candidate.proposedId}-${rowId}`, kind: "roster-candidate",
      proposedId: candidate.proposedId, rowId, sourceRun,
      status: rejected ? "rejected" : !audit ? "awaiting-audit" : missing.length ? "needs-evidence" : "ready-for-review",
      owner: !audit ? "Audit" : "Promote",
      candidate, audit: audit ?? null, missing,
      nextAction: rejected ? "Retain evidence and rejection reason; do not roster" : !audit ?
        "Audit reopens pick and association sources even when hard=0" : missing.length ?
        "Promote prepares missing identity/photo/source material; Audit owns evidence verification" :
        "Ask operator to approve roster addition and the proposed photo together",
      rosterApproved: false, photoApproved: false,
      mintRequired: !candidate.eventSlug,
    };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [run, auditFile] = process.argv.slice(2);
  if (!run) throw new Error("Usage: node scripts/roster-proposals.mjs <run.md> [candidate-audits.json]; prints proposals only");
  const contents = readFileSync(run, "utf8");
  const audits = auditFile ? JSON.parse(readFileSync(auditFile, "utf8")) : [];
  if (!Array.isArray(audits)) throw new Error("Candidate audit file must be an array");
  console.log(JSON.stringify({ needsAudit: needsScoutAudit(contents), proposals: prepareRosterProposals(contents, audits, { sourceRun: run }) }, null, 2));
}
