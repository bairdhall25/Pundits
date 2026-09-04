import { SportSlate } from "@/components/SportSlate";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata = socialPageMeta(
  "ncaaf",
  "College football picks",
  "Expert CFB picks for this week. See who the TV voices are taking, with the market price next to each take.",
);

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
