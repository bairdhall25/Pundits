import { SportSlate } from "@/components/SportSlate";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata = socialPageMeta(
  "ncaaf",
  "College football picks",
  "Expert CFB picks for Week 1, plus Week 0 results. See who the TV voices are taking, with the market price next to each take.",
);

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
