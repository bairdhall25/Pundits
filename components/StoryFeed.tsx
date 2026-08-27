import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { formatCents, formatShortDate } from "@/lib/format";
import { pickStory, takePath, type MappedTake } from "@/lib/seo";

function sideLabel(take: MappedTake): string {
  if (take.call.side === "yes") return take.event.awayTeam ?? "YES";
  return take.event.homeTeam ?? "NO";
}

function sideCents(take: MappedTake): number | null {
  return take.call.side === "yes" ? take.event.yesCents : take.event.noCents;
}

export function StoryFeed({ takes }: { takes: MappedTake[] }) {
  return (
    <ol className="feed">
      {takes.map((take) => {
        const story = pickStory(take);
        const tone = take.call.side ?? "no";
        const href = takePath(take.event.slug, take.pundit.id);
        const when = formatShortDate(take.call.sourceDate);
        return (
          <li key={`${take.event.slug}-${take.pundit.id}`} className={`feed-post ${tone}`}>
            <Link href={href} className="feed-hit" aria-label={story.headline} />
            <PunditAvatar
              src={take.pundit.photo}
              alt={take.pundit.name}
              size="feed"
            />
            <div className="feed-main">
              <div className="feed-top">
                <div>
                  <div className="nm type-broadcast">{take.pundit.name}</div>
                  <div className="feed-by">
                    {take.pundit.outlet}
                    {when ? ` · ${when}` : ""}
                  </div>
                </div>
                <div className={`px type-broadcast ${tone === "yes" ? "px-yes" : ""}`}>
                  {formatCents(sideCents(take))}
                </div>
              </div>
              <h2 className="feed-hd type-broadcast">{story.headline}</h2>
              <p className="feed-qt">“{take.call.claim}”</p>
              <div className="feed-meta">
                {tone.toUpperCase()} · {sideLabel(take)}
                <span>{take.event.title}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
