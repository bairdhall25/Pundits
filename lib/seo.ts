import { isMapped, settledSide, sidesForCard } from "./data";
import { formatAsOf, formatCents, formatGameWhen, formatShortDate } from "./format";
import { eventShare } from "./share";
import {
  LEGAL_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  TWITTER_URL,
  canonicalUrl,
  takePath,
} from "./site";
import type { StoryCard } from "./story-card";
import type { Call, Event, Pundit } from "./types";

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

function priceLine(event: Event, call: Call): string | null {
  const game = gamePick(event, call);
  if (!game || game.pickedCents == null) return null;
  const asOf = formatAsOf(event.sourcedAt);
  return `The market price on ${game.picked} was ${formatCents(game.pickedCents)} on Kalshi${
    asOf ? ` ${asOf}` : ""
  }`;
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
  return `The market had ${dog} as the underdog at ${formatCents(cents)} on Kalshi${
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

export function sideChip(event: Event, side: "yes" | "no"): string {
  if (side === "yes" && event.awayTeam) return event.awayTeam;
  if (side === "no" && event.homeTeam) return event.homeTeam;
  return side === "yes" ? "Takes it" : "Against";
}

export function toStoryCard(take: MappedTake): StoryCard {
  const { pundit, event, call } = take;
  const side = call.side ?? "no";
  return {
    href: takePath(event.slug, pundit.id),
    headline: takeHeadline(pundit, event, call),
    quote: call.claim,
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
  const price = priceLine(event, call);

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
    const posture =
      game.pickedCents != null && game.otherCents != null && game.pickedCents < game.otherCents
        ? "is calling for the upset"
        : "is backing the market favorite";
    paragraphs.push(
      `${pundit.name} ${posture}: ${game.picked} over ${game.other}. ${
        price ? `${price}.` : ""
      }`.trim()
    );
  } else if (call.side === "no") {
    paragraphs.push(
      `${negativeOutcome(pundit, event.title)}. The market priced that position at ${formatCents(
        event.noCents
      )}${formatAsOf(event.sourcedAt) ? ` ${formatAsOf(event.sourcedAt)}` : ""}.`
    );
  } else {
    paragraphs.push(
      `${pundit.name} is planting a flag on ${outcomePhrase(event.title)}. The market priced that outcome at ${formatCents(
        event.yesCents
      )}${formatAsOf(event.sourcedAt) ? ` ${formatAsOf(event.sourcedAt)}` : ""}.`
    );
  }

  if (game) {
    const marketBits = [
      dog,
      when ? `The game is listed for ${when}.` : null,
      "That price is a frozen market snapshot, not a bet the expert placed.",
    ].filter(Boolean);
    paragraphs.push(marketBits.join(" "));
  } else {
    paragraphs.push(
      `${when ? `The market covers the ${when}. ` : ""}The price is a frozen snapshot, not a bet the expert placed.`
    );
  }

  const said = day
    ? `The receipt comes from ${call.source} on ${day}. ${pundit.name} said: “${call.claim}”`
    : `The receipt comes from ${call.source}. ${pundit.name} said: “${call.claim}”`;
  paragraphs.push(said);

  if (call.reasoning?.trim()) {
    paragraphs.push(`The reasoning ${pundit.name} gave: ${call.reasoning.trim()}`);
  }

  const others = allCalls.filter(
    (c) =>
      isMapped(c) &&
      c.eventSlug === event.slug &&
      c.punditId !== pundit.id
  );
  if (others.length && pundits.length) {
    const names = [...new Set(
      others
        .map((c) => pundits.find((p) => p.id === c.punditId)?.name)
        .filter((n): n is string => Boolean(n))
    )];
    if (names.length) {
      const place = event.awayTeam ? "this game" : "this pick";
      paragraphs.push(
        names.length === 1
          ? `${names[0]} has also weighed in on ${place}; the full split is on the game page.`
          : `${names.join(", ")} have also weighed in on ${place}; the full split is on the game page.`
      );
    }
  }

  const dek = game
    ? [
        graded
          ? `Result: ${call.status === "hit" ? game.picked : game.other} won — this pick ${
              call.status === "hit" ? "hit" : "missed"
            }.`
          : null,
        `${pundit.name} ${graded ? "took" : "is taking"} ${game.picked} over ${game.other}.`,
        price ? `${price}.` : null,
        dog,
        `Here is the quote and the context behind the pick.`,
      ]
        .filter(Boolean)
        .join(" ")
    : [headline + ".", dog, "Here is the quote and the market context."].filter(Boolean).join(" ");
  return { headline, dek, paragraphs };
}

export function takeDescription(
  pundit: Pundit,
  event: Event,
  call: Call
): string {
  return pickStory({ pundit, event, call }).dek;
}

export function pickLede(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): string {
  const share = eventShare(event, calls, pundits);
  const [yes, no] = sidesForCard(event, calls);
  const n = yes.calls.length + no.calls.length;
  if (n === 0) {
    return `No verified expert pick on ${event.title} yet.`;
  }
  return share.description.endsWith(".") ? share.description : `${share.description}.`;
}

export function isoDay(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return m?.[1];
}

export function latestDay(dates: Array<string | null | undefined>): string | undefined {
  const days = dates.map(isoDay).filter((d): d is string => Boolean(d));
  if (!days.length) return undefined;
  return days.sort()[days.length - 1];
}

export function takeLastModified(call: Call): string | undefined {
  return latestDay([call.sourceDate, call.gradedAt]);
}

export function eventLastModified(event: Event, calls: Call[]): string | undefined {
  return latestDay([
    event.sourcedAt,
    ...calls.flatMap((call) => [call.sourceDate, call.gradedAt]),
  ]);
}

export function organizationGraph() {
  const url = canonicalUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#org`,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        url,
        logo: canonicalUrl("/og.png"),
        description: SITE_DESCRIPTION,
        sameAs: [TWITTER_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        about: { "@type": "Thing", name: "College football and NFL expert picks" },
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
  const share = eventShare(event, calls, pundits);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": event.awayTeam && event.homeTeam ? "SportsEvent" : "Event",
    name: event.title,
    url,
    description: share.description,
    sport: "American football",
    eventStatus: settledSide(event, calls)
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
  };
  if (event.kickoffDate) {
    base.startDate = event.kickoffDate;
  }
  if (event.awayTeam) {
    base.awayTeam = { "@type": "SportsTeam", name: event.awayTeam };
  }
  if (event.homeTeam) {
    base.homeTeam = { "@type": "SportsTeam", name: event.homeTeam };
  }
  return base;
}

export function personJsonLd(pundit: Pundit) {
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
  };
}

export function articleJsonLd(take: MappedTake, allCalls: Call[] = [], pundits: Pundit[] = []) {
  const url = canonicalUrl(takePath(take.event.slug, take.pundit.id));
  const story = pickStory(take, allCalls, pundits);
  const image = canonicalUrl(`/og/takes/${take.event.slug}--${take.pundit.id}.png`);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    datePublished: isoDay(take.call.sourceDate),
    dateModified: latestDay([
      take.call.sourceDate,
      take.event.sourcedAt,
      take.call.gradedAt,
    ]),
    url,
    mainEntityOfPage: url,
    description: story.dek,
    articleBody: story.paragraphs.join(" "),
    articleSection: take.event.sport === "nfl" ? "NFL" : "College Football",
    isAccessibleForFree: true,
    image: [image],
    author: {
      "@type": "Organization",
      name: `${SITE_NAME} Staff`,
      url: canonicalUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: canonicalUrl("/"),
      logo: canonicalUrl("/og.png"),
    },
    about: {
      "@type": take.event.awayTeam ? "SportsEvent" : "Event",
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
