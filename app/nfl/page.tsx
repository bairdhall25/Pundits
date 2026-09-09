import { SportSlate, leaguePageMeta } from "@/components/SportSlate";

export const generateMetadata = () => leaguePageMeta("nfl");

export default function NflPage() {
  return <SportSlate sport="nfl" />;
}
