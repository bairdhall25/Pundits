import { formatAsOf, formatShortDate } from "./format";
import type { SocialEventRow, SocialIndex, SocialTakeRow } from "./social";
import {
  snapshotPhrase,
  splitSnapshotPhrase,
  type RankedStory,
} from "./social-select";

export type Draft = {
  archetype: RankedStory["archetype"];
  body: string;
  selfReply: string;
  cardUrl: string;
  tags: string[];
  eventSlug: string;
  pageUrl: string;
  usesPrice: boolean;
  snapshotAt: string | null;
  evidenceKind?: SocialTakeRow["evidenceKind"];
};

export type CopyReviewFailure =
  | "empty-side-contradiction"
  | "unsupported-cover"
  | "false-quotation"
  | "took-at-price"
  | "missing-price-time"
  | "unapproved-tag"
  | "betting-language"
  | "manufactured-feud"
  | "fake-viewing";

export type CopyReview = {
  ok: boolean;
  failures: CopyReviewFailure[];
};

export type PostKind =
  | "original"
  | "outside-thread-reply"
  | "self-link-reply"
  | "other-self-reply";

export type ReachKind = "organic" | "paid" | "unavailable";

export type PublicMetrics = {
  views: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
  bookmarks: number | null;
};

export type PrivateMetrics = {
  urlClicks: number | null;
  profileClicks: number | null;
  detailExpands: number | null;
  followsFromPost: number | null;
};

export type ClassifiedPost = {
  kind: PostKind;
  reach: ReachKind;
  publicMetrics: PublicMetrics;
  privateMetrics: PrivateMetrics;
};

export type TimelineItem = {
  id: string;
  text: string;
  createdAt: string;
  inReplyToId?: string | null;
  inReplyToAuthorIsUs?: boolean;
  containsOwnPermalink?: boolean;
  isPaid?: boolean | null;
  metrics?: Partial<PublicMetrics & PrivateMetrics>;
};

const COVER_RE = /\bcover(?:ed|ing)?\b|\bATS\b/i;
const TOOK_AT_RE = /\btook\s+.+?\s+at\s+\d+\s*¢/i;
const EMPTY_SIDE_RE = /\bempty side\b/i;
const BETTING_RE = /\b(?:lock|can't lose|free money|guaranteed|hammer it)\b/i;
const FEUD_RE = /\b(?:feud|war|destroy(?:ed|s)? him|clown)\b/i;
const WATCHED_RE = /\b(?:I watched|we watched|from the stands|money down)\b/i;
const QUOTE_CHARS_RE = /[“”"]/;

export const APPROVED_PUNDIT_HANDLES: Record<string, string> = {
  mcelroy: "@GregMcElroy",
  patterson: "@Chip_Patterson",
  finebaum: "@finebaum",
  kanell: "@dannykanell",
  pate: "@JoshPateCFB",
  cowherd: "@colincowherd",
  eisen: "@richeisen",
  compton: "@_willcompton",
  walker: "@BFW",
};

export const APPROVED_OUTLET_HANDLES = new Set([
  "@Cover3Podcast",
  "@AlwaysCFB",
  "@BFWshow",
]);

export function parseApprovedHandleRegistry(markdown: string): {
  pundits: { punditId: string; handle: string }[];
  outlets: { handle: string }[];
} {
  const pundits: { punditId: string; handle: string }[] = [];
  const outlets: { handle: string }[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const pundit = line.match(/^\|\s*`([^`]+)`\s*\|[^|]+\|\s*`(@[^`]+)`\s*\|/);
    if (pundit) {
      pundits.push({ punditId: pundit[1], handle: pundit[2] });
      continue;
    }
    const outlet = line.match(/^\|[^|]+\|\s*`(@[^`]+)`\s*\|/);
    if (outlet && !line.includes("`punditId`")) {
      outlets.push({ handle: outlet[1] });
    }
  }
  return { pundits, outlets };
}

export function approvedHandleSet(
  registry = parseApprovedHandleRegistry("")
): Set<string> {
  const handles = new Set<string>(Object.values(APPROVED_PUNDIT_HANDLES));
  for (const handle of APPROVED_OUTLET_HANDLES) handles.add(handle);
  for (const row of registry.pundits) handles.add(row.handle);
  for (const row of registry.outlets) handles.add(row.handle);
  return handles;
}

function eventBySlug(index: SocialIndex, slug: string): SocialEventRow | undefined {
  return index.events.find((event) => event.slug === slug);
}

function takeByPundit(
  index: SocialIndex,
  slug: string,
  punditId: string
): SocialTakeRow | undefined {
  return index.takes.find((take) => take.eventSlug === slug && take.punditId === punditId);
}

function listNames(names: string[], cap = 4): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length <= cap) {
    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  }
  const shown = names.slice(0, cap);
  return `${shown.join(", ")}, and ${names.length - cap} more`;
}

function agree(names: string[], singular: string, plural: string): string {
  return names.length === 1 ? singular : plural;
}

function scoreLine(event: SocialEventRow): string | null {
  if (event.awayScore == null || event.homeScore == null) return null;
  if (!event.awayTeam || !event.homeTeam) return null;
  const awayWon = event.awayScore > event.homeScore;
  const winner = awayWon ? event.awayTeam : event.homeTeam;
  const loser = awayWon ? event.homeTeam : event.awayTeam;
  return `${winner} ${Math.max(event.awayScore, event.homeScore)}, ${loser} ${Math.min(event.awayScore, event.homeScore)}`;
}

function priceExplainsSplit(event: SocialEventRow): boolean {
  if (event.yesCents == null || event.noCents == null) return false;
  const gap = Math.abs(event.yesCents - event.noCents);
  return gap >= 15;
}

function claimFragment(take: SocialTakeRow): string {
  if (take.evidenceKind === "reported-selection") return take.claim;
  return take.claim;
}

export function draftStory(index: SocialIndex, story: RankedStory): Draft {
  const event = eventBySlug(index, story.eventSlug);
  if (!event) {
    throw new Error(`Missing event ${story.eventSlug}`);
  }

  if (story.archetype === "disagreement") {
    const away = event.awayTeam ?? "the away side";
    const home = event.homeTeam ?? "the home side";
    const yes = listNames(event.yesPundits);
    const no = listNames(event.noPundits);
    const usesPrice = priceExplainsSplit(event);
    const price = usesPrice
      ? splitSnapshotPhrase(
          event.yesCents,
          event.noCents,
          event.snapshotAt,
          event.awayTeam,
          event.homeTeam
        )
      : null;
    const when = event.kickoffDate
      ? ` ahead of ${formatShortDate(event.kickoffDate) ?? event.kickoffDate}`
      : "";
    const body = [
      `${yes} ${agree(event.yesPundits, "picks", "pick")} ${away}. ${no} ${agree(event.noPundits, "picks", "pick")} ${home}.`,
      `${event.trackedCount} tracked calls, both sides on the record${when}.`,
      price,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      archetype: "disagreement",
      body,
      selfReply: event.pageUrl,
      cardUrl: event.ogCard,
      tags: [],
      eventSlug: event.slug,
      pageUrl: event.pageUrl,
      usesPrice: Boolean(price),
      snapshotAt: event.snapshotAt,
    };
  }

  if (story.archetype === "resolution") {
    const score = scoreLine(event);
    const yes = listNames(event.yesPundits);
    const no = listNames(event.noPundits);
    const away = event.awayTeam ?? "the away side";
    const home = event.homeTeam ?? "the home side";
    const usesPrice = priceExplainsSplit(event);
    const price = usesPrice
      ? splitSnapshotPhrase(
          event.yesCents,
          event.noCents,
          event.snapshotAt,
          event.awayTeam,
          event.homeTeam
        )
      : null;
    const body = [
      score ? `${score}.` : `${event.title} is graded.`,
      `${yes} ${agree(event.yesPundits, "had", "had")} ${away}. ${no} ${agree(event.noPundits, "had", "had")} ${home}.`,
      "Tracked result is the straight-up winner, not a spread cover.",
      price,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      archetype: "resolution",
      body,
      selfReply: event.pageUrl,
      cardUrl: event.ogCard,
      tags: [],
      eventSlug: event.slug,
      pageUrl: event.pageUrl,
      usesPrice: Boolean(price),
      snapshotAt: event.snapshotAt,
    };
  }

  const take = story.punditId
    ? takeByPundit(index, story.eventSlug, story.punditId)
    : undefined;
  if (!take) {
    throw new Error(`Missing take for ${story.eventSlug}/${story.punditId}`);
  }
  const usesPrice = take.cents != null && take.cents < 50;
  const price = usesPrice ? snapshotPhrase(take.cents, take.snapshotAt) : null;
  const quoted =
    take.evidenceKind === "spoken-quote" ? `“${claimFragment(take)}”` : claimFragment(take);
  const result =
    take.status === "pending"
      ? null
      : [
          scoreLine(event) ? `Final: ${scoreLine(event)}.` : null,
          take.status === "hit" ? "Straight-up hit." : "Straight-up miss.",
        ]
          .filter(Boolean)
          .join(" ");
  const body = [
    `${take.punditName} picked ${take.sideLabel}.`,
    take.evidenceKind === "spoken-quote" ? quoted : `Reported selection: ${quoted}.`,
    take.rationale,
    price,
    result,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    archetype: "notable-call",
    body,
    selfReply: take.pageUrl,
    cardUrl: take.ogCard,
    tags: [],
    eventSlug: event.slug,
    pageUrl: take.pageUrl,
    usesPrice: Boolean(price),
    snapshotAt: take.snapshotAt,
    evidenceKind: take.evidenceKind,
  };
}

export function reviewCopy(
  text: string,
  context: {
    bothSides?: boolean;
    evidenceKind?: SocialTakeRow["evidenceKind"];
    usesPrice?: boolean;
    snapshotAt?: string | null;
    gradingScope?: "straight-up-winner" | "named-outcome";
    tags?: string[];
    approvedHandles?: Set<string>;
    spreadOrigin?: boolean;
  }
): CopyReview {
  const failures: CopyReviewFailure[] = [];
  if (EMPTY_SIDE_RE.test(text) && context.bothSides) {
    failures.push("empty-side-contradiction");
  }
  if (
    COVER_RE.test(text) &&
    context.gradingScope === "straight-up-winner" &&
    !/\bnot (?:a |whether a )?spread cover\b/i.test(text)
  ) {
    failures.push("unsupported-cover");
  }
  if (context.evidenceKind === "reported-selection" && QUOTE_CHARS_RE.test(text)) {
    failures.push("false-quotation");
  }
  if (TOOK_AT_RE.test(text)) {
    failures.push("took-at-price");
  }
  if (context.usesPrice && !formatAsOf(context.snapshotAt ?? null)) {
    failures.push("missing-price-time");
  }
  if (/\d+\s*¢/.test(text) && !/as of /i.test(text) && !/snapshot:/i.test(text)) {
    failures.push("missing-price-time");
  }
  const approved = context.approvedHandles ?? approvedHandleSet();
  for (const tag of context.tags ?? []) {
    if (!approved.has(tag)) failures.push("unapproved-tag");
  }
  const mentioned = text.match(/@\w+/g) ?? [];
  for (const handle of mentioned) {
    if (!approved.has(handle)) failures.push("unapproved-tag");
  }
  if (BETTING_RE.test(text)) failures.push("betting-language");
  if (FEUD_RE.test(text)) failures.push("manufactured-feud");
  if (WATCHED_RE.test(text)) failures.push("fake-viewing");
  return { ok: failures.length === 0, failures: [...new Set(failures)] };
}

export function metricCell(value: number | null | undefined): number | "n/a" {
  return value == null ? "n/a" : value;
}

function metricOrNull(value: number | null | undefined): number | null {
  return value == null ? null : value;
}

export function classifyTimelineItem(item: TimelineItem): ClassifiedPost {
  let kind: PostKind = "original";
  if (item.inReplyToId) {
    if (item.inReplyToAuthorIsUs && item.containsOwnPermalink) kind = "self-link-reply";
    else if (item.inReplyToAuthorIsUs) kind = "other-self-reply";
    else kind = "outside-thread-reply";
  }

  let reach: ReachKind = "organic";
  if (item.isPaid === true) reach = "paid";
  else if (item.isPaid == null) reach = "unavailable";

  const m = item.metrics ?? {};
  return {
    kind,
    reach,
    publicMetrics: {
      views: metricOrNull(m.views),
      likes: metricOrNull(m.likes),
      replies: metricOrNull(m.replies),
      reposts: metricOrNull(m.reposts),
      quotes: metricOrNull(m.quotes),
      bookmarks: metricOrNull(m.bookmarks),
    },
    privateMetrics: {
      urlClicks: metricOrNull(m.urlClicks),
      profileClicks: metricOrNull(m.profileClicks),
      detailExpands: metricOrNull(m.detailExpands),
      followsFromPost: metricOrNull(m.followsFromPost),
    },
  };
}

export function organicResponseAllowed(post: ClassifiedPost): boolean {
  return post.kind === "original" && post.reach === "organic";
}
