import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "NCAAF",
  "College football Week 0 and Week 1 picks from named pundits, mapped onto Kalshi markets.",
  "/ncaaf"
);

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
