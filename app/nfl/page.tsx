import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "NFL Week 1 picks",
  "Expert NFL picks for Week 1. Who the TV voices are taking in the regular-season openers, with the market price.",
  "/nfl"
);

export default function NflPage() {
  return <SportSlate sport="nfl" />;
}
