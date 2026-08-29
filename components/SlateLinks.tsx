import Link from "next/link";
import { weekArchivePath } from "@/components/WeekArchive";
import { archiveWeeks, teamHasTakes } from "@/lib/archive";
import { loadCalls, loadEvents, loadTeams } from "@/lib/data";
import type { Sport } from "@/lib/types";

/** Permanent per-week archive links for a sport's slate page. */
export function WeekArchivePathLinks({ sport }: { sport: Sport }) {
  const weeks = archiveWeeks(loadEvents()).filter((w) => w.sport === sport);
  if (!weeks.length) return null;
  return (
    <nav className="past-weeks" aria-label="Weekly archives">
      <span className="past-weeks-label">Weeks</span>
      {weeks.map((w) => (
        <Link
          key={`${w.season}-${w.week}`}
          href={weekArchivePath(sport, w.season, w.week)}
        >
          Week {w.week}
        </Link>
      ))}
    </nav>
  );
}

/** Team-page links for teams that have at least one take (crawl path for
 *  the indexable team pages; empty ones stay unlinked and noindexed). */
export function TeamLinks({ sport }: { sport: Sport }) {
  const events = loadEvents();
  const calls = loadCalls();
  const teams = loadTeams().filter(
    (t) => t.sport === sport && teamHasTakes(t.id, events, calls)
  );
  if (!teams.length) return null;
  return (
    <nav className="team-links" aria-label="Teams">
      <span className="team-links-label">Teams</span>
      {teams.map((t) => (
        <Link key={t.id} href={`/teams/${t.id}`}>
          {t.name}
        </Link>
      ))}
    </nav>
  );
}
