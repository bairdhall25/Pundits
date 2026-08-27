import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { FuturePeek, PeekRow } from "@/components/PeekRow";
import {
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
    title: "NCAAF",
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
        Full slate. Home cards first. Games without a roster face stay on this
        page until they earn a spot on home.
      </p>
      <div className="when">{copy.when}</div>

      <section className="board">
        <div className="board-kicker type-broadcast">Games</div>
        <h2 className="board-title type-broadcast">The slate</h2>
        {games.map((event) => (
          <EventCard
            key={event.slug}
            event={event}
            calls={calls}
            pundits={pundits}
          />
        ))}
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
    </main>
  );
}
