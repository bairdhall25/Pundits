import { gamesForWeek, takesOnTeam, weekRecord } from "../archive";
import {
  callsForPundit,
  eventKind,
  eventScanStatus,
  finalScoreLine,
  getTeam,
  isMapped,
  settledLabel,
  sidesForCard,
  toActivityRecord,
} from "../data";
import { formatCents, formatGameWhen } from "../format";
import { takeHeadline, type MappedTake } from "../seo";
import type {
  Call,
  CardSide,
  Event,
  Pundit,
  Side,
  Sport,
  Team,
} from "../types";
import {
  SOCIAL_DISCLOSURES,
  quoteExcerpt,
  socialPeopleGroup,
  type EditorialSocialCardModel,
  type QuoteSocialCardModel,
  type SocialFormat,
  type SocialPeopleGroup,
  type SocialPerson,
  type SocialResult,
  type SocialSide,
  type SocialState,
  type SplitSocialCardModel,
} from "./model";
import { portraitPresentationFor } from "./portraits";

const LANDSCAPE_PEOPLE_LIMIT = 4;
const STORY_PEOPLE_LIMIT = 3;
const WEEK_PEOPLE_LIMIT = 5;

function personLimit(format: SocialFormat): number {
  return format === "story" ? STORY_PEOPLE_LIMIT : LANDSCAPE_PEOPLE_LIMIT;
}

function personFromPundit(pundit: Pundit, call?: Call): SocialPerson {
  const presentation = portraitPresentationFor(pundit.id);
  return {
    punditId: pundit.id,
    name: pundit.name,
    outlet: pundit.outlet,
    portrait: pundit.photo?.trim() || null,
    ...(presentation.focus ? { portraitFocus: presentation.focus } : {}),
    ...(call?.claim ? { quote: call.claim } : {}),
    ...(call?.status ? { status: call.status } : {}),
  };
}

function peopleFromCalls(calls: Call[], pundits: Pundit[]): SocialPerson[] {
  const punditById = new Map(pundits.map((pundit) => [pundit.id, pundit]));
  const seen = new Set<string>();
  const people: SocialPerson[] = [];
  for (const call of calls) {
    const pundit = punditById.get(call.punditId);
    if (!pundit || seen.has(pundit.id)) continue;
    seen.add(pundit.id);
    people.push(personFromPundit(pundit, call));
  }
  return people;
}

function chipForTeam(team: Team | null) {
  return team
    ? { abbr: team.abbr, primary: team.primary, ink: team.ink }
    : null;
}

function futureSideLabel(
  event: Event,
  side: Side,
  teams: Team[]
): string {
  const team = getTeam(event.teamId, teams);
  if (side === "yes") return team?.name ?? event.title;
  if (/\bwins?\b/i.test(event.title)) return "The field";
  if (/\bmakes?\b/i.test(event.title)) return "Misses";
  return "Against";
}

function sideLabel(event: Event, side: CardSide, teams: Team[]): string {
  return eventKind(event) === "game"
    ? side.label
    : futureSideLabel(event, side.side, teams);
}

function socialSide(
  event: Event,
  side: CardSide,
  pundits: Pundit[],
  teams: Team[],
  format: SocialFormat,
  picked?: boolean
): SocialSide {
  const people = peopleFromCalls(side.calls, pundits);
  const teamId =
    eventKind(event) === "game"
      ? side.teamId
      : side.side === "yes"
        ? event.teamId
        : undefined;
  return {
    side: side.side,
    label: sideLabel(event, side, teams),
    cents: side.cents,
    chip: chipForTeam(getTeam(teamId, teams)),
    people: socialPeopleGroup(people, personLimit(format)),
    empty: side.calls.length === 0,
    ...(picked == null ? {} : { picked }),
  };
}

function eventState(event: Event, calls: Call[]): SocialState {
  const status = eventScanStatus(event, calls);
  if (status === "grading") return "partial";
  if (status === "final") return "final";
  return "pending";
}

function eventResult(event: Event, calls: Call[]): SocialResult | null {
  const score = finalScoreLine(event, calls);
  if (score) return { label: "Final", detail: score, tone: "neutral" };
  const winner = settledLabel(event, calls);
  return winner
    ? { label: "Final", detail: `${winner} won`, tone: "neutral" }
    : null;
}

function eventProof(sides: [SocialSide, SocialSide]): string[] {
  const total = sides.reduce((sum, side) => sum + side.people.total, 0);
  return [
    `${total} verified pick${total === 1 ? "" : "s"}`,
    `${sides[0].label} ${formatCents(sides[0].cents)} · ${sides[1].label} ${formatCents(sides[1].cents)}`,
  ];
}

function emptyEventCard(
  event: Event,
  format: SocialFormat,
  sides: [CardSide, CardSide],
  teams: Team[]
): EditorialSocialCardModel {
  const labels = sides.map((side) => sideLabel(event, side, teams));
  return {
    archetype: "editorial",
    mode: "event-empty",
    format,
    state: "pending",
    kicker: eventKind(event) === "game" ? "Event preview" : "Market watch",
    headline: event.title,
    context: formatGameWhen(event),
    metrics: [
      { label: labels[0], value: formatCents(sides[0].cents) },
      { label: labels[1], value: formatCents(sides[1].cents) },
    ],
    people: null,
    groups: [],
    feature: null,
    proof: ["No mapped picks yet", "Frozen market context"],
    disclosure: SOCIAL_DISCLOSURES.prices,
  };
}

export function resolveEventSocialCard(
  event: Event,
  calls: Call[],
  pundits: Pundit[],
  teams: Team[],
  format: SocialFormat = "landscape"
): SplitSocialCardModel | EditorialSocialCardModel {
  const rawSides = sidesForCard(event, calls);
  if (rawSides.every((side) => side.calls.length === 0)) {
    return emptyEventCard(event, format, rawSides, teams);
  }
  const sides: [SocialSide, SocialSide] = [
    socialSide(event, rawSides[0], pundits, teams, format),
    socialSide(event, rawSides[1], pundits, teams, format),
  ];
  return {
    archetype: "split",
    mode: eventKind(event),
    format,
    state: eventState(event, calls),
    sport: event.sport,
    kicker: eventKind(event) === "game" ? "Expert pick split" : "Expert future split",
    headline: event.title,
    context: formatGameWhen(event),
    sides,
    result: eventResult(event, calls),
    proof: eventProof(sides),
    disclosure: SOCIAL_DISCLOSURES.picks,
  };
}

export function resolveTakeSocialCard(
  take: MappedTake,
  calls: Call[],
  pundits: Pundit[],
  teams: Team[],
  format: SocialFormat = "landscape"
): QuoteSocialCardModel {
  const rawSides = sidesForCard(take.event, calls);
  const picked = take.call.side;
  const sides: [SocialSide, SocialSide] = [
    socialSide(
      take.event,
      rawSides[0],
      pundits,
      teams,
      format,
      picked === "yes"
    ),
    socialSide(
      take.event,
      rawSides[1],
      pundits,
      teams,
      format,
      picked === "no"
    ),
  ];
  const pickedSide = picked === "yes" ? sides[0] : sides[1];
  const score = finalScoreLine(take.event, calls);
  const result =
    take.call.status === "pending"
      ? null
      : {
          label: take.call.status === "hit" ? "Hit" : "Miss",
          ...(score ? { detail: score } : {}),
          tone: take.call.status,
        } satisfies SocialResult;
  return {
    archetype: "quote",
    mode: "take",
    format,
    state: take.call.status,
    kicker: take.pundit.outlet,
    headline: takeHeadline(take.pundit, take.event, take.call),
    context: formatGameWhen(take.event),
    subject: personFromPundit(take.pundit, take.call),
    quote: take.call.claim,
    quoteExcerpt: quoteExcerpt(take.call.claim, format === "story" ? 110 : 160),
    metrics: [
      { label: "Picked", value: pickedSide.label },
      { label: "Frozen", value: formatCents(pickedSide.cents) },
    ],
    sides,
    result,
    proof: [
      `${pickedSide.label} ${formatCents(pickedSide.cents)}`,
      take.call.status === "pending" ? "Open pick" : result!.label,
      "Original public quote",
    ],
    disclosure: SOCIAL_DISCLOSURES.picks,
  };
}

export function resolvePunditSocialCard(
  pundit: Pundit,
  calls: Call[],
  format: SocialFormat = "landscape"
): QuoteSocialCardModel {
  const record = toActivityRecord(pundit, calls);
  const latest = callsForPundit(pundit.id, calls).find(isMapped) ?? null;
  const graded = record.season2026.wins + record.season2026.losses;
  return {
    archetype: "quote",
    mode: "pundit",
    format,
    state: "evergreen",
    kicker: pundit.outlet,
    headline: pundit.name,
    context: "Expert picks · quotes · receipts",
    subject: personFromPundit(pundit, latest ?? undefined),
    quote: latest?.claim ?? null,
    quoteExcerpt: latest
      ? quoteExcerpt(latest.claim, format === "story" ? 110 : 140)
      : null,
    metrics: [
      { label: "Open picks", value: String(record.mappedPending) },
      {
        label: "2026 record",
        value: graded
          ? `${record.season2026.wins}–${record.season2026.losses}`
          : "—",
      },
      { label: "Graded", value: String(graded), tone: "muted" },
    ],
    sides: null,
    result: null,
    proof: [
      `${record.totalCalls} captured take${record.totalCalls === 1 ? "" : "s"}`,
      `${graded} graded`,
      `${record.mappedPending} open pick${record.mappedPending === 1 ? "" : "s"}`,
    ],
    disclosure: SOCIAL_DISCLOSURES.picks,
  };
}

function featureForTeam(
  team: Team,
  withPeople: SocialPeopleGroup,
  againstPeople: SocialPeopleGroup
): EditorialSocialCardModel["feature"] {
  const candidates = [
    { group: withPeople, headline: `The ${team.name} call` },
    { group: againstPeople, headline: `The ${team.name} fade` },
  ]
    .filter((candidate) => candidate.group.total > 0)
    .sort((a, b) => a.group.total - b.group.total);
  const selected = candidates[0];
  const person = selected?.group.people[0];
  if (!selected || !person) return null;
  return {
    kicker: person.name,
    headline:
      selected.group.total === 1 ? `Lone ${selected.headline.slice(4)}` : selected.headline,
    context: person.outlet,
    person,
  };
}

export function resolveTeamSocialCard(
  team: Team,
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  format: SocialFormat = "landscape"
): EditorialSocialCardModel {
  const takes = takesOnTeam(team.id, events, calls);
  const withPeople = socialPeopleGroup(
    peopleFromCalls(takes.for, pundits),
    personLimit(format)
  );
  const againstPeople = socialPeopleGroup(
    peopleFromCalls(takes.against, pundits),
    personLimit(format)
  );
  const total = takes.for.length + takes.against.length;
  return {
    archetype: "editorial",
    mode: "team",
    format,
    state: "evergreen",
    kicker: team.sport === "nfl" ? "NFL team archive" : "College football team archive",
    headline: team.name,
    context: `${total} verified pick${total === 1 ? "" : "s"}`,
    chip: chipForTeam(team),
    metrics: [
      { label: "With", value: String(takes.for.length), tone: "accent" },
      { label: "Against", value: String(takes.against.length) },
    ],
    people: null,
    groups: [
      {
        label: "With",
        count: takes.for.length,
        people: withPeople,
        tone: "accent",
      },
      {
        label: "Against",
        count: takes.against.length,
        people: againstPeople,
      },
    ],
    feature: featureForTeam(team, withPeople, againstPeople),
    proof: [
      `${total} verified pick${total === 1 ? "" : "s"}`,
      `${takes.for.length} with · ${takes.against.length} against`,
    ],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  };
}

function marqueeGame(games: Event[], calls: Call[]): Event | null {
  const ranked = games
    .map((game) => {
      const [yes, no] = sidesForCard(game, calls);
      const total = yes.calls.length + no.calls.length;
      const twoSided = yes.calls.length > 0 && no.calls.length > 0;
      return { game, total, twoSided };
    })
    .sort(
      (a, b) =>
        Number(b.twoSided) - Number(a.twoSided) ||
        b.total - a.total ||
        a.game.homeRank - b.game.homeRank
    );
  return ranked[0]?.game ?? null;
}

function weekState(record: ReturnType<typeof weekRecord>): SocialState {
  const graded = record.hits + record.misses;
  if (graded > 0 && record.pending > 0) return "partial";
  if (graded > 0 && record.pending === 0) return "final";
  return "pending";
}

export function resolveWeekSocialCard(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[],
  pundits: Pundit[],
  teams: Team[] = [],
  format: SocialFormat = "landscape"
): EditorialSocialCardModel {
  const games = gamesForWeek(sport, season, week, events);
  const record = weekRecord(games, calls);
  const total = record.hits + record.misses + record.pending;
  const marquee = marqueeGame(games, calls);
  const marqueeCalls = marquee
    ? sidesForCard(marquee, calls).flatMap((side) => side.calls)
    : [];
  const people = socialPeopleGroup(
    peopleFromCalls(marqueeCalls, pundits),
    format === "story" ? STORY_PEOPLE_LIMIT : WEEK_PEOPLE_LIMIT
  );
  const marqueeSides = marquee ? sidesForCard(marquee, calls) : null;
  const socialMarqueeSides: [SocialSide, SocialSide] | null =
    marquee && marqueeSides
      ? [
          socialSide(marquee, marqueeSides[0], pundits, teams, format),
          socialSide(marquee, marqueeSides[1], pundits, teams, format),
        ]
      : null;
  const split = marqueeSides
    ? `${marqueeSides[0].calls.length} — ${marqueeSides[1].calls.length} expert pick split`
    : undefined;
  return {
    archetype: "editorial",
    mode: "week",
    format,
    state: weekState(record),
    kicker: sport === "nfl" ? "NFL weekly archive" : "College football weekly archive",
    headline: `Week ${week}`,
    context: `${total} pick${total === 1 ? "" : "s"} · ${games.length} game${games.length === 1 ? "" : "s"}`,
    metrics: [
      { label: "Picks", value: String(total), tone: "accent" },
      { label: "Games", value: String(games.length) },
      ...(record.hits + record.misses > 0
        ? [
            {
              label: "Record",
              value: `${record.hits}–${record.misses}`,
            } as const,
          ]
        : []),
    ],
    people: people.total ? people : null,
    groups: [],
    feature: marquee
      ? {
          kicker: "Marquee disagreement",
          headline: marquee.title,
          ...(split ? { context: split } : {}),
          ...(socialMarqueeSides ? { sides: socialMarqueeSides } : {}),
        }
      : null,
    proof: [
      `${sport.toUpperCase()} week ${week}`,
      record.pending
        ? `${record.pending} open pick${record.pending === 1 ? "" : "s"}`
        : `${record.hits}–${record.misses} final record`,
    ],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  };
}

export type SocialPageKey =
  | "home"
  | "stories"
  | "book"
  | "leaderboard"
  | "ncaaf"
  | "nfl"
  | "submit"
  | "about"
  | "methodology"
  | "privacy"
  | "terms";

const PAGE_CONTENT: Record<
  SocialPageKey,
  Pick<EditorialSocialCardModel, "kicker" | "headline" | "context" | "proof" | "disclosure">
> = {
  home: {
    kicker: "Expert sports predictions",
    headline: "Public picks. Permanent receipts.",
    context: "College football · NFL",
    proof: ["Real quotes", "Frozen market context", "Final results"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  stories: {
    kicker: "The receipts",
    headline: "Who picked what.",
    context: "Newest verified takes",
    proof: ["Original quotes", "Mapped picks", "Final receipts"],
    disclosure: SOCIAL_DISCLOSURES.picks,
  },
  book: {
    kicker: "The ledger",
    headline: "Every take. On record.",
    context: "Search the public record",
    proof: ["Named people", "Source evidence", "Result states"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  leaderboard: {
    kicker: "Records with receipts",
    headline: "The sample travels with the record.",
    context: "Open activity · graded results",
    proof: ["Hits", "Misses", "Graded sample"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  ncaaf: {
    kicker: "College football",
    headline: "Expert picks. Frozen context. Final receipts.",
    context: "Current slate and permanent archive",
    proof: ["Games", "Futures", "Weekly archives"],
    disclosure: SOCIAL_DISCLOSURES.picks,
  },
  nfl: {
    kicker: "NFL",
    headline: "Expert picks. Frozen context. Final receipts.",
    context: "Current slate and permanent archive",
    proof: ["Games", "Futures", "Weekly archives"],
    disclosure: SOCIAL_DISCLOSURES.picks,
  },
  submit: {
    kicker: "Help fill the board",
    headline: "Found a public pick we missed?",
    context: "Send the source · Scout verifies it",
    proof: ["Public links", "Same evidence bar", "No automatic publishing"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  about: {
    kicker: "About Pundits.Pro",
    headline: "Public picks, preserved.",
    context: "Attribution · context · accountability",
    proof: ["Named people", "Original sources", "Permanent results"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  methodology: {
    kicker: "How the ledger works",
    headline: "From public take to final receipt.",
    context: "Verify · map · freeze · grade",
    proof: ["Exact evidence", "Objective mapping", "Auditable results"],
    disclosure: SOCIAL_DISCLOSURES.prices,
  },
  privacy: {
    kicker: "Pundits.Pro",
    headline: "Privacy policy.",
    context: "How the site handles information",
    proof: ["Privacy", "Transparency", "Contact"],
    disclosure: SOCIAL_DISCLOSURES.evidence,
  },
  terms: {
    kicker: "Pundits.Pro",
    headline: "Terms of use.",
    context: "The public ledger and its boundaries",
    proof: ["Public evidence", "Frozen context", "No betting advice"],
    disclosure: SOCIAL_DISCLOSURES.prices,
  },
};

export type SocialPageData = {
  events: Event[];
  calls: Call[];
  pundits: Pundit[];
};

function pageCalls(key: SocialPageKey, data: SocialPageData): Call[] {
  const mapped = data.calls.filter(isMapped);
  if (key !== "ncaaf" && key !== "nfl") return mapped;
  const slugs = new Set(
    data.events.filter((event) => event.sport === key).map((event) => event.slug)
  );
  return mapped.filter((call) => call.eventSlug && slugs.has(call.eventSlug));
}

function pageMetrics(
  key: SocialPageKey,
  data: SocialPageData | undefined
): EditorialSocialCardModel["metrics"] {
  if (!data) return [];
  const mapped = pageCalls(key, data);
  const eventCount = new Set(mapped.flatMap((call) => (call.eventSlug ? [call.eventSlug] : []))).size;
  const punditCount = new Set(mapped.map((call) => call.punditId)).size;
  const graded = mapped.filter((call) => call.status !== "pending").length;
  if (key === "book") {
    return [
      { label: "Takes", value: String(data.calls.length), tone: "accent" },
      { label: "Mapped", value: String(mapped.length) },
    ];
  }
  if (key === "leaderboard") {
    return [
      { label: "On record", value: String(punditCount), tone: "accent" },
      { label: "Graded", value: String(graded) },
    ];
  }
  if (["home", "stories", "ncaaf", "nfl"].includes(key)) {
    return [
      { label: "Mapped picks", value: String(mapped.length), tone: "accent" },
      { label: "Events", value: String(eventCount) },
    ];
  }
  return [];
}

function pagePeople(
  key: SocialPageKey,
  format: SocialFormat,
  data: SocialPageData | undefined
): SocialPeopleGroup | null {
  if (!data || !["home", "stories", "book", "leaderboard", "ncaaf", "nfl"].includes(key)) {
    return null;
  }
  const newest = [...pageCalls(key, data)].sort((a, b) =>
    a.sourceDate < b.sourceDate ? 1 : a.sourceDate > b.sourceDate ? -1 : 0
  );
  const people = socialPeopleGroup(
    peopleFromCalls(newest, data.pundits),
    format === "story" ? STORY_PEOPLE_LIMIT : 3
  );
  return people.total ? people : null;
}

export function resolvePageSocialCard(
  key: SocialPageKey,
  format: SocialFormat = "landscape",
  data?: SocialPageData
): EditorialSocialCardModel {
  const content = PAGE_CONTENT[key];
  return {
    archetype: "editorial",
    mode: "page",
    format,
    state: "evergreen",
    ...content,
    metrics: pageMetrics(key, data),
    people: pagePeople(key, format, data),
    groups: [],
    feature: null,
  };
}
