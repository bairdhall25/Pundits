import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextLinks } from "@/components/ContextLinks";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { TeamChip } from "@/components/TeamChip";
import { TrackView } from "@/components/TrackView";
import { teamHasTakes } from "@/lib/archive";
import { teamPageOpenParams } from "@/lib/analytics";
import { getTeam, loadCalls, loadEvents, loadPundits, loadTeams } from "@/lib/data";
import { ogImageFor, teamOgCard } from "@/lib/og";
import { teamContent, type TeamMatchup } from "@/lib/page-content";
import { breadcrumbList, teamJsonLd, teamPageJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return loadTeams().map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = getTeam(id, loadTeams());
  if (!team) return pageMeta("Team picks", "Tracked picks by team.");
  const events = loadEvents();
  const calls = loadCalls();
  const content = teamContent(team, events, calls, loadPundits());
  const card = teamOgCard(team, events, calls, loadPundits());
  const meta = pageMeta(
    content.title,
    content.description,
    `/teams/${id}`,
    ogImageFor(card.file, content.title, card)
  );
  if (!teamHasTakes(id, events, calls)) {
    // Thin until a take involves this team; flips to indexable with content.
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

function MatchupPicks({
  teamName,
  matchup,
}: {
  teamName: string;
  matchup: TeamMatchup;
}) {
  return (
    <div className="team-split">
      <div>
        <div className="board-kicker type-broadcast">With {teamName}</div>
        {matchup.forTeam.length ? (
          <ul className="take-list">
            {matchup.forTeam.map((entry) => (
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
        ) : (
          <p className="empty">{matchup.emptyFor}</p>
        )}
      </div>
      <div>
        <div className="board-kicker type-broadcast">Against</div>
        {matchup.againstTeam.length ? (
          <ul className="take-list">
            {matchup.againstTeam.map((entry) => (
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
        ) : (
          <p className="empty">{matchup.emptyAgainst}</p>
        )}
      </div>
    </div>
  );
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(id, loadTeams());
  if (!team) notFound();
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const content = teamContent(team, events, calls, pundits);

  return (
    <main id="main" className="shell" data-page-type="team">
      <TrackView
        event="team_page_open"
        params={teamPageOpenParams({ teamId: team.id, sport: team.sport })}
      />
      <JsonLd data={teamPageJsonLd(team, content.title, content.description)} />
      <JsonLd data={teamJsonLd(team)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: team.name, path: `/teams/${team.id}` },
        ])}
      />
      <Breadcrumbs items={[{ name: "Picks", href: "/" }, { name: team.name }]} />
      <div className="eyebrow type-broadcast">
        {team.sport === "nfl" ? "NFL" : "College football"}
      </div>
      <div className="team-head">
        <TeamChip team={team} />
        <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
          {content.h1}
        </h1>
      </div>
      <p className="lede">{content.lede}</p>
      <p className="coverage-note">{content.disclaimer}</p>
      <ContextLinks links={content.contextLinks} label="League, game, and week" />

      {content.nextMatchup ? (
        <section className="board" aria-labelledby="next-matchup">
          <div className="board-kicker type-broadcast">Next matchup</div>
          <h2 id="next-matchup" className="board-title type-broadcast">
            {content.nextMatchup.event.title}
          </h2>
          {content.nextMatchup.when ? (
            <p className="when">{content.nextMatchup.when}</p>
          ) : null}
          <EventCard
            event={content.nextMatchup.event}
            calls={calls}
            pundits={pundits}
            surface="team"
          />
          <MatchupPicks teamName={team.name} matchup={content.nextMatchup} />
        </section>
      ) : null}

      {content.upcoming.map((matchup) => (
        <section key={matchup.event.slug} className="board">
          <div className="board-kicker type-broadcast">Also upcoming</div>
          <h2 className="board-title type-broadcast">{matchup.event.title}</h2>
          <EventCard
            event={matchup.event}
            calls={calls}
            pundits={pundits}
            surface="team"
          />
        </section>
      ))}

      {content.historical.length ? (
        <section className="board" aria-labelledby="past-results">
          <div className="board-kicker type-broadcast">Results</div>
          <h2 id="past-results" className="board-title type-broadcast">
            Past results
          </h2>
          {content.historical.map((matchup) => (
            <div key={matchup.event.slug}>
              {matchup.beatLine ? <p className="lede">{matchup.beatLine}.</p> : null}
              <p className="coverage-note">{matchup.lede}</p>
              <EventCard
                event={matchup.event}
                calls={calls}
                pundits={pundits}
                surface="team"
              />
              <MatchupPicks teamName={team.name} matchup={matchup} />
            </div>
          ))}
        </section>
      ) : null}

      {content.otherMarkets.length ? (
        <section className="board">
          <div className="board-kicker type-broadcast">Markets</div>
          <h2 className="board-title type-broadcast">{team.name} on the board</h2>
          {content.otherMarkets.map((event) => (
            <EventCard
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
              surface="team"
            />
          ))}
        </section>
      ) : null}
    </main>
  );
}
