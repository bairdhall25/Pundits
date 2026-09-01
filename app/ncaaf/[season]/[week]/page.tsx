import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeekArchive, weekArchiveMeta } from "@/components/WeekArchive";
import { archiveWeeks, parseWeekParam } from "@/lib/archive";
import { loadCalls, loadEvents } from "@/lib/data";
import { pageMeta } from "@/lib/site";

const SPORT = "ncaaf" as const;

export function generateStaticParams() {
  return archiveWeeks(loadEvents())
    .filter((w) => w.sport === SPORT)
    .map((w) => ({ season: String(w.season), week: `week-${w.week}` }));
}

function resolve(seasonParam: string, weekParam: string) {
  const season = /^\d{4}$/.test(seasonParam) ? Number(seasonParam) : null;
  const week = parseWeekParam(weekParam);
  if (season == null || week == null) return null;
  const exists = archiveWeeks(loadEvents()).some(
    (w) => w.sport === SPORT && w.season === season && w.week === week
  );
  return exists ? { season, week } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string; week: string }>;
}): Promise<Metadata> {
  const { season, week } = await params;
  const resolved = resolve(season, week);
  if (!resolved) return pageMeta("Expert picks", "Weekly expert picks archive.");
  return weekArchiveMeta(
    SPORT,
    resolved.season,
    resolved.week,
    loadEvents(),
    loadCalls()
  );
}

export default async function NcaafWeekPage({
  params,
}: {
  params: Promise<{ season: string; week: string }>;
}) {
  const { season, week } = await params;
  const resolved = resolve(season, week);
  if (!resolved) notFound();
  return <WeekArchive sport={SPORT} season={resolved.season} week={resolved.week} />;
}
