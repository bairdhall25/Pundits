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
  return <article className={s.report} aria-labelledby="pick-report-title">
    <header className={s.hero}>
      <div className={s.masthead}><span>College football pick report</span><span>2026 / WEEK 01</span></div>
      <div className={s.heroGrid}>
        <div><h1 id="pick-report-title"><span className={s.eyebrow}>College football Week {r.week} results: </span>{r.underdogs.picks.length} underdog picks.<br /><em>One winner.</em></h1>
          <p className={s.dek}>Every tracked favorite pick was correct. {winner.pundit.name}’s {winner.label} call was the lone underdog hit—but the perfect favorite record needs a closer look.</p>
        </div>
      </div>
      <div className={s.byline}><span>Analysis by <Link href="/about/">Pundits.Pro</Link></span><span>{r.picks.length} picks · {r.punditCount} pundits · {r.games.length} games</span><a href="#report-method">How we counted ↗</a></div>
    </header>

    <section className={s.section} aria-labelledby="report-split">
      <div className={s.sectionHead}><h2 id="report-split">What happened in Week 1?</h2></div>
      <div className={s.prose}><p>Favorites finished unbeaten in our Week 1 ledger: every tracked favorite selection was correct, while only one underdog selection hit. Together, the picks finished {r.hits}–{r.misses} on outright winners.</p><p>That split needs context. These are {r.picks.length} selections from {r.punditCount} pundits across {r.games.length} games, with several people backing the same teams. The {r.underdogs.picks.length} underdog picks represented {r.underdogs.games} different teams; only {winner.label} won. This is the sample we captured, not every prediction those pundits made.</p></div>
      <figure className={s.comparison}><div className={s.chartGrid}><ResultChart label="Favorites" group={r.favorites} /><ResultChart label="Underdogs" group={r.underdogs} /></div><figcaption>Straight-up pick results, not against the spread. Groups use dated Kalshi snapshots; see the counting method below.</figcaption></figure>
    </section>

    <section className={s.receipt} aria-labelledby="report-receipt">
      <div className={s.receiptIntro}><h2 id="report-receipt">Who picked Tulsa to upset Oklahoma State?</h2><p>{winner.pundit.name} backed {winner.label} on Cover 3 before the game. Our dated snapshot put Tulsa at {winner.cents}¢; the Golden Hurricane then beat Oklahoma State {winnerDog.score}, delivering the week’s only winning underdog selection.</p><p>The original receipt makes that call verifiable. It also belongs alongside Patterson’s misses, rather than standing alone as proof of an upset-picking edge.</p></div>
      <div className={s.receiptCard}><div className={s.face}><PunditAvatar src={winner.pundit.photo} alt={winner.pundit.name} size="feed" /><div><strong>{winner.pundit.name}</strong><span>{winner.pundit.outlet}</span></div><span className={s.hit}>✓ Hit</span></div>
        {winner.call.claim.includes("I'm gonna go Tulsa plus 450.") && <blockquote>“I’m gonna go Tulsa plus 450.”</blockquote>}
        <p className={s.source}>Cover 3 · Source: {winner.call.sourceDate}</p>
        <div className={s.receiptNumbers}><div><small>Frozen snapshot</small><strong>{winner.cents}¢</strong><span>as of {winner.event.sourcedAt}</span></div><div><small>Final score</small><strong>{winnerDog.score}</strong><span>Tulsa over Oklahoma State</span></div></div>
        <Link className={s.receiptLink} href={takePath(winner.event.slug, winner.pundit.id)}>Read the original receipt <span>↗</span></Link>
      </div>
      {companion && <p className={s.companion}>The other side of his week: Patterson also picked Toledo, which lost {companion.event.awayScore}–{companion.event.homeScore} at Michigan State. That puts him at {r.underdogs.picks.filter(p => p.pundit.id === winner.pundit.id && p.call.status === "hit").length}–{r.underdogs.picks.filter(p => p.pundit.id === winner.pundit.id && p.call.status === "miss").length} on tracked Week 1 underdogs. <Link href={takePath(companion.event.slug, companion.pundit.id)}>The Toledo receipt ↗</Link></p>}
    </section>

    <section className={s.section} aria-labelledby="report-underdogs">
      <div className={s.sectionHead}><h2 id="report-underdogs">Which underdog picks won in Week 1?</h2></div>
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
      <p className={s.scope}>Final scores are shown from the underdog’s perspective.</p>
    </section>

    <section className={s.section} aria-labelledby="report-favorites">
      <div className={s.sectionHead}><h2 id="report-favorites">What’s behind the perfect favorite record?</h2></div>
      <div className={s.prose}><p>LSU supplied {lsuCount} winning picks and Notre Dame supplied {ndCount}: {lsuCount + ndCount} of the {r.favorites.hits} favorite hits came from just two results. The favorite record therefore reflects repeated agreement on a few teams, not {r.favorites.hits} independent winning games.</p><p>Across all {r.games.length} covered games, favorites went {favoriteWins}–{r.games.length - favoriteWins}. Oklahoma State lost, but nobody in our ledger had picked it. That difference explains why the captured favorite selections could finish unbeaten.</p><p>One week cannot establish lasting predictive skill. The useful next question is whether pundits keep finding successful underdogs as their records grow—and whether those hits hold up when every miss stays in view.</p></div>
      <Link className={s.nextLink} href="/ncaaf/">Follow the current college football picks <span>→</span></Link>
    </section>

    <section id="report-method" className={s.method} aria-labelledby="report-method-title"><h2 id="report-method-title">How we counted the picks</h2><p>We used the published game-winner picks for college football Week 1 of the 2026 season. All {r.picks.length} were graded. Each pundit counts once per game. Week 0, NFL, season-long predictions, tentative commentary and takes without a specific tracked event and side are excluded.</p><p>For this report, underdogs are picked sides below 50¢ in the displayed dated Kalshi snapshot; favorites are above 50¢. No selection was missing a price or exactly 50¢. These shared event snapshots are not closing odds or necessarily the prices when a prediction was made. The records measure straight-up results, not spread covers or betting returns.</p><Link href="/methodology/">How Pundits.Pro verifies and grades picks ↗</Link></section>
  </article>;
}
