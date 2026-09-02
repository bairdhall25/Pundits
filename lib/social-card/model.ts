import type { CallStatus, Side, Sport } from "../types";

export type SocialArchetype = "split" | "quote" | "editorial";

export type SocialState =
  | "pending"
  | "hit"
  | "miss"
  | "partial"
  | "final"
  | "evergreen";

export type SocialFormat = "landscape" | "story";

export type PortraitFocus = {
  /** Horizontal focal point, normalized from 0 (left) to 1 (right). */
  x: number;
  /** Vertical focal point, normalized from 0 (top) to 1 (bottom). */
  y: number;
};

export type PortraitPresentation = {
  punditId: string;
  focus?: PortraitFocus;
  featuredScale?: number;
};

export type SocialPerson = {
  punditId: string;
  name: string;
  outlet: string;
  portrait: string | null;
  portraitFocus?: PortraitFocus;
  featuredScale?: number;
  quote?: string;
  status?: CallStatus;
};

export type SocialPeopleGroup = {
  /** People selected for this concrete format. */
  people: SocialPerson[];
  /** Total distinct people represented by the source data. */
  total: number;
  /** People not shown in `people`; render this explicitly as +N. */
  overflow: number;
};

export type SocialTeamChip = {
  abbr: string;
  primary: string;
  ink: string;
};

export type SocialSide = {
  /** Internal mapping key. Never use this value as public copy. */
  side: Side;
  label: string;
  cents: number | null;
  chip: SocialTeamChip | null;
  people: SocialPeopleGroup;
  empty: boolean;
  picked?: boolean;
};

export type SocialMetric = {
  label: string;
  value: string;
  tone?: "default" | "accent" | "muted";
};

export type SocialEditorialGroup = {
  label: string;
  count: number;
  people: SocialPeopleGroup;
  tone?: "default" | "accent" | "muted";
};

export type SocialResult = {
  label: string;
  detail?: string;
  tone: "hit" | "miss" | "neutral";
};

type SocialCardBase = {
  format: SocialFormat;
  state: SocialState;
  kicker: string;
  headline: string;
  context: string | null;
  proof: string[];
  disclosure: string;
};

export type SplitSocialCardModel = SocialCardBase & {
  archetype: "split";
  mode: "game" | "future";
  sport: Sport;
  sides: [SocialSide, SocialSide];
  result: SocialResult | null;
};

export type QuoteSocialCardModel = SocialCardBase & {
  archetype: "quote";
  mode: "take" | "pundit";
  subject: SocialPerson;
  quote: string | null;
  quoteExcerpt: string | null;
  metrics: SocialMetric[];
  sides: [SocialSide, SocialSide] | null;
  result: SocialResult | null;
};

export type EditorialSocialCardModel = SocialCardBase & {
  archetype: "editorial";
  mode: "event-empty" | "team" | "week" | "page";
  metrics: SocialMetric[];
  people: SocialPeopleGroup | null;
  groups: SocialEditorialGroup[];
  feature: {
    kicker: string;
    headline: string;
    context?: string;
  } | null;
};

export type SocialCardModel =
  | SplitSocialCardModel
  | QuoteSocialCardModel
  | EditorialSocialCardModel;

export const SOCIAL_DISCLOSURES = {
  picks: "Mapped takes · not bets they placed",
  prices: "Frozen market snapshot · not live odds",
  evidence: "Real quotes · sources · final receipts",
} as const;

export function socialPeopleGroup(
  people: SocialPerson[],
  limit: number
): SocialPeopleGroup {
  const safeLimit = Math.max(0, Math.floor(limit));
  return {
    people: people.slice(0, safeLimit),
    total: people.length,
    overflow: Math.max(0, people.length - safeLimit),
  };
}

export function quoteExcerpt(claim: string, max = 160): string {
  const trimmed = claim.replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  const window = trimmed.slice(0, max);
  const stop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
    window.lastIndexOf(", ")
  );
  if (stop >= max * 0.45) return window.slice(0, stop).trim();
  return `${window.replace(/\s+\S*$/, "")}…`;
}
