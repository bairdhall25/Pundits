import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "NCAAF",
  "College football cards with a real face. Week 0 and Week 1 Kalshi markets.",
  "/ncaaf"
);

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
