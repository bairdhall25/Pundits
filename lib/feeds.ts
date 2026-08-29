import { mappedTakes, pickStory, takePath, type MappedTake } from "./seo";
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

function rssDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toUTCString();
}

export function recentNewsTakes(takes: MappedTake[], days = 2): MappedTake[] {
  if (!takes.length) return [];
  const newest = takes.reduce(
    (max, take) => (take.call.sourceDate > max ? take.call.sourceDate : max),
    takes[0].call.sourceDate
  );
  const cutoff = new Date(`${newest}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(0, days - 1));
  const cutoffDay = cutoff.toISOString().slice(0, 10);
  return takes.filter((take) => take.call.sourceDate >= cutoffDay);
}

export function rssFeed(calls: Call[], events: Event[], pundits: Pundit[]): string {
  const items = mappedTakes(calls, events, pundits)
    .slice(0, 50)
    .map((take) => {
      const story = pickStory(take, calls, pundits);
      const url = canonicalUrl(takePath(take.event.slug, take.pundit.id));
      return `<item>
<title>${xmlEscape(story.headline)}</title>
<link>${xmlEscape(url)}</link>
<guid isPermaLink="true">${xmlEscape(url)}</guid>
<pubDate>${rssDate(take.call.sourceDate)}</pubDate>
<category>${take.event.sport === "nfl" ? "NFL" : "College Football"}</category>
<description>${xmlEscape(story.dek)}</description>
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${SITE_NAME} — Expert picks</title>
<link>${canonicalUrl("/")}</link>
<description>${xmlEscape(SITE_DESCRIPTION)}</description>
<language>en-us</language>
<lastBuildDate>${rssDate(mappedTakes(calls, events, pundits)[0]?.call.sourceDate ?? "2026-01-01")}</lastBuildDate>
${items}
</channel>
</rss>`;
}

export function newsSitemap(calls: Call[], events: Event[], pundits: Pundit[]): string {
  const urls = recentNewsTakes(mappedTakes(calls, events, pundits))
    .map((take) => {
      const story = pickStory(take, calls, pundits);
      return `<url>
<loc>${xmlEscape(canonicalUrl(takePath(take.event.slug, take.pundit.id)))}</loc>
<news:news>
<news:publication><news:name>${SITE_NAME}</news:name><news:language>en</news:language></news:publication>
<news:publication_date>${take.call.sourceDate}</news:publication_date>
<news:title>${xmlEscape(story.headline)}</news:title>
</news:news>
</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
}
