import {
  firstPublishedAt,
  isNewsEligible,
  newsPublicationDate,
  rssPublicationDate,
} from "./publication";
import { callsLastModified, mappedTakes, pickStory, takePath, type MappedTake } from "./seo";
import { canonicalUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";
import type { Call, Event, Pundit } from "./types";

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function recentNewsTakes(
  takes: MappedTake[],
  days = 2,
  now: Date = new Date()
): MappedTake[] {
  return takes.filter((take) => isNewsEligible(firstPublishedAt(take.call), now, days));
}

export function rssFeed(calls: Call[], events: Event[], pundits: Pundit[]): string {
  const items = mappedTakes(calls, events, pundits)
    .slice(0, 50)
    .map((take) => {
      const story = pickStory(take, calls, pundits);
      const url = canonicalUrl(takePath(take.event.slug, take.pundit.id));
      const published = firstPublishedAt(take.call);
      const rssDate = published ? rssPublicationDate(published) : null;
      const pubDate = rssDate ? `\n<pubDate>${rssDate}</pubDate>` : "";
      return `<item>
<title>${xmlEscape(story.headline)}</title>
<link>${xmlEscape(url)}</link>
<guid isPermaLink="true">${xmlEscape(url)}</guid>${pubDate}
<category>${take.event.sport === "nfl" ? "NFL" : "College Football"}</category>
<description>${xmlEscape(story.dek)}</description>
</item>`;
    })
    .join("\n");

  const buildDay =
    callsLastModified(calls, mappedTakes(calls, events, pundits)[0]?.call.sourceDate) ??
    "2026-01-01";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${SITE_NAME} — Expert picks</title>
<link>${canonicalUrl("/")}</link>
<description>${xmlEscape(SITE_DESCRIPTION)}</description>
<language>en-us</language>
<lastBuildDate>${rssPublicationDate(buildDay) ?? new Date("2026-01-01T00:00:00Z").toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
}

export function newsSitemap(
  calls: Call[],
  events: Event[],
  pundits: Pundit[],
  now: Date = new Date()
): string {
  const urls = recentNewsTakes(mappedTakes(calls, events, pundits), 2, now)
    .map((take) => {
      const story = pickStory(take, calls, pundits);
      const published = firstPublishedAt(take.call);
      if (!published) return "";
      return `<url>
<loc>${xmlEscape(canonicalUrl(takePath(take.event.slug, take.pundit.id)))}</loc>
<news:news>
<news:publication><news:name>${SITE_NAME}</news:name><news:language>en</news:language></news:publication>
<news:publication_date>${xmlEscape(newsPublicationDate(published))}</news:publication_date>
<news:title>${xmlEscape(story.headline)}</news:title>
</news:news>
</url>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
}
