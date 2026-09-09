import { createHash } from "node:crypto";

export const LANE_STATUSES = ["completed", "dry", "blocked", "not-run"];
export const EXPECTED_LANES = ["Shows", "X", "News"];
export const PROMOTE_OK = new Set(["ok", "ok-no-reasoning"]);
export const UNMAPPED_OK = new Set(["ok-unmapped", "ok-unmapped-no-reasoning"]);
export const MILESTONE_FIELDS = [
  "sourcePublishedAt",
  "stagedAt",
  "auditedAt",
  "promotedAt",
  "verifiedLiveAt",
];

export function normalizeQuote(quote) {
  return String(quote ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function rowIdentity({
  pundit = "",
  eventSlug = "",
  side = "",
  verbatimQuote = "",
  sourceUrl = "",
} = {}) {
  const canonical = [
    String(pundit).trim().toLowerCase(),
    String(eventSlug || "unmapped").trim().toLowerCase(),
    String(side || "").trim().toLowerCase(),
    normalizeQuote(verbatimQuote),
    String(sourceUrl || "").trim(),
  ].join("\u0000");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

export function approvalStillValid(auditRow, intakeRow) {
  if (!auditRow || !intakeRow) return false;
  const currentId = rowIdentity(intakeRow);
  if (auditRow.rowId && auditRow.rowId !== currentId) return false;
  if (!auditRow.rowId) {
    return (
      normalizeQuote(auditRow.verbatimQuote) === normalizeQuote(intakeRow.verbatimQuote) &&
      (auditRow.pundit || "") === (intakeRow.pundit || "") &&
      (auditRow.eventSlug || "") === (intakeRow.eventSlug || "") &&
      (auditRow.side || "") === (intakeRow.side || "")
    );
  }
  return true;
}

export function duplicateMappedKeys(rows) {
  const seen = new Map();
  const duplicates = [];
  for (const row of rows ?? []) {
    if (!row.eventSlug) continue;
    const key = `${(row.pundit || row.proposedId || "").toLowerCase()}\u0000${row.eventSlug}`;
    if (seen.has(key)) {
      duplicates.push({ row, firstLine: seen.get(key) });
    } else {
      seen.set(key, row.line ?? row.rowId);
    }
  }
  return duplicates;
}

export function supersededByQuoteChange(previousAudit, intakeRow) {
  if (!previousAudit) return false;
  return !approvalStillValid(previousAudit, intakeRow);
}

/**
 * Row-specific Promote gate. An unrelated fail does not block a verified mapped row
 * whose current quote still matches its Audit identity.
 */
function matchingIntake(audit, intakeRows, intakeById) {
  if (audit.rowId && intakeById.has(audit.rowId)) return intakeById.get(audit.rowId);
  const sameSlot = (intakeRows ?? []).filter(
    (row) =>
      (row.pundit || "") === (audit.pundit || "") &&
      (row.eventSlug || "") === (audit.eventSlug || "")
  );
  if (sameSlot.length === 1) return sameSlot[0];
  return (intakeRows ?? []).find((row) => approvalStillValid(audit, row));
}

export function promoteReadyRows(auditRows, intakeRows) {
  const intakeById = new Map(
    (intakeRows ?? []).map((row) => [rowIdentity(row), row])
  );
  const ready = [];
  const blocked = [];
  for (const audit of auditRows ?? []) {
    const intake = matchingIntake(audit, intakeRows, intakeById);
    if (!intake) {
      blocked.push({ audit, reason: "no matching current intake row" });
      continue;
    }
    if (supersededByQuoteChange(audit, intake)) {
      blocked.push({ audit, intake, reason: "quote changed; previous approval is invalid" });
      continue;
    }
    if (audit.verdict === "fail") {
      blocked.push({ audit, intake, reason: "row failed Audit" });
      continue;
    }
    if (PROMOTE_OK.has(audit.verdict) && intake.eventSlug) {
      ready.push({ audit, intake });
      continue;
    }
    if (UNMAPPED_OK.has(audit.verdict)) {
      blocked.push({
        audit,
        intake,
        reason: "verified overflow waits on an explicit operator mint",
      });
    }
  }
  return { ready, blocked };
}

export function dayLevelFailBlocksReadyMappedRows() {
  return false;
}

export function parseLaneStatus(contents) {
  const lines = String(contents ?? "").split(/\r?\n/u);
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (/^##\s+Lane status\s*$/i.test(line)) {
      inTable = true;
      continue;
    }
    if (inTable && /^##\s+/.test(line)) break;
    if (!inTable || !line.startsWith("|")) continue;
    const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (!cells.length || /^-{3,}/.test(cells[0]) || /^lane$/i.test(cells[0])) continue;
    rows.push({
      lane: cells[0],
      status: (cells[1] || "").toLowerCase(),
      asOf: cells[2] || "",
      note: cells[3] || "",
    });
  }
  return rows;
}

export function laneStatusErrors(contents) {
  const errors = [];
  const rows = parseLaneStatus(contents);
  if (rows.length === 0) return errors;
  const seen = new Set();
  for (const row of rows) {
    seen.add(row.lane);
    if (!LANE_STATUSES.includes(row.status)) {
      errors.push(`Lane ${row.lane} status "${row.status}" must be ${LANE_STATUSES.join("|")}`);
    }
    if (row.status === "dry" && /not run|did not run|skipped the pass/i.test(row.note)) {
      errors.push(`Lane ${row.lane}: a missing run is not a dry hunt`);
    }
    if (row.status === "completed" && /connector failure|failed_to_load|client-not-enrolled/i.test(row.note)) {
      errors.push(`Lane ${row.lane}: do not claim a sweep after a connector failure`);
    }
  }
  for (const lane of EXPECTED_LANES) {
    if (!seen.has(lane)) {
      errors.push(`Lane status table is missing ${lane}; record completed, dry, blocked, or not-run`);
    }
  }
  return errors;
}

export function missingLaneIsNotDry(status) {
  return status === "not-run" || status === "blocked";
}

export function loadDecisionQueue(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) {
    throw new Error("docs/capture-decisions.json must be an object with an items array");
  }
  return {
    version: raw.version ?? 1,
    updated: raw.updated ?? "",
    reviewCadence: raw.reviewCadence ?? "",
    items: raw.items,
  };
}

export function pendingDecisions(doc) {
  return (doc?.items ?? []).filter((item) => item.status === "pending");
}

export function formatDecisionQueue(doc) {
  const items = pendingDecisions(doc);
  const lines = [
    "### Decision queue (operator — not a new bot)",
    "",
    doc?.reviewCadence ? `${doc.reviewCadence}` : "",
    doc?.reviewCadence ? "" : "",
    "| id | kind | needed | status |",
    "|---|---|---|---|",
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "");
  if (items.length === 0) {
    lines.push("| *(none)* | | | |");
    return lines.join("\n");
  }
  for (const item of items) {
    lines.push(
      `| ${item.id} | ${item.kind} | ${String(item.needed ?? "").replace(/\|/g, "/")} | ${item.status} |`
    );
  }
  return lines.join("\n");
}

export function milestonesFromKnown({
  sourcePublishedAt = "",
  stagedAt = "",
  auditedAt = "",
  promotedAt = "",
  verifiedLiveAt = "",
} = {}) {
  return {
    sourcePublishedAt: sourcePublishedAt || "unknown",
    stagedAt: stagedAt || "unknown",
    auditedAt: auditedAt || "unknown",
    promotedAt: promotedAt || "unknown",
    verifiedLiveAt: verifiedLiveAt || "unknown",
  };
}

export function rejectSourceDateBackfill(milestones, sourceDate) {
  if (!sourceDate) return [];
  const errors = [];
  for (const field of ["stagedAt", "auditedAt", "promotedAt", "verifiedLiveAt"]) {
    if (milestones[field] && milestones[field] === sourceDate) {
      errors.push(`${field} must not be backfilled from sourceDate`);
    }
  }
  return errors;
}
