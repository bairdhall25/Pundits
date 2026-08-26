import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { PunditAvatar } from "@/components/PunditAvatar";
import {
  callsForEvent,
  formatAsOf,
  formatCents,
  getEvent,
  loadCalls,
  loadEvents,
  loadPundits,
} from "@/lib/data";

export function generateStaticParams() {
  return loadEvents().map((e) => ({ slug: e.slug }));
}

export default async function PickPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const events = loadEvents();
  const event = getEvent(slug, events);
  if (!event) notFound();

  const calls = loadCalls();
  const pundits = loadPundits();
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const mapped = [
    ...callsForEvent(slug, calls, "yes"),
    ...callsForEvent(slug, calls, "no"),
  ];
  const asOf = formatAsOf(event.sourcedAt);
  const slate = event.sport === "nfl" ? "/nfl" : "/ncaaf";

  return (
    <main className="shell">
      <Link
        href={slate}
        className="mb-4 inline-block text-xs uppercase tracking-widest text-[var(--green)]"
      >
        ← {event.sport === "nfl" ? "NFL" : "NCAAF"} slate
      </Link>
      <div className="eyebrow type-broadcast">Kalshi market</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {event.title}
      </h1>
      <p className="lede">
        {event.kind === "game"
          ? [event.kickoff, event.network].filter(Boolean).join(" · ")
          : event.contractName}
        {asOf ? ` · ${asOf}` : ""}
        . Hypothetical $100 at the freeze.
      </p>

      <div className="freeze-bar">
        <div>
          <span>Yes</span>
          <b className="type-broadcast px-yes">{formatCents(event.yesCents)}</b>
        </div>
        <div>
          <span>No</span>
          <b className="type-broadcast">{formatCents(event.noCents)}</b>
        </div>
        {event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="see freeze-src"
          >
            Price source{asOf ? ` · ${asOf}` : ""} →
          </a>
        ) : (
          <div className="when">{asOf ?? "No Kalshi freeze yet"}</div>
        )}
      </div>

      <EventCard
        event={event}
        calls={calls}
        pundits={pundits}
        permalink={false}
      />

      <section className="board">
        <div className="board-kicker type-broadcast">The tape</div>
        <h2 className="board-title type-broadcast">Sources</h2>
        {mapped.length === 0 ? (
          <p className="empty">No roster lean mapped yet.</p>
        ) : (
          mapped.map((c) => {
            const p = byId[c.punditId];
            if (!p) return null;
            return (
              <div key={c.id} className="src-row">
                <Link href={`/pundits/${p.id}`} className="src-who">
                  <PunditAvatar src={p.photo} alt={p.name} size="row" />
                  <div>
                    <div className="nm type-broadcast">{p.name}</div>
                    <div className="qt">“{c.claim}”</div>
                  </div>
                </Link>
                <div className="src-meta">
                  {c.source}
                  {c.sourceDate ? ` · ${c.sourceDate}` : ""}
                  {c.sourceUrl ? (
                    <>
                      {" · "}
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                        Open source →
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
