import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompactEventCard, EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import {
  archiveWeeks,
  gamesForWeek,
  weekArchivePath,
  weekRecord,
  weekResults,
} from "@/lib/archive";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { coverageTier, getWeekArchiveGames } from "@/lib/featured";
import { formatCents } from "@/lib/format";
import { ogImageFor, weekOgCard } from "@/lib/og";
import { breadcrumbList, collectionPageJsonLd, takePath } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import type { Call, Event, Sport } from "@/lib/types";

export { weekArchivePath };

const SPORT_LABEL: Record<Sport, string> = {
  ncaaf: "College football",
  nfl: "NFL",
};

export function weekArchiveTitle(sport: Sport, season: number, week: number): string {
  return `${SPORT_LABEL[sport]} Week ${week} expert picks (${season})`;
}

export function weekArchiveDescription(
  week: number,
  record: { hits: number; misses: number; pending: number }
): string {
  const graded = record.hits + record.misses > 0;
  return graded
    ? `Experts went ${record.hits}–${record.misses} on verified Week ${week} picks. Every quote, frozen price, and result.`
    : `Verified expert picks for every tracked Week ${week} game, with the quote and the frozen market price.`;
}

export function weekArchiveMeta(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[]
): Metadata {
  const games = gamesForWeek(sport, season, week, events);
  const record = weekRecord(games, calls);
  const title = weekArchiveTitle(sport, season, week);
  const card = weekOgCard(sport, season, week, events, calls);
  return pageMeta(
    title,
    weekArchiveDescription(week, record),
    weekArchivePath(sport, season, week),
    ogImageFor(card.file, title, card)
  );
}

export function WeekArchive({
  sport,
  season,
  week,
}: {
  sport: Sport;
  season: number;
  week: number;
}) {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const games = getWeekArchiveGames(
    sport,
    season,
    week,
    events,
    calls,
    pundits
  );
  const record = weekRecord(
    gamesForWeek(sport, season, week, events),
    calls
  );
  const results = weekResults(games, calls, pundits);
  const graded = record.hits + record.misses > 0;
  const weeks = archiveWeeks(events).filter(
    (w) => w.sport === sport && w.season === season
  );
  const idx = weeks.findIndex((w) => w.week === week);
  const prev = idx > 0 ? weeks[idx - 1] : null;
  const next = idx >= 0 && idx < weeks.length - 1 ? weeks[idx + 1] : null;
  const label = SPORT_LABEL[sport];
  const slate = `/${sport}/`;

  const lede = graded
    ? `Experts went ${record.hits}–${record.misses} on verified Week ${week} picks${
        record.pending ? `, with ${record.pending} still open` : ""
      }. Every pick below shows the quote, the frozen price, and the result.`
    : `${games.length} tracked game${games.length === 1 ? "" : "s"} · ${
        record.pending
      } open expert pick${record.pending === 1 ? "" : "s"}. Results land after the games.`;
  const path = weekArchivePath(sport, season, week);

  return (
    <main id="main" className="shell">
      <JsonLd
        data={collectionPageJsonLd(weekArchiveTitle(sport, season, week), path, lede)}
      />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: label, path: slate },
          { name: `Week ${week}`, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Picks", href: "/" },
          { name: label, href: slate },
          { name: `Week ${week}` },
        ]}
      />
      <div className="eyebrow type-broadcast">
        {label} · {season}–{String(season + 1).slice(-2)}
      </div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {label} Week {week}
      </h1>
      <p className="lede">{lede}</p>

      {results.length ? (
        <section className="week-results" aria-labelledby="week-results-title">
          <h2 id="week-results-title" className="type-broadcast">
            Who was right
          </h2>
          <ol>
            {results.map((result) => (
              <li key={result.call.id}>
                <Link
                  className="week-result-link"
                  href={takePath(result.event.slug, result.pundit.id)}
                >
                  <span className="week-result-pundit">
                    {result.pundit.name}
                  </span>
                  <span>{`— ${result.status} (`}</span>
                  <span className="week-result-pick">
                    {result.pickLabel}
                    {result.cents == null
                      ? ""
                      : `, ${formatCents(result.cents)}`}
                    )
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="board">
        {games.map((event) => {
          const Card =
            coverageTier(event, calls, pundits) === "full"
              ? EventCard
              : CompactEventCard;
          return (
            <Card
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
            />
          );
        })}
      </section>

      <nav className="week-nav" aria-label="More weeks">
        {prev ? (
          <Link href={weekArchivePath(sport, season, prev.week)}>
            ← Week {prev.week}
          </Link>
        ) : (
          <span />
        )}
        <Link href={slate}>Current {label} slate</Link>
        {next ? (
          <Link href={weekArchivePath(sport, season, next.week)}>
            Week {next.week} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
