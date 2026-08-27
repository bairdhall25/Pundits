import { isMapped, sidesForCard } from "./data";
import { formatAsOf, formatCents, formatShortDate } from "./format";
import { eventShare } from "./share";
import { SITE_DESCRIPTION, SITE_NAME, canonicalUrl, takePath } from "./site";
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
  return `${dog} is the underdog at ${formatCents(cents)} on Kalshi${asOf ? `, ${asOf}` : ""}.`;
}

export function takeHeadline(pundit: Pundit, event: Event, call: Call): string {
  const game = gamePick(event, call);
  if (game) return `${pundit.name} picks ${game.picked} over ${game.other}`;
  if (call.side === "no") return `${pundit.name} against ${event.title}`;
  return `${pundit.name} takes ${event.title}`;
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
  const when = [event.kickoff, event.network].filter(Boolean).join(" · ");
  const day = formatShortDate(call.sourceDate);

  const paragraphs: string[] = [];
  if (game) {
    paragraphs.push(`${pundit.name} picks ${game.picked} over ${game.other}.`);
  } else if (call.side === "no") {
    paragraphs.push(`${pundit.name} is against ${event.title}.`);
  } else {
    paragraphs.push(`${pundit.name} takes ${event.title}.`);
  }

  const marketBits = [
    dog,
    when ? `Listed ${when}.` : null,
    "Hypothetical $100 at the freeze.",
  ].filter(Boolean);
  paragraphs.push(marketBits.join(" "));

  const said = day
    ? `On ${call.source} (${day}), ${pundit.name} said: “${call.claim}”`
    : `On ${call.source}, ${pundit.name} said: “${call.claim}”`;
  paragraphs.push(said);

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
      paragraphs.push(
        names.length === 1
          ? `${names[0]} is also mapped on this market.`
          : `Also mapped: ${names.join(", ")}.`
      );
    }
  }

  const dek = [headline + ".", dog].filter(Boolean).join(" ");
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
    return `${event.title} is on the Kalshi board. No roster-voice winner is mapped yet.`;
  }
  return `Named pundits on the ${event.title} Kalshi market. ${share.description}.`;
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

export function organizationGraph() {
  const url = canonicalUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#org`,
        name: SITE_NAME,
        url,
        logo: canonicalUrl("/og.png"),
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
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
  };
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
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.headline,
    datePublished: isoDay(take.call.sourceDate),
    url,
    mainEntityOfPage: url,
    description: story.dek,
    articleBody: story.paragraphs.join(" "),
    author: {
      "@type": "Person",
      name: take.pundit.name,
      url: canonicalUrl(`/pundits/${take.pundit.id}`),
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
    citation: take.call.sourceUrl ?? undefined,
  };
}
