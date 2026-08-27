import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "NFL",
  "NFL Week 1 picks from named pundits, mapped onto Kalshi markets. Regular season, not preseason.",
  "/nfl"
);

export default function NflPage() {
  return <SportSlate sport="nfl" />;
}
