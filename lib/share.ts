import { sidesForCard } from "./data";
import { formatAsOf, formatCents, formatGameDate, seasonSpan } from "./format";
import { canonicalUrl } from "./site";
import type { ActivityRecord, Call, Event, Pundit } from "./types";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  image: string;
  story: string;
  tweetHref: string;
};

export function tweetIntent(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function sharePayload(input: {
  title: string;
  text: string;
  path: string;
  image: string;
  story: string;
}): SharePayload {
  const url = canonicalUrl(input.path);
  return {
    title: input.title,
    text: input.text,
    url,
    image: input.image,
    story: input.story,
    tweetHref: tweetIntent(input.text, url),
  };
}

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

function andList(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function picksLine(names: string[], team: string): string | null {
  if (!names.length) return null;
  const verb = names.length === 1 ? "picks" : "pick";
  return `${andList(names)} ${verb} ${team}`;
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
    const who = [
      picksLine(noNames, event.homeTeam),
      picksLine(yesNames, event.awayTeam),
    ].filter(Boolean);
    if (!yesNames.length) who.push(`Nobody on ${event.awayTeam} yet`);
    if (!noNames.length && yesNames.length) who.push(`Nobody on ${event.homeTeam} yet`);
    if (!yesNames.length && !noNames.length) {
      who.length = 0;
      who.push("No verified expert picks yet");
    }
    const description = [
      ...who,
      `${event.homeTeam} ${formatCents(no.cents)}, ${event.awayTeam} ${formatCents(yes.cents)} on Kalshi`,
      asOf,
    ]
      .filter(Boolean)
      .join(". ");
    return { title, description };
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
  latest?: Call
): { title: string; description: string } {
  const bits = [
    `${pundit.name} expert picks`,
    pundit.outlet,
    `2026 record ${pundit.season2026.wins}–${pundit.season2026.losses}`,
    pundit.mappedPending
      ? `${pundit.mappedPending} live pick${pundit.mappedPending === 1 ? "" : "s"}`
      : null,
    latest ? `Latest: “${clipClaim(latest.claim)}”` : null,
  ].filter(Boolean);
  return { title: `${pundit.name} picks`, description: `${bits.join(". ")}.` };
}
