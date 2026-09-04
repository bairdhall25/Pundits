import { readFileSync } from "node:fs";
import path from "node:path";
import { weekArchivePath } from "./archive";
import { eventKind, eventScanStatus } from "./data";
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

export type LeagueWeekBlock = {
  season: number;
  week: number;
  label: string;
  open: Event[];
  final: Event[];
};

export type LeagueSlate = {
  weeks: LeagueWeekBlock[];
  previous: {
    season: number;
    week: number;
    href: string;
    line: string;
  } | null;
  unscheduled: Event[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

export function parseKickoffMinutes(
  kickoff: string | null | undefined
): number | null {
  if (!kickoff) return null;
  const match = kickoff.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59) return null;
  if (hour === 12) return 12 * 60 + minute;
  if (hour >= 1 && hour <= 11) return (hour + 12) * 60 + minute;
  return null;
}

function kickoffRank(event: Event): number {
  const minutes = parseKickoffMinutes(event.kickoff);
  return minutes == null ? Number.POSITIVE_INFINITY : minutes;
}

export function sortBySchedule(
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Event[] {
  return [...events].sort((a, b) => {
    const when = dateValue(a) - dateValue(b);
    if (when) return when;

    const clock = kickoffRank(a) - kickoffRank(b);
    if (clock) return clock;

    const aCoverage = coverage(a, calls, pundits);
    const bCoverage = coverage(b, calls, pundits);
    const faces = bCoverage.faces - aCoverage.faces;
    if (faces) return faces;

    const bothSides = Number(bCoverage.bothSides) - Number(aCoverage.bothSides);
    if (bothSides) return bothSides;

    const disagreement =
      Number(bCoverage.disagreement) - Number(aCoverage.disagreement);
    if (disagreement) return disagreement;

    return a.slug.localeCompare(b.slug);
  });
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
  const pinned = pinnedSlug
    ? pool.filter((event) => event.slug === pinnedSlug)
    : [];
  const rest = pool.filter((event) => event.slug !== pinnedSlug);
  return [...pinned, ...sortBySchedule(rest, calls, pundits)];
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

export function coverageTier(
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
    : coverageTier(event, calls, pundits);
}

function sortFinalGames(
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Event[] {
  return events
    .filter((event) => isCompleteFinalCard(event, calls, pundits))
    .sort((a, b) => {
      const when = dateValue(b) - dateValue(a);
      if (when) return when;
      const aMinutes = parseKickoffMinutes(a.kickoff);
      const bMinutes = parseKickoffMinutes(b.kickoff);
      if (aMinutes == null && bMinutes == null) {
        return a.slug.localeCompare(b.slug);
      }
      if (aMinutes == null) return 1;
      if (bMinutes == null) return -1;
      return bMinutes - aMinutes || a.slug.localeCompare(b.slug);
    });
}

export function getHomepageFeaturedGames(
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  pin: FeaturedPin | null = null,
  asOf = todayIso(),
  sectionLimit = 3,
  compactLimit = 2,
  finalLimit = 2
): HomepageFeaturedGames {
  const sorted = sortFeaturedGames(events, calls, pundits, pin, asOf);
  const hero = selectFeaturedGame(sorted, calls, pundits, pin, asOf);
  const finals = sortFinalGames(events, calls, pundits);
  const sections = (sport: Sport) => {
    const candidates = sorted.filter(
      (event) => event.sport === sport && event.slug !== hero?.slug
    );
    const full = candidates
      .filter((event) => coverageTier(event, calls, pundits) === "full")
      .slice(0, sectionLimit);
    const fullSlugs = new Set(full.map((event) => event.slug));
    return {
      full,
      compact: candidates
        .filter((event) => !fullSlugs.has(event.slug))
        .slice(0, compactLimit),
    };
  };
  const ncaaf = sections("ncaaf");
  const nfl = sections("nfl");
  const sportFinals = (sport: Sport) =>
    finals.filter((event) => event.sport === sport).slice(0, finalLimit);

  return {
    hero,
    ncaaf: ncaaf.full,
    nfl: nfl.full,
    ncaafCompact: ncaaf.compact,
    nflCompact: nfl.compact,
    ncaafFinal: sportFinals("ncaaf"),
    nflFinal: sportFinals("nfl"),
  };
}

export function getLeagueGames(
  sport: Sport,
  events: Event[],
  calls: Call[]
): Event[] {
  return events.filter(
    (event) =>
      event.sport === sport &&
      eventKind(event) === "game" &&
      mappedHardCallsForEvent(event, calls).length > 0
  );
}

function monthDay(iso: string): string | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return null;
  return `${month} ${Number(match[3])}`;
}

function weekLabel(week: number, games: Event[]): string {
  const dates = games
    .map((event) => event.kickoffDate)
    .filter((date): date is string => Boolean(date && ISO_DAY.test(date)))
    .sort();
  if (!dates.length) return `Week ${week}`;
  const start = monthDay(dates[0]);
  const end = monthDay(dates[dates.length - 1]);
  if (!start || !end) return `Week ${week}`;
  if (start === end) return `Week ${week} · ${start}`;
  const startMonth = start.slice(0, 3);
  const endParts = end.split(" ");
  const range =
    startMonth === endParts[0] ? `${start}–${endParts[1]}` : `${start}–${end}`;
  return `Week ${week} · ${range}`;
}

function weekId(season: number, week: number): number {
  return season * 1000 + week;
}

function partitionLive(
  ordered: Event[],
  calls: Call[]
): { open: Event[]; final: Event[] } {
  const open: Event[] = [];
  const final: Event[] = [];
  for (const event of ordered) {
    const status = eventScanStatus(event, calls);
    if (status === "final") final.push(event);
    else open.push(event);
  }
  return { open, final };
}

export function getLeagueSlate(
  sport: Sport,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): LeagueSlate {
  const eligible = getLeagueGames(sport, events, calls);
  const unscheduled = sortBySchedule(
    eligible.filter((event) => event.week == null || event.season == null),
    calls,
    pundits
  );
  const scheduled = eligible.filter(
    (event) => event.week != null && event.season != null
  );

  const grouped = new Map<number, Event[]>();
  for (const event of scheduled) {
    const id = weekId(event.season as number, event.week as number);
    const list = grouped.get(id) ?? [];
    list.push(event);
    grouped.set(id, list);
  }

  const keys = [...grouped.keys()].sort((a, b) => a - b);
  const openKeys = keys.filter((id) =>
    (grouped.get(id) ?? []).some((event) => {
      const status = eventScanStatus(event, calls);
      return status === "open" || status === "grading";
    })
  );

  let liveKeys: number[];
  if (openKeys.length) {
    const minOpen = Math.min(...openKeys);
    liveKeys = keys.filter((id) => id >= minOpen);
  } else if (keys.length) {
    const latestKickoff = (id: number) => {
      const values = (grouped.get(id) ?? [])
        .map((event) => dateValue(event))
        .filter((value) => value !== Number.POSITIVE_INFINITY);
      return values.length ? Math.max(...values) : Number.NEGATIVE_INFINITY;
    };
    const latest = keys.reduce((best, id) => {
      const latestDate = latestKickoff(id);
      const bestDate = latestKickoff(best);
      if (latestDate !== bestDate) return latestDate > bestDate ? id : best;
      return id > best ? id : best;
    }, keys[0]);
    liveKeys = [latest];
  } else {
    liveKeys = [];
  }

  const weeks: LeagueWeekBlock[] = liveKeys.map((id) => {
    const games = sortBySchedule(grouped.get(id) ?? [], calls, pundits);
    const season = Math.floor(id / 1000);
    const week = id % 1000;
    const { open, final } = partitionLive(games, calls);
    return {
      season,
      week,
      label: weekLabel(week, games),
      open,
      final,
    };
  });

  const earliestLive = liveKeys[0];
  const previousKey = earliestLive
    ? [...keys].reverse().find((id) => id < earliestLive)
    : undefined;
  const previous =
    previousKey == null
      ? null
      : {
          season: Math.floor(previousKey / 1000),
          week: previousKey % 1000,
          href: weekArchivePath(
            sport,
            Math.floor(previousKey / 1000),
            previousKey % 1000
          ),
          line: `Week ${previousKey % 1000} is final →`,
        };

  return { weeks, previous, unscheduled };
}

export function getWeekArchiveGames(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Event[] {
  return sortBySchedule(
    getLeagueGames(sport, events, calls).filter(
      (event) => event.season === season && event.week === week
    ),
    calls,
    pundits
  );
}
