import { EmailInterestForm } from "@/components/EmailInterestForm";
import { EventCard } from "@/components/EventCard";
import { SportFilter } from "@/components/SportFilter";
import {
  BookPeek,
  FuturePeek,
  PeekRow,
  StoryPeek,
  TablePeek,
} from "@/components/PeekRow";
import {
  getActivityBoard,
  getFuturesPeek,
  getWeekend,
  hasGradedRecords,
  latestCalls,
  settledSide,
  loadCalls,
  loadEvents,
  loadPundits,
} from "@/lib/data";
import { mappedTakes, pickStory, takePath } from "@/lib/seo";
import type { Event, Call, Pundit } from "@/lib/types";

function Weekend({
  id,
  kicker,
  label,
  when,
  href,
  events,
  calls,
  pundits,
}: {
  id: string;
  kicker: string;
  label: string;
  when: string;
  href: string;
  events: Event[];
  calls: Call[];
  pundits: Pundit[];
}) {
  return (
    <section id={id} className="board">
      <div className="row-head">
        <div>
          <div className="board-kicker type-broadcast">{kicker}</div>
          <h2 className="board-title type-broadcast">{label}</h2>
          <div className="when">{when}</div>
        </div>
        <a className="see" href={href}>
          Full {label} slate →
        </a>
      </div>
      {events.map((event) => (
        <EventCard
          key={event.slug}
          event={event}
          calls={calls}
          pundits={pundits}
        />
      ))}
    </section>
  );
}

export default function HomePage() {
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const ncaaf = getWeekend("ncaaf", events);
  const nfl = getWeekend("nfl", events);
  const futures = [
    ...getFuturesPeek("ncaaf", events, calls, 3),
    ...getFuturesPeek("nfl", events, calls, 2),
  ];
  const table = getActivityBoard(pundits, calls).slice(0, 10);
  const book = latestCalls(calls, 6);
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const stories = mappedTakes(calls, events, pundits).slice(0, 8);
  const withPicks = ncaaf.filter((e) =>
    calls.some((c) => c.eventSlug === e.slug)
  );
  // An open game with picks beats a settled one; a settled marquee is the
  // fallback only when everything has graded.
  const marquee =
    withPicks.find((e) => !settledSide(e, calls)) ?? withPicks[0] ?? ncaaf[0];
  const ncaafRest = marquee ? ncaaf.filter((e) => e !== marquee) : ncaaf;

  return (
    <main id="main" className="shell">
      <div className="hero">
        <div className="hero-copy">
          <div className="eyebrow type-broadcast">
            Active picks · opening weekend
          </div>
          <h1 className="mb-2 mt-1 text-[clamp(32px,8vw,56px)] leading-[0.92] tracking-wide lg:text-[72px]">
            Who’s picking
            <br />
            what.
          </h1>
          <p className="lede lg:text-lg">
            College football and NFL picks from named analysts and
            commentators. See who they’re taking, the quote, and the market
            price.
          </p>
          <ul className="trust-bar">
            <li>Real quotes, linked to source</li>
            <li>Prices frozen from Kalshi</li>
            <li>After the game, we mark who was right</li>
          </ul>
        </div>
        {marquee ? (
          <div className="hero-card">
            <div className="hero-card-kicker type-broadcast">
              Marquee · College football
            </div>
            <EventCard event={marquee} calls={calls} pundits={pundits} />
          </div>
        ) : null}
      </div>
      <details className="how">
        <summary>How it works</summary>
        <p>
          These are public comments from named experts, not bets they placed.
          The number is a frozen Kalshi price, not a live sportsbook line.
          Open a card for the quote and source. After the game we mark who was
          right. An empty side means no verified pick has been captured yet.
        </p>
      </details>
      <SportFilter current="all" />
      <nav className="board-jump" aria-label="Jump to section">
        <span className="board-jump-label">Jump to</span>
        <a href="#ncaaf">College</a>
        <a href="#nfl">NFL</a>
        <a href="#futures">Disagreements</a>
      </nav>

      <Weekend
        id="ncaaf"
        kicker="Opening weekend"
        label="College football"
        when="Week 0 Sat Aug 29 · Week 1 Sep 3–7 · verified picks with original quotes"
        href="/ncaaf/"
        events={ncaafRest}
        calls={calls}
        pundits={pundits}
      />
      <Weekend
        id="nfl"
        kicker="Up next"
        label="NFL"
        when="Week 1 · Sep 9–14 · regular season, not preseason"
        href="/nfl/"
        events={nfl}
        calls={calls}
        pundits={pundits}
      />

      <section id="futures" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">Pundit vs pundit</div>
            <h2 className="board-title type-broadcast">Biggest disagreements</h2>
          </div>
          <span className="flex gap-3">
            <a className="see" href="/ncaaf/">
              NCAAF →
            </a>
            <a className="see" href="/nfl/">
              NFL →
            </a>
          </span>
        </div>
        <PeekRow>
          {futures.map((event) => (
            <FuturePeek
              key={event.slug}
              event={event}
              calls={calls}
              pundits={pundits}
            />
          ))}
        </PeekRow>
      </section>

      <section id="takes" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">Takes · quote feed</div>
            <h2 className="board-title type-broadcast">Latest verified picks</h2>
          </div>
          <a className="see" href="/stories/">
            All takes →
          </a>
        </div>
        <PeekRow>
          {stories.map((take) => {
            const story = pickStory(take, calls, pundits);
            return (
              <StoryPeek
                key={`${take.event.slug}-${take.pundit.id}`}
                href={takePath(take.event.slug, take.pundit.id)}
                headline={story.headline}
                kicker={`${take.call.source}${take.call.sourceDate ? ` · ${take.call.sourceDate}` : ""}`}
              />
            );
          })}
        </PeekRow>
      </section>

      <section id="table" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">Most on record</div>
            <h2 className="board-title type-broadcast">The table</h2>
          </div>
          <a className="see" href="/leaderboard/">
            Full table →
          </a>
        </div>
        <PeekRow>
          {table.map((p) => (
            <TablePeek key={p.id} p={p} graded={hasGradedRecords(table)} />
          ))}
        </PeekRow>
      </section>

      <section id="book" className="board">
        <div className="row-head">
          <div>
            <div className="board-kicker type-broadcast">The Book · compact ledger</div>
            <h2 className="board-title type-broadcast">Fresh quotes</h2>
          </div>
          <a className="see" href="/book/">
            Open The Book →
          </a>
        </div>
        <PeekRow>
          {book.map((c) => {
            const p = byId[c.punditId];
            if (!p) return null;
            return <BookPeek key={c.id} call={c} pundit={p} />;
          })}
        </PeekRow>
      </section>

      <EmailInterestForm placement="home" scope="all" />
    </main>
  );
}
