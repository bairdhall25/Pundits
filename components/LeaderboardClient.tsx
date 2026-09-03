"use client";

import { Tabs } from "@base-ui/react/tabs";
import { useState } from "react";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { defaultBoardSort, sortActivityBoard, type BoardSort } from "@/lib/board";
import { hasGradedRecords } from "@/lib/records";
import type { ActivityRecord } from "@/lib/types";

export function LeaderboardClient({ board }: { board: ActivityRecord[] }) {
  const graded = hasGradedRecords(board);
  const [sort, setSort] = useState<BoardSort>(defaultBoardSort(board));
  const [showAll, setShowAll] = useState(false);

  if (!graded) {
    return (
      <LeaderboardBoard
        board={sortActivityBoard(board, "open")}
        showAll={showAll}
        onShowAll={setShowAll}
      />
    );
  }

  return (
    <Tabs.Root
      className="leaderboard-tabs"
      value={sort}
      onValueChange={(value) => setSort(value as BoardSort)}
    >
      <Tabs.List className="feed-tabs" aria-label="Table order">
        <Tabs.Tab value="results">
            2026 results
        </Tabs.Tab>
        <Tabs.Tab value="open">
            Open picks
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="results" className="leaderboard-panel">
        <LeaderboardBoard
          board={sortActivityBoard(board, "results")}
          showAll={showAll}
          onShowAll={setShowAll}
        />
      </Tabs.Panel>
      <Tabs.Panel value="open" className="leaderboard-panel">
        <LeaderboardBoard
          board={sortActivityBoard(board, "open")}
          showAll={showAll}
          onShowAll={setShowAll}
        />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
