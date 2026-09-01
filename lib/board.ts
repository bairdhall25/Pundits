import type { ActivityRecord } from "./types";
import { hasGradedRecords } from "./records";

export type BoardSort = "results" | "open";

function gradedSample(p: ActivityRecord): number {
  return p.season2026.wins + p.season2026.losses;
}

export function sortActivityBoard(
  board: ActivityRecord[],
  sort: BoardSort
): ActivityRecord[] {
  const copy = [...board];
  if (sort === "open") {
    return copy.sort(
      (a, b) =>
        b.mappedPending - a.mappedPending ||
        b.totalCalls - a.totalCalls ||
        a.name.localeCompare(b.name)
    );
  }
  return copy.sort(
    (a, b) =>
      gradedSample(b) - gradedSample(a) ||
      b.season2026.wins - a.season2026.wins ||
      a.season2026.losses - b.season2026.losses ||
      b.mappedPending - a.mappedPending ||
      a.name.localeCompare(b.name)
  );
}

export function defaultBoardSort(board: ActivityRecord[]): BoardSort {
  return hasGradedRecords(board) ? "results" : "open";
}
