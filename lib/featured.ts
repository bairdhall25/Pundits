import { readFileSync } from "node:fs";
import path from "node:path";
import { eventKind, eventScanStatus, getSlateGames } from "./data";
import type { Call, Event, Pundit, Side, Sport } from "./types";

export type FeaturedPin = {
  slug: string;
  until: string;
};

export type DisplayTier = "featured" | "full" | "compact";

export type HomepageFeaturedGames = {
  hero: Event | undefined;
  ncaaf: Event[];
  nfl: Event[];
  ncaafCompact: Event[];
  nflCompact: Event[];
  ncaafFinal: Event[];
  nflFinal: Event[];
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFeaturedPin(value: unknown): value is FeaturedPin {
  if (!value || typeof value !== "object") return false;
  const pin = value as Partial<FeaturedPin>;
  return (
    typeof pin.slug === "string" &&
    pin.slug.length > 0 &&
    typeof pin.until === "string" &&
    ISO_DAY.test(pin.until)
  );
}

export function loadFeaturedPin(
  rel = "data/featured-pin.json"
): FeaturedPin | null {
  try {
    const file = path.join(process.cwd(), rel);
    const value: unknown = JSON.parse(readFileSync(file, "utf8"));
    return isFeaturedPin(value) ? value : null;
  } catch {
    return null;
  }
}

export function mappedHardCallsForEvent(
  event: Event,
  calls: Call[]
): Call[] {
  return calls.filter(
    (call) =>
      call.kind === "hard" &&
      call.eventSlug === event.slug &&
      Boolean(call.side)
  );
}

function cardedCalls(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): Call[] {
  const cardedPundits = new Set(
    pundits
      .filter((pundit) => pundit.photo.trim().length > 0)
      .map((pundit) => pundit.id)
  );
  return mappedHardCallsForEvent(event, calls).filter((call) =>
    cardedPundits.has(call.punditId)
  );
}

function hasFreeze(event: Event): boolean {
  return (
    event.yesCents != null &&
    event.noCents != null &&
    Boolean(event.sourceUrl)
  );
}

function isCompleteCard(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): boolean {
  return (
    eventKind(event) === "game" &&
    hasFreeze(event) &&
    cardedCalls(event, calls, pundits).length > 0
  );
}

export function isCompleteFeaturedCard(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): boolean {
  const status = eventScanStatus(event, calls);
  return (
    isCompleteCard(event, calls, pundits) &&
    (status === "open" || status === "grading")
  );
}

function isCompleteFinalCard(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): boolean {
  return (
    isCompleteCard(event, calls, pundits) &&
    eventScanStatus(event, calls) === "final"
  );
}

function dateValue(event: Event): number {
  if (!event.kickoffDate || !ISO_DAY.test(event.kickoffDate)) {
    return Number.POSITIVE_INFINITY;
  }
  return Date.parse(`${event.kickoffDate}T00:00:00Z`);
}

function coverage(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): { faces: number; bothSides: boolean; disagreement: boolean } {
  const eligible = cardedCalls(event, calls, pundits);
  const faces = new Set(eligible.map((call) => call.punditId)).size;
  const sides = new Set(eligible.map((call) => call.side as Side));
  const bothSides = sides.has("yes") && sides.has("no");
  const underdog =
    event.yesCents != null && event.noCents != null
      ? event.yesCents < event.noCents
        ? "yes"
        : event.noCents < event.yesCents
          ? "no"
          : null
      : null;
  return {
    faces,
    bothSides,
    disagreement:
      bothSides ||
      (underdog != null && eligible.some((call) => call.side === underdog)),
  };
}

function activePinnedSlug(
  pin: FeaturedPin | null,
  pool: Event[],
  asOf: string
): string | null {
  if (!pin || !ISO_DAY.test(asOf) || pin.until < asOf) return null;
  return pool.some((event) => event.slug === pin.slug) ? pin.slug : null;
}

export function sortFeaturedGames(
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  pin: FeaturedPin | null = null,
  asOf = todayIso()
): Event[] {
  const pool = events.filter((event) =>
    isCompleteFeaturedCard(event, calls, pundits)
  );
  const pinnedSlug = activePinnedSlug(pin, pool, asOf);

  return [...pool].sort((a, b) => {
    const pinOrder =
      Number(b.slug === pinnedSlug) - Number(a.slug === pinnedSlug);
    if (pinOrder) return pinOrder;

    const when = dateValue(a) - dateValue(b);
    if (when) return when;

    const kickoff = (a.kickoff ?? "").localeCompare(b.kickoff ?? "");
    if (kickoff) return kickoff;

    const aCoverage = coverage(a, calls, pundits);
    const bCoverage = coverage(b, calls, pundits);
    const faces = bCoverage.faces - aCoverage.faces;
    if (faces) return faces;

    const bothSides = Number(bCoverage.bothSides) - Number(aCoverage.bothSides);
    if (bothSides) return bothSides;

    const disagreement =
      Number(bCoverage.disagreement) - Number(aCoverage.disagreement);
    if (disagreement) return disagreement;

    // Size remains deliberately deferred until it has an explicit data source.
    return a.slug.localeCompare(b.slug);
  });
}

function selectFeaturedGame(
  sorted: Event[],
  calls: Call[],
  pundits: Pundit[],
  pin: FeaturedPin | null,
  asOf: string
): Event | undefined {
  const pinnedSlug = activePinnedSlug(pin, sorted, asOf);
  const pinned = pinnedSlug
    ? sorted.find((event) => event.slug === pinnedSlug)
    : undefined;
  const twoSided = sorted.find(
    (event) => coverage(event, calls, pundits).bothSides
  );
  return pinned ?? twoSided ?? sorted[0];
}

function nonFeaturedTier(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): Exclude<DisplayTier, "featured"> {
  const eventCoverage = coverage(event, calls, pundits);
  return eventCoverage.bothSides || eventCoverage.faces >= 2
    ? "full"
    : "compact";
}

/** Display weight is contextual: `events` is the complete homepage candidate pool. */
export function displayTier(
  event: Event,
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  pin: FeaturedPin | null = null,
  asOf = todayIso()
): DisplayTier {
  const sorted = sortFeaturedGames(events, calls, pundits, pin, asOf);
  const featured = selectFeaturedGame(sorted, calls, pundits, pin, asOf);
  return event.slug === featured?.slug
    ? "featured"
    : nonFeaturedTier(event, calls, pundits);
}

function sortFinalGames(
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Event[] {
  return events
    .filter((event) => isCompleteFinalCard(event, calls, pundits))
    .sort(
      (a, b) =>
        dateValue(b) - dateValue(a) ||
        (b.kickoff ?? "").localeCompare(a.kickoff ?? "") ||
        a.slug.localeCompare(b.slug)
    );
}

export function getHomepageFeaturedGames(
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  pin: FeaturedPin | null = null,
  asOf = todayIso(),
  sectionLimit = 3
): HomepageFeaturedGames {
  const sorted = sortFeaturedGames(events, calls, pundits, pin, asOf);
  const hero = selectFeaturedGame(sorted, calls, pundits, pin, asOf);
  const finals = sortFinalGames(events, calls, pundits);
  const sections = (sport: Sport) => {
    const candidates = sorted.filter(
      (event) => event.sport === sport && event.slug !== hero?.slug
    );
    const full = candidates
      .filter((event) => nonFeaturedTier(event, calls, pundits) === "full")
      .slice(0, sectionLimit);
    const fullSlugs = new Set(full.map((event) => event.slug));
    return {
      full,
      compact: candidates.filter((event) => !fullSlugs.has(event.slug)),
    };
  };
  const ncaaf = sections("ncaaf");
  const nfl = sections("nfl");

  return {
    hero,
    ncaaf: ncaaf.full,
    nfl: nfl.full,
    ncaafCompact: ncaaf.compact,
    nflCompact: nfl.compact,
    ncaafFinal: finals.filter((event) => event.sport === "ncaaf"),
    nflFinal: finals.filter((event) => event.sport === "nfl"),
  };
}

export function getLeagueGames(
  sport: Sport,
  events: Event[],
  calls: Call[]
): Event[] {
  return getSlateGames(sport, events).filter(
    (event) => mappedHardCallsForEvent(event, calls).length > 0
  );
}
