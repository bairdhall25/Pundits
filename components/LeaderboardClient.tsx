"use client";

import { useState } from "react";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import type { ActivityRecord } from "@/lib/types";

export function LeaderboardClient({ board }: { board: ActivityRecord[] }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <LeaderboardBoard board={board} showAll={showAll} onShowAll={setShowAll} />
  );
}
