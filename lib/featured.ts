import { readFileSync } from "node:fs";
import path from "node:path";
import { eventKind, eventScanStatus, getSlateGames } from "./data";
import type { Call, Event, Pundit, Side, Sport } from "./types";

export type FeaturedPin = {
  slug: string;
  until: string;
};

export type HomepageFeaturedGames = {
  hero: Event | undefined;
  ncaaf: Event[];
  nfl: Event[];
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

function primetimeNetwork(event: Event): boolean {
  const network = event.network ?? "";
  const match = event.kickoff?.match(/\b(\d{1,2}):\d{2}\b/);
  const hour = match ? Number(match[1]) : -1;
  return /\b(ABC|CBS|ESPN|FOX|NBC)\b/i.test(network) && hour >= 7 && hour < 12;
}

function showcase(event: Event): boolean {
  return /GameDay|Big Noon/i.test(`${event.network ?? ""} ${event.kickoff ?? ""}`);
}

function rankedMatchup(event: Event): boolean {
  return /(?:#|No\.\s*)\d+/i.test(event.title);
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

    // An operator-designated home game takes a homepage slot before an off-home
    // one. docs/board.md keeps watchlist games off `/` until an explicit
    // `onHome` flip; without this, minting off-home overflow could displace a
    // home game purely on kickoff order.
    const homeOrder = Number(b.onHome) - Number(a.onHome);
    if (homeOrder) return homeOrder;

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

    const primetime = Number(primetimeNetwork(b)) - Number(primetimeNetwork(a));
    if (primetime) return primetime;

    const destination = Number(showcase(b)) - Number(showcase(a));
    if (destination) return destination;

    const ranked = Number(rankedMatchup(b)) - Number(rankedMatchup(a));
    if (ranked) return ranked;

    const homeRank = a.homeRank - b.homeRank;
    return homeRank || a.slug.localeCompare(b.slug);
  });
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
  const pinnedSlug = activePinnedSlug(pin, sorted, asOf);
  const pinned = pinnedSlug
    ? sorted.find((event) => event.slug === pinnedSlug)
    : undefined;
  const twoSided = sorted.find(
    (event) => coverage(event, calls, pundits).bothSides
  );
  const finals = sortFinalGames(events, calls, pundits);

  return {
    hero: pinned ?? twoSided ?? sorted[0],
    ncaaf: sorted
      .filter((event) => event.sport === "ncaaf")
      .slice(0, sectionLimit),
    nfl: sorted.filter((event) => event.sport === "nfl").slice(0, sectionLimit),
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
