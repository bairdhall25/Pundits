"use client";

import { useState } from "react";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { defaultBoardSort, sortActivityBoard, type BoardSort } from "@/lib/board";
import { hasGradedRecords } from "@/lib/records";
import type { ActivityRecord } from "@/lib/types";

export function LeaderboardClient({ board }: { board: ActivityRecord[] }) {
  const graded = hasGradedRecords(board);
  const [sort, setSort] = useState<BoardSort>(defaultBoardSort(board));
  const [showAll, setShowAll] = useState(false);
  const rows = sortActivityBoard(board, sort);
  return (
    <>
      {graded ? (
        <div className="feed-tabs" role="tablist" aria-label="Table order">
          <button
            type="button"
            role="tab"
            aria-selected={sort === "results"}
            className={sort === "results" ? "on" : undefined}
            onClick={() => setSort("results")}
          >
            2026 results
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sort === "open"}
            className={sort === "open" ? "on" : undefined}
            onClick={() => setSort("open")}
          >
            Open picks
          </button>
        </div>
      ) : null}
      <LeaderboardBoard board={rows} showAll={showAll} onShowAll={setShowAll} />
    </>
  );
}
