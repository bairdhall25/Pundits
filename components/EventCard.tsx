import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { TeamChip } from "@/components/TeamChip";
import {
  eventHasFight,
  eventScanStatus,
  eventStatusLine,
  finalScoreParts,
  formatAsOf,
  formatCents,
  formatGameWhen,
  getTeam,
  loadTeams,
  seasonLabel,
  sidesForCard,
} from "@/lib/data";
import { KickoffTag } from "@/components/KickoffTag";
import { americanOdds, statusChipText } from "@/lib/format";
import { eventKalshiUrl } from "@/lib/kalshi";
import { takePath } from "@/lib/seo";
import type { Call, CardSide, Event, Pundit, Team } from "@/lib/types";

function FaceRow({
  call,
  pundit,
  detail,
  eventSlug,
}: {
  call: Call;
  pundit: Pundit;
  detail: boolean;
  eventSlug?: string;
}) {
  return (
    <div className="person-block">
      <Link href={`/pundits/${pundit.id}`} className="person person-hit">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="row" />
        <div>
          <div className="nm type-broadcast">
            {pundit.name}
            {call.status !== "pending" ? (
              <span className={`result-chip ${call.status}`}>{statusChipText(call.status)}</span>
            ) : null}
          </div>
          {detail ? <div className="qt">“{call.claim}”</div> : null}
        </div>
      </Link>
      {detail ? (
        <div className="src-meta">
          {call.source}
          {call.sourceDate ? ` · ${call.sourceDate}` : ""}
          {call.sourceUrl ? (
            <>
              {" · "}
              <a href={call.sourceUrl} target="_blank" rel="noreferrer">
                Open source →
              </a>
            </>
          ) : null}
          {eventSlug ? (
            <>
              {" · "}
              <Link href={takePath(eventSlug, pundit.id)}>Full take →</Link>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SideCol({
  side,
  pundits,
  teams,
  detail,
  game,
  eventSlug,
  settled = false,
  eventHref,
}: {
  side: CardSide;
  pundits: Pundit[];
  teams: Team[];
  detail: boolean;
  game: boolean;
  eventSlug?: string;
  settled?: boolean;
  eventHref?: string;
}) {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const vacant = side.calls.length === 0;
  const team = getTeam(side.teamId, teams);
  const odds = game && !settled ? americanOdds(side.cents) : null;
  const teamBlock = (
    <div className="scan-team">
      <div className="who">
        {team ? <TeamChip team={team} /> : null}
        <div className="scan-name type-broadcast">{side.label}</div>
      </div>
      <div className="px-wrap">
        <div className={`px type-broadcast ${detail && side.side === "yes" ? "px-yes" : ""}`}>
          {formatCents(side.cents)}
        </div>
        {odds ? <div className="px-odds">≈ {odds}</div> : null}
      </div>
    </div>
  );
  return (
    <div className={`col ${side.side} ${vacant ? "col-vacant" : ""}`}>
      {eventHref ? (
        <Link href={eventHref} className="event-price-link">
          {teamBlock}
        </Link>
      ) : (
        teamBlock
      )}
      {detail && game ? (
        <div className="lab">
          {side.side === "yes" ? "Away" : "Home"}
        </div>
      ) : null}
      {vacant ? (
        eventHref ? (
          <Link href={eventHref} className="empty event-price-link">
            No verified pundit pick yet
          </Link>
        ) : (
          <div className="empty">No verified pundit pick yet</div>
        )
      ) : (
        side.calls.map((c) => {
          const p = byId[c.punditId];
          if (!p) return null;
          return (
            <FaceRow
              key={c.id}
              call={c}
              pundit={p}
              detail={detail}
              eventSlug={eventSlug}
            />
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
  const when = game ? formatGameWhen(event) : event.contractName;
  const status = eventScanStatus(event, calls);
  const statusLine = eventStatusLine(event, calls);
  const score = finalScoreParts(event, calls);
  const scanMeta = [when, !game ? seasonLabel(event.season) : null].filter(Boolean).join(" · ");
  const detailMeta = [when, !game ? seasonLabel(event.season) : null, asOf]
    .filter(Boolean)
    .join(" · ");
  const teams = loadTeams();
  const futureTeam = !game ? getTeam(event.teamId, teams) : null;

  const kalshiHref = eventKalshiUrl(event);
  const freezeHref = kalshiHref ?? event.sourceUrl;
  const eventHref = `/picks/${event.slug}`;
  const eventLinkLabel = `${event.title}. ${yes.label} ${formatCents(yes.cents)}${yes.calls.length ? "" : ", no verified pundit pick yet"}. ${no.label} ${formatCents(no.cents)}${no.calls.length ? "" : ", no verified pundit pick yet"}`;

  return (
    <article
      className={`event ${fight ? "fight" : ""} ${permalink ? "event-link" : ""} ${detail ? "event-detail" : "event-scan"} ${status === "final" ? "event-settled" : status === "grading" ? "event-grading" : "event-open"}`}
      data-kickoff={game ? event.kickoffDate : undefined}
    >
      <div className="event-head">
        <div>
          {detail && kalshiHref ? (
            <a
              href={kalshiHref}
              target="_blank"
              rel="noreferrer"
              className="kalshi-tag type-broadcast"
            >
              Kalshi
            </a>
          ) : (
            <div className="kalshi-tag type-broadcast">Kalshi</div>
          )}
          {detail ? null : (
            <h2 className="type-broadcast event-title">
              {permalink ? (
                <Link
                  href={eventHref}
                  className="event-title-link"
                  aria-label={eventLinkLabel}
                >
                  {futureTeam ? <TeamChip team={futureTeam} /> : null}
                  <span>{event.title}</span>
                </Link>
              ) : (
                <>
                  {futureTeam ? <TeamChip team={futureTeam} /> : null}
                  <span>{event.title}</span>
                </>
              )}
            </h2>
          )}
          {detail && futureTeam ? (
            <div className="who event-future-team">
              <TeamChip team={futureTeam} />
              <span className="scan-name type-broadcast">{futureTeam.name}</span>
            </div>
          ) : null}
          <div className="meta">
            {game && status === "open" ? (
              <span className="kick-tag type-broadcast">Open</span>
            ) : null}
            {game && status === "open" ? <KickoffTag date={event.kickoffDate} /> : null}
            {detail ? detailMeta : scanMeta}
          </div>
        </div>
        {detail && freezeHref ? (
          <a
            href={freezeHref}
            target="_blank"
            rel="noreferrer"
            className="see freeze-src"
          >
            Price source{asOf ? ` · ${asOf}` : ""} →
          </a>
        ) : null}
      </div>
      {status !== "open" ? (
        <div className="event-final type-broadcast">{statusLine}</div>
      ) : null}
      <div className="sides">
        <SideCol
          side={yes}
          pundits={pundits}
          teams={teams}
          detail={detail}
          game={game}
          eventSlug={event.slug}
          settled={status === "final"}
          eventHref={permalink ? eventHref : undefined}
        />
        <SideCol
          side={no}
          pundits={pundits}
          teams={teams}
          detail={detail}
          game={game}
          eventSlug={event.slug}
          settled={status === "final"}
          eventHref={permalink ? eventHref : undefined}
        />
      </div>
      {detail ? (
        <details className="market-details">
          <summary>Market details</summary>
          <p>
            {game
              ? `The away side is ${yes.label}; the home side is ${no.label}.`
              : "Takes it and Against are the two market sides."}{" "}
            Frozen at {formatCents(event.yesCents)} / {formatCents(event.noCents)}
            {asOf ? ` ${asOf}` : ""}. Hypothetical $100 at that freeze — not a bet
            the pundit placed.
          </p>
          <p>
            <Link href="/methodology/">How grading works →</Link>
          </p>
          {kalshiHref ? (
            <p>
              {event.ticker ? (
                <>
                  Contract {event.ticker}.{" "}
                </>
              ) : null}
              <a href={kalshiHref} target="_blank" rel="noreferrer">
                Open on Kalshi →
              </a>
            </p>
          ) : null}
        </details>
      ) : permalink ? (
        <Link href={eventHref} className="see-why">
          See why →
        </Link>
      ) : null}
    </article>
  );
}
