import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { TeamChip } from "@/components/TeamChip";
import {
  eventHasFight,
  formatAsOf,
  formatCents,
  formatGameWhen,
  getTeam,
  loadTeams,
  seasonLabel,
  settledLabel,
  sidesForCard,
} from "@/lib/data";
import { americanOdds, kickoffTag, statusLabel } from "@/lib/format";
import type { Call, CardSide, Event, Pundit, Team } from "@/lib/types";

function FaceRow({
  call,
  pundit,
  detail,
}: {
  call: Call;
  pundit: Pundit;
  detail: boolean;
}) {
  return (
    <div className="person-block">
      <Link href={`/pundits/${pundit.id}`} className="person person-hit">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="row" />
        <div>
          <div className="nm type-broadcast">
            {pundit.name}
            {call.status !== "pending" ? (
              <span className={`result-chip ${call.status}`}>{statusLabel(call.status)}</span>
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
}: {
  side: CardSide;
  pundits: Pundit[];
  teams: Team[];
  detail: boolean;
  game: boolean;
}) {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const vacant = side.calls.length === 0;
  const team = getTeam(side.teamId, teams);
  const odds = game ? americanOdds(side.cents) : null;
  return (
    <div className={`col ${side.side} ${vacant ? "col-vacant" : ""}`}>
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
      {detail ? (
        <div className="lab">
          {game ? (side.side === "yes" ? "Away" : "Home") : side.side.toUpperCase()}
        </div>
      ) : null}
      {vacant ? (
        <div className="empty">No verified pundit pick yet</div>
      ) : (
        side.calls.map((c) => {
          const p = byId[c.punditId];
          if (!p) return null;
          return <FaceRow key={c.id} call={c} pundit={p} detail={detail} />;
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
  const finalLabel = settledLabel(event, calls);
  const scanMeta = [when, !game ? seasonLabel(event.season) : null].filter(Boolean).join(" · ");
  const detailMeta = [when, !game ? seasonLabel(event.season) : null, asOf]
    .filter(Boolean)
    .join(" · ");
  const teams = loadTeams();
  const futureTeam = !game ? getTeam(event.teamId, teams) : null;
  const tag = game && !finalLabel ? kickoffTag(event.kickoffDate, new Date()) : null;

  return (
    <article
      className={`event ${fight ? "fight" : ""} ${permalink ? "event-link" : ""} ${detail ? "event-detail" : "event-scan"} ${finalLabel ? "event-settled" : ""}`}
    >
      {permalink ? (
        <Link
          href={`/picks/${event.slug}`}
          className="event-hit"
          aria-label={`${event.title}. ${yes.label} ${formatCents(yes.cents)}${yes.calls.length ? "" : ", no verified pundit pick yet"}. ${no.label} ${formatCents(no.cents)}${no.calls.length ? "" : ", no verified pundit pick yet"}`}
        />
      ) : null}
      <div className="event-head">
        <div>
          <div className="kalshi-tag type-broadcast">Kalshi</div>
          {detail ? null : (
            <h2 className="type-broadcast event-title">
              {futureTeam ? <TeamChip team={futureTeam} /> : null}
              {event.title}
            </h2>
          )}
          {detail && futureTeam ? (
            <div className="who event-future-team">
              <TeamChip team={futureTeam} />
              <span className="scan-name type-broadcast">{futureTeam.name}</span>
            </div>
          ) : null}
          <div className="meta">
            {tag ? <span className="kick-tag type-broadcast">{tag}</span> : null}
            {detail ? detailMeta : scanMeta}
          </div>
        </div>
        {detail && event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="see freeze-src"
          >
            Price source{asOf ? ` · ${asOf}` : ""} →
          </a>
        ) : null}
      </div>
      {finalLabel ? (
        <div className="event-final type-broadcast">Final · {finalLabel}</div>
      ) : null}
      <div className="sides">
        <SideCol side={yes} pundits={pundits} teams={teams} detail={detail} game={game} />
        <SideCol side={no} pundits={pundits} teams={teams} detail={detail} game={game} />
      </div>
      {detail ? (
        <details className="market-details">
          <summary>Market details</summary>
          <p>
            {game
              ? `YES means ${yes.label} wins. NO means ${no.label} wins.`
              : "YES and NO are the Kalshi contract sides."}{" "}
            Frozen at {formatCents(event.yesCents)} / {formatCents(event.noCents)}
            {asOf ? ` ${asOf}` : ""}. Hypothetical $100 at that freeze — not a bet
            the pundit placed.
          </p>
        </details>
      ) : permalink ? (
        <div className="see-why">See why →</div>
      ) : null}
    </article>
  );
}
