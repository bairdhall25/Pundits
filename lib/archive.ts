import { callsForEvent, eventKind, gameComplete, mappedCalls } from "./data";
import type { Call, Event, Pundit, Sport } from "./types";

export type ArchiveWeek = { sport: Sport; season: number; week: number };

/** URL segment "week-3" → 3. Anything else → null. */
export function parseWeekParam(segment: string): number | null {
  const m = segment.match(/^week-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function isArchivableGame(e: Event): boolean {
  return eventKind(e) === "game" && e.week != null && e.season != null;
}

/** Every sport/season/week that has at least one game, in stable order. */
export function archiveWeeks(events: Event[]): ArchiveWeek[] {
  const seen = new Map<string, ArchiveWeek>();
  for (const e of events) {
    if (!isArchivableGame(e)) continue;
    const key = `${e.sport}/${e.season}/${e.week}`;
    if (!seen.has(key)) {
      seen.set(key, { sport: e.sport, season: e.season!, week: e.week! });
    }
  }
  return [...seen.values()].sort(
    (a, b) =>
      a.sport.localeCompare(b.sport) || a.season - b.season || a.week - b.week
  );
}

export function weekArchivePath(
  sport: Sport,
  season: number,
  week: number
): string {
  return `/${sport}/${season}/week-${week}/`;
}

export function gamesForWeek(
  sport: Sport,
  season: number,
  week: number,
  events: Event[]
): Event[] {
  return events
    .filter(
      (e) =>
        isArchivableGame(e) &&
        e.sport === sport &&
        e.season === season &&
        e.week === week
    )
    .sort((a, b) => a.homeRank - b.homeRank);
}

/** Graded tally across every mapped take on the given games. */
export function weekRecord(
  games: Event[],
  calls: Call[]
): { hits: number; misses: number; pending: number } {
  const slugs = new Set(games.map((e) => e.slug));
  const record = { hits: 0, misses: 0, pending: 0 };
  for (const c of mappedCalls(calls)) {
    if (!c.eventSlug || !slugs.has(c.eventSlug)) continue;
    if (c.status === "hit") record.hits += 1;
    else if (c.status === "miss") record.misses += 1;
    else record.pending += 1;
  }
  return record;
}

export type WeekResult = {
  call: Call;
  event: Event;
  pundit: Pundit;
  status: "hit" | "miss";
  pickLabel: string;
  cents: number | null;
};

/** Graded takes on a week's games, ordered for a citation-friendly result list. */
export function weekResults(
  games: Event[],
  calls: Call[],
  pundits: Pundit[]
): WeekResult[] {
  const eventBySlug = new Map(games.map((event) => [event.slug, event]));
  const punditById = new Map(pundits.map((pundit) => [pundit.id, pundit]));

  return mappedCalls(calls)
    .flatMap((call): WeekResult[] => {
      if (
        !call.eventSlug ||
        !call.side ||
        (call.status !== "hit" && call.status !== "miss")
      ) {
        return [];
      }
      const event = eventBySlug.get(call.eventSlug);
      const pundit = punditById.get(call.punditId);
      if (!event || !pundit || !event.awayTeam || !event.homeTeam) return [];
      const picked = call.side === "yes" ? event.awayTeam : event.homeTeam;
      const other = call.side === "yes" ? event.homeTeam : event.awayTeam;
      return [
        {
          call,
          event,
          pundit,
          status: call.status,
          pickLabel: `${picked} over ${other}`,
          cents: call.side === "yes" ? event.yesCents : event.noCents,
        },
      ];
    })
    .sort(
      (a, b) =>
        (a.status === b.status ? 0 : a.status === "hit" ? -1 : 1) ||
        a.pundit.name.localeCompare(b.pundit.name)
    );
}

export function latestGradedWeekRecap(
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): { sport: Sport; season: number; week: number; href: string; line: string } | null {
  const games = events.filter(
    (e) => eventKind(e) === "game" && e.season != null && e.week != null && gameComplete(e)
  );
  if (!games.length) return null;
  const newest = [...games].sort((a, b) =>
    (b.kickoffDate ?? "").localeCompare(a.kickoffDate ?? "")
  )[0];
  const weekGames = gamesForWeek(newest.sport, newest.season!, newest.week!, events);
  const record = weekRecord(weekGames, calls);
  if (record.hits + record.misses === 0) return null;
  const hitNames = [
    ...new Set(
      weekResults(weekGames, calls, pundits)
        .filter((r) => r.status === "hit")
        .map((r) => r.pundit.name)
    ),
  ];
  const hitTeam = weekResults(weekGames, calls, pundits).find((r) => r.status === "hit")
    ?.pickLabel.split(" over ")[0];
  const who =
    hitNames.length && hitTeam
      ? ` ${listNames(hitNames)} hit on ${hitTeam}.`
      : "";
  const line = `Week ${newest.week}: experts went ${record.hits}–${record.misses}.${who}`;
  return {
    sport: newest.sport,
    season: newest.season!,
    week: newest.week!,
    href: weekArchivePath(newest.sport, newest.season!, newest.week!),
    line,
  };
}

function listNames(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** Takes for and against a team, across its games (side maps to away/home)
 *  and its futures (yes = for, no = against). */
export function takesOnTeam(
  teamId: string,
  events: Event[],
  calls: Call[]
): { for: Call[]; against: Call[] } {
  const forTeam: Call[] = [];
  const against: Call[] = [];
  for (const e of events) {
    if (eventKind(e) === "game") {
      if (e.awayTeamId === teamId) {
        forTeam.push(...callsForEvent(e.slug, calls, "yes"));
        against.push(...callsForEvent(e.slug, calls, "no"));
      } else if (e.homeTeamId === teamId) {
        forTeam.push(...callsForEvent(e.slug, calls, "no"));
        against.push(...callsForEvent(e.slug, calls, "yes"));
      }
    } else if (e.teamId === teamId) {
      forTeam.push(...callsForEvent(e.slug, calls, "yes"));
      against.push(...callsForEvent(e.slug, calls, "no"));
    }
  }
  return { for: forTeam, against };
}

export function teamHasTakes(
  teamId: string,
  events: Event[],
  calls: Call[]
): boolean {
  const takes = takesOnTeam(teamId, events, calls);
  return takes.for.length + takes.against.length > 0;
}

/** Events involving a team (games either side, futures on the team). */
export function teamEvents(teamId: string, events: Event[]): Event[] {
  return events.filter(
    (e) =>
      e.awayTeamId === teamId || e.homeTeamId === teamId || e.teamId === teamId
  );
}
