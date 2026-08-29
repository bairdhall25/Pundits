import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  ActivityRecord,
  Call,
  CardSide,
  Event,
  EventsFile,
  Pundit,
  Side,
  Sport,
  Team,
} from "./types";
import { publicSideLabel } from "./public-side";
export { hasGradedRecords } from "./records";

export function seasonFromCalls(
  punditId: string,
  calls: Call[]
): { wins: number; losses: number; pending: number } {
  const hard = calls.filter((c) => c.punditId === punditId && c.kind === "hard");
  return {
    wins: hard.filter((c) => c.status === "hit").length,
    losses: hard.filter((c) => c.status === "miss").length,
    pending: hard.filter((c) => c.status === "pending").length,
  };
}

export function toActivityRecord(pundit: Pundit, calls: Call[]): ActivityRecord {
  const mine = calls.filter((c) => c.punditId === pundit.id);
  return {
    ...pundit,
    season2026: seasonFromCalls(pundit.id, calls),
    mappedPending: mine.filter((c) => isMapped(c) && c.status === "pending").length,
    totalCalls: mine.length,
  };
}

export function getActivityBoard(pundits: Pundit[], calls: Call[]): ActivityRecord[] {
  return pundits
    .map((p) => toActivityRecord(p, calls))
    .sort(
      (a, b) =>
        b.mappedPending - a.mappedPending ||
        b.totalCalls - a.totalCalls ||
        a.name.localeCompare(b.name)
    );
}

export function getPundit(id: string, pundits: Pundit[], calls: Call[]): ActivityRecord | null {
  const p = pundits.find((x) => x.id === id);
  return p ? toActivityRecord(p, calls) : null;
}

export function callsForPundit(id: string, calls: Call[]): Call[] {
  return calls
    .filter((c) => c.punditId === id)
    .sort((a, b) => {
      if (a.sourceDate < b.sourceDate) return 1;
      if (a.sourceDate > b.sourceDate) return -1;
      return 0;
    });
}

function readJson<T>(rel: string): T {
  const file = path.join(process.cwd(), rel);
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

export function loadPundits(): Pundit[] {
  return readJson<Pundit[]>("data/pundits.json");
}

export function loadCalls(): Call[] {
  return readJson<Call[]>("data/calls.json");
}

export function loadEventsFile(): EventsFile {
  return readJson<EventsFile>("data/events.json");
}

export function loadEvents(): Event[] {
  return loadEventsFile().events;
}

export function loadTeams(): Team[] {
  return readJson<Team[]>("data/teams.json");
}

export function getTeam(id: string | undefined, teams: Team[] = loadTeams()): Team | null {
  if (!id) return null;
  return teams.find((t) => t.id === id) ?? null;
}

export function isMapped(call: Call): boolean {
  return Boolean(call.eventSlug && call.side);
}

export function mappedCalls(calls: Call[]): Call[] {
  return calls.filter(isMapped);
}

export function callsForEvent(
  slug: string,
  calls: Call[],
  side?: Side
): Call[] {
  return mappedCalls(calls).filter((c) => {
    if (c.eventSlug !== slug) return false;
    if (side && c.side !== side) return false;
    return true;
  });
}

export function sidesForCard(event: Event, calls: Call[]): [CardSide, CardSide] {
  const yes: CardSide = {
    side: "yes",
    label: publicSideLabel(event, "yes"),
    cents: event.yesCents,
    calls: callsForEvent(event.slug, calls, "yes"),
    teamId: event.awayTeamId,
  };
  const no: CardSide = {
    side: "no",
    label: publicSideLabel(event, "no"),
    cents: event.noCents,
    calls: callsForEvent(event.slug, calls, "no"),
    teamId: event.homeTeamId,
  };
  return [yes, no];
}

export function eventHasFight(slug: string, calls: Call[]): boolean {
  return (
    callsForEvent(slug, calls, "yes").length > 0 &&
    callsForEvent(slug, calls, "no").length > 0
  );
}

/** Infer the winning side from graded mapped calls. No new event field. */
export function settledSide(event: Event, calls: Call[]): Side | null {
  const mapped = callsForEvent(event.slug, calls);
  if (!mapped.length || mapped.some((c) => c.status === "pending")) return null;
  const inferred = new Set<Side>();
  for (const c of mapped) {
    if (!c.side) continue;
    if (c.status === "hit") inferred.add(c.side);
    else inferred.add(c.side === "yes" ? "no" : "yes");
  }
  if (inferred.size !== 1) return null;
  return [...inferred][0];
}

export function settledLabel(event: Event, calls: Call[]): string | null {
  const side = settledSide(event, calls);
  if (!side) return null;
  const [yes, no] = sidesForCard(event, calls);
  return side === "yes" ? yes.label : no.label;
}

export function eventKind(event: Event): "game" | "future" {
  return event.kind ?? "future";
}

export function getWeekend(
  sport: Sport,
  events: Event[]
): Event[] {
  return events
    .filter((e) => e.onHome && e.sport === sport && eventKind(e) === "game")
    .sort((a, b) => a.homeRank - b.homeRank);
}

export function getSlateGames(sport: Sport, events: Event[]): Event[] {
  return events
    .filter((e) => e.sport === sport && eventKind(e) === "game")
    .sort(
      (a, b) =>
        Number(b.onHome) - Number(a.onHome) || a.homeRank - b.homeRank
    );
}

export function getFuturesPeek(
  sport: Sport,
  events: Event[],
  calls: Call[],
  limit = 5
): Event[] {
  return getBoard(sport, events, calls).slice(0, limit);
}

export function latestCalls(calls: Call[], limit = 6): Call[] {
  const newest = [...calls].sort((a, b) => {
    if (a.sourceDate < b.sourceDate) return 1;
    if (a.sourceDate > b.sourceDate) return -1;
    return 0;
  });
  const seen = new Set<string>();
  const out: Call[] = [];
  for (const c of newest) {
    if (seen.has(c.punditId)) continue;
    seen.add(c.punditId);
    out.push(c);
    if (out.length === limit) break;
  }
  return out;
}

export function getHomeEvents(events: Event[], calls: Call[]): Event[] {
  return events
    .filter((e) => e.onHome)
    .sort((a, b) => {
      const fa = eventHasFight(a.slug, calls) ? 1 : 0;
      const fb = eventHasFight(b.slug, calls) ? 1 : 0;
      if (fb !== fa) return fb - fa;
      if (a.sport !== b.sport) return a.sport.localeCompare(b.sport);
      return a.homeRank - b.homeRank;
    });
}

export function getBoard(
  sport: Sport,
  events: Event[],
  calls: Call[]
): Event[] {
  return events
    .filter(
      (e) => e.onHome && e.sport === sport && eventKind(e) === "future"
    )
    .sort((a, b) => {
      const fa = eventHasFight(a.slug, calls) ? 0 : 1;
      const fb = eventHasFight(b.slug, calls) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return a.homeRank - b.homeRank;
    });
}

export function getEvent(slug: string, events: Event[]): Event | null {
  return events.find((e) => e.slug === slug) ?? null;
}

export { formatCents, formatAsOf, formatGameWhen, seasonLabel, seasonSpan, statusLabel } from "./format";

export function impliedOpenDollars(punditId: string, calls: Call[]): number {
  return (
    mappedCalls(calls).filter(
      (c) => c.punditId === punditId && c.status === "pending"
    ).length * 100
  );
}

export function otherTakes(punditId: string, calls: Call[]): Call[] {
  return callsForPundit(punditId, calls).filter((c) => !isMapped(c));
}
