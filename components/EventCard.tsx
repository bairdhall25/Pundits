import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { TeamChip } from "@/components/TeamChip";
import { TrackAnchor, TrackLink } from "@/components/TrackLink";
import {
  eventDetailOpenParams,
  sourceOpenParams,
  type EngagementSurface,
} from "@/lib/analytics";
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
import { MarketDetails } from "@/components/MarketDetails";
import { americanOdds, statusChipText } from "@/lib/format";
import { eventKalshiUrl } from "@/lib/kalshi";
import { mappedHardCallsForEvent } from "@/lib/featured";
import { isVsGame } from "@/lib/public-side";
import { takePath } from "@/lib/seo";
import type { Call, CardSide, Event, Pundit, Team } from "@/lib/types";

export function CompactEventCard({
  event,
  calls,
  pundits,
  surface = "event",
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
  surface?: EngagementSurface;
}) {
  const [yes, no] = sidesForCard(event, calls);
  const eventHref = `/picks/${event.slug}`;
  const status = eventScanStatus(event, calls);
  const byId = new Map(pundits.map((pundit) => [pundit.id, pundit]));
  const eligible = mappedHardCallsForEvent(event, calls).filter((call) => {
    const pundit = byId.get(call.punditId);
    return Boolean(pundit?.photo.trim());
  });
  const uniquePicks = Array.from(
    new Map(eligible.map((call) => [call.punditId, call])).values()
  );
  const sideLabels = { yes: yes.label, no: no.label };
  const pickCount = uniquePicks.length;

  return (
    <article
      className={`compact-event ${eventHasFight(event.slug, calls) ? "fight" : ""}`}
      data-kickoff={event.kickoffDate}
    >
      <div className="compact-event-main">
        <div className="compact-event-copy">
          <h3 className="compact-event-title type-broadcast">
            <TrackLink
              href={eventHref}
              event="event_detail_open"
              params={eventDetailOpenParams({
                eventSlug: event.slug,
                sport: event.sport,
                surface,
              })}
            >
              {event.title}
            </TrackLink>
          </h3>
          <div className="compact-event-meta">
            {status === "open" ? <KickoffTag date={event.kickoffDate} /> : null}
            <span>
              {status === "open"
                ? formatGameWhen(event)
                : eventStatusLine(event, calls)}
            </span>
          </div>
        </div>
        <Link
          href={eventHref}
          className="compact-event-market"
          aria-label={`${event.title} frozen market: ${yes.label} ${formatCents(yes.cents)}, ${no.label} ${formatCents(no.cents)}`}
        >
          {[yes, no].map((side) => (
            <span key={side.side} className="compact-market-side">
              <span>{side.label}</span>
              <strong className="type-broadcast">{formatCents(side.cents)}</strong>
            </span>
          ))}
        </Link>
      </div>
      <div className="compact-event-picks">
        <span className="compact-event-count">
          {pickCount} verified {pickCount === 1 ? "pick" : "picks"}
        </span>
        <div className="compact-event-links" aria-label={`Picks for ${event.title}`}>
          {uniquePicks.map((call) => {
            const pundit = byId.get(call.punditId);
            if (!pundit || !call.side) return null;
            return (
              <Link key={call.id} href={takePath(event.slug, pundit.id)}>
                {pundit.name} → {sideLabels[call.side]}
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function FaceRow({
  call,
  pundit,
  detail,
  eventSlug,
}: {
  call: Call;
  pundit: Pundit;
  detail: boolean;
  eventSlug: string;
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
          <div className="src-meta-line">
            {call.source}
            {call.sourceDate ? ` · ${call.sourceDate}` : ""}
          </div>
          <div className="src-actions">
            {call.sourceUrl ? (
              <TrackAnchor
                href={call.sourceUrl}
                event="source_open"
                params={sourceOpenParams({
                  eventSlug,
                  punditId: pundit.id,
                  sourceType: "evidence",
                })}
              >
                Open source →
              </TrackAnchor>
            ) : null}
            {eventSlug ? (
              <Link href={takePath(eventSlug, pundit.id)}>Full take →</Link>
            ) : null}
          </div>
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
  vsGame,
  eventSlug,
  settled = false,
  eventHref,
}: {
  side: CardSide;
  pundits: Pundit[];
  teams: Team[];
  detail: boolean;
  game: boolean;
  vsGame: boolean;
  eventSlug: string;
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
      {detail && game && !vsGame ? (
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
  surface = "event",
}: {
  event: Event;
  calls: Call[];
  pundits: Pundit[];
  permalink?: boolean;
  detail?: boolean;
  surface?: EngagementSurface;
}) {
  const [yes, no] = sidesForCard(event, calls);
  const fight = eventHasFight(event.slug, calls);
  const game = event.kind === "game";
  const vsGame = isVsGame(event);
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
          {detail ? (
            kalshiHref ? (
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
            )
          ) : null}
          {detail ? null : (
            <h2 className="type-broadcast event-title">
              {permalink ? (
                <TrackLink
                  href={eventHref}
                  className="event-title-link"
                  ariaLabel={eventLinkLabel}
                  event="event_detail_open"
                  params={eventDetailOpenParams({
                    eventSlug: event.slug,
                    sport: event.sport,
                    surface,
                  })}
                >
                  {futureTeam ? <TeamChip team={futureTeam} /> : null}
                  <span>{event.title}</span>
                </TrackLink>
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
          vsGame={vsGame}
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
          vsGame={vsGame}
          eventSlug={event.slug}
          settled={status === "final"}
          eventHref={permalink ? eventHref : undefined}
        />
      </div>
      {detail ? (
        <MarketDetails>
          <p>
            {game
              ? isVsGame(event)
                ? `${event.title}${event.network ? ` · ${event.network}` : ""}. ${yes.label} is the away contract; ${no.label} is the home contract.`
                : `The away side is ${yes.label}; the home side is ${no.label}.`
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
        </MarketDetails>
      ) : permalink ? (
        <Link href={eventHref} className="see-why">
          See why →
        </Link>
      ) : null}
    </article>
  );
}
