import type { ReactNode } from "react";
import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { callsForEvent, eventHasFight, formatCents } from "@/lib/data";
import type { ActivityRecord, Call, Event, Pundit } from "@/lib/types";

export function PeekRow({
  children,
  hint = true,
}: {
  children: ReactNode;
  hint?: boolean;
}) {
  return (
    <>
      {hint ? <div className="hint">Swipe for more</div> : null}
      <div className="scroller">{children}</div>
    </>
  );
}

export function FuturePeek({
  event,
  calls,
  pundits,
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
}) {
  const yes = callsForEvent(event.slug, calls, "yes");
  const no = callsForEvent(event.slug, calls, "no");
  const fight = eventHasFight(event.slug, calls);
  const names = (side: Call[]) => {
    const list = side
      .map((c) => pundits.find((p) => p.id === c.punditId)?.name.split(" ").slice(-1)[0])
      .filter(Boolean);
    return list.length ? list.join(" · ") : "No pick yet";
  };

  return (
    <Link
      href={`/picks/${event.slug}`}
      className={`peek ${fight ? "fight" : ""}`}
    >
      <div className="kalshi-tag type-broadcast">Kalshi</div>
      <h3 className="type-broadcast ph">{event.title}</h3>
      <div className="tape">
        <div>
          <span>Yes</span>
          <b className="type-broadcast px-yes">{formatCents(event.yesCents)}</b>
          <div className="sub">{names(yes)}</div>
        </div>
        <div>
          <span>No</span>
          <b className="type-broadcast">{formatCents(event.noCents)}</b>
          <div className="sub">{names(no)}</div>
        </div>
      </div>
    </Link>
  );
}

export function TablePeek({ p }: { p: ActivityRecord }) {
  return (
    <Link href={`/pundits/${p.id}`} className="peek table-card">
      <PunditAvatar src={p.photo} alt={p.name} size="row" />
      <div className="nm type-broadcast">{p.name.split(" ").slice(-1)[0]}</div>
      <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Live
      </div>
      <div className="pct type-broadcast">{p.mappedPending}</div>
      <div className="wl">
        2026 {p.season2026.wins}–{p.season2026.losses}
      </div>
    </Link>
  );
}

export function StoryPeek({
  href,
  headline,
  kicker,
}: {
  href: string;
  headline: string;
  kicker: string;
}) {
  return (
    <Link href={href} className="peek">
      <div className="kalshi-tag type-broadcast">Pick story</div>
      <h3 className="type-broadcast ph">{headline}</h3>
      <div className="sub">{kicker}</div>
    </Link>
  );
}

export function BookPeek({
  call,
  pundit,
}: {
  call: Call;
  pundit: Pundit;
}) {
  const href =
    call.eventSlug && call.side
      ? `/picks/${call.eventSlug}/${pundit.id}`
      : `/pundits/${pundit.id}`;
  return (
    <Link href={href} className="peek book-card">
      <div className="book-quote">“{call.claim}”</div>
      <div className="book-by">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="peek" />
        <div>
          <div className="nm type-broadcast">{pundit.name.split(" ").slice(-1)[0]}</div>
          <div className="sub">{call.source}</div>
        </div>
      </div>
    </Link>
  );
}
