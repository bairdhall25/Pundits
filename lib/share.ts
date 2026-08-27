import { sidesForCard } from "./data";
import { formatAsOf, formatCents, formatGameDate, seasonSpan } from "./format";
import type { ActivityRecord, Call, Event, Pundit } from "./types";

function namesOn(sideCalls: Call[], pundits: Pundit[]): string[] {
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

function list(names: string[]): string {
  return names.length ? names.join(", ") : "nobody yet";
}

function clipClaim(claim: string, max = 180): string {
  const trimmed = claim.replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function eventShare(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): { title: string; description: string } {
  const [yes, no] = sidesForCard(event, calls);
  const tape =
    event.awayTeam && event.homeTeam
      ? `YES ${event.awayTeam} ${formatCents(yes.cents)} · NO ${event.homeTeam} ${formatCents(no.cents)}`
      : `${event.contractName} · Yes ${formatCents(event.yesCents)} · No ${formatCents(event.noCents)}`;
  const asOf = formatAsOf(event.sourcedAt);
  const description = [
    tape,
    `YES: ${list(namesOn(yes.calls, pundits))}`,
    `NO: ${list(namesOn(no.calls, pundits))}`,
    asOf,
  ]
    .filter(Boolean)
    .join(". ");
  const when = event.kickoffDate
    ? formatGameDate(event.kickoffDate)
    : seasonSpan(event.season);
  return {
    title: when ? `${event.title} picks · ${when}` : `${event.title} picks`,
    description,
  };
}

export function punditShare(
  pundit: Pick<ActivityRecord, "name" | "outlet" | "mappedPending" | "season2026">,
  latest?: Call
): { title: string; description: string } {
  const bits = [
    pundit.outlet,
    `2026 ${pundit.season2026.wins}–${pundit.season2026.losses}`,
    pundit.mappedPending
      ? `${pundit.mappedPending} live pick${pundit.mappedPending === 1 ? "" : "s"}`
      : null,
    latest ? `Latest: “${clipClaim(latest.claim)}”` : null,
  ].filter(Boolean);
  return { title: pundit.name, description: `${bits.join(". ")}.` };
}
