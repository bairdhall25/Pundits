import { EventCard } from "@/components/EventCard";
import { getHomeEvents, loadCalls, loadEvents, loadPundits } from "@/lib/data";

export default function HomePage() {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const home = getHomeEvents(events, calls);

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">Active bets · Kalshi freeze</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92] tracking-wide">
        Who’s on
        <br />
        what.
      </h1>
      <p className="lede">
        Each card is a real contract. Faces on the left implied YES. Faces on
        the right implied NO.
      </p>
      {home.map((event) => (
        <EventCard
          key={event.slug}
          event={event}
          calls={calls}
          pundits={pundits}
        />
      ))}
    </main>
  );
}
