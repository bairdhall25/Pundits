# Whose Bet Cashes Competitive Profile

Status: Evidence with an active monitoring checklist

Baseline researched: 2026-08-29

Website: https://whosebetcashes.com/

X: [@whosebetcashes](https://x.com/whosebetcashes) (0 followers, 0 posts on 2026-08-29)

Builder: Gunnari Auvinen

## Current assessment

Whose Bet Cashes is the closest *mechanism* to Pundits.Pro: a committed on-air quote, a timestamped receipt, a grade, a public leaderboard. The corpus is betting-show ATS/props/units, not GameDay/Cover 3 straight-up comments, and the price is a sportsbook number plus closing-line value, not a frozen Kalshi snapshot.

It is a serious side project with a real pipeline and almost no distribution. Do not copy units/ROI as the hero object. Do study the receipt plus vetting plus settle-loop, which is further along than Pundits' first grading cycle.

## Baseline signals

- Homepage 2026-08-29 (self-reported on-site): 36,721 picks tracked; settled 15,437-20,288-424; 43.2% hit rate; -1,990.64u. Last 30 days 96-148-2, -45.54u. Conviction split: locks/hammers -5.9% ROI, standard -5.0%, leans/sprinkles -21.9%.
- Tagline: "Every betting pick made on the shows we track, graded win or loss. Follow the people who cash — fade the ones who don't."
- Personalities overlapping Pundits' world appear as guests or hosts with small samples in this scrape (Cowherd, Nick Wright, Stuckey, Collin Wilson, Kanell, Patterson, Orlovsky, Fallica, Finebaum, McAfee, Klatt). The volume leaders are betting-show regulars (Matt Perrault, Nick Kostos, Femi Abebefe, and others).
- Builder writeup: https://gunnariauvinen.com/posts/building-whose-bet-cashes/ — RSS ingest, Whisper transcription, Claude extraction, verbatim-in-transcript vetting gate, GitHub Action cron, JSON-in-git as source of truth, ESPN scoreboard settle, human PR review before publish. Same "static JSON is the record" instinct as Pundits.
- Commitment rules drop leans, future intent, and listener advice. Quote must exist verbatim at the stated timestamp.
- X account exists and is unused (0 followers, 0 posts). No funding, company, or customers verified.

## Competitive interpretation

### Strengths

- Receipt stack is real: quote, timestamp, audio archive, grade, provenance field (`espn` / `research` / `manual`).
- Operating at tens of thousands of picks with automated settle plus human merge.
- Honest about the house edge. The site's thesis is that talk-show picks are entertainment.
- CLV / beat-the-close charts are a sharper "were they any good" take than SU%.

### Weaknesses

- Betting-show customer, not the fan who wants Herbstreit on UNC–TCU.
- Units and ROI pull it into capper-tracker territory Pundits should not occupy.
- Zero X. The book is invisible on Saturday.
- Seven-show corpus (from the builder post's examples: The Herd, Action Network, Sharp or Square, The Favorites, UnSportsmanLike, What's Wright?). Not GameDay.
- One operator reviewing every PR.

## Implications for Pundits.Pro

- The wedge stays: public SU comments from named TV/podcast pundits, quote plus source URL plus frozen Kalshi, hit/miss — not "did the ATS bet cash."
- Steal the discipline, not the object: verbatim-in-source check, settle provenance, do not ship a pick the quote cannot support.
- Overlapping names (Kanell, Patterson, Cowherd) will confuse if Pundits ever shows units. Don't.
- Git-as-ledger is a cousin of Pundits' static JSON. Not a reason to change storage.

## Partnership thesis

Complementary corpora. Possible later: they keep betting-show ATS; Pundits keeps public SU comments; a shared "this person on the record" index. Only if rights to show audio/transcripts are clean and Gunnari wants it. Not a 2026 distribution partner.

## Monitoring checklist

- Whether `@whosebetcashes` ever posts.
- New shows, especially Cover 3 / GameDay / McAfee as first-class sources.
- Whether they add SU public comments without a number.
- Corpus size and whether the settle loop stays current during CFB/NFL season.

## Sources

- https://whosebetcashes.com/
- https://gunnariauvinen.com/posts/building-whose-bet-cashes/
- https://gunnariauvinen.com/projects/
- https://x.com/whosebetcashes

## Observations

- 2026-08-29: first Pundits competition pass. Closest mechanism, different job.
