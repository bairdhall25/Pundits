import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { FuturePeek, PeekRow } from "@/components/PeekRow";
import { SportFilter } from "@/components/SportFilter";
import { WeekArchivePathLinks, TeamLinks } from "@/components/SlateLinks";
import {
  formatGameWhen,
  getBoard,
  getSlateGames,
  loadCalls,
  loadEvents,
  loadPundits,
} from "@/lib/data";
import type { Sport } from "@/lib/types";

const COPY: Record<
  Sport,
  { kicker: string; title: string; when: string }
> = {
  ncaaf: {
    kicker: "College football",
    title: "College football",
    when: "Week 0 Sat Aug 29 · Week 1 Sep 3–7",
  },
  nfl: {
    kicker: "Pro football",
    title: "NFL",
    when: "Week 1 · Sep 9–14",
  },
};

export function SportSlate({ sport }: { sport: Sport }) {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const games = getSlateGames(sport, events);
  const futures = getBoard(sport, events, calls);
  const copy = COPY[sport];
  const active = games.filter((e) => calls.some((c) => c.eventSlug === e.slug));
  const waiting = games.filter((e) => !calls.some((c) => c.eventSlug === e.slug));

  return (
    <main id="main" className="shell">
      <Breadcrumbs
        items={[{ name: "Picks", href: "/" }, { name: copy.title }]}
      />
      <div className="eyebrow type-broadcast">{copy.kicker}</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {copy.title}
      </h1>
      <p className="lede">
        Expert picks on this week’s games. Cards on the home page have a
        verified face. The rest stay here until someone takes a side.
      </p>
      <SportFilter current={sport} />
      <div className="when">{copy.when}</div>
      <WeekArchivePathLinks sport={sport} />

      <section className="board">
        <div className="board-kicker type-broadcast">Games</div>
        <h2 className="board-title type-broadcast">The slate</h2>
        {active.map((event) => (
          <EventCard
            key={event.slug}
            event={event}
            calls={calls}
            pundits={pundits}
          />
        ))}
        {waiting.length ? (
          <>
            <h3 className="wait-head type-broadcast">
              Waiting for a verified pick
            </h3>
            <ul className="wait-list">
              {waiting.map((event) => (
                <li key={event.slug}>
                  <Link href={`/picks/${event.slug}`} className="wait-row">
                    <span className="wait-title type-broadcast">
                      {event.title}
                    </span>
                    <span className="wait-when">{formatGameWhen(event)}</span>
                    <span className="wait-cta">No pick yet →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="board">
        <div className="board-kicker type-broadcast">Still open</div>
        <h2 className="board-title type-broadcast">Futures</h2>
        <PeekRow hint={false}>
          {futures.map((event) => (
            <FuturePeek
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
            />
          ))}
        </PeekRow>
      </section>

      <TeamLinks sport={sport} />
    </main>
  );
}
