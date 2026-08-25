import { readFileSync } from "node:fs";
import path from "node:path";
import type { Call, Pundit, PunditRecord } from "./types";

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
