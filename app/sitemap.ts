import type { MetadataRoute } from "next";
import {
  loadCalls,
  loadEvents,
  loadEventsFile,
  loadPundits,
  mappedCalls,
} from "@/lib/data";
import { isoDay, latestDay, mappedTakes, takePath } from "@/lib/seo";
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
    { url: canonicalUrl("/terms/"), lastModified: freeze, changeFrequency: "yearly", priority: 0.2 },
  ];

  const picks: MetadataRoute.Sitemap = events.map((event) => {
    const on = mapped.filter((c) => c.eventSlug === event.slug);
    return {
      url: canonicalUrl(`/picks/${event.slug}/`),
      lastModified: latestDay([event.sourcedAt, ...on.map((c) => c.sourceDate)]) ?? freeze,
      changeFrequency: "weekly",
      priority: on.length ? 0.8 : 0.4,
    };
  });

  const takes: MetadataRoute.Sitemap = mappedTakes(calls, events, pundits).map((take) => ({
    url: canonicalUrl(takePath(take.event.slug, take.pundit.id)),
    lastModified: isoDay(take.call.sourceDate),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const people: MetadataRoute.Sitemap = pundits.map((pundit) => {
    const mine = calls.filter((c) => c.punditId === pundit.id);
    const live = mapped.filter((c) => c.punditId === pundit.id);
    return {
      url: canonicalUrl(`/pundits/${pundit.id}/`),
      lastModified: latestDay(mine.map((c) => c.sourceDate)) ?? freeze,
      changeFrequency: "weekly",
      priority: live.length ? 0.7 : 0.3,
    };
  });

  return [...core, ...takes, ...picks, ...people];
}
