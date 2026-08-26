import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import {
  callsForEvent,
  eventHasFight,
  formatCents,
} from "@/lib/data";
import type { Call, Event, Pundit } from "@/lib/types";

function SideCol({
  label,
  cents,
  calls,
  pundits,
  tone,
}: {
  label: string;
  cents: number | null;
  calls: Call[];
  pundits: Pundit[];
  tone: "yes" | "no";
}) {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  return (
    <div className={`col ${tone}`}>
      <div className="lab">
        {label} · {formatCents(cents)} · {calls.length} pundit
        {calls.length === 1 ? "" : "s"}
      </div>
      {calls.length === 0 ? (
        <div className="empty">Nobody on this side yet</div>
      ) : (
        calls.map((c) => {
          const p = byId[c.punditId];
          if (!p) return null;
          return (
            <Link
              key={c.id}
              href={`/pundits/${p.id}`}
              className="person"
            >
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
  const yes = callsForEvent(event.slug, calls, "yes");
  const no = callsForEvent(event.slug, calls, "no");
  const fight = eventHasFight(event.slug, calls);
  const game = event.kind === "game";
  const leftLabel = game ? (event.awayTeam ?? "Away") : "Yes";
  const rightLabel = game ? (event.homeTeam ?? "Home") : "No";
  const title = permalink ? (
    <Link href={`/picks/${event.slug}`} className="hover:text-[var(--green)]">
      {event.title}
    </Link>
  ) : (
    event.title
  );
  const meta = game
    ? [event.kickoff, event.network, `Kalshi ${formatCents(event.yesCents)} / ${formatCents(event.noCents)}`]
        .filter(Boolean)
        .join(" · ")
    : `Kalshi · ${event.contractName} · YES ${formatCents(event.yesCents)} · NO ${formatCents(event.noCents)}`;

  return (
    <article className={`event ${fight ? "fight" : ""}`}>
      <div className="event-head">
        <h2 className="type-broadcast">{title}</h2>
        <div className="meta">{meta}</div>
      </div>
      <div className="sides">
        <SideCol
          label={leftLabel}
          cents={event.yesCents}
          calls={yes}
          pundits={pundits}
          tone="yes"
        />
        <SideCol
          label={rightLabel}
          cents={event.noCents}
          calls={no}
          pundits={pundits}
          tone="no"
        />
      </div>
    </article>
  );
}
