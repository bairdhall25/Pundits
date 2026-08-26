import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "NFL",
  "NFL Week 1 cards with a real face. Regular season, not preseason.",
  "/nfl"
);

export default function NflPage() {
  return <SportSlate sport="nfl" />;
}
