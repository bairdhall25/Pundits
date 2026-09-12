import { takesOnTeam } from "./archive";
import { finalScoreParts, isMapped, seasonFromCalls } from "./data";
import {
  evidenceKindFor,
  presentEvidence,
  winnerOnlyLine,
} from "./evidence";
import { publicSideLabel } from "./public-side";
import {
  americanOdds,
  formatAsOf,
  formatCents,
  formatGameWhen,
  formatShortDate,
} from "./format";
import { firstPublishedAt, materialUpdatedAt } from "./publication";
import { isoDay, latestDay } from "./seo-dates";
import { gameComparison, receiptDisagreement } from "./page-content";
import {
  LEGAL_NAME,
  SITE_DESCRIPTION,
  SITE_ENTITY_NAME,
  SITE_NAME,
  TWITTER_URL,
  canonicalUrl,
  takePath,
} from "./site";
import type { StoryCard } from "./story-card";
import type { Call, Event, Pundit, Team } from "./types";

export { isoDay, latestDay } from "./seo-dates";

export type MappedTake = {
  call: Call;
  event: Event;
  pundit: Pundit;
};

export function mappedTakes(
  calls: Call[],
  events: Event[],
  pundits: Pundit[]
): MappedTake[] {
  const eventBySlug = Object.fromEntries(events.map((e) => [e.slug, e]));
  const punditById = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const latest = new Map<string, MappedTake>();
  for (const call of calls) {
    if (!isMapped(call) || !call.eventSlug || !call.side) continue;
    const event = eventBySlug[call.eventSlug];
    const pundit = punditById[call.punditId];
    if (!event || !pundit) continue;
    const key = `${event.slug}/${pundit.id}`;
    const prev = latest.get(key);
    if (!prev || call.sourceDate >= prev.call.sourceDate) {
      latest.set(key, { call, event, pundit });
    }
  }
  return [...latest.values()].sort((a, b) => {
    if (a.call.sourceDate < b.call.sourceDate) return 1;
    if (a.call.sourceDate > b.call.sourceDate) return -1;
    return a.pundit.name.localeCompare(b.pundit.name);
  });
}

export { takePath };

export type PickStory = {
  headline: string;
  dek: string;
  paragraphs: string[];
};

function snapshotLine(event: Event, call: Call): string | null {
  const game = gamePick(event, call);
  const asOf = formatAsOf(event.sourcedAt);
  const asOfBit = asOf ? ` ${asOf}` : "";
  const disclaimer =
    "That figure is a dated event-level Kalshi snapshot, not live odds and not necessarily the market when the original prediction was spoken or first captured.";
  if (game && game.pickedCents != null) {
    return `Displayed Kalshi snapshot: ${game.picked} ${formatCents(game.pickedCents)}${asOfBit}. ${disclaimer}`;
  }
  const cents = call.side === "no" ? event.noCents : event.yesCents;
  if (cents == null) return null;
  return `Displayed Kalshi snapshot: ${formatCents(cents)}${asOfBit}. ${disclaimer}`;
}

function gamePick(event: Event, call: Call): {
  picked: string;
  other: string;
  pickedCents: number | null;
  otherCents: number | null;
} | null {
  if (!event.awayTeam || !event.homeTeam || !call.side) return null;
  if (call.side === "yes") {
    return {
      picked: event.awayTeam,
      other: event.homeTeam,
      pickedCents: event.yesCents,
      otherCents: event.noCents,
    };
  }
  return {
    picked: event.homeTeam,
    other: event.awayTeam,
    pickedCents: event.noCents,
    otherCents: event.yesCents,
  };
}

function underdogLine(event: Event): string | null {
  if (event.yesCents == null || event.noCents == null) return null;
  if (!event.awayTeam || !event.homeTeam) return null;
  if (event.yesCents === event.noCents) return null;
  const dog = event.yesCents < event.noCents ? event.awayTeam : event.homeTeam;
  const cents = Math.min(event.yesCents, event.noCents);
  const asOf = formatAsOf(event.sourcedAt);
  return `The snapshot had ${dog} as the underdog at ${formatCents(cents)}${
    asOf ? `, ${asOf}` : ""
  }.`;
}

function outcomePhrase(title: string): string {
  const wins = title.match(/^(.+?) wins (.+)$/i);
  if (wins) return `${wins[1]} to win ${wins[2]}`;
  const makes = title.match(/^(.+?) makes (.+)$/i);
  if (makes) return `${makes[1]} to make ${makes[2]}`;
  return title;
}

function negativeOutcome(pundit: Pundit, title: string, past = false): string {
  const see = past ? "did not see" : "does not see";
  const wins = title.match(/^(.+?) wins (.+)$/i);
  if (wins) return `${pundit.name} ${see} ${wins[1]} winning ${wins[2]}`;
  const makes = title.match(/^(.+?) makes (.+)$/i);
  if (makes) return `${pundit.name} ${see} ${makes[1]} making ${makes[2]}`;
  return `${pundit.name} ${past ? "was" : "is"} out on ${title}`;
}

/** Graded takes speak in past tense and carry the verdict — after the game,
 *  searchers want the answer, not the prediction. */
export function takeHeadline(pundit: Pundit, event: Event, call: Call): string {
  const graded = call.status === "hit" || call.status === "miss";
  const game = gamePick(event, call);
  if (game) {
    if (!graded) return `${pundit.name} picks ${game.picked} over ${game.other}`;
    const verdict =
      call.status === "hit" ? " — and hit" : ` — and missed (${game.other} won)`;
    return `${pundit.name} picked ${game.picked} over ${game.other}${verdict}`;
  }
  const verdict = graded ? ` — and ${call.status === "hit" ? "hit" : "missed"}` : "";
  if (call.side === "no") return `${negativeOutcome(pundit, event.title, graded)}${verdict}`;
  const verb = graded ? "picked" : "picks";
  return `${pundit.name} ${verb} ${outcomePhrase(event.title)}${verdict}`;
}

/** Compact search/social title; the full editorial headline stays on the page. */
export function takeMetaTitle(pundit: Pundit, event: Event, call: Call): string {
  const headline = takeHeadline(pundit, event, call);
  if (`${headline} · ${SITE_NAME}`.length <= 70) return headline;
  const graded = call.status === "hit" || call.status === "miss";
  const verdict = graded ? ` — ${call.status === "hit" ? "Hit" : "Miss"}` : "";
  const game = gamePick(event, call);
  if (game) return `${pundit.name}: ${game.picked} over ${game.other}${verdict}`;

  const title = event.title.replace(/the national title/i, "national title");
  const outcome = title.match(/^(.+?) (wins|makes) (.+)$/i);
  if (!outcome) return headline;
  const verb = outcome[2].toLowerCase() === "wins" ? "win" : "make";
  const prediction = `${call.side === "no" ? "not " : ""}to ${verb}`;
  return `${pundit.name}: ${outcome[1]} ${prediction} ${outcome[3]}${verdict}`;
}

export function sideChip(event: Event, side: "yes" | "no"): string {
  return publicSideLabel(event, side);
}

export function toStoryCard(take: MappedTake): StoryCard {
  const { pundit, event, call } = take;
  const side = call.side ?? "no";
  return {
    href: takePath(event.slug, pundit.id),
    headline: takeHeadline(pundit, event, call),
    quote: call.claim,
    quoteIsSpoken: evidenceKindFor(call) === "spoken-quote",
    name: pundit.name,
    photo: pundit.photo,
    outlet: pundit.outlet,
    date: formatShortDate(call.sourceDate),
    sport: event.sport,
    kind: event.kind ?? "future",
    eventTitle: event.title,
    kickoff: formatGameWhen(event),
    side,
    sideChip: sideChip(event, side),
    cents: side === "yes" ? event.yesCents : event.noCents,
    status: call.status,
    eventSlug: event.slug,
    punditId: pundit.id,
  };
}

export function pickStory(
  take: MappedTake,
  allCalls: Call[] = [],
  pundits: Pundit[] = []
): PickStory {
  const { pundit, event, call } = take;
  const headline = takeHeadline(pundit, event, call);
  const game = gamePick(event, call);
  const dog = underdogLine(event);
  const when = formatGameWhen(event);
  const day = formatShortDate(call.sourceDate);
  const snapshot = snapshotLine(event, call);
  const evidence = presentEvidence(call, pundit.name, day);
  const isGame = Boolean(event.awayTeam && event.homeTeam);
  const grading = winnerOnlyLine(call, isGame);

  const graded = call.status === "hit" || call.status === "miss";
  const paragraphs: string[] = [];
  if (graded && game) {
    const winner = call.status === "hit" ? game.picked : game.other;
    paragraphs.push(
      `Result: ${winner} won. This pick graded a ${call.status === "hit" ? "hit" : "miss"}.`
    );
  } else if (graded) {
    paragraphs.push(`Result: this take graded a ${call.status === "hit" ? "hit" : "miss"}.`);
  }
  if (game) {
    const verb = graded ? "picked" : "picks";
    paragraphs.push(`${pundit.name} ${verb} ${game.picked} over ${game.other}.`);
  } else if (call.side === "no") {
    paragraphs.push(`${negativeOutcome(pundit, event.title, graded)}.`);
  } else {
    const verb = graded ? "picked" : "picks";
    paragraphs.push(`${pundit.name} ${verb} ${outcomePhrase(event.title)}.`);
  }

  paragraphs.push(evidence.evidenceLine);
  if (evidence.locatorLine) {
    paragraphs.push(`Source locator: ${evidence.locatorLine}.`);
  }
  if (evidence.correctionNote) {
    paragraphs.push(evidence.correctionNote);
  }
  if (evidence.rationale) {
    paragraphs.push(`Why ${pundit.name} picked them: ${evidence.rationale}`);
  }
  if (grading) paragraphs.push(grading);
  if (snapshot) paragraphs.push(snapshot);
  if (dog) paragraphs.push(dog);
  if (when) {
    paragraphs.push(
      graded ? `The game was listed for ${when}.` : `The game is listed for ${when}.`
    );
  }

  const disagreement = receiptDisagreement(event, call, pundit, allCalls, pundits);
  if (disagreement) paragraphs.push(disagreement);

  const dek = game
    ? [
        graded
          ? `Result: ${call.status === "hit" ? game.picked : game.other} won — this pick ${
              call.status === "hit" ? "hit" : "missed"
            }.`
          : null,
        `${pundit.name} ${graded ? "picked" : "picks"} ${game.picked} over ${game.other}.`,
        dog,
        evidence.kind === "reported-selection"
          ? "Here is the reported selection and the snapshot context."
          : "Here is the sourced evidence and the snapshot context.",
      ]
        .filter(Boolean)
        .join(" ")
    : [headline + ".", dog, "Here is the sourced evidence and the snapshot context."]
        .filter(Boolean)
        .join(" ");
  return { headline, dek, paragraphs };
}

export type GradeRow = { label: string; value: string; href?: string; hrefLabel?: string };

/** The take page's labeled facts — same primitives as pickStory, honest structure. */
export function gradeSheet(take: MappedTake, calls: Call[], pundits: Pundit[]): GradeRow[] {
  const { pundit, event, call } = take;
  const graded = call.status === "hit" || call.status === "miss";
  const game = gamePick(event, call);
  const rows: GradeRow[] = [];

  if (graded) {
    const score = finalScoreParts(event, calls);
    if (score) {
      rows.push({
        label: "Result",
        value: `${score.winner} won ${score.winnerScore}–${score.loserScore}.`,
      });
    } else if (game) {
      const winner = call.status === "hit" ? game.picked : game.other;
      rows.push({ label: "Result", value: `${winner} won.` });
    } else {
      rows.push({ label: "Result", value: `Graded a ${call.status}.` });
    }
  }

  if (game) {
    const upset =
      game.pickedCents != null && game.otherCents != null && game.pickedCents < game.otherCents;
    const posture = upset
      ? graded
        ? "called the upset"
        : "calling the upset"
      : graded
        ? "backed the snapshot favorite"
        : "backing the snapshot favorite";
    rows.push({ label: "The call", value: `${game.picked} over ${game.other} — ${posture}.` });
  } else if (call.side === "no") {
    rows.push({ label: "The call", value: `${negativeOutcome(pundit, event.title, graded)}.` });
  } else {
    rows.push({
      label: "The call",
      value: `${pundit.name} ${graded ? "picked" : "picks"} ${outcomePhrase(event.title)}.`,
    });
  }

  const cents = game ? game.pickedCents : call.side === "no" ? event.noCents : event.yesCents;
  if (cents != null) {
    const odds = americanOdds(cents);
    const asOf = formatAsOf(event.sourcedAt);
    rows.push({
      label: "Kalshi snapshot",
      value: `${formatCents(cents)} displayed snapshot${odds ? ` (≈ ${odds})` : ""}${asOf ? `, ${asOf}` : ""}.`,
    });
  }

  const grading = winnerOnlyLine(call, Boolean(game));
  if (grading) {
    rows.push({ label: "Grading", value: grading });
  }

  const season = seasonFromCalls(pundit.id, calls);
  const recordValue =
    season.wins + season.losses > 0
      ? `${pundit.name} is ${season.wins}–${season.losses} on graded picks this season${
          season.pending ? `, with ${season.pending} open` : ""
        }.`
      : `${pundit.name} has no graded picks yet this season${
          season.pending ? ` — ${season.pending} open` : ""
        }.`;
  rows.push({
    label: "Record",
    value: recordValue,
    href: `/pundits/${pundit.id}`,
    hrefLabel: "Full record →",
  });

  return rows;
}

export function takeDescription(
  pundit: Pundit,
  event: Event,
  call: Call
): string {
  return pickStory({ pundit, event, call }).dek;
}

export type BylinePart = { label: string; value: string; href?: string };

export function storyByline(take: MappedTake): BylinePart[] {
  const parts: BylinePart[] = [
    { label: "Published by", value: SITE_ENTITY_NAME, href: "/about" },
  ];
  const sourceDay = formatShortDate(take.call.sourceDate);
  if (sourceDay) parts.push({ label: "Source published", value: sourceDay });
  const publishedDay = formatShortDate(firstPublishedAt(take.call));
  if (publishedDay) parts.push({ label: "On Pundits", value: publishedDay });
  const gradedDay = formatShortDate(take.call.gradedAt);
  if (gradedDay) parts.push({ label: "Graded", value: gradedDay });
  const updatedDay = formatShortDate(take.call.updatedAt);
  if (
    updatedDay &&
    take.call.updatedAt !== take.call.firstPublishedAt &&
    take.call.updatedAt !== take.call.gradedAt
  ) {
    parts.push({ label: "Updated", value: updatedDay });
  }
  return parts;
}

export function pickLede(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): string {
  return gameComparison(event, calls, pundits).lede;
}

export function takeLastModified(call: Call): string | undefined {
  return latestDay([
    call.firstPublishedAt,
    call.updatedAt,
    call.gradedAt,
    call.sourceDate,
  ]);
}

export function eventLastModified(event: Event, calls: Call[]): string | undefined {
  return latestDay([
    event.sourcedAt,
    ...calls.flatMap((call) => [
      call.firstPublishedAt,
      call.updatedAt,
      call.sourceDate,
      call.gradedAt,
    ]),
  ]);
}

export function callsLastModified(
  calls: Call[],
  fallback?: string | null
): string | undefined {
  return latestDay([
    ...calls.flatMap((call) => [
      call.firstPublishedAt,
      call.updatedAt,
      call.sourceDate,
      call.gradedAt,
    ]),
    fallback,
  ]);
}

export function teamLastModified(
  teamId: string,
  events: Event[],
  calls: Call[]
): string | undefined {
  const takes = takesOnTeam(teamId, events, calls);
  return latestDay(
    [...takes.for, ...takes.against].flatMap((call) => [
      call.firstPublishedAt,
      call.updatedAt,
      call.sourceDate,
      call.gradedAt,
    ])
  );
}

export function organizationGraph() {
  const url = canonicalUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#org`,
        name: SITE_ENTITY_NAME,
        alternateName: SITE_NAME,
        legalName: LEGAL_NAME,
        url,
        logo: canonicalUrl("/og.png"),
        description: SITE_DESCRIPTION,
        sameAs: [TWITTER_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: SITE_ENTITY_NAME,
        alternateName: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Named college football and NFL pundit picks",
        },
        publisher: { "@id": `${url}#org` },
      },
    ],
  };
}

export function breadcrumbList(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqJsonLd(
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function eventJsonLd(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
) {
  const url = canonicalUrl(`/picks/${event.slug}`);
  const comparison = gameComparison(event, calls, pundits);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: comparison.title,
    url,
    description: comparison.description,
    about:
      event.awayTeam && event.homeTeam
        ? [
            { "@type": "SportsTeam", name: event.awayTeam },
            { "@type": "SportsTeam", name: event.homeTeam },
          ]
        : { "@type": "Thing", name: event.title },
  };
}

export function personJsonLd(pundit: Pundit, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pundit.name,
    url: canonicalUrl(`/pundits/${pundit.id}`),
    jobTitle: "Sports pundit",
    worksFor: { "@type": "Organization", name: pundit.outlet },
    image: pundit.photo.startsWith("http")
      ? pundit.photo
      : canonicalUrl(pundit.photo),
    ...(description ? { description } : {}),
  };
}

export function profilePageJsonLd(pundit: Pundit, description: string) {
  const person = personJsonLd(pundit, description);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${pundit.name}: current picks and tracked record`,
    url: person.url,
    description,
    mainEntity: {
      "@type": "Person",
      name: person.name,
      url: person.url,
      jobTitle: person.jobTitle,
      worksFor: person.worksFor,
      image: person.image,
      description: person.description,
    },
  };
}

export function teamJsonLd(team: Team) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    url: canonicalUrl(`/teams/${team.id}`),
    sport: "American Football",
  };
}

export function teamPageJsonLd(team: Team, name: string, description: string) {
  const teamNode = teamJsonLd(team);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: teamNode.url,
    description,
    mainEntity: {
      "@type": "SportsTeam",
      name: teamNode.name,
      url: teamNode.url,
      sport: teamNode.sport,
    },
    about: {
      "@type": "SportsTeam",
      name: teamNode.name,
    },
  };
}

export function collectionPageJsonLd(
  name: string,
  path: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: canonicalUrl(path),
    description,
  };
}

export function articleJsonLd(take: MappedTake, allCalls: Call[] = [], pundits: Pundit[] = []) {
  const url = canonicalUrl(takePath(take.event.slug, take.pundit.id));
  const story = pickStory(take, allCalls, pundits);
  const image = canonicalUrl(`/og/takes/${take.event.slug}--${take.pundit.id}.png`);
  const published = isoDay(firstPublishedAt(take.call));
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    ...(published ? { datePublished: published } : {}),
    dateModified: materialUpdatedAt(take.call, take.event),
    url,
    mainEntityOfPage: url,
    description: story.dek,
    articleBody: story.paragraphs.join(" "),
    articleSection: take.event.sport === "nfl" ? "NFL" : "College Football",
    isAccessibleForFree: true,
    image: [image],
    author: {
      "@type": "Organization",
      name: SITE_ENTITY_NAME,
      url: canonicalUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_ENTITY_NAME,
      url: canonicalUrl("/"),
      logo: canonicalUrl("/og.png"),
    },
    about: {
      "@type": "Thing",
      name: take.event.title,
      url: canonicalUrl(`/picks/${take.event.slug}`),
    },
    mentions: {
      "@type": "Person",
      name: take.pundit.name,
      url: canonicalUrl(`/pundits/${take.pundit.id}`),
    },
    citation: take.call.sourceUrl ?? undefined,
  };
}
