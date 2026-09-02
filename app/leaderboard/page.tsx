import { JsonLd } from "@/components/JsonLd";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { getActivityBoard, loadCalls, loadPundits } from "@/lib/data";
import { collectionPageJsonLd } from "@/lib/seo";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata = socialPageMeta(
  "leaderboard",
  "Expert pick records",
  "Who’s actually on the record this season. Hits, misses, and open expert picks.",
);

export default function LeaderboardPage() {
  const board = getActivityBoard(loadPundits(), loadCalls());

  return (
    <main id="main" className="shell">
      <JsonLd
        data={collectionPageJsonLd(
          "Expert pick records",
          "/leaderboard/",
          "Who’s actually on the record this season. Hits, misses, and open expert picks."
        )}
      />
      <div className="eyebrow type-broadcast">Pundits</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        The table.
      </h1>
      <p className="lede">
        People with a 2026 result first, by how many picks have graded, then
        hits. Sample sizes are small — this is a ledger, not a claim they can
        predict. Switch to open picks to see volume.
      </p>
      <LeaderboardClient board={board} />
    </main>
  );
}
