# Predicted Sports Competitive Profile

Status: Evidence with an active monitoring checklist

Baseline researched: 2026-08-29

Website: https://predictedsports.com/

X: [@predictedsports](https://x.com/predictedsports)

## Current assessment

Predicted Sports was building public, graded AI pick boards (CFB + NFL) as a "lock the pick, grade it in public" cousin. As of **2026-09-30** the entire site is **owner-suspended on Render**: homepage, `/cfb/board`, `/nfl/board`, and `/leaderboard` all return HTTP 503 with body "This service has been suspended by its owner" and response header `x-render-routing: suspend-by-user`. Public CFB/NFL board surfaces that were live through the 2026-09-16 / 2026-09-23 radar windows are not reachable.

The core object remains a model call, not a named pundit's quote — and while offline there is no SEO collision or graded NFL/CFB board to watch week-to-week. Do not copy its feature set. No Pundits roadmap change from the suspension alone.

Threat: **Low** while suspended (was Medium when boards were live). Partnership potential: deferred until the product returns; not a 2026 priority. Re-score immediately if boards come back with denser human-expert or quote surfaces.

## Baseline signals

- Homepage 2026-08-29: "Every game, forecast and graded in public." MLB and UFC live. Claims Gemini 3.7 Flash leading an index at 60% (103–68 across 171 graded games); MLB consensus 56% (421 of 751); UFC consensus 70% (68 of 97). Numbers are self-reported on-site.
- CFB board https://predictedsports.com/cfb/board showed Week 1 2026 games including North Carolina @ TCU with an AI consensus (TCU 7/7 in the snippet captured this pass), projected scores, and a sportsbook line. Individual model calls gated as Pro.
- Head-to-head hub https://predictedsports.com/vs and a 2026-08-06 post claiming 171 H2H pages, including models vs ESPN BPI and CBS Sports staff, picks captured before the game and never edited. Opus vs ESPN BPI was stated as 34-34 on shared games.
- Monetization: free consensus; Pro for per-model calls, Daily Edge, and strategies; 7-day free trial advertised. Email list for a monthly AI report.
- X profile on 2026-08-29 (fxtwitter): `@predictedsports`, 8 followers, 7 posts. Bio: "Sports models, predictions & data."
- Operator/funding not verified in this pass.

## Competitive interpretation

### Strengths

- Same loop Pundits needs: lock before, grade after, show losses.
- Event pages and H2H URLs are built for search ("Claude vs ChatGPT sports predictions").
- (Historical, pre-suspension) CFB/NFL boards covered the same weeks Pundits cares about when live.
- Human expert records are already in the comparison set, even if they are not the hero.
- Explicit $9/mo Pro funnel with audited strategy claims on the homepage.

### Weaknesses

- Models are not named people fans argue about in a bar.
- Almost no X distribution (`@predictedsports` **9** followers as of 2026-09-30; was 8 on 2026-09-16).
- **Site currently offline** (Render suspend-by-user as of 2026-09-30) — no public board or Pro funnel to evaluate until restored.
- Pro paywall on the interesting split ("which model picked what").
- No verbatim quote or source URL as the object.
- Frozen Kalshi context is not the product; they show a sportsbook line beside AI consensus.

## Implications for Pundits.Pro

- Expect SEO overlap on "[game] picks" pages. Pundits' differentiator is the named human plus the quote, not another consensus percentage.
- Do not add AI model boards. That is their product; it is explicitly out of Pundits' parked scope.
- If they lean harder into CBS/ESPN staff records, they become a closer cousin to Cole/Pickwatch. Re-score then.
- NFL board going live does not change the white space: still no named pundit + quote + Kalshi card.

## Partnership thesis

Possible later: they have model boards; Pundits has named-quote receipts. Only interesting if both have density on the same events and rights are clean. Not a 2026 priority.

## Monitoring checklist

- Whether the Render suspension lifts and CFB/NFL boards return.
- If restored: board density, Week progression beyond the last-seen NFL Week 1 / CFB Week 4 window, and whether human experts get first-class pages.
- X growth from ~9 followers.
- Pricing / what stays free.
- Whether they start quoting analysts rather than staff consensus blobs.

## Sources

- https://predictedsports.com/
- https://predictedsports.com/cfb/board
- https://predictedsports.com/nfl/board
- https://predictedsports.com/vs
- https://predictedsports.com/p/claude-vs-chatgpt-sports-predictions
- https://x.com/predictedsports
- https://api.fxtwitter.com/predictedsports (followers snapshot 2026-09-16; re-checked 2026-09-30 → 9)
- Render response headers on 2026-09-30 (`x-render-routing: suspend-by-user`)

## Observations

- 2026-08-29: first Pundits competition pass. Public-ledger cousin, different hero object.

- 2026-09-02 (weekly radar): **Material.** CFB AI Pick Board at https://predictedsports.com/cfb/board is live and grading (Week 0 games graded with consensus + finals; Week 1 slate has consensus calls). Leaderboard CFB section shows **8 graded games**. NFL board at https://predictedsports.com/nfl/board exists for Week 1 (Sep 9+) but picks still say field projects land game week. Pro strategies UI still MLB/UFC/EPL-focused ($9/mo). Still AI-model consensus + public grades, not named human + verbatim quote + source + Kalshi. Threat stays **Medium** (public-ledger/SEO cousin now denser on CFB); partnership call unchanged. Watch NFL picks filling next week.

- 2026-09-09 (weekly radar): No material change vs 2026-09-02. CFB board at Week 2 consensus (continuation). NFL `/nfl/board` still scaffolded with "Field projects picks land game week" for the Week 1 slate. `@predictedsports` still ~8 followers.

- 2026-09-16 (weekly radar): **Material.** NFL board at https://predictedsports.com/nfl/board is live as "NFL Week 1" with field consensus for the Sep 13–14 slate (CHI at CAR through DEN at KC): projected margins/totals, ATS vote counts (e.g. 7/7, 4/8), Pro-gated per-model projected scores. Scaffold / "picks land game week" placeholder is gone. CFB board at Week 3 FBS consensus (continuation). Homepage still pitches verified betting performance (+$12,000 at $100/play, +120.0 units, 56.8% win rate on 710–541 / 1251 plays), $9/mo Pro, and featured strategies. `@predictedsports` still **8 followers** (fxtwitter). Threat stays **Medium** (NFL surface now real; still not named-pundit + Kalshi). Partnership call unchanged. No Pundits roadmap change.

- 2026-09-23 (weekly radar): No material change vs 2026-09-16. CFB Week 4 continuation; NFL `/nfl/board` still Week 1 field consensus (no Week 2/3 board observed). `@predictedsports` still ~8 followers. Threat Medium unchanged. (No PR — quiet week.)

- 2026-09-30 (weekly radar): **Material.** Entire https://predictedsports.com/ surface is **suspended by owner** on Render. Verified HTTP **503** on `/`, `/cfb/board`, `/nfl/board`, `/leaderboard`; HTML title "Service Suspended"; body "This service has been suspended by its owner."; response header `x-render-routing: suspend-by-user`. Prior live CFB (through Week 4 continuum) and NFL Week 1 boards are unreachable. `@predictedsports` **9 followers** / 7 posts (fxtwitter). Threat moves **Medium → Low** while offline; partnership deferred. Still not named-pundit + quote + Kalshi. **No Pundits roadmap change.** Watch for restore.
