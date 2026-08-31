import { LeaderboardClient } from "@/components/LeaderboardClient";
import { getActivityBoard, loadCalls, loadPundits } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Expert pick records",
  "Who’s actually on the record this season. Hits, misses, and open expert picks.",
  "/leaderboard"
);

export default function LeaderboardPage() {
  const board = getActivityBoard(loadPundits(), loadCalls());

  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">Pundits</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        The table.
      </h1>
      <p className="lede">
        Who’s actually on the record. Ranked by open picks. The 2026 column is
        hits and misses on graded games.
      </p>
      <LeaderboardClient board={board} />
    </main>
  );
}
