import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompactEventCard, EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";
import { PickReport } from "@/components/PickReport";
import { publishedPickReport, pickReportMeta } from "@/lib/pick-report";
import { resolveWeekSocialCard } from "@/lib/social-card/resolver";
import {
  archiveWeeks,
  weekArchivePath,
  weekResults,
} from "@/lib/archive";
import { weekArchiveOpenParams } from "@/lib/analytics";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { coverageTier, getWeekArchiveGames } from "@/lib/featured";
import { formatCents } from "@/lib/format";
import { ogImageFor, weekOgCard } from "@/lib/og";
import { weekArchiveContent } from "@/lib/page-content";
import { breadcrumbList, collectionPageJsonLd, takePath } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import type { Call, Event, Pundit, Sport } from "@/lib/types";

export { weekArchivePath };

export function weekArchiveMeta(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Metadata {
  const content = weekArchiveContent(sport, season, week, events, calls, pundits);
  const card = weekOgCard(sport, season, week, events, calls);
  const report = publishedPickReport(sport, season, week, events, calls, pundits);
  const reportMeta = report ? pickReportMeta(report) : null;
  const metadata = pageMeta(
    reportMeta?.title ?? content.title,
    reportMeta?.description ?? content.description,
    weekArchivePath(sport, season, week),
    ogImageFor(card.file, reportMeta?.socialTitle ?? content.title, report ? resolveWeekSocialCard(sport, season, week, events, calls, pundits) : card)
  );
  if (reportMeta) {
    metadata.openGraph = { ...metadata.openGraph, title: reportMeta.socialTitle, description: reportMeta.socialDescription };
    metadata.twitter = { ...metadata.twitter, title: reportMeta.socialTitle, description: reportMeta.socialDescription };
  }
  return metadata;
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
  const content = weekArchiveContent(
    sport,
    season,
    week,
    events,
    calls,
    pundits
  );
  const results = weekResults(games, calls, pundits);
  const weeks = archiveWeeks(events).filter(
    (w) => w.sport === sport && w.season === season
  );
  const idx = weeks.findIndex((w) => w.week === week);
  const prev = idx > 0 ? weeks[idx - 1] : null;
  const next = idx >= 0 && idx < weeks.length - 1 ? weeks[idx + 1] : null;
  const slate = `/${sport}/`;
  const path = weekArchivePath(sport, season, week);
  const report = publishedPickReport(sport, season, week, events, calls, pundits);
  const reportMeta = report ? pickReportMeta(report) : null;

  return (
    <main id="main" className="shell" data-page-type="week">
      <TrackView
        event="week_archive_open"
        params={weekArchiveOpenParams({ sport, season, week })}
      />
      <JsonLd
        data={collectionPageJsonLd(reportMeta?.title ?? content.title, path, reportMeta?.description ?? content.description)}
      />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: content.sportLabel, path: slate },
          { name: `Week ${week}`, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Picks", href: "/" },
          { name: content.sportLabel, href: slate },
          { name: `Week ${week}` },
        ]}
      />
      {report ? <PickReport report={report} /> : <><div className="eyebrow type-broadcast">
        {content.sportLabel} · {season}–{String(season + 1).slice(-2)}
      </div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {content.h1}
      </h1>
      <p className="lede">{content.lede}</p>
      <p className="coverage-note">{content.disclaimer}</p>
      </>}

      {content.disagreements.length ? (
        <section className="week-results" aria-labelledby="week-disagreements-title">
          <h2 id="week-disagreements-title" className="type-broadcast">
            Verified disagreements
          </h2>
          <ol>
            {content.disagreements.map((row) => (
              <li key={row.event.slug}>
                <Link className="week-result-link" href={row.href}>
                  <span className="week-result-pundit">{row.event.title}</span>
                </Link>
                <span> — {row.line}</span>
                <ul className="take-list">
                  {row.receipts.map((entry) => (
                    <li key={entry.href}>
                      <Link href={entry.href}>
                        {entry.name} → {entry.sideLabel}
                        <span>
                          {entry.source}
                          {entry.sourceDate ? ` · ${entry.sourceDate}` : ""}
                          {" · Receipt"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {results.length ? (
        <section className="week-results" aria-labelledby="week-results-title">
          <h2 id="week-results-title" className="type-broadcast">
            Graded picks
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
              surface="week"
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
        <Link href={slate}>Current {content.sportLabel} slate</Link>
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
