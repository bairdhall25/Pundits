import { gamesForWeek, takesOnTeam, weekRecord } from "./archive";
import { formatCents, formatGameWhen } from "./format";
import { finalScoreLine, getTeam, sidesForCard } from "./data";
import { sideChip, takeHeadline, type MappedTake } from "./seo";
import { canonicalUrl, ogImage, takePath } from "./site";
import type { ActivityRecord, Call, CallStatus, CardSide, Event, Pundit, Sport, Team } from "./types";

export type OgChip = {
  abbr: string;
  primary: string;
  ink: string;
};

export type OgFace = {
  name: string;
  photo: string;
  quote?: string;
};

export type OgSide = {
  label: string;
  cents: string;
  chip: OgChip | null;
  faces: OgFace[];
  empty: boolean;
  picked: boolean;
};

export type TakeOgCard = {
  kind: "take";
  file: string;
  kicker: string;
  headline: string;
  quote: string;
  when: string | null;
  photo: string;
  name: string;
  status: CallStatus;
  result: string | null;
  sides: [OgSide, OgSide];
};

export type EventOgCard = {
  kind: "event";
  file: string;
  title: string;
  when: string | null;
  sides: [OgSide, OgSide];
};

export type PunditOgCard = {
  kind: "pundit";
  file: string;
  name: string;
  outlet: string;
  photo: string;
  livePicks: number;
  wins: number;
  losses: number;
  recordLabel: string;
  latestQuote: string | null;
};

export type TeamOgCard = {
  kind: "team";
  file: string;
  name: string;
  sport: string;
  chip: OgChip;
  withThem: number;
  against: number;
  withFaces: OgFace[];
  againstFaces: OgFace[];
};

export type WeekOgCard = {
  kind: "week";
  file: string;
  kicker: string;
  title: string;
  line: string;
  games: string[];
};

export function ogTakePath(slug: string, punditId: string): string {
  return `/og/takes/${slug}--${punditId}.png`;
}

export function ogEventPath(slug: string): string {
  return `/og/events/${slug}.png`;
}

export function ogPunditPath(id: string): string {
  return `/og/pundits/${id}.png`;
}

export function ogTeamPath(id: string): string {
  return `/og/teams/${id}.png`;
}

export function ogWeekPath(sport: Sport, season: number, week: number): string {
  return `/og/weeks/${sport}-${season}-week-${week}.png`;
}

export function ogStoryTakePath(slug: string, punditId: string): string {
  return `/og/stories/takes/${slug}--${punditId}.png`;
}

export function ogStoryEventPath(slug: string): string {
  return `/og/stories/events/${slug}.png`;
}

export function ogStoryPunditPath(id: string): string {
  return `/og/stories/pundits/${id}.png`;
}

export function ogQuote(claim: string, max = 140): string {
  const trimmed = claim.replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  const window = trimmed.slice(0, max);
  const stop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (stop >= max * 0.45) return window.slice(0, stop).trim();
  return `${window.replace(/\s+\S*$/, "")}…`;
}

export function takeTweetText(card: TakeOgCard, slug: string, punditId: string): string {
  const [yes, no] = card.sides;
  const price = `${yes.label} ${yes.cents} · ${no.label} ${no.cents}`;
  return [
    card.headline,
    "",
    `“${ogQuote(card.quote, 160)}”`,
    "",
    price,
    card.when,
    canonicalUrl(takePath(slug, punditId)),
  ]
    .filter((line) => line != null)
    .join("\n");
}

function ogCacheVersion(value: unknown): string {
  const input = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function ogImageFor(path: string, alt: string, cacheKey?: unknown) {
  const url = canonicalUrl(path);
  return {
    ...ogImage(),
    url: cacheKey == null ? url : `${url}?v=${ogCacheVersion(cacheKey)}`,
    alt,
  };
}

function chipFor(team: Team | null): OgChip | null {
  if (!team) return null;
  return { abbr: team.abbr, primary: team.primary, ink: team.ink };
}

function facesOn(side: CardSide, pundits: Pundit[]): OgFace[] {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const out: OgFace[] = [];
  for (const call of side.calls) {
    const p = byId[call.punditId];
    if (!p || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push({ name: p.name, photo: p.photo, quote: call.claim });
  }
  return out;
}

function ogLabel(event: Event, side: CardSide): string {
  const chip = sideChip(event, side.side);
  if (chip === "Takes it" || chip === "Against") return chip;
  return side.label;
}

function toOgSide(
  event: Event,
  side: CardSide,
  pundits: Pundit[],
  teams: Team[],
  picked: boolean
): OgSide {
  const team = getTeam(side.teamId, teams) ?? (side.side === "yes" ? getTeam(event.teamId, teams) : null);
  const faces = facesOn(side, pundits);
  return {
    label: ogLabel(event, side),
    cents: formatCents(side.cents),
    chip: chipFor(team),
    faces,
    empty: faces.length === 0,
    picked,
  };
}

export function takeOgCard(
  take: MappedTake,
  calls: Call[],
  pundits: Pundit[],
  teams: Team[]
): TakeOgCard {
  const [yes, no] = sidesForCard(take.event, calls);
  return {
    kind: "take",
    file: ogTakePath(take.event.slug, take.pundit.id),
    kicker: take.pundit.outlet,
    headline: takeHeadline(take.pundit, take.event, take.call),
    quote: take.call.claim,
    when: formatGameWhen(take.event),
    photo: take.pundit.photo,
    name: take.pundit.name,
    status: take.call.status,
    result: finalScoreLine(take.event, calls),
    sides: [
      toOgSide(take.event, yes, pundits, teams, take.call.side === "yes"),
      toOgSide(take.event, no, pundits, teams, take.call.side === "no"),
    ],
  };
}

export function eventOgCard(
  event: Event,
  calls: Call[],
  pundits: Pundit[],
  teams: Team[]
): EventOgCard {
  const [yes, no] = sidesForCard(event, calls);
  return {
    kind: "event",
    file: ogEventPath(event.slug),
    title: event.title,
    when: formatGameWhen(event),
    sides: [
      toOgSide(event, yes, pundits, teams, false),
      toOgSide(event, no, pundits, teams, false),
    ],
  };
}

export function punditOgCard(
  pundit: ActivityRecord,
  latest?: Call
): PunditOgCard {
  return {
    kind: "pundit",
    file: ogPunditPath(pundit.id),
    name: pundit.name,
    outlet: pundit.outlet,
    photo: pundit.photo,
    livePicks: pundit.mappedPending,
    wins: pundit.season2026.wins,
    losses: pundit.season2026.losses,
    recordLabel:
      pundit.season2026.wins === 0 && pundit.season2026.losses === 0
        ? "—"
        : `${pundit.season2026.wins}–${pundit.season2026.losses}`,
    latestQuote: latest?.claim ?? null,
  };
}

function facesFromCalls(calls: Call[], pundits: Pundit[]): OgFace[] {
  const byId = Object.fromEntries(pundits.map((pundit) => [pundit.id, pundit]));
  const seen = new Set<string>();
  const out: OgFace[] = [];
  for (const call of calls) {
    const pundit = byId[call.punditId];
    if (!pundit || seen.has(pundit.id)) continue;
    seen.add(pundit.id);
    out.push({ name: pundit.name, photo: pundit.photo, quote: call.claim });
  }
  return out;
}

export function teamOgCard(
  team: Team,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): TeamOgCard {
  const takes = takesOnTeam(team.id, events, calls);
  return {
    kind: "team",
    file: ogTeamPath(team.id),
    name: team.name,
    sport: team.sport === "nfl" ? "NFL" : "College football",
    chip: { abbr: team.abbr, primary: team.primary, ink: team.ink },
    withThem: takes.for.length,
    against: takes.against.length,
    withFaces: facesFromCalls(takes.for, pundits),
    againstFaces: facesFromCalls(takes.against, pundits),
  };
}

export function weekOgCard(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[]
): WeekOgCard {
  const games = gamesForWeek(sport, season, week, events);
  const record = weekRecord(games, calls);
  const graded = record.hits + record.misses > 0;
  return {
    kind: "week",
    file: ogWeekPath(sport, season, week),
    kicker: sport === "nfl" ? "NFL" : "College football",
    title: `Week ${week} expert picks`,
    line: graded
      ? `Experts went ${record.hits}–${record.misses}`
      : `${games.length} game${games.length === 1 ? "" : "s"} · ${record.pending} open pick${record.pending === 1 ? "" : "s"}`,
    games: games.map((game) => game.title),
  };
}
