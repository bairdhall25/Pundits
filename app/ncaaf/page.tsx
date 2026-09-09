import { SportSlate, leaguePageMeta } from "@/components/SportSlate";

export const generateMetadata = () => leaguePageMeta("ncaaf");

export default function NcaafPage() {
  return <SportSlate sport="ncaaf" />;
}
