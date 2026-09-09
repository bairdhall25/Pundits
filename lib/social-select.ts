import { formatAsOf, formatCents } from "./format";
import type { SocialEventRow, SocialIndex, SocialTakeRow } from "./social";

/** Daily posting limit is a ceiling, never a production quota. */
export const DAILY_POST_CAP = 6;

/** Favorite-side snapshot at or above this is routine unless a specific reason exists. */
export const ROUTINE_FAVORITE_CENTS = 80;

/** Graded samples this small are not a record story by themselves. */
export const THIN_RECORD_SAMPLE = 3;

/** Post a resolution only when gradedAt or kickoffDate is within this many ET days. */
export const RESOLUTION_WINDOW_DAYS = 3;

export type StoryPriority =
  | "pregame-disagreement"
  | "postgame-resolution"
  | "notable-call"
  | "optional";

export type CoverageState = "pending" | "hit" | "miss" | "pregame" | "result";

export type CoverageRecord = {
  destination: string;
  state: CoverageState | "unknown";
  postedAt: string;
  postId?: string;
};

export type CoverageScan = {
  /** False when live timeline/search could not be verified. */
  established: boolean;
  records: CoverageRecord[];
  detail?: string;
};

export type NoveltyDecision =
  | { action: "allow"; key: string }
  | { action: "skip"; reason: "duplicate" | "coverage-unknown"; key: string; detail: string };

export type RankedStory = {
  priority: StoryPriority;
  rank: number;
  archetype: "disagreement" | "resolution" | "notable-call";
  eventSlug: string;
  pageUrl: string;
  cardUrl: string;
  state: CoverageState;
  takePageUrl?: string;
  punditId?: string;
  reason: string;
  skipReason?: string;
};

export type SelectionOptions = {
  now?: Date;
  postsToday?: number;
  dailyCap?: number;
  scan: CoverageScan;
};

export type SelectionResult = {
  post: RankedStory[];
  skipped: { story: RankedStory; reason: string }[];
};

function easternDay(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(at);
}

/** Cap window: Eastern calendar day of `now`. Distinct from novelty lookback. */
export function countsTowardDailyCap(postedAt: string, now: Date): boolean {
  const posted = new Date(postedAt);
  if (Number.isNaN(posted.getTime())) return false;
  return easternDay(posted) === easternDay(now);
}

export function canonicalizeDestination(url: string): string {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    parsed.search = "";
    let path = parsed.pathname || "/";
    if (!path.endsWith("/")) path += "/";
    return `${parsed.origin}${path}`.toLowerCase();
  } catch {
    const path = trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
    return path.toLowerCase();
  }
}

export function coverageKey(destination: string, state: CoverageState): string {
  return `${canonicalizeDestination(destination)}::${state}`;
}

/**
 * Lifecycle novelty: a pending take posted yesterday still blocks the same
 * pending take today. A later grade is a different state and may post.
 * Unverified coverage, or a prior post at this destination whose state
 * cannot be inferred, is a skip — never an assumed green light.
 */
export function decideNovelty(
  destination: string,
  state: CoverageState,
  scan: CoverageScan
): NoveltyDecision {
  const key = coverageKey(destination, state);
  if (!scan.established) {
    return {
      action: "skip",
      reason: "coverage-unknown",
      key,
      detail: scan.detail ?? "Live timeline/search did not establish prior coverage.",
    };
  }
  const dest = canonicalizeDestination(destination);
  const matching = scan.records.filter(
    (row) => canonicalizeDestination(row.destination) === dest
  );
  if (matching.some((row) => row.state === "unknown")) {
    return {
      action: "skip",
      reason: "coverage-unknown",
      key,
      detail: `Prior coverage at ${dest} has an unknown state; skip rather than assume novelty.`,
    };
  }
  const duplicate = matching.find((row) => row.state === state);
  if (duplicate) {
    return {
      action: "skip",
      reason: "duplicate",
      key,
      detail: `Already posted ${state} for ${dest} at ${duplicate.postedAt}.`,
    };
  }
  return { action: "allow", key };
}

const PREGAME_TIMING_HINT =
  /\b(?:in the book|on the record|ahead of|before kickoff|pending)\b/i;
const PICK_HINT = /\b(?:picked|picks)\b/i;
const OUTCOME_HINT = /\b(?:final|graded|hit|miss|called it)\b/i;
const HIT_HINT = /\b(?:hit|called it)\b/i;
const MISS_HINT = /\bmiss\b/i;

function matches(pattern: RegExp, body: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(body);
}

/**
 * Infer a historical post's state from that post's own language.
 * Predicted scores are not results. Ambiguous outcome language is not a hit.
 * Current ledger settlement is not an input and must not relabel a pregame post.
 */
export function inferCoverageState(
  text: string,
  subject: "take" | "event"
): CoverageState | "unknown" {
  const body = text.trim();
  if (!body) return "unknown";
  const timing = matches(PREGAME_TIMING_HINT, body);
  const pick = matches(PICK_HINT, body);
  const outcome = matches(OUTCOME_HINT, body);
  const hit = matches(HIT_HINT, body);
  const miss = matches(MISS_HINT, body);
  if (hit && miss) return "unknown";
  if (timing && outcome) return "unknown";
  if (subject === "event") {
    if (outcome) return "result";
    if (timing || pick) return "pregame";
    return "unknown";
  }
  if (miss) return "miss";
  if (hit) return "hit";
  if (outcome) return "unknown";
  if (timing || pick) return "pending";
  return "unknown";
}

export function snapshotPhrase(cents: number | null, snapshotAt: string | null): string | null {
  if (cents == null) return null;
  const asOf = formatAsOf(snapshotAt);
  if (!asOf) return null;
  return `Kalshi snapshot: ${formatCents(cents)}, ${asOf}`;
}

export function splitSnapshotPhrase(
  yesCents: number | null,
  noCents: number | null,
  snapshotAt: string | null,
  awayTeam?: string,
  homeTeam?: string
): string | null {
  if (yesCents == null || noCents == null) return null;
  const asOf = formatAsOf(snapshotAt);
  if (!asOf) return null;
  const yesBit = awayTeam
    ? `${awayTeam} ${formatCents(yesCents)}`
    : formatCents(yesCents);
  const noBit = homeTeam
    ? `${homeTeam} ${formatCents(noCents)}`
    : formatCents(noCents);
  return `Kalshi snapshot: ${yesBit} / ${noBit}, ${asOf}`;
}

function takesForEvent(index: SocialIndex, slug: string): SocialTakeRow[] {
  return index.takes.filter((take) => take.eventSlug === slug);
}

function isUpcomingGame(event: SocialEventRow, today: string): boolean {
  if (event.kind !== "game" || event.settled) return false;
  if (!event.kickoffDate) return false;
  return event.kickoffDate >= today;
}

function isoDay(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function dayDiff(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return Number.POSITIVE_INFINITY;
  return Math.round((end - start) / 86_400_000);
}

/** Resolutions are timely follow-through, not a backlog of every settled card. */
export function isFreshResolution(
  event: SocialEventRow,
  takes: SocialTakeRow[],
  today: string
): boolean {
  const gradedDays = takes
    .map((take) => isoDay(take.gradedAt))
    .filter((day): day is string => Boolean(day))
    .map((day) => dayDiff(day, today));
  if (gradedDays.some((days) => days >= 0 && days <= RESOLUTION_WINDOW_DAYS)) return true;
  if (event.kickoffDate) {
    const sinceKick = dayDiff(event.kickoffDate, today);
    if (sinceKick >= 0 && sinceKick <= RESOLUTION_WINDOW_DAYS) return true;
  }
  return false;
}

function minoritySide(event: SocialEventRow): "yes" | "no" | null {
  const yes = event.yesPundits.length;
  const no = event.noPundits.length;
  if (yes === 0 || no === 0) return null;
  if (yes === no) return null;
  return yes < no ? "yes" : "no";
}

function underdogSide(event: SocialEventRow): "yes" | "no" | null {
  if (event.yesCents == null || event.noCents == null) return null;
  if (event.yesCents === event.noCents) return null;
  return event.yesCents < event.noCents ? "yes" : "no";
}

export function isRoutineFavoriteWin(event: SocialEventRow, takes: SocialTakeRow[]): boolean {
  if (!event.settled || event.kind !== "game") return false;
  const hits = takes.filter((take) => take.status === "hit");
  if (!hits.length) return false;
  const winningCents = hits[0]?.cents;
  if (winningCents == null || winningCents < ROUTINE_FAVORITE_CENTS) return false;
  if (event.bothSides) return false;
  return hits.every((take) => take.cents != null && take.cents >= ROUTINE_FAVORITE_CENTS);
}

function notableTakeReason(event: SocialEventRow, take: SocialTakeRow): string | null {
  const underdog = underdogSide(event);
  const minority = minoritySide(event);
  if (underdog && take.side === underdog) {
    const cents = take.cents != null ? `${take.cents}¢ snapshot` : "underdog side";
    return `${take.punditName} is on the underdog (${cents}).`;
  }
  if (minority && take.side === minority) {
    return `${take.punditName} is the holdout on ${take.sideLabel}.`;
  }
  if (take.rationale && take.status === "pending") {
    return `${take.punditName} attached a source-grounded reason.`;
  }
  return null;
}

function listNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function rankStories(index: SocialIndex, now: Date = new Date()): RankedStory[] {
  const today = easternDay(now);
  const ranked: RankedStory[] = [];

  for (const event of index.events) {
    if (event.kind !== "game") continue;
    const takes = takesForEvent(index, event.slug);

    if (event.bothSides && isUpcomingGame(event, today)) {
      ranked.push({
        priority: "pregame-disagreement",
        rank: 1,
        archetype: "disagreement",
        eventSlug: event.slug,
        pageUrl: event.pageUrl,
        cardUrl: event.ogCard,
        state: "pregame",
        reason: `${listNames(event.yesPundits)} pick ${event.awayTeam ?? "the away side"}. ${listNames(event.noPundits)} pick ${event.homeTeam ?? "the home side"}. ${event.trackedCount} tracked calls.`,
      });
      continue;
    }

    if (event.bothSides && event.settled) {
      if (isFreshResolution(event, takes, today)) {
        ranked.push({
          priority: "postgame-resolution",
          rank: 2,
          archetype: "resolution",
          eventSlug: event.slug,
          pageUrl: event.pageUrl,
          cardUrl: event.ogCard,
          state: "result",
          reason: `Tracked disagreement on ${event.title} is graded. Straight-up winner only.`,
        });
      }
      continue;
    }

    if (isRoutineFavoriteWin(event, takes)) {
      ranked.push({
        priority: "optional",
        rank: 9,
        archetype: "notable-call",
        eventSlug: event.slug,
        pageUrl: event.pageUrl,
        cardUrl: event.ogCard,
        state: event.settled ? "result" : "pregame",
        reason: "Routine favorite win on a one-sided board.",
        skipReason: "Routine favorite win needs a specific reason to merit a post.",
      });
      continue;
    }

    const notablePool = event.settled
      ? takes.filter((take) => take.status === "hit" || take.status === "miss")
      : takes.filter((take) => take.status === "pending");

    for (const take of notablePool) {
      const reason = notableTakeReason(event, take);
      if (!reason) {
        if (take.status === "hit" && take.cents != null && take.cents >= ROUTINE_FAVORITE_CENTS) {
          ranked.push({
            priority: "optional",
            rank: 9,
            archetype: "notable-call",
            eventSlug: event.slug,
            pageUrl: take.pageUrl,
            cardUrl: take.ogCard,
            state: take.status,
            takePageUrl: take.pageUrl,
            punditId: take.punditId,
            reason: `${take.punditName} hit a heavy favorite.`,
            skipReason: "Routine favorite win needs a specific reason to merit a post.",
          });
        }
        continue;
      }
      if (!event.bothSides && !event.settled && !isUpcomingGame(event, today)) continue;
      ranked.push({
        priority: "notable-call",
        rank: 3,
        archetype: "notable-call",
        eventSlug: event.slug,
        pageUrl: take.pageUrl,
        cardUrl: take.ogCard,
        state: take.status === "pending" ? "pending" : take.status,
        takePageUrl: take.pageUrl,
        punditId: take.punditId,
        reason,
      });
    }
  }

  ranked.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.eventSlug.localeCompare(b.eventSlug);
  });
  return ranked;
}

export function selectStories(index: SocialIndex, options: SelectionOptions): SelectionResult {
  const ranked = rankStories(index, options.now);
  const dailyCap = options.dailyCap ?? DAILY_POST_CAP;
  const postsToday = options.postsToday ?? 0;
  const remaining = Math.max(0, dailyCap - postsToday);
  const post: RankedStory[] = [];
  const skipped: { story: RankedStory; reason: string }[] = [];

  for (const story of ranked) {
    if (story.skipReason) {
      skipped.push({ story, reason: story.skipReason });
      continue;
    }
    if (story.priority === "optional") {
      skipped.push({
        story,
        reason: "Optional pattern offers no new value beyond the primary editorial order.",
      });
      continue;
    }
    const novelty = decideNovelty(story.pageUrl, story.state, options.scan);
    if (novelty.action === "skip") {
      skipped.push({
        story,
        reason:
          novelty.reason === "duplicate"
            ? novelty.detail
            : "Coverage could not be established; skip rather than assume novelty.",
      });
      continue;
    }
    if (post.length >= remaining) {
      skipped.push({
        story,
        reason: remaining === 0
          ? "Daily cap already reached. Caps are ceilings, not slots to fill."
          : "Primary stories already selected; leftover cap is not a quota.",
      });
      continue;
    }
    post.push(story);
  }

  return { post, skipped };
}

export function punditSampleSize(row: { wins: number; losses: number }): number {
  return row.wins + row.losses;
}

export function isThinRecord(row: { wins: number; losses: number }): boolean {
  return punditSampleSize(row) < THIN_RECORD_SAMPLE;
}

