import { isMapped, sidesForCard } from "./data";
import { formatAsOf, formatCents } from "./format";
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

export function takeHeadline(pundit: Pundit, event: Event, call: Call): string {
  if (call.side === "yes" && event.awayTeam) {
    return `${pundit.name} picks ${event.awayTeam}`;
  }
  if (call.side === "no" && event.homeTeam) {
    return `${pundit.name} picks ${event.homeTeam}`;
  }
  if (call.side === "no") return `${pundit.name} against ${event.title}`;
  return `${pundit.name}: ${event.title}`;
}

export function takeDescription(
  pundit: Pundit,
  event: Event,
  call: Call
): string {
  const [yes, no] = sidesForCard(event, [call]);
  const side = call.side === "yes" ? yes : no;
  const tape =
    event.awayTeam && event.homeTeam
      ? `${side.label} ${formatCents(side.cents)}`
      : `${call.side?.toUpperCase()} ${formatCents(side.cents)}`;
  const asOf = formatAsOf(event.sourcedAt);
  return [
    `${pundit.name} (${pundit.outlet}) on ${event.title}.`,
    `“${call.claim}”`,
    `${call.source}${call.sourceDate ? ` · ${call.sourceDate}` : ""}.`,
    `Kalshi ${tape}${asOf ? ` · ${asOf}` : ""}.`,
  ].join(" ");
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

export function articleJsonLd(take: MappedTake) {
  const url = canonicalUrl(takePath(take.event.slug, take.pundit.id));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: takeHeadline(take.pundit, take.event, take.call),
    datePublished: isoDay(take.call.sourceDate),
    url,
    mainEntityOfPage: url,
    description: takeDescription(take.pundit, take.event, take.call),
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
