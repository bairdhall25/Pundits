import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CompactEventCard, EventCard } from "@/components/EventCard";
import { FinalRow } from "@/components/FinalRow";
import { FuturePeek, PeekRow } from "@/components/PeekRow";
import { SportFilter } from "@/components/SportFilter";
import { WeekArchivePathLinks, TeamLinks } from "@/components/SlateLinks";
import {
  loadCalls,
  loadEvents,
  loadPundits,
  partitionFutures,
  seasonLabel,
} from "@/lib/data";
import { coverageTier, getLeagueSlate } from "@/lib/featured";
import { breadcrumbList, collectionPageJsonLd } from "@/lib/seo";
import type { Call, Event, Pundit, Sport } from "@/lib/types";

const COPY: Record<Sport, { kicker: string; title: string }> = {
  ncaaf: {
    kicker: "College football",
    title: "College football",
  },
  nfl: {
    kicker: "Pro football",
    title: "NFL",
  },
};

function GameCard({
  event,
  calls,
  pundits,
  sport,
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
  sport: Sport;
}) {
  const Card =
    coverageTier(event, calls, pundits) === "full" ? EventCard : CompactEventCard;
  return (
    <Card
      event={event}
      calls={calls}
      pundits={pundits}
      surface={sport}
    />
  );
}

export function SportSlate({ sport }: { sport: Sport }) {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const slate = getLeagueSlate(sport, events, calls, pundits);
  const { withPicks: futurePicks, waiting: futureWaiting } = partitionFutures(
    sport,
    events,
    calls
  );
  const copy = COPY[sport];
  const when = [
    ...slate.weeks.map((week) => week.label),
    slate.previous ? `Week ${slate.previous.week} is final` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const description =
    sport === "nfl"
      ? "Expert NFL picks for this week. Who the TV voices are taking, with the market price."
      : "Expert CFB picks for this week. Who the TV voices are taking, with the market price next to each take.";

  return (
    <main id="main" className="shell">
      <JsonLd
        data={collectionPageJsonLd(
          sport === "nfl" ? "NFL picks" : "College football picks",
          `/${sport}/`,
          description
        )}
      />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/picks" },
          { name: copy.title, path: `/${sport}` },
        ])}
      />
      <Breadcrumbs
        items={[{ name: "Picks", href: "/picks/" }, { name: copy.title }]}
      />
      <div className="eyebrow type-broadcast">{copy.kicker}</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {copy.title}
      </h1>
      <p className="lede">
        Expert picks on this week’s games. Every game here has at least one
        verified pick. Prices are frozen when available.
      </p>
      <SportFilter current={sport} />
      {when ? <div className="when">{when}</div> : null}
      <WeekArchivePathLinks sport={sport} />
      {slate.previous ? (
        <p className="week-recap">
          <a href={slate.previous.href}>{slate.previous.line}</a>
        </p>
      ) : null}

      {slate.weeks.map((week) => (
        <section key={`${week.season}-${week.week}`} className="board">
          <div className="board-kicker type-broadcast">Games</div>
          <h2 className="board-title type-broadcast">{week.label}</h2>
          {week.open.map((event) => (
            <GameCard
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
              sport={sport}
            />
          ))}
          {week.final.length ? (
            <>
              <h3 className="wait-head type-broadcast">Final</h3>
              <ul className="wait-list">
                {week.final.map((event) => (
                  <li key={event.slug}>
                    <FinalRow event={event} calls={calls} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ))}
      {slate.unscheduled.length ? (
        <section className="board">
          <div className="board-kicker type-broadcast">Games</div>
          <h2 className="board-title type-broadcast">Also on the slate</h2>
          {slate.unscheduled.map((event) => (
            <GameCard
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
              sport={sport}
            />
          ))}
        </section>
      ) : null}

      <section className="board">
        <div className="board-kicker type-broadcast">Still open</div>
        <h2 className="board-title type-broadcast">Futures</h2>
        <PeekRow hint={false}>
          {futurePicks.map((event) => (
            <FuturePeek
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
            />
          ))}
        </PeekRow>
        {futureWaiting.length ? (
          <>
            <h3 className="wait-head type-broadcast">Waiting for a verified pick</h3>
            <ul className="wait-list">
              {futureWaiting.map((event) => (
                <li key={event.slug}>
                  <Link href={`/picks/${event.slug}`} className="wait-row">
                    <span className="wait-title type-broadcast">{event.title}</span>
                    <span className="wait-when">{seasonLabel(event.season)}</span>
                    <span className="wait-cta">No pick yet →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <TeamLinks sport={sport} />
    </main>
  );
}
