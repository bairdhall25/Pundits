import type { ReactNode } from "react";
import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { callsForEvent, eventHasFight, formatCents } from "@/lib/data";
import type { Call, Event, Pundit, PunditRecord } from "@/lib/types";

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
  const faces = [...yes, ...no]
    .map((c) => pundits.find((p) => p.id === c.punditId))
    .filter((p): p is Pundit => Boolean(p));
  const unique = [...new Map(faces.map((p) => [p.id, p])).values()];
  const fight = eventHasFight(event.slug, calls);

  return (
    <Link
      href={`/picks/${event.slug}`}
      className={`peek ${fight ? "fight" : ""}`}
    >
      <h3 className="type-broadcast ph">{event.title}</h3>
      <div className="faces">
        {unique.slice(0, 4).map((p) => (
          <PunditAvatar key={p.id} src={p.photo} alt={p.name} size="peek" />
        ))}
      </div>
      <div className="sub">
        YES {formatCents(event.yesCents)}
        {unique.length
          ? ` · ${unique.map((p) => p.name.split(" ").slice(-1)[0]).join(", ")}`
          : " · nobody mapped yet"}
      </div>
    </Link>
  );
}

export function TablePeek({ p }: { p: PunditRecord }) {
  return (
    <Link href={`/pundits/${p.id}`} className="peek table-card">
      <PunditAvatar src={p.photo} alt={p.name} size="row" />
      <div className="nm type-broadcast">{p.name.split(" ").slice(-1)[0]}</div>
      <div className="pct type-broadcast">{p.accuracy2025}%</div>
      <div className="wl">
        2025 est · 2026 {p.season2026.wins}–{p.season2026.losses}
      </div>
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
  return (
    <Link href={`/pundits/${pundit.id}`} className="peek">
      <div className="faces">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="peek" />
      </div>
      <h3 className="type-broadcast ph">{pundit.name.split(" ").slice(-1)[0]}</h3>
      <div className="sub">“{call.claim}”</div>
    </Link>
  );
}
