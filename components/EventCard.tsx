import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { eventHasFight, formatCents, sidesForCard } from "@/lib/data";
import type { Call, CardSide, Event, Pundit } from "@/lib/types";

function SideCol({
  side,
  pundits,
  collapsed,
}: {
  side: CardSide;
  pundits: Pundit[];
  collapsed: boolean;
}) {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const { label, cents, calls, side: tone } = side;

  if (collapsed) {
    return (
      <div className={`col ${tone} col-empty`}>
        {label} · {formatCents(cents)} · nobody on this side yet
      </div>
    );
  }

  return (
    <div className={`col ${tone}`}>
      <div className={`px type-broadcast ${tone === "yes" ? "px-yes" : ""}`}>
        {formatCents(cents)}
      </div>
      <div className="lab">
        {label} · {calls.length} pundit{calls.length === 1 ? "" : "s"}
      </div>
      {calls.length === 0 ? (
        <div className="empty">Nobody on this side yet</div>
      ) : (
        calls.map((c) => {
          const p = byId[c.punditId];
          if (!p) return null;
          return (
            <Link key={c.id} href={`/pundits/${p.id}`} className="person person-hit">
              <PunditAvatar src={p.photo} alt={p.name} size="row" />
              <div>
                <div className="nm type-broadcast">{p.name}</div>
                <div className="qt">“{c.claim}”</div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

export function EventCard({
  event,
  calls,
  pundits,
  permalink = true,
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
  permalink?: boolean;
}) {
  const [first, second] = sidesForCard(event, calls);
  const fight = eventHasFight(event.slug, calls);
  const game = event.kind === "game";
  const collapseSecond = second.calls.length === 0 && first.calls.length > 0;
  const meta = game
    ? [event.kickoff, event.network].filter(Boolean).join(" · ")
    : event.contractName;

  return (
    <article className={`event ${fight ? "fight" : ""} ${permalink ? "event-link" : ""}`}>
      {permalink ? (
        <Link
          href={`/picks/${event.slug}`}
          className="event-hit"
          aria-label={event.title}
        />
      ) : null}
      <div className="event-head">
        <div>
          <div className="kalshi-tag type-broadcast">Kalshi</div>
          <h2 className="type-broadcast">{event.title}</h2>
        </div>
        <div className="meta">{meta}</div>
      </div>
      <div className={`sides ${collapseSecond ? "sides-collapsed" : ""}`}>
        <SideCol side={first} pundits={pundits} collapsed={false} />
        <SideCol side={second} pundits={pundits} collapsed={collapseSecond} />
      </div>
    </article>
  );
}
