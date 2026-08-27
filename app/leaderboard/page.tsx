import { LeaderboardClient } from "@/components/LeaderboardClient";
import { getActivityBoard, loadCalls, loadPundits } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Expert pick records",
  "Who’s actually on the record this season. Hits, misses, and live expert picks — everyone starts 0–0.",
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
        Who’s actually on the record. Everyone starts 0–0. Hits and misses
        land after the games.
      </p>
      <LeaderboardClient board={board} />
    </main>
  );
}
