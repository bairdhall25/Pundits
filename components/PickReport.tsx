import Link from "next/link";
import { PunditAvatar } from "./PunditAvatar";
import type { PickReport as Report, ReportGroup } from "@/lib/pick-report";
import { takePath } from "@/lib/seo";
import s from "./PickReport.module.css";

function ResultChart({ label, group }: { label: string; group: ReportGroup }) {
  const pct = group.picks.length ? group.hits / group.picks.length * 100 : 0;
  return <div className={s.chart}>
    <div className={s.chartTop}><h3>{label}</h3><span>{group.picks.length} picks · {group.games} games</span></div>
    <div className={s.record}>{group.hits}<span>–{group.misses}</span><small>W–L</small></div>
    <div className={s.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
    <p className={s.chartCaption}><strong>{pct.toFixed(pct === 100 ? 0 : 1)}% correct</strong><span>{group.hits} {group.hits === 1 ? "hit" : "hits"} / {group.misses} {group.misses === 1 ? "miss" : "misses"}</span></p>
  </div>;
}

export function PickReport({ report: r }: { report: Report }) {
  const winner = r.underdogs.picks.find(p => p.call.status === "hit")!;
  const companion = r.underdogs.picks.find(p => p.pundit.id === winner.pundit.id && p.event.slug === "toledo-at-michigan-state-2026" && p.call.status === "miss");
  const winnerDog = r.dogGames.find(g => g.hit)!;
  const favoriteWins = r.favoriteGames.filter(g => g.hit).length;
  const lsuCount = r.favorites.picks.filter(p => p.event.slug === "clemson-at-lsu-2026").length;
  const ndCount = r.favorites.picks.filter(p => p.event.slug === "wisconsin-vs-nd-2026").length;
  const unpickedFavorites = r.favoriteGames.filter(g => !r.favorites.picks.some(p => p.event.slug === g.event.slug));
  return <article className={s.report} aria-labelledby="pick-report-title">
    <header className={s.hero}>
      <div className={s.masthead}><span>College football pick report</span><span>2026 / WEEK 01</span></div>
      <div className={s.heroGrid}>
        <div><h1 id="pick-report-title"><span className={s.eyebrow}>College football Week {r.week} results: </span>{r.underdogs.picks.length} underdog picks.<br /><em>One winner.</em></h1>
          <p className={s.dek}>Our tracked picks went {r.hits}–{r.misses} on straight-up winners. The split tells the story: {r.favorites.hits}–{r.favorites.misses} on favorites, {r.underdogs.hits}–{r.underdogs.misses} on underdogs.</p>
        </div>
        <aside className={s.heroStat} aria-label="Underdog results"><span>The upset count</span><strong>1<span>/{r.underdogs.picks.length}</span></strong><p>winning underdog pick</p><small>{r.underdogs.games} different underdogs.<br />Only {winner.label} won.</small></aside>
      </div>
      <div className={s.byline}><span>Analysis by <Link href="/about/">Pundits.Pro</Link></span><span>{r.picks.length} picks · {r.punditCount} pundits · {r.games.length} games</span><a href="#report-method">How we counted ↗</a></div>
    </header>

    <section className={s.section} aria-labelledby="report-split">
      <div className={s.sectionHead}><span className={s.number}>01 / THE SPLIT</span><h2 id="report-split">Same week. Different records.</h2></div>
      <p className={s.prose}>The exception was {winner.pundit.name}’s call for {winner.label} to beat Oklahoma State. Our dated Kalshi snapshot put {winner.label} at {winner.cents}¢. Tulsa won {winnerDog.score}.</p>
      <figure className={s.comparison}><div className={s.chartGrid}><ResultChart label="Favorites" group={r.favorites} /><ResultChart label="Underdogs" group={r.underdogs} /></div><figcaption>Share of tracked selections that picked the winner. Several pundits picked the same teams; these are pick records, not separate game results.</figcaption></figure>
      <p className={s.scope}>Winner-only results. Not against the spread. Favorites and underdogs are classified using dated Kalshi snapshots. This is the sample we tracked, not every prediction these pundits made.</p>
    </section>

    <section className={s.section} aria-labelledby="report-underdogs">
      <div className={s.sectionHead}><span className={s.number}>02 / THE UNDERDOGS</span><h2 id="report-underdogs">Which underdog picks won in Week 1?</h2></div>
      <p className={s.prose}>{r.underdogs.picks.length} selections, {r.underdogs.games} different teams. The table keeps every call in view, including the misses.</p>
      <div className={s.tableWrap}><table className={s.table}>
        <caption>Tracked Week 1 underdogs · 2026 · prices are dated snapshots</caption>
        <thead><tr><th scope="col">Underdog / matchup</th><th scope="col">Who picked it</th><th scope="col">Kalshi snapshot</th><th scope="col">Final / W–L</th></tr></thead>
        <tbody>{r.dogGames.map(g => <tr key={g.event.slug} className={g.hit ? s.winnerRow : undefined}>
          <th scope="row"><Link href={`/picks/${g.event.slug}/`}>{g.label}<span>{g.event.title}</span></Link></th>
          <td className={s.selectors}>{g.picks.map(p => <Link key={p.call.id} href={takePath(g.event.slug, p.pundit.id)}>{p.pundit.name}<span aria-hidden="true"> ↗</span></Link>)}</td>
          <td><div className={s.price}><strong>{g.cents}¢</strong><span>{g.event.sourcedAt}</span></div><div className={s.priceTrack} aria-hidden="true"><span style={{ width: `${g.cents}%` }} /></div></td>
          <td><span className={g.hit ? s.hit : s.miss}>{g.hit ? "✓ Won" : "× Lost"}</span><strong className={s.score}>{g.score}</strong></td>
        </tr>)}</tbody>
      </table></div>
      <p className={s.scope}>Final scores are shown from the underdog’s perspective. A narrow loss and a blowout both count as a miss on the same question: did the picked team win outright?</p>
    </section>

    <section className={s.receipt} aria-labelledby="report-receipt">
      <div className={s.receiptIntro}><span className={s.number}>03 / THE EXCEPTION</span><h2 id="report-receipt">Who picked Tulsa to upset Oklahoma State?</h2><p>{winner.pundit.name} had the only underdog hit in our Week 1 sample.</p></div>
      <div className={s.receiptCard}><div className={s.face}><PunditAvatar src={winner.pundit.photo} alt={winner.pundit.name} size="feed" /><div><strong>{winner.pundit.name}</strong><span>{winner.pundit.outlet}</span></div><span className={s.hit}>✓ Hit</span></div>
        {winner.call.claim.includes("I'm gonna go Tulsa plus 450.") && <blockquote>“I’m gonna go Tulsa plus 450.”</blockquote>}
        <p className={s.source}>Cover 3 · Source: {winner.call.sourceDate}</p>
        <div className={s.receiptNumbers}><div><small>Frozen snapshot</small><strong>{winner.cents}¢</strong><span>as of {winner.event.sourcedAt}</span></div><div><small>Final score</small><strong>{winnerDog.score}</strong><span>Tulsa over Oklahoma State</span></div></div>
        <Link className={s.receiptLink} href={takePath(winner.event.slug, winner.pundit.id)}>Read the original receipt <span>↗</span></Link>
      </div>
      {companion && <p className={s.companion}>The other side of his week: Patterson also picked Toledo, which lost {companion.event.awayScore}–{companion.event.homeScore} at Michigan State. That puts him at {r.underdogs.picks.filter(p => p.pundit.id === winner.pundit.id && p.call.status === "hit").length}–{r.underdogs.picks.filter(p => p.pundit.id === winner.pundit.id && p.call.status === "miss").length} on tracked Week 1 underdogs. <Link href={takePath(companion.event.slug, companion.pundit.id)}>The Toledo receipt ↗</Link></p>}
    </section>

    <section className={s.section} aria-labelledby="report-favorites">
      <div className={s.sectionHead}><span className={s.number}>04 / BEHIND THE RECORD</span><h2 id="report-favorites">How did favorites perform in Week 1?</h2></div>
      <div className={s.contextGrid}><div className={s.prose}><p>Our {r.favorites.hits} winning favorite selections covered {r.favorites.games} different teams in {r.favorites.games} games. LSU accounted for {lsuCount} winning picks; Notre Dame supplied {ndCount} more. Those two results produced {lsuCount + ndCount} of the {r.favorites.hits} hits.</p><p>Across all {r.games.length} games we covered, favorites went {favoriteWins}–{r.games.length - favoriteWins}. {unpickedFavorites.map(g => g.label).join(", ")} had no tracked favorite-side selections.</p><p>A pundit-pick record and a game-level record answer different questions. The {r.favorites.hits}–{r.favorites.misses} figure describes the favorite selections we captured. It does not mean {r.favorites.hits} separate favorites won.</p></div>
      <figure className={s.gameChart}><span className={s.number}>ONE SQUARE = ONE GAME</span><strong>{favoriteWins}<span>–{r.games.length - favoriteWins}</span></strong><p>Favorite game results</p><div className={s.gameDots} aria-hidden="true">{r.favoriteGames.map(g => <span key={g.event.slug} className={g.hit ? s.dotHit : s.dotMiss} />)}</div><figcaption>{favoriteWins} wins · {r.games.length - favoriteWins} {r.games.length - favoriteWins === 1 ? "loss" : "losses"} across {r.games.length} covered games.<br />Losing favorite: {r.favoriteGames.filter(g => !g.hit).map(g => g.label).join(", ") || "none"}.</figcaption></figure></div>
    </section>

    <section className={s.closing} aria-labelledby="report-next"><span className={s.number}>THE NEXT QUESTION</span><h2 id="report-next">What does this tell us about expert pick accuracy?</h2><p>A winning percentage becomes more informative when you can see the selections underneath it: favorites or underdogs, how many distinct games, and which public calls produced the record. One week of this selected sample cannot establish who has a lasting advantage at predicting upsets.</p><p>The question for the next report is whether anyone keeps finding successful underdogs as their sample grows.</p><Link href="/ncaaf/">Follow the current college football picks <span>→</span></Link></section>
    <section id="report-method" className={s.method} aria-labelledby="report-method-title"><h2 id="report-method-title">How we counted the picks</h2><p>We used the published game-winner picks for college football Week 1 of the 2026 season. All {r.picks.length} were graded. Each pundit counts once per game. Week 0, NFL, season-long predictions, tentative commentary and takes without a specific tracked event and side are excluded.</p><p>For this report, underdogs are picked sides below 50¢ in the displayed dated Kalshi snapshot; favorites are above 50¢. No selection was missing a price or exactly 50¢. These shared event snapshots are not closing odds or necessarily the prices when a prediction was made. The records measure straight-up results, not spread covers or betting returns.</p><Link href="/methodology/">How Pundits.Pro verifies and grades picks ↗</Link></section>
    <div className={s.archiveHeading}><span className={s.number}>THE COMPLETE LEDGER</span><p>Every disagreement. Every graded pick. The original receipts below.</p></div>
  </article>;
}
