import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { getActivityBoard, loadCalls, loadPundits } from "@/lib/data";

export default function LeaderboardPage() {
  const board = getActivityBoard(loadPundits(), loadCalls());

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">The table</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        The table.
      </h1>
      <p className="lede">
        Everyone starts 0–0. The board ranks who’s actually on record this
        week.
      </p>
      <LeaderboardBoard board={board} showAll />
    </main>
  );
}
