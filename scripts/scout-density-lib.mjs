import { easternDay } from "./scout-feeds-lib.mjs";
import {
  approvedHuntSlugs,
  formatProposedShortlist,
  isApprovedPriorityTarget,
  loadCaptureTargets,
  ncaafAbsenceFlag,
  targetBySlug,
  targetPriority,
} from "./scout-targets-lib.mjs";

const STATUS_ORDER = {
  "empty-side": 0,
  "off-home": 1,
  thin: 2,
  dense: 3,
  "source-complete": 4,
  "flip-check": 5,
  "grader-flag": 6,
  skip: 7,
};

const QUEUE_ORDER = {
  hunt: 0,
  "source-complete": 1,
  "flip-check": 2,
  "grader-flag": 3,
  skip: 4,
};

export function isGameEvent(event) {
  if (!event || event.kind === "future") return false;
  if (event.kind === "game") return true;
  const kick = Boolean(event.kickoff || event.kickoffDate);
  const away = Boolean(event.awayTeam || event.awayTeamId);
  const home = Boolean(event.homeTeam || event.homeTeamId);
  return kick && away && home;
}

/** Final scores mean the game is archive, not a hunt target. */
export function isSettledGame(event) {
  return event?.awayScore != null && event?.homeScore != null;
}

export function mappedHardForEvent(calls, slug) {
  const yes = [];
  const no = [];
  for (const call of calls ?? []) {
    if (call.kind !== "hard") continue;
    if (call.eventSlug !== slug) continue;
    if (call.side !== "yes" && call.side !== "no") continue;
    if (!call.punditId) continue;
    if (call.side === "yes") yes.push(call.punditId);
    else no.push(call.punditId);
  }
  return { yes, no };
}

export function hasPendingMappedHard(calls, slug) {
  return (calls ?? []).some(
    (call) =>
      call.kind === "hard" &&
      call.eventSlug === slug &&
      (call.side === "yes" || call.side === "no") &&
      call.punditId &&
      call.status !== "hit" &&
      call.status !== "miss"
  );
}

export function densityStatus(yes, no, { offHome = false } = {}) {
  const y = yes.length;
  const n = no.length;
  if (offHome && y + n === 0) return "off-home";
  if (y === 0 || n === 0) return "empty-side";
  if (y + n < 3) return "thin";
  return "dense";
}

const FLIP_WINDOW_MS = 72 * 60 * 60 * 1000;

/**
 * Dense onHome games get one flip-check pass over already-carded pundits in
 * the last 3 calendar days of kickoffDate (docs/capture-policy.md rule 3).
 * kickoffDate is date-only; the window is that UTC midnight minus 72h, not
 * 72 clock hours before the local kickoff time.
 */
export function inFlipWindow(event, now = Date.now()) {
  if (!event?.onHome || !event.kickoffDate) return false;
  const kick = Date.parse(event.kickoffDate);
  if (Number.isNaN(kick)) return false;
  return kick - now <= FLIP_WINDOW_MS;
}

export function calendarDay(at = Date.now()) {
  return easternDay(at instanceof Date ? at : new Date(at));
}

/**
 * Pregame hunting is closed once the kickoff calendar date is behind today
 * or scores exist. Missing kickoff is not a live state.
 */
export function huntEligibility(event, { now = Date.now(), pendingMapped = false } = {}) {
  if (isSettledGame(event)) {
    if (!pendingMapped) {
      return {
        pregame: false,
        queue: "omit",
        reason: "settled and graded — expired from the active queue",
      };
    }
    return {
      pregame: false,
      queue: "grader-flag",
      reason: "settled with pending mapped calls — flag Grader, not a pregame hunt",
    };
  }
  if (!event?.kickoffDate) {
    return {
      pregame: false,
      queue: "skip",
      reason: "kickoff unknown — not live, not a pregame hunt",
    };
  }
  const kick = Date.parse(event.kickoffDate);
  if (Number.isNaN(kick)) {
    return {
      pregame: false,
      queue: "skip",
      reason: "kickoff unparsable — not live, not a pregame hunt",
    };
  }
  const today = calendarDay(now);
  if (event.kickoffDate < today) {
    return {
      pregame: false,
      queue: "grader-flag",
      reason: "past kickoff without a final — flag Grader, not a pregame hunt",
    };
  }
  return { pregame: true, queue: "hunt", reason: "" };
}

export function huntHint(
  event,
  yes,
  no,
  status,
  { flipCheck = false, sourceComplete = false, eligibility } = {}
) {
  if (eligibility && !eligibility.pregame) return eligibility.reason;
  if (status === "dense") {
    const parts = [];
    if (sourceComplete) {
      parts.push("source-complete designated voices (density is display-only)");
    }
    if (flipCheck) {
      parts.push("flip-check carded pundits only (kickoff date ≤3 days)");
    }
    if (parts.length) return parts.join("; ");
    return "skip";
  }
  if (status === "off-home")
    return "one roster SU (off-home until operator flip)";
  if (status === "thin") return "keep hunting (stack OK)";
  const away = event.awayTeam ?? "away";
  const home = event.homeTeam ?? "home";
  if (yes.length === 0 && no.length === 0) return "both sides empty";
  const first =
    yes.length === 0 ? `${away} YES first` : `${home} NO first`;
  if (yes.length + no.length < 3) return `${first}, then a third voice`;
  return first;
}

function queueKind({ status, flipCheck, sourceComplete, eligibility }) {
  if (eligibility && !eligibility.pregame) return eligibility.queue;
  if (status === "dense" && sourceComplete) return "source-complete";
  if (status === "dense" && flipCheck) return "flip-check";
  if (status === "dense") return "skip";
  return "hunt";
}

export function scoreEvent(
  event,
  calls,
  {
    offHome = false,
    now = Date.now(),
    targets = null,
    sourceComplete = false,
  } = {}
) {
  const { yes, no } = mappedHardForEvent(calls, event.slug);
  const status = densityStatus(yes, no, { offHome });
  const eligibility = huntEligibility(event, {
    now,
    pendingMapped: hasPendingMappedHard(calls, event.slug),
  });
  const flipCheck =
    eligibility.pregame && status === "dense" && inFlipWindow(event, now);
  const approved = isApprovedPriorityTarget(targets, event.slug);
  const complete =
    eligibility.pregame &&
    (sourceComplete || (approved && status === "dense"));
  const hunt = huntHint(event, yes, no, status, {
    flipCheck,
    sourceComplete: complete,
    eligibility,
  });
  const queue = queueKind({
    status,
    flipCheck,
    sourceComplete: complete,
    eligibility,
  });
  const target = targetBySlug(targets, event.slug);
  return {
    eventSlug: event.slug,
    sport: event.sport,
    yes,
    no,
    status,
    hunt,
    queue,
    priority: targetPriority(targets, event.slug, { onHome: event.onHome }),
    kickoffDate: event.kickoffDate ?? "",
    onHome: Boolean(event.onHome),
    approved,
    sourceComplete: complete,
    flipCheck,
  };
}

function isInactiveQueue(queue) {
  return queue === "grader-flag" || queue === "skip" || queue === "omit";
}

function compareDispatchRows(a, b) {
  const aInactive = isInactiveQueue(a.queue);
  const bInactive = isInactiveQueue(b.queue);
  if (aInactive !== bInactive) return aInactive ? 1 : -1;
  if (a.priority !== b.priority) return a.priority - b.priority;
  const aKick = a.kickoffDate || "9999-99-99";
  const bKick = b.kickoffDate || "9999-99-99";
  if (aKick !== bKick) return aKick.localeCompare(bKick);
  const queueDiff = (QUEUE_ORDER[a.queue] ?? 9) - (QUEUE_ORDER[b.queue] ?? 9);
  if (queueDiff) return queueDiff;
  const statusDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
  if (statusDiff) return statusDiff;
  return a.eventSlug.localeCompare(b.eventSlug);
}

export function scoreSlate({
  events,
  calls,
  bringOntoHome = [],
  targets = null,
  now = Date.now(),
}) {
  const approvedSlugs = targets
    ? approvedHuntSlugs(targets)
    : bringOntoHome;
  const offHomeSet = new Set(approvedSlugs);
  const seen = new Set();
  const rows = [];
  for (const event of events ?? []) {
    if (!isGameEvent(event)) continue;
    const listedOffHome = !event.onHome && offHomeSet.has(event.slug);
    const approved = isApprovedPriorityTarget(targets, event.slug);
    if (!event.onHome && !listedOffHome && !approved) continue;
    if (seen.has(event.slug)) continue;
    seen.add(event.slug);
    const row = scoreEvent(event, calls, {
      offHome: listedOffHome && !event.onHome,
      now,
      targets,
    });
    if (row.queue === "omit") continue;
    rows.push(row);
  }
  rows.sort(compareDispatchRows);
  return rows;
}

function cell(ids) {
  return ids.length ? ids.join(", ") : "(none)";
}

export function coverageFlags({ events = [], targets = null, now = Date.now() } = {}) {
  const flags = [];
  const ncaaf = ncaafAbsenceFlag(events, targets, { now });
  if (ncaaf) flags.push(ncaaf);
  const uncertain = (events ?? []).filter(
    (event) => isGameEvent(event) && !event.kickoffDate && !isSettledGame(event)
  );
  if (uncertain.length) {
    flags.push(
      `kickoff unknown on ${uncertain.map((event) => event.slug).join(", ")} — not live`
    );
  }
  return flags;
}

export function formatDispatch(rows, { events = [], targets = null, now = Date.now() } = {}) {
  const lines = ["## Dispatch", ""];
  const flags = coverageFlags({ events, targets, now });
  if (flags.length) {
    lines.push("Coverage flags:");
    for (const flag of flags) lines.push(`- ${flag}`);
    lines.push("");
  }
  lines.push("Hunt order is priority, then verified kickoff, then coverage. Density is a display metric; designated sources on approved priority games still source-complete.");
  lines.push("");
  lines.push("| eventSlug | sport | yes | no | status | hunt | priority | kickoff |");
  lines.push("|---|---|---|---|---|---|---|---|");
  const huntRows = rows.filter((row) => row.queue !== "grader-flag" && row.queue !== "skip");
  const graderRows = rows.filter((row) => row.queue === "grader-flag");
  const skipped = rows.filter((row) => row.queue === "skip");
  if (huntRows.length === 0) {
    lines.push("| *(none)* | | | | | | | |");
  } else {
    for (const row of huntRows) {
      lines.push(
        `| ${row.eventSlug} | ${row.sport} | ${cell(row.yes)} | ${cell(row.no)} | ${row.status} | ${row.hunt} | ${row.priority} | ${row.kickoffDate || "(unknown)"} |`
      );
    }
  }
  if (graderRows.length) {
    lines.push("");
    lines.push("### Grader (not a pregame hunt)");
    lines.push("");
    lines.push("| eventSlug | sport | status | reason |");
    lines.push("|---|---|---|---|");
    for (const row of graderRows) {
      lines.push(
        `| ${row.eventSlug} | ${row.sport} | ${row.status} | ${row.hunt} |`
      );
    }
  }
  if (skipped.length) {
    lines.push("");
    lines.push("### Skip");
    lines.push("");
    for (const row of skipped) {
      lines.push(`- ${row.eventSlug}: ${row.hunt}`);
    }
  }
  if (targets && !targets.legacy) {
    lines.push("");
    lines.push(formatProposedShortlist(targets));
  }
  return lines.join("\n");
}

export function loadBringOntoHome(raw) {
  if (Array.isArray(raw)) {
    if (raw.some((s) => typeof s !== "string" || !s)) {
      throw new Error("docs/bring-onto-home.json must be a JSON array of slugs");
    }
    return raw;
  }
  const doc = loadCaptureTargets(raw);
  return approvedHuntSlugs(doc);
}

export { loadCaptureTargets };
