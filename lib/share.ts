import { settledSide, sidesForCard } from "./data";
import { quotedEvidenceText } from "./evidence";
import { formatAsOf, formatCents, formatGameDate, seasonSpan } from "./format";
import type { ActivityRecord, Call, Event, Pundit } from "./types";

export { sharePayload, tweetIntent, type SharePayload } from "./share-link";

export function namesOn(sideCalls: Call[], pundits: Pundit[]): string[] {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p.name]));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of sideCalls) {
    const name = byId[c.punditId];
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

export function andList(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function picksLine(names: string[], team: string, past = false): string | null {
  if (!names.length) return null;
  const verb = past ? "picked" : names.length === 1 ? "picks" : "pick";
  return `${andList(names)} ${verb} ${team}`;
}

function clipClaim(claim: string, max = 180): string {
  const trimmed = claim.replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function homeHeroLede(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): string {
  const [yes, no] = sidesForCard(event, calls);
  const yesNames = namesOn(yes.calls, pundits);
  const noNames = namesOn(no.calls, pundits);
  if (!event.awayTeam || !event.homeTeam) {
    return "No verified pick yet.";
  }
  const bits = [
    picksLine(noNames, event.homeTeam),
    picksLine(yesNames, event.awayTeam),
    yesNames.length ? null : `Nobody on ${event.awayTeam} yet`,
    noNames.length || !yesNames.length ? null : `Nobody on ${event.homeTeam} yet`,
  ].filter(Boolean);
  if (!bits.length) return `No verified pick on ${event.title} yet.`;
  return `${bits.join(". ")}.`;
}

export function eventShare(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): { title: string; description: string } {
  const [yes, no] = sidesForCard(event, calls);
  const asOf = formatAsOf(event.sourcedAt);
  const when = event.kickoffDate
    ? formatGameDate(event.kickoffDate)
    : seasonSpan(event.season);
  const title = when
    ? `${event.title} expert picks · ${when}`
    : `${event.title} expert picks`;

  const yesNames = namesOn(yes.calls, pundits);
  const noNames = namesOn(no.calls, pundits);

  if (event.awayTeam && event.homeTeam) {
    // Once the game settles, searchers want the answer, not the preview.
    const winnerSide = settledSide(event, calls);
    const winner =
      winnerSide === "yes" ? event.awayTeam : winnerSide === "no" ? event.homeTeam : null;
    const loser = winnerSide === "yes" ? event.homeTeam : event.awayTeam;
    const pendingTitle = when
      ? `${event.title}: who picked whom · ${when}`
      : `${event.title}: who picked whom`;
    const settledTitle = winner ? `${winner} beat ${loser}: who called it` : pendingTitle;
    const who = [
      picksLine(noNames, event.homeTeam, Boolean(winner)),
      picksLine(yesNames, event.awayTeam, Boolean(winner)),
    ].filter(Boolean);
    if (!yesNames.length) who.push(`Nobody on ${event.awayTeam} yet`);
    if (!noNames.length && yesNames.length) who.push(`Nobody on ${event.homeTeam} yet`);
    if (!yesNames.length && !noNames.length) {
      who.length = 0;
      who.push("No verified expert picks yet");
    }
    const description = [
      winner ? `Final: ${winner} won` : null,
      ...who,
      `${event.homeTeam} ${formatCents(no.cents)}, ${event.awayTeam} ${formatCents(yes.cents)} on Kalshi`,
      asOf,
    ]
      .filter(Boolean)
      .join(". ");
    return { title: settledTitle, description };
  }

  const who = [
    yesNames.length
      ? `${andList(yesNames)} ${yesNames.length === 1 ? "takes" : "take"} ${event.title}`
      : null,
    noNames.length
      ? `${andList(noNames)} ${noNames.length === 1 ? "is" : "are"} against`
      : null,
  ].filter(Boolean);
  if (!who.length) who.push("No verified expert picks yet");
  const description = [
    ...who,
    `${formatCents(event.yesCents)} / ${formatCents(event.noCents)} on Kalshi`,
    asOf,
  ]
    .filter(Boolean)
    .join(". ");
  return { title, description };
}

export function punditShare(
  pundit: Pick<ActivityRecord, "name" | "outlet" | "mappedPending" | "season2026">,
  latest?: Call,
  options: { showRecord?: boolean } = {}
): { title: string; description: string } {
  const showRecord =
    options.showRecord ?? pundit.season2026.wins + pundit.season2026.losses > 0;
  const graded = pundit.season2026.wins + pundit.season2026.losses;
  const bits = [
    `${pundit.name} on ${pundit.outlet}`,
    "Current mapped picks and the 2026 tracked record on Pundits.Pro",
    showRecord
      ? `2026 tracked record ${pundit.season2026.wins}–${pundit.season2026.losses} on ${graded} graded pick${graded === 1 ? "" : "s"}`
      : null,
    pundit.mappedPending
      ? `${pundit.mappedPending} open pick${pundit.mappedPending === 1 ? "" : "s"}`
      : null,
    latest
      ? `Latest: ${quotedEvidenceText({ ...latest, claim: clipClaim(latest.claim) })}`
      : null,
  ].filter(Boolean);
  return {
    title: `${pundit.name}: current picks and tracked record`,
    description: `${bits.join(". ")}.`,
  };
}
