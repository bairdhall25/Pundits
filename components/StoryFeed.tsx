import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { formatCents } from "@/lib/format";
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
          <Link href={card.href} className="feed-hit" aria-label={card.headline} />
          <PunditAvatar src={card.photo} alt={card.name} size="feed" />
          <div className="feed-main">
            <div className="feed-kicker">
              <span>{card.sport === "nfl" ? "NFL" : "NCAAF"}</span>
              <span>{card.kind === "game" ? "Game" : "Future"}</span>
              {card.kickoff ? <span>{card.kickoff}</span> : null}
              <span>{card.status === "pending" ? "Live" : card.status === "hit" ? "Hit" : "Miss"}</span>
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
            <h2 className="feed-hd type-broadcast">{card.headline}</h2>
            <p className="feed-qt">“{card.quote}”</p>
            <div className="feed-meta">
              {card.sideChip}
              <span>{card.eventTitle}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
