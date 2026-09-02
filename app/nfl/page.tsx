import { SportSlate } from "@/components/SportSlate";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata = socialPageMeta(
  "nfl",
  "NFL Week 1 picks",
  "Expert NFL picks for Week 1. Who the TV voices are taking in the regular-season openers, with the market price.",
);

export default function NflPage() {
  return <SportSlate sport="nfl" />;
}
