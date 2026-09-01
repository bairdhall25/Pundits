import type { MetadataRoute } from "next";
import { archiveWeeks, gamesForWeek, teamHasTakes } from "@/lib/archive";
import {
  eventHasTakes,
  loadCalls,
  loadEvents,
  loadEventsFile,
  loadPundits,
  loadTeams,
  mappedCalls,
} from "@/lib/data";
import { punditIndexable } from "@/lib/records";
import {
  callsLastModified,
  eventLastModified,
  isoDay,
  latestDay,
  mappedTakes,
  takeLastModified,
  takePath,
  teamLastModified,
} from "@/lib/seo";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const freeze = isoDay(loadEventsFile().freezeDate);
  const mapped = mappedCalls(calls);

  const corpus = callsLastModified(calls, freeze) ?? freeze;
  const ncaafSlugs = new Set(events.filter((e) => e.sport === "ncaaf").map((e) => e.slug));
  const nflSlugs = new Set(events.filter((e) => e.sport === "nfl").map((e) => e.slug));

  const core: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: corpus, changeFrequency: "daily", priority: 1 },
    {
      url: canonicalUrl("/ncaaf/"),
      lastModified:
        callsLastModified(
          calls.filter((c) => c.eventSlug && ncaafSlugs.has(c.eventSlug)),
          freeze
        ) ?? freeze,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: canonicalUrl("/nfl/"),
      lastModified:
        callsLastModified(
          calls.filter((c) => c.eventSlug && nflSlugs.has(c.eventSlug)),
          freeze
        ) ?? freeze,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: canonicalUrl("/book/"), lastModified: corpus, changeFrequency: "daily", priority: 0.8 },
    { url: canonicalUrl("/stories/"), lastModified: corpus, changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/leaderboard/"), lastModified: corpus, changeFrequency: "weekly", priority: 0.6 },
    { url: canonicalUrl("/privacy/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.2 },
    { url: canonicalUrl("/about/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.3 },
    { url: canonicalUrl("/methodology/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.4 },
    { url: canonicalUrl("/terms/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.2 },
  ];

  const picks: MetadataRoute.Sitemap = events
    .filter((event) => eventHasTakes(event.slug, calls))
    .map((event) => {
      const on = mapped.filter((c) => c.eventSlug === event.slug);
      return {
        url: canonicalUrl(`/picks/${event.slug}/`),
        lastModified: eventLastModified(event, on) ?? freeze,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

  const takes: MetadataRoute.Sitemap = mappedTakes(calls, events, pundits).map((take) => ({
    url: canonicalUrl(takePath(take.event.slug, take.pundit.id)),
    lastModified: takeLastModified(take.call),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Zero-call profiles are noindexed until their first take lands; keep the
  // sitemap in agreement so Search Console stays quiet.
  const people: MetadataRoute.Sitemap = pundits
    .filter((pundit) => punditIndexable(pundit.id, calls))
    .map((pundit) => {
      const mine = calls.filter((c) => c.punditId === pundit.id);
      const live = mapped.filter((c) => c.punditId === pundit.id);
      return {
        url: canonicalUrl(`/pundits/${pundit.id}/`),
        lastModified:
          latestDay(mine.flatMap((c) => [c.sourceDate, c.gradedAt])) ?? freeze,
        changeFrequency: "weekly",
        priority: live.length ? 0.7 : 0.3,
      };
    });

  const archives: MetadataRoute.Sitemap = archiveWeeks(events).map((w) => {
    const games = gamesForWeek(w.sport, w.season, w.week, events);
    const on = mapped.filter((c) => games.some((e) => e.slug === c.eventSlug));
    return {
      url: canonicalUrl(`/${w.sport}/${w.season}/week-${w.week}/`),
      lastModified:
        latestDay([
          ...games.map((e) => e.sourcedAt),
          ...on.flatMap((c) => [c.sourceDate, c.gradedAt]),
        ]) ?? freeze,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  // Team pages follow the pundit-profile rule: indexable (and listed) only
  // once at least one take involves the team.
  const teams: MetadataRoute.Sitemap = loadTeams()
    .filter((t) => teamHasTakes(t.id, events, calls))
    .map((t) => ({
      url: canonicalUrl(`/teams/${t.id}/`),
      lastModified: teamLastModified(t.id, events, calls) ?? freeze,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...core, ...takes, ...picks, ...archives, ...teams, ...people];
}
