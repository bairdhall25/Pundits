import { EventCard } from "@/components/EventCard";
import {
  BookPeek,
  FuturePeek,
  PeekRow,
  TablePeek,
} from "@/components/PeekRow";
import {
  getActivityBoard,
  getFuturesPeek,
  getWeekend,
  latestCalls,
  loadCalls,
  loadEvents,
  loadPundits,
} from "@/lib/data";
import type { Event, Call, Pundit } from "@/lib/types";

function Weekend({
  id,
  kicker,
  label,
  when,
  events,
  calls,
  pundits,
}: {
  id: string;
  kicker: string;
  label: string;
  when: string;
  events: Event[];
  calls: Call[];
  pundits: Pundit[];
}) {
  return (
    <section id={id} className="board">
      <div className="board-kicker type-broadcast">{kicker}</div>
      <h2 className="board-title type-broadcast">{label}</h2>
      <div className="when">{when}</div>
      {events.map((event) => (
        <EventCard
          key={event.slug}
          event={event}
          calls={calls}
          pundits={pundits}
        />
      ))}
    </section>
  );
}

export default function HomePage() {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const ncaaf = getWeekend("ncaaf", events);
  const nfl = getWeekend("nfl", events);
  const futures = [
    ...getFuturesPeek("ncaaf", events, calls, 3),
    ...getFuturesPeek("nfl", events, calls, 2),
  ];
  const table = getActivityBoard(pundits, calls).slice(0, 6);
  const book = latestCalls(calls, 6);
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">Active picks · this weekend first</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,11vw,68px)] leading-[0.92] tracking-wide lg:text-[128px]">
        Who’s on
        <br />
        what.
      </h1>
      <p className="lede lg:text-lg">
        Each card is a Kalshi market. Faces are implied picks. Games first,
        futures underneath.
      </p>
      <div className="board-jump">
        <a href="#ncaaf">NCAAF weekend</a>
        <a href="#nfl">NFL week 1</a>
        <a href="#futures">Futures</a>
        <a href="#table">The table</a>
        <a href="#book">The Book</a>
      </div>

      <Weekend
        id="ncaaf"
        kicker="This weekend"
        label="NCAAF"
        when="Week 1 · Sep 3–7 · marquee first"
        events={ncaaf}
        calls={calls}
        pundits={pundits}
      />
      <Weekend
        id="nfl"
        kicker="Up next"
        label="NFL"
        when="Week 1 · Sep 9–14 · regular season, not preseason"
        events={nfl}
        calls={calls}
        pundits={pundits}
      />

      <section id="futures" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">Still open</div>
            <h2 className="board-title type-broadcast">Hottest fights</h2>
          </div>
          <a className="see" href="/leaderboard">
            See all →
          </a>
        </div>
        <PeekRow>
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

      <section id="table" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">Gamification</div>
            <h2 className="board-title type-broadcast">The table</h2>
          </div>
          <a className="see" href="/leaderboard">
            Full leaderboard →
          </a>
        </div>
        <PeekRow>
          {table.map((p) => (
            <TablePeek key={p.id} p={p} />
          ))}
        </PeekRow>
      </section>

      <section id="book" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">The archive</div>
            <h2 className="board-title type-broadcast">Latest from The Book</h2>
          </div>
          <a className="see" href="/book">
            Open The Book →
          </a>
        </div>
        <PeekRow>
          {book.map((c) => {
            const p = byId[c.punditId];
            if (!p) return null;
            return <BookPeek key={c.id} call={c} pundit={p} />;
          })}
        </PeekRow>
      </section>
    </main>
  );
}
