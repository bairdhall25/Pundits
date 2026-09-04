import Link from "next/link";
import { CompactEventCard, EventCard } from "@/components/EventCard";
import { FinalRow } from "@/components/FinalRow";
import { FuturePeek, PeekRow } from "@/components/PeekRow";
import { TeamLinks, WeekArchivePathLinks } from "@/components/SlateLinks";
import {
  loadCalls,
  loadEvents,
  loadPundits,
  partitionFutures,
  seasonLabel,
} from "@/lib/data";
import { coverageTier, getLeagueSlate } from "@/lib/featured";
import type { Call, Event, Pundit, Sport } from "@/lib/types";

const SPORTS: readonly Sport[] = ["ncaaf", "nfl"];

const COPY: Record<Sport, { kicker: string; title: string; linkLabel: string }> = {
  ncaaf: {
    kicker: "College football",
    title: "College football",
    linkLabel: "NCAAF only",
  },
  nfl: {
    kicker: "Pro football",
    title: "NFL",
    linkLabel: "NFL only",
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

export function AllPicksSlate() {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();

  return SPORTS.map((sport) => {
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

    return (
      <div key={sport} id={sport} className="all-picks-league">
        <div className="row-head all-picks-league-head">
          <div>
            <div className="board-kicker type-broadcast">{copy.kicker}</div>
            <h2 className="board-title type-broadcast">{copy.title}</h2>
          </div>
          <Link className="see" href={`/${sport}/`}>
            {copy.linkLabel} →
          </Link>
        </div>
        {when ? <div className="when">{when}</div> : null}
        <WeekArchivePathLinks sport={sport} />
        {slate.previous ? (
          <p className="week-recap">
            <Link href={slate.previous.href}>{slate.previous.line}</Link>
          </p>
        ) : null}

        {slate.weeks.map((week) => (
          <section key={`${week.season}-${week.week}`} className="board">
            <div className="board-kicker type-broadcast">Games</div>
            <h3 className="board-title type-broadcast">{week.label}</h3>
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
                <h4 className="wait-head type-broadcast">Final</h4>
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
            <h3 className="board-title type-broadcast">Also on the slate</h3>
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
          <h3 className="board-title type-broadcast">Futures</h3>
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
              <h4 className="wait-head type-broadcast">
                Waiting for a verified pick
              </h4>
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
      </div>
    );
  });
}
