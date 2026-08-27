import { SportSlate } from "@/components/SportSlate";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "College football picks",
  "Expert CFB picks for Week 0 and Week 1. See who the TV voices are taking, with the market price next to each take.",
  "/ncaaf"
);

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
