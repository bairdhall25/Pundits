import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { eventHasFight, formatAsOf, formatCents, sidesForCard } from "@/lib/data";
import type { CardSide, Event, Pundit } from "@/lib/types";

function sideLab(side: CardSide): string {
  const tone = side.side.toUpperCase();
  const n = side.calls.length;
  if (n === 0) {
    return `${tone} · ${side.label} · ${formatCents(side.cents)} · nobody on this side yet`;
  }
  return `${tone} · ${side.label} · ${n} pundit${n === 1 ? "" : "s"}`;
}

function SideCol({
  side,
  pundits,
  collapsed,
  detail,
}: {
  side: CardSide;
  pundits: Pundit[];
  collapsed: boolean;
  detail: boolean;
}) {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const { cents, calls, side: tone } = side;

  if (collapsed) {
    return <div className={`col ${tone} col-empty`}>{sideLab(side)}</div>;
  }

  return (
    <div className={`col ${tone}`}>
      <div className={`px type-broadcast ${tone === "yes" ? "px-yes" : ""}`}>
        {formatCents(cents)}
      </div>
      <div className="lab">{sideLab(side)}</div>
      {calls.length === 0 ? (
        <div className="empty">Nobody on this side yet</div>
      ) : (
        calls.map((c) => {
          const p = byId[c.punditId];
          if (!p) return null;
          return (
            <div key={c.id} className="person-block">
              <Link href={`/pundits/${p.id}`} className="person person-hit">
                <PunditAvatar src={p.photo} alt={p.name} size="row" />
                <div>
                  <div className="nm type-broadcast">{p.name}</div>
                  <div className="qt">“{c.claim}”</div>
                </div>
              </Link>
              {detail ? (
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
              ) : null}
            </div>
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
  detail = false,
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
  permalink?: boolean;
  detail?: boolean;
}) {
  const [yes, no] = sidesForCard(event, calls);
  const fight = eventHasFight(event.slug, calls);
  const game = event.kind === "game";
  const asOf = formatAsOf(event.sourcedAt);
  const meta = [
    game ? [event.kickoff, event.network].filter(Boolean).join(" · ") : event.contractName,
    asOf,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`event ${fight ? "fight" : ""} ${permalink ? "event-link" : ""} ${detail ? "event-detail" : ""}`}
    >
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
          {detail ? null : <h2 className="type-broadcast">{event.title}</h2>}
          {detail ? <div className="meta">{meta}</div> : null}
        </div>
        {detail ? (
          event.sourceUrl ? (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="see freeze-src"
            >
              Price source{asOf ? ` · ${asOf}` : ""} →
            </a>
          ) : (
            <div className="meta">{asOf ?? "No Kalshi freeze yet"}</div>
          )
        ) : (
          <div className="meta">{meta}</div>
        )}
      </div>
      <div className="sides">
        <SideCol
          side={yes}
          pundits={pundits}
          collapsed={!detail && yes.calls.length === 0 && no.calls.length > 0}
          detail={detail}
        />
        <SideCol
          side={no}
          pundits={pundits}
          collapsed={!detail && no.calls.length === 0 && yes.calls.length > 0}
          detail={detail}
        />
      </div>
    </article>
  );
}
