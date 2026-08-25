import { EventCard } from "@/components/EventCard";
import { getBoard, loadCalls, loadEvents, loadPundits } from "@/lib/data";
import type { Event, Call, Pundit, Sport } from "@/lib/types";

function Board({
  id,
  label,
  events,
  calls,
  pundits,
}: {
  id: Sport;
  label: string;
  events: Event[];
  calls: Call[];
  pundits: Pundit[];
}) {
  return (
    <section id={id} className="board">
      <div className="board-kicker type-broadcast">Top 10</div>
      <h2 className="board-title type-broadcast">{label}</h2>
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
  const ncaaf = getBoard("ncaaf", events, calls);
  const nfl = getBoard("nfl", events, calls);

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">Active bets · Kalshi freeze</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92] tracking-wide">
        Who’s on
        <br />
        what.
      </h1>
      <p className="lede">
        Two boards. Ten popular contracts each. Faces on the left implied YES.
        Faces on the right implied NO.
      </p>
      <div className="board-jump">
        <a href="#ncaaf">NCAAF</a>
        <a href="#nfl">NFL</a>
      </div>
      <Board
        id="ncaaf"
        label="NCAAF"
        events={ncaaf}
        calls={calls}
        pundits={pundits}
      />
      <Board
        id="nfl"
        label="NFL"
        events={nfl}
        calls={calls}
        pundits={pundits}
      />
    </main>
  );
}
