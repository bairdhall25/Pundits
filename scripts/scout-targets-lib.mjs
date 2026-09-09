import { easternDay } from "./scout-feeds-lib.mjs";

export const CAPTURE_TARGETS_VERSION = 1;
export const DEFAULT_PROPOSED_CAP = 4;
export const TARGET_STATES = new Set([
  "proposed",
  "approved",
  "expired-settled",
  "expired-ungraded",
  "deferred",
]);

const SPORTS = new Set(["ncaaf", "nfl"]);

export function loadCaptureTargets(raw) {
  if (Array.isArray(raw)) {
    return {
      version: CAPTURE_TARGETS_VERSION,
      proposedCap: { ncaaf: DEFAULT_PROPOSED_CAP, nfl: DEFAULT_PROPOSED_CAP },
      gaps: [],
      targets: raw.map((slug, index) => ({
        id: `legacy-${slug}`,
        state: "approved",
        eventSlug: slug,
        priority: 5,
        sport: null,
        legacy: true,
      })),
      expired: [],
      legacy: true,
    };
  }
  if (!raw || typeof raw !== "object") {
    throw new Error("docs/capture-targets.json must be a versioned object or a slug array");
  }
  if (raw.version !== CAPTURE_TARGETS_VERSION) {
    throw new Error(`docs/capture-targets.json version must be ${CAPTURE_TARGETS_VERSION}`);
  }
  if (!Array.isArray(raw.targets)) {
    throw new Error("docs/capture-targets.json needs a targets array");
  }
  const seen = new Set();
  for (const target of raw.targets) {
    validateTarget(target, seen);
  }
  for (const target of raw.expired ?? []) {
    if (!target?.id) throw new Error("expired capture target is missing id");
  }
  return {
    version: raw.version,
    updated: raw.updated ?? "",
    proposedCap: {
      ncaaf: Number(raw.proposedCap?.ncaaf) || DEFAULT_PROPOSED_CAP,
      nfl: Number(raw.proposedCap?.nfl) || DEFAULT_PROPOSED_CAP,
    },
    selectionRule: raw.selectionRule ?? "",
    gaps: Array.isArray(raw.gaps) ? raw.gaps : [],
    targets: raw.targets,
    expired: raw.expired ?? [],
    legacy: false,
  };
}

function validateTarget(target, seen) {
  if (!target || typeof target !== "object") {
    throw new Error("capture target must be an object");
  }
  if (!target.id || seen.has(target.id)) {
    throw new Error(`capture target id missing or duplicated: ${target.id ?? "(none)"}`);
  }
  seen.add(target.id);
  if (!TARGET_STATES.has(target.state)) {
    throw new Error(`capture target ${target.id} has invalid state ${target.state}`);
  }
  if (target.sport && !SPORTS.has(target.sport)) {
    throw new Error(`capture target ${target.id} has invalid sport ${target.sport}`);
  }
  if (target.priority != null && (!Number.isFinite(target.priority) || target.priority < 1)) {
    throw new Error(`capture target ${target.id} priority must be a positive number`);
  }
  if (target.eventSlug != null && target.eventSlug !== "" && typeof target.eventSlug !== "string") {
    throw new Error(`capture target ${target.id} eventSlug must be a string or null`);
  }
}

export function approvedHuntTargets(doc, { now = Date.now() } = {}) {
  const today = easternDay(new Date(now));
  return (doc?.targets ?? []).filter(
    (target) => target.state === "approved" &&
      (!target.expires || target.expires >= today) &&
      (!target.kickoffDate || target.kickoffDate >= today)
  );
}

export function approvedHuntSlugs(doc, options) {
  return approvedHuntTargets(doc, options).map((target) => target.eventSlug).filter(Boolean);
}

export function proposedTargets(doc, { sport } = {}) {
  return (doc?.targets ?? []).filter((target) => {
    if (target.state !== "proposed") return false;
    if (sport && target.sport !== sport) return false;
    return true;
  });
}

export function proposedCap(doc, sport) {
  return doc?.proposedCap?.[sport] ?? DEFAULT_PROPOSED_CAP;
}

export function flagProposedCap(doc) {
  const flags = [];
  for (const sport of ["ncaaf", "nfl"]) {
    const count = proposedTargets(doc, { sport }).length;
    const cap = proposedCap(doc, sport);
    if (count > cap) {
      flags.push(
        `${sport} proposed shortlist is ${count} games; cap is ${cap}. Trim before treating as the next-slate proposal.`
      );
    }
  }
  return flags;
}

export function upcomingSportAbsence(events, { sport, now = Date.now() } = {}) {
  const today = easternDay(new Date(now));
  const upcoming = (events ?? []).filter((event) => {
    if (event.sport !== sport) return false;
    if (event.kind === "future") return false;
    if (event.kind && event.kind !== "game") return false;
    if (!event.kickoffDate && !(event.kickoff && event.awayTeam && event.homeTeam)) {
      return false;
    }
    if (event.awayScore != null && event.homeScore != null) return false;
    if (!event.kickoffDate) return true;
    return event.kickoffDate >= today;
  });
  return {
    sport,
    count: upcoming.length,
    slugs: upcoming.map((event) => event.slug),
  };
}

export function ncaafAbsenceFlag(events, doc, { now = Date.now() } = {}) {
  const upcoming = upcomingSportAbsence(events, { sport: "ncaaf", now });
  const approved = approvedHuntTargets(doc, { now }).filter((target) => target.sport === "ncaaf");
  const proposed = proposedTargets(doc, { sport: "ncaaf" });
  if (upcoming.count > 0 || approved.length > 0) return null;
  const proposedNote =
    proposed.length > 0
      ? ` Proposed Week 2 shortlist (${proposed.length}) awaits PM selection — not permission to scout every game.`
      : " No proposed college shortlist is on file.";
  return `upcoming NCAAF game events: 0 — no approved college hunt target.${proposedNote} Do not interpret this as no college work.`;
}

export function targetBySlug(doc, slug) {
  if (!slug) return null;
  return (doc?.targets ?? []).find((target) => target.eventSlug === slug) ?? null;
}

export function targetPriority(doc, slug, { onHome = false } = {}) {
  const target = targetBySlug(doc, slug);
  if (target?.state === "approved" && Number.isFinite(target.priority)) return target.priority;
  if (onHome) return 5;
  return 9;
}

export function isApprovedPriorityTarget(doc, slug) {
  const target = targetBySlug(doc, slug);
  return Boolean(target && target.state === "approved");
}

export function expireSettledTargets(doc, events) {
  const settled = new Set(
    (events ?? [])
      .filter((event) => event?.awayScore != null && event?.homeScore != null)
      .map((event) => event.slug)
  );
  const keep = [];
  const expired = [...(doc.expired ?? [])];
  for (const target of doc.targets ?? []) {
    if (target.eventSlug && settled.has(target.eventSlug) && target.state === "approved") {
      expired.push({
        ...target,
        state: "expired-settled",
        expiredAt: easternDay(new Date()),
        reason: target.reason ?? "Settled in live events.json. Public URL preserved.",
      });
    } else {
      keep.push(target);
    }
  }
  return { ...doc, targets: keep, expired };
}

export function formatProposedShortlist(doc) {
  const rows = (doc?.targets ?? []).filter((target) => target.state === "proposed");
  const lines = [
    "### Proposed (not approved — do not hunt unless selected)",
    "",
    "| id | sport | matchup | kickoff | eventSlug | priority | source |",
    "|---|---|---|---|---|---|---|",
  ];
  if (rows.length === 0) {
    lines.push("| *(none)* | | | | | | |");
    return lines.join("\n");
  }
  for (const target of rows) {
    const matchup = [target.away, target.home].filter(Boolean).join(" at ") || target.id;
    lines.push(
      `| ${target.id} | ${target.sport ?? ""} | ${matchup} | ${target.kickoffDate ?? ""} ${target.kickoffWindow ?? ""} | ${target.eventSlug ?? "(none — do not mint)"} | ${target.priority ?? ""} | ${cell(target.kickoffSource)} |`
    );
  }
  return lines.join("\n");
}

function cell(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .trim();
}
