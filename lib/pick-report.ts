import { gamesForWeek } from "./archive";
import type { Call, Event, Pundit, Sport } from "./types";

export type ReportPick = { call: Call; event: Event; pundit: Pundit; cents: number; label: string };
export type ReportGroup = { picks: ReportPick[]; hits: number; misses: number; games: number };

/** A settled, priced sample only. Incomplete or contradictory evidence stays on the normal archive. */
export function buildPickReport(sport: Sport, season: number, week: number, events: Event[], calls: Call[], pundits: Pundit[]) {
  const games = gamesForWeek(sport, season, week, events);
  if (!games.length) return null;
  const scoped = calls.filter(c => c.kind === "hard" && c.side && games.some(e => e.slug === c.eventSlug));
  const seen = new Set<string>();
  const picks: ReportPick[] = [];
  for (const event of games) {
    if (!event.awayTeam || !event.homeTeam || !event.resultUrl || event.awayScore == null || event.homeScore == null || event.awayScore === event.homeScore || !event.sourcedAt) return null;
    if (event.yesCents == null || event.noCents == null || !Number.isFinite(event.yesCents) || !Number.isFinite(event.noCents) || event.yesCents <= 0 || event.yesCents >= 100 || event.noCents <= 0 || event.noCents >= 100) return null;
    // Even-price or ambiguous markets need editorial treatment, not an invented favorite.
    if (!((event.yesCents < 50 && event.noCents > 50) || (event.noCents < 50 && event.yesCents > 50))) return null;
    const gameCalls = scoped.filter(c => c.eventSlug === event.slug);
    if (!gameCalls.length) return null;
    const winner = event.awayScore > event.homeScore ? "yes" : "no";
    for (const call of gameCalls) {
      const key = `${call.punditId}/${event.slug}`;
      const pundit = pundits.find(p => p.id === call.punditId);
      if (seen.has(key) || !pundit || call.status !== (call.side === winner ? "hit" : "miss")) return null;
      seen.add(key);
      picks.push({ call, event, pundit, cents: call.side === "yes" ? event.yesCents : event.noCents, label: call.side === "yes" ? event.awayTeam : event.homeTeam });
    }
  }
  const group = (rows: ReportPick[]): ReportGroup => ({ picks: rows, hits: rows.filter(p => p.call.status === "hit").length, misses: rows.filter(p => p.call.status === "miss").length, games: new Set(rows.map(p => p.event.slug)).size });
  const favorites = group(picks.filter(p => p.cents > 50));
  const underdogs = group(picks.filter(p => p.cents < 50));
  const dogGames = games.flatMap(event => {
    const rows = underdogs.picks.filter(p => p.event.slug === event.slug);
    return rows.length ? [{ event, picks: rows, cents: rows[0].cents, label: rows[0].label, hit: rows[0].call.status === "hit", score: rows[0].call.side === "yes" ? `${event.awayScore}–${event.homeScore}` : `${event.homeScore}–${event.awayScore}` }] : [];
  }).sort((a, b) => Number(b.hit) - Number(a.hit) || a.cents - b.cents || a.label.localeCompare(b.label));
  const favoriteGames = games.map(event => ({ event, hit: (event.yesCents! > 50) === (event.awayScore! > event.homeScore!), label: event.yesCents! > 50 ? event.awayTeam! : event.homeTeam! }));
  return { sport, season, week, games, picks, favorites, underdogs, dogGames, favoriteGames, punditCount: new Set(picks.map(p => p.pundit.id)).size, hits: picks.filter(p => p.call.status === "hit").length, misses: picks.filter(p => p.call.status === "miss").length };
}

export type PickReport = NonNullable<ReturnType<typeof buildPickReport>>;

/** Only this issue has reviewed editorial copy. Later weeks retain the established archive. */
export function publishedPickReport(sport: Sport, season: number, week: number, events: Event[], calls: Call[], pundits: Pundit[]) {
  if (sport !== "ncaaf" || season !== 2026 || week !== 1) return null;
  const report = buildPickReport(sport, season, week, events, calls, pundits);
  if (!report) return null;
  // These are the narrative's factual premises; fall back rather than publish stale analysis after a correction.
  if (report.underdogs.hits !== 1 || report.favorites.misses !== 0 || report.dogGames.filter(g => g.hit).length !== 1) return null;
  const winner = report.underdogs.picks.find(p => p.call.status === "hit")!;
  if (winner.pundit.id !== "patterson" || winner.event.slug !== "oklahoma-state-at-tulsa-2026") return null;
  return report;
}

export function pickReportMeta(report: PickReport) {
  return {
    title: `College Football Week ${report.week} Pick Results: Underdogs ${report.underdogs.hits}–${report.underdogs.misses} (${report.season})`,
    description: `Our tracked college football Week ${report.week} picks went ${report.hits}–${report.misses}: favorites ${report.favorites.hits}–${report.favorites.misses}, underdogs ${report.underdogs.hits}–${report.underdogs.misses}. See the ${report.season} results, who picked Tulsa and how we counted.`,
    socialTitle: `College football Week ${report.week}: ${report.underdogs.picks.length} underdog picks. One winner.`,
    socialDescription: `Favorites went ${report.favorites.hits}–${report.favorites.misses} in our tracked selections. Underdogs went ${report.underdogs.hits}–${report.underdogs.misses} across ${report.underdogs.games} games. Chip Patterson had the only underdog hit: Tulsa.`,
  };
}
