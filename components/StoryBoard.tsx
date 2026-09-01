"use client";

import { useMemo, useState } from "react";
import { StoryFeed } from "@/components/StoryFeed";
import { filterUseParams, trackEvent } from "@/lib/analytics";
import { storyHaystack, type StoryCard, type StoryKind } from "@/lib/story-card";
import type { Sport } from "@/lib/types";

type SportFilter = "all" | Sport;
type KindFilter = "all" | StoryKind;
type GroupBy = "latest" | "matchup";

export function StoryBoard({ cards }: { cards: StoryCard[] }) {
  const [sport, setSport] = useState<SportFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [group, setGroup] = useState<GroupBy>("latest");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter((c) => {
      if (sport !== "all" && c.sport !== sport) return false;
      if (kind !== "all" && c.kind !== kind) return false;
      if (needle && !storyHaystack(c).includes(needle)) return false;
      return true;
    });
  }, [cards, sport, kind, q]);

  const matchups = useMemo(() => {
    const map = new Map<string, { title: string; cards: StoryCard[] }>();
    for (const c of shown) {
      const row = map.get(c.eventSlug) ?? { title: c.eventTitle, cards: [] };
      row.cards.push(c);
      map.set(c.eventSlug, row);
    }
    return [...map.values()];
  }, [shown]);

  return (
    <>
      <div className="feed-tools">
        <div className="feed-tabs" role="tablist" aria-label="League">
          {(
            [
              ["all", "All"],
              ["ncaaf", "NCAAF"],
              ["nfl", "NFL"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={sport === value}
              className={sport === value ? "on" : undefined}
              onClick={() => {
                trackEvent(
                  "filter_use",
                  filterUseParams({
                    surface: "stories",
                    filterName: "sport",
                    filterValue: value,
                  })
                );
                setSport(value);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <details className="feed-more">
          <summary className={kind !== "all" || group !== "latest" ? "on" : undefined}>
            Filter &amp; sort
          </summary>
          <div className="feed-more-panel">
            <div className="feed-tabs" role="tablist" aria-label="Kind">
              {(
                [
                  ["all", "All takes"],
                  ["game", "Games"],
                  ["future", "Futures"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={kind === value}
                  className={kind === value ? "on" : undefined}
                  onClick={() => {
                    trackEvent(
                      "filter_use",
                      filterUseParams({
                        surface: "stories",
                        filterName: "kind",
                        filterValue: value,
                      })
                    );
                    setKind(value);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="feed-tabs" role="tablist" aria-label="Order">
              {(
                [
                  ["latest", "Latest"],
                  ["matchup", "By game"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={group === value}
                  className={group === value ? "on" : undefined}
                  onClick={() => {
                    trackEvent(
                      "filter_use",
                      filterUseParams({
                        surface: "stories",
                        filterName: "group",
                        filterValue: value,
                      })
                    );
                    setGroup(value);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </details>
        <label className="feed-search">
          <span className="sr-only">Search stories</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pundit, team, quote"
          />
        </label>
      </div>
      <p className="feed-count">
        {shown.length} {shown.length === 1 ? "story" : "stories"}
      </p>
      {group === "matchup" ? (
        matchups.map((m) => (
          <section key={m.title + m.cards[0].eventSlug} className="feed-group">
            <h2 className="type-broadcast feed-group-hd">{m.title}</h2>
            <StoryFeed cards={m.cards} />
          </section>
        ))
      ) : (
        <StoryFeed cards={shown} />
      )}
    </>
  );
}
