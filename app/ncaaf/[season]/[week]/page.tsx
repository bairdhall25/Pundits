import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  WeekArchive,
  weekArchivePath,
  weekArchiveTitle,
} from "@/components/WeekArchive";
import { archiveWeeks, gamesForWeek, parseWeekParam, weekRecord } from "@/lib/archive";
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
  const events = loadEvents();
  const games = gamesForWeek(SPORT, resolved.season, resolved.week, events);
  const record = weekRecord(games, loadCalls());
  const graded = record.hits + record.misses > 0;
  const description = graded
    ? `Experts went ${record.hits}–${record.misses} on verified Week ${resolved.week} picks. Every quote, frozen price, and result.`
    : `Verified expert picks for every tracked Week ${resolved.week} game, with the quote and the frozen market price.`;
  return pageMeta(
    weekArchiveTitle(SPORT, resolved.season, resolved.week),
    description,
    weekArchivePath(SPORT, resolved.season, resolved.week)
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
