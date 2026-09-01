import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { TrackAnchor } from "@/components/TrackLink";
import { sourceOpenParams } from "@/lib/analytics";
import { finalScoreLine } from "@/lib/data";
import {
  formatAsOf,
  formatCents,
  formatShortDate,
  statusLabel,
  verdictClass,
} from "@/lib/format";
import type { MappedTake } from "@/lib/seo";
import type { Call } from "@/lib/types";

export function Receipt({ take, calls }: { take: MappedTake; calls: Call[] }) {
  const { pundit, event, call } = take;
  const graded = call.status === "hit" || call.status === "miss";
  const day = formatShortDate(call.sourceDate);
  const gradedDay = formatShortDate(call.gradedAt);
  const asOf = formatAsOf(event.sourcedAt);
  const score = finalScoreLine(event, calls);
  const game = Boolean(event.awayTeam && event.homeTeam);
  const froze = game
    ? `${event.awayTeam} ${formatCents(event.yesCents)} / ${event.homeTeam} ${formatCents(event.noCents)}`
    : `Yes ${formatCents(event.yesCents)} / No ${formatCents(event.noCents)}`;

  return (
    <article className="receipt">
      <div className="receipt-head">
        Receipt · {call.source}
        {day ? ` · ${day}` : ""}
      </div>
      {graded ? (
        <div className={`receipt-stamp verdict-${verdictClass(call.status)}`}>
          {statusLabel(call.status)}
        </div>
      ) : null}
      <blockquote className="receipt-quote">“{call.claim}”</blockquote>
      <Link href={`/pundits/${pundit.id}`} className="person person-hit">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="row" />
        <div>
          <div className="nm type-broadcast">{pundit.name}</div>
          <div className="src-meta">{pundit.outlet}</div>
        </div>
      </Link>
      {call.sourceUrl ? (
        <div className="src-meta">
          <TrackAnchor
            href={call.sourceUrl}
            event="source_open"
            params={sourceOpenParams({
              eventSlug: event.slug,
              punditId: pundit.id,
              sourceType: "evidence",
            })}
          >
            Open source →
          </TrackAnchor>
        </div>
      ) : null}
      <div className="receipt-tape">
        <div>
          Froze <b>{froze}</b>
          {asOf ? ` · ${asOf}` : ""}
        </div>
        {graded ? (
          <div>
            Final <b>{score ?? "—"}</b>
            {gradedDay ? ` · Graded ${gradedDay}` : ""}
          </div>
        ) : null}
      </div>
    </article>
  );
}
