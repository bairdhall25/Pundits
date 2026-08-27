import type { CallStatus, Side, Sport } from "./types";

export type StoryKind = "game" | "future";

export type StoryCard = {
  href: string;
  headline: string;
  quote: string;
  name: string;
  photo: string;
  outlet: string;
  date: string | null;
  sport: Sport;
  kind: StoryKind;
  eventTitle: string;
  kickoff: string | null;
  side: Side;
  sideChip: string;
  cents: number | null;
  status: CallStatus;
  eventSlug: string;
  punditId: string;
};

export function storyHaystack(card: StoryCard): string {
  return [
    card.headline,
    card.quote,
    card.name,
    card.outlet,
    card.eventTitle,
    card.sideChip,
  ]
    .join(" ")
    .toLowerCase();
}
