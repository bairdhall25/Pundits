import {
  eventKind,
  settledSide,
  sidesForCard,
  toActivityRecord,
} from "./data";
import {
  ogEventPath,
  ogPunditPath,
  ogStoryEventPath,
  ogStoryPunditPath,
  ogStoryTakePath,
  ogTakePath,
} from "./og";
import { mappedTakes, sideChip } from "./seo";
import type { Call, CallStatus, Event, Pundit, Side, Sport } from "./types";

const SITE = "https://pundits.pro";

export type SocialEventRow = {
  slug: string;
  title: string;
  sport: Sport;
  kind: "game" | "future";
  week?: number;
  kickoff?: string;
  kickoffDate?: string;
  yesCents: number | null;
  noCents: number | null;
  awayTeam?: string;
  homeTeam?: string;
  settled: boolean;
  yesPundits: string[];
  noPundits: string[];
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialTakeRow = {
  eventSlug: string;
  punditId: string;
  punditName: string;
  status: CallStatus;
  side: Side;
  sideLabel: string;
  cents: number | null;
  claim: string;
  sourceDate: string;
  gradedAt?: string;
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialPunditRow = {
  id: string;
  name: string;
  outlet: string;
  wins: number;
  losses: number;
  pending: number;
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialIndex = {
  generatedAt: string;
  site: string;
  events: SocialEventRow[];
  takes: SocialTakeRow[];
  pundits: SocialPunditRow[];
};

function names(punditIds: string[], pundits: Pundit[]): string[] {
  const byId = new Map(pundits.map((p) => [p.id, p.name]));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of punditIds) {
    const name = byId.get(id);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

export function socialIndex(
  calls: Call[],
  events: Event[],
  pundits: Pundit[],
  generatedAt: string = new Date().toISOString()
): SocialIndex {
  const eventRows: SocialEventRow[] = events.map((event) => {
    const [yes, no] = sidesForCard(event, calls);
    return {
      slug: event.slug,
      title: event.title,
      sport: event.sport,
      kind: eventKind(event),
      week: event.week,
      kickoff: event.kickoff,
      kickoffDate: event.kickoffDate,
      yesCents: event.yesCents,
      noCents: event.noCents,
      awayTeam: event.awayTeam,
      homeTeam: event.homeTeam,
      settled: settledSide(event, calls) !== null,
      yesPundits: names(yes.calls.map((c) => c.punditId), pundits),
      noPundits: names(no.calls.map((c) => c.punditId), pundits),
      pageUrl: `${SITE}/picks/${event.slug}/`,
      ogCard: `${SITE}${ogEventPath(event.slug)}`,
      storyCard: `${SITE}${ogStoryEventPath(event.slug)}`,
    };
  });

  const takeRows: SocialTakeRow[] = mappedTakes(calls, events, pundits).map(
    ({ call, event, pundit }) => {
      const side = call.side ?? "no";
      return {
        eventSlug: event.slug,
        punditId: pundit.id,
        punditName: pundit.name,
        status: call.status,
        side,
        sideLabel: sideChip(event, side),
        cents: side === "yes" ? event.yesCents : event.noCents,
        claim: call.claim,
        sourceDate: call.sourceDate,
        gradedAt: call.gradedAt,
        pageUrl: `${SITE}/picks/${event.slug}/${pundit.id}/`,
        ogCard: `${SITE}${ogTakePath(event.slug, pundit.id)}`,
        storyCard: `${SITE}${ogStoryTakePath(event.slug, pundit.id)}`,
      };
    }
  );

  const punditRows: SocialPunditRow[] = pundits.map((pundit) => {
    const record = toActivityRecord(pundit, calls);
    return {
      id: pundit.id,
      name: pundit.name,
      outlet: pundit.outlet,
      wins: record.season2026.wins,
      losses: record.season2026.losses,
      pending: record.season2026.pending,
      pageUrl: `${SITE}/pundits/${pundit.id}/`,
      ogCard: `${SITE}${ogPunditPath(pundit.id)}`,
      storyCard: `${SITE}${ogStoryPunditPath(pundit.id)}`,
    };
  });

  return { generatedAt, site: SITE, events: eventRows, takes: takeRows, pundits: punditRows };
}
