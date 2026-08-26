import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  Call,
  Event,
  EventsFile,
  Pundit,
  PunditRecord,
  Side,
  Sport,
} from "./types";

export function accuracyPct(wins: number, losses: number): number {
  const n = wins + losses;
  if (n === 0) return 0;
  return Math.round((wins / n) * 100);
}

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

export function toRecord(pundit: Pundit, calls: Call[]): PunditRecord {
  return {
    ...pundit,
    accuracy2025: accuracyPct(
      pundit.estimated2025.wins,
      pundit.estimated2025.losses
    ),
    season2026: seasonFromCalls(pundit.id, calls),
  };
}

export function getLeaderboard(
  pundits: Pundit[],
  calls: Call[]
): PunditRecord[] {
  return pundits
    .map((p) => toRecord(p, calls))
    .sort((a, b) => b.accuracy2025 - a.accuracy2025);
}

export function getPundit(
  id: string,
  pundits: Pundit[],
  calls: Call[]
): PunditRecord | null {
  const p = pundits.find((x) => x.id === id);
  return p ? toRecord(p, calls) : null;
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

export function eventHasFight(slug: string, calls: Call[]): boolean {
  return (
    callsForEvent(slug, calls, "yes").length > 0 &&
    callsForEvent(slug, calls, "no").length > 0
  );
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

export function getFuturesPeek(
  sport: Sport,
  events: Event[],
  calls: Call[],
  limit = 5
): Event[] {
  return getBoard(sport, events, calls).slice(0, limit);
}

export function latestCalls(calls: Call[], limit = 6): Call[] {
  return [...calls]
    .sort((a, b) => {
      if (a.sourceDate < b.sourceDate) return 1;
      if (a.sourceDate > b.sourceDate) return -1;
      return 0;
    })
    .slice(0, limit);
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

export function formatCents(cents: number | null): string {
  if (cents == null) return "—";
  return `${cents}¢`;
}

export function impliedOpenDollars(punditId: string, calls: Call[]): number {
  return (
    mappedCalls(calls).filter(
      (c) => c.punditId === punditId && c.status === "pending"
    ).length * 100
  );
}
