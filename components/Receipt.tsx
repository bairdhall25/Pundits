import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { TrackAnchor } from "@/components/TrackLink";
import { sourceOpenParams } from "@/lib/analytics";
import { finalScoreLine } from "@/lib/data";
import { presentEvidence } from "@/lib/evidence";
import {
  formatAsOf,
  formatCents,
  formatShortDate,
  statusLabel,
  verdictClass,
} from "@/lib/format";
import { publicSideLabel } from "@/lib/public-side";
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
  const snapshot = game
    ? `${event.awayTeam} ${formatCents(event.yesCents)} / ${event.homeTeam} ${formatCents(event.noCents)}`
    : `${publicSideLabel(event, "yes")} ${formatCents(event.yesCents)} / ${publicSideLabel(event, "no")} ${formatCents(event.noCents)}`;
  const evidence = presentEvidence(call, pundit.name, day);
  const ClaimTag = evidence.isQuotedSpeech ? "blockquote" : "p";

  return (
    <article className="receipt">
      <div className="receipt-head">
        Receipt · {call.source}
        {day ? ` · ${day}` : ""}
        {evidence.isQuotedSpeech ? "" : " · Reported selection"}
      </div>
      {graded ? (
        <div className={`receipt-stamp verdict-${verdictClass(call.status)}`}>
          {statusLabel(call.status)}
        </div>
      ) : null}
      <ClaimTag className="receipt-quote">{evidence.displayText}</ClaimTag>
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
      {evidence.locatorLine ? (
        <div className="src-meta">{evidence.locatorLine}</div>
      ) : null}
      {evidence.transcriptUrl ? (
        <div className="src-meta">
          <a href={evidence.transcriptUrl} target="_blank" rel="noreferrer">
            Open transcript →
          </a>
        </div>
      ) : null}
      <div className="receipt-tape">
        <div>
          Snapshot <b>{snapshot}</b>
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
