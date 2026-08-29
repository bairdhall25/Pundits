import type { MetadataRoute } from "next";
import { archiveWeeks, gamesForWeek, teamHasTakes } from "@/lib/archive";
import {
  loadCalls,
  loadEvents,
  loadEventsFile,
  loadPundits,
  loadTeams,
  mappedCalls,
} from "@/lib/data";
import { punditIndexable } from "@/lib/records";
import {
  eventLastModified,
  isoDay,
  latestDay,
  mappedTakes,
  takeLastModified,
  takePath,
} from "@/lib/seo";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const freeze = isoDay(loadEventsFile().freezeDate);
  const mapped = mappedCalls(calls);

  const core: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: freeze, changeFrequency: "daily", priority: 1 },
    { url: canonicalUrl("/ncaaf/"), lastModified: freeze, changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/nfl/"), lastModified: freeze, changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/book/"), lastModified: latestDay(calls.map((c) => c.sourceDate)), changeFrequency: "daily", priority: 0.8 },
    { url: canonicalUrl("/stories/"), lastModified: latestDay(calls.map((c) => c.sourceDate)), changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/leaderboard/"), lastModified: freeze, changeFrequency: "weekly", priority: 0.6 },
    { url: canonicalUrl("/privacy/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.2 },
    { url: canonicalUrl("/about/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.3 },
    { url: canonicalUrl("/methodology/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.4 },
    { url: canonicalUrl("/terms/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.2 },
  ];

  const picks: MetadataRoute.Sitemap = events.map((event) => {
    const on = mapped.filter((c) => c.eventSlug === event.slug);
    return {
      url: canonicalUrl(`/picks/${event.slug}/`),
      lastModified: eventLastModified(event, on) ?? freeze,
      changeFrequency: "weekly",
      priority: on.length ? 0.8 : 0.4,
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
      lastModified: freeze,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...core, ...takes, ...picks, ...archives, ...teams, ...people];
}
