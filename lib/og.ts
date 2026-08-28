import { formatCents, formatGameWhen } from "./format";
import { getTeam, sidesForCard } from "./data";
import { sideChip, takeHeadline, type MappedTake } from "./seo";
import { canonicalUrl, ogImage, takePath } from "./site";
import type { Call, CardSide, Event, Pundit, Team } from "./types";

export type OgChip = {
  abbr: string;
  primary: string;
  ink: string;
};

export type OgFace = {
  name: string;
  photo: string;
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
  sides: [OgSide, OgSide];
};

export type EventOgCard = {
  kind: "event";
  file: string;
  title: string;
  when: string | null;
  sides: [OgSide, OgSide];
};

export function ogTakePath(slug: string, punditId: string): string {
  return `/og/takes/${slug}--${punditId}.png`;
}

export function ogEventPath(slug: string): string {
  return `/og/events/${slug}.png`;
}

export function ogQuote(claim: string, max = 140): string {
  const trimmed = claim.replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).replace(/\s+\S*$/, "")}…`;
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

export function ogImageFor(path: string, alt: string) {
  return {
    ...ogImage(),
    url: canonicalUrl(path),
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
    out.push({ name: p.name, photo: p.photo });
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
