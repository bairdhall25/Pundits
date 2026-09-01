import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { ShareButton } from "@/components/ShareButton";
import { TrackLink } from "@/components/TrackLink";
import { pickStoryOpenParams } from "@/lib/analytics";
import { formatCents, statusLabel } from "@/lib/format";
import { sharePayload } from "@/lib/share-link";
import type { StoryCard } from "@/lib/story-card";

export function StoryFeed({ cards }: { cards: StoryCard[] }) {
  if (!cards.length) {
    return <p className="lede">No stories on this filter yet.</p>;
  }
  return (
    <ol className="feed">
      {cards.map((card) => (
        <li
          key={`${card.eventSlug}-${card.punditId}`}
          className={`feed-post ${card.side}`}
        >
          <TrackLink
            href={card.href}
            className="feed-hit"
            ariaLabel={card.headline}
            event="pick_story_open"
            params={pickStoryOpenParams({
              eventSlug: card.eventSlug,
              punditId: card.punditId,
              status: card.status,
              surface: "stories",
            })}
          />
          <PunditAvatar src={card.photo} alt={card.name} size="feed" />
          <div className="feed-main">
            <div className="feed-kicker">
              <span>{card.sport === "nfl" ? "NFL" : "NCAAF"}</span>
              <span>{card.kind === "game" ? "Game" : "Future"}</span>
              {card.kickoff ? <span>{card.kickoff}</span> : null}
              <span>{statusLabel(card.status)}</span>
            </div>
            <div className="feed-top">
              <div>
                <div className="nm type-broadcast">{card.name}</div>
                <div className="feed-by">
                  {card.outlet}
                  {card.date ? ` · ${card.date}` : ""}
                </div>
              </div>
              <div
                className={`px type-broadcast ${card.side === "yes" ? "px-yes" : ""}`}
              >
                {formatCents(card.cents)}
              </div>
            </div>
            <h2 className="feed-hd">{card.headline}</h2>
            <p className="feed-qt">“{card.quote}”</p>
            <div className="feed-meta">
              {card.sideChip}
              <span>{card.eventTitle}</span>
            </div>
            <ShareButton
              compact
              share={sharePayload({
                title: card.headline,
                text: card.headline,
                path: card.href,
                image: `/og/takes/${card.eventSlug}--${card.punditId}.png`,
                story: `/og/stories/takes/${card.eventSlug}--${card.punditId}.png`,
              })}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
