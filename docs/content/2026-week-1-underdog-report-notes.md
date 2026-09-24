# Week 1 College Football Pick Report: verification and publishing notes

Status: Evidence

Date: 2026-09-10. Owner: Codex for article/data; Grok for a subsequent tweeting assignment only. Article remains an unpublished draft.

## Provenance

- Retrieved 2026-09-10T04:39:36.839Z.
- Live social index generatedAt: 2026-09-10T04:04:17.347Z.
- Sources: https://pundits.pro/social/cards.json and current main's https://raw.githubusercontent.com/bairdhall25/Pundits/main/data/events.json and https://raw.githubusercontent.com/bairdhall25/Pundits/main/data/calls.json .
- Cross-checked the published Week 1 archive and Patterson's Tulsa/Toledo receipts. Read the live methodology, including visible FAQ.
- Local raw retrieval snapshot and calculated rows: `.agent-artifacts/week1-underdog-report/verified-snapshot.json` (local verification artifact, not a production data file).
- The operator checkout remains stale relative to current main/publication. Analysis uses the fetched published/current-main data, not the local editorial JSON. No editorial records were edited.

## Reproduction and reconciliation

1. Select repository events with sport=ncaaf, kind=game, season=2026, week=1.
2. Select hard calls with a side mapped to those events; check uniqueness by punditId + eventSlug.
3. Match the live social index by that same key, status, and side. Check displayed price and snapshot date against current main's event fields.
4. Bucket the selected side price: below 50 underdog; above 50 favorite; exactly 50 and missing separately. Count hits, misses and pending, plus unique games and pundits.
5. For game-level results, compare final scores with the favorite side in each event's dated snapshot, counting each game once. Check published grades against those scores.

| Check | Result |
|---|---|
| Current-main mapped hard picks / live takes | 39 / 39 |
| Distinct pundits / games | 17 / 11 |
| Duplicate pundit/event keys | 0 |
| Status or side mismatches | 0 |
| All picks | 28 hits, 11 misses, 0 pending |
| Favorite selections | 27 hits, 0 misses; 8 distinct games |
| Underdog selections | 1 hit, 11 misses; 7 distinct games |
| Missing or exactly-50-cent prices | 0 |
| Game-level favorite record across covered slate | 10-1 across 11 games |
| Favorite games with no favorite-side pick | Michigan State, South Florida, Oklahoma State |

The eight favorite-selection games and seven underdog-selection games overlap on four games. They do not total 15 separate games. The selected underdogs went 1-6 at the team/game level. Tulsa was the sole winner; its one tracked selector was Patterson. His Toledo miss makes his Week 1 underdog record 1-1. Ten LSU picks and seven Notre Dame picks account for 17 of 27 favorite hits.

## Editorial and SEO decisions

- Selected headline: College football Week 1 results: 12 underdog picks, one winner.
- Search intent: retrospective college football expert underdog picks/results, with a dated Week 1 scope. No claim to supply upcoming picks or comprehensive league betting trends.
- Recommended initial home: editorial synthesis within the existing `/ncaaf/2026/week-1/` archive, preserving that permanent URL. A season-long report is a later option if this series earns repeat readership; no route was created in this task.
- Competitor/query research was conducted in the preceding strategy discussion. Demand and ranking potential remain hypotheses; no search-volume, difficulty or traffic claims are made.
- The draft has a useful multi-game table, a successful call with its companion miss, and a separate explanation of game-level versus pick-level counts. Individual games support the analysis rather than becoming duplicate standalone recaps.
- Grok can receive the final published article link and verified findings after publication. No tweet was sent or scheduled, and no article-writing task was dispatched to Grok.

## Methodology impact

This is descriptive analysis of existing published grades. Eligibility, records, grading, attribution and market semantics do not change. The draft explicitly defines its favorite/underdog grouping and sample. The live methodology and its visible FAQ support straight-up grading and dated shared event snapshots. No application or methodology edit is required for this draft; a later publishing implementation must perform its normal rendered structured-data and release checks.

## Source presentation observation

The live Patterson Tulsa/Toledo receipt templates label their original evidence as naming a point spread, although the preserved snippets use +450/+350 moneyline wording. The article does not repeat that template characterization or infer a cover. The existing winner grades and scores agree. Any correction to source classification belongs in a separate Audit/Promote review, not this article draft.

## Detailed copy and SEO review — September 10

Scope: revised the draft and metadata specification only. No application metadata, live copy, route, schema or image changed. The shared series is now College Football Pick Report, accommodating favorites and underdogs in one report. The filename is a local artifact path, not a proposed public slug.

### Search intent and positioning

Primary intent: college football Week 1 expert pick results for 2026. Secondary questions: which tracked underdogs won, who picked Tulsa, and how the favorite selections performed. General searches for underdog picks surface pregame recommendations, such as [Covers' Week 1 upset predictions](https://www.covers.com/ncaaf/upset-predictions-underdog-picks-week-1-2026). Analyst results also have established coverage in [Cole's GameDay Blog](https://gamedaycole.com/). The article's differentiator is its original selection-versus-game analysis with named receipts, not a comprehensive expert ranking or a list of best bets.

This bounded search review establishes plausible intent, not query volumes, keyword difficulty, a fixed ranking position or future traffic. Do not optimize this historical page around 'this week' or imply its selections are upcoming. Put those visitors on the current college football slate via a descriptive internal link.

### Title, descriptions and opening

- Previous search title led with 'Underdog Picks', which could suggest a recommendation page. Revised title leads with the sport, week and 'Pick Results', retains the distinctive 1–11 finding and includes the season year.
- H1 now explicitly says 'results'. Keep a single primary H1 and a visible 2026 season eyebrow. When this is integrated into the archive, replace its existing top-level H1 rather than stacking competing titles.
- Meta description replaces vague 'what the records hide' wording with the actual overall and split records, a recognizable person/team story, and the scope phrase 'our tracked'. It is a snippet candidate, not a ranking promise; Google may choose page text instead.
- Social title keeps the short curiosity hook while retaining sport and week. Social description identifies the tracked sample and seven-game denominator. The image needs a visible 2026/Week 1 label.
- Opening now supplies the 2026 season, 28–11 result, straight-up grading, favorite/underdog breakdown and snapshot basis immediately. The third paragraph explains picks versus games and limited coverage before readers reach the table.
- Keep the brand suffix added by the application to one occurrence. The proposed title is the title input, before the site's existing suffix. Google truncates by available display width, not a universal character cutoff.

### Article structure and language

- Changed bold pseudo-headings to actual H2s with descriptive questions. These organize substantive answers; no extra FAQ section or FAQPage markup is proposed.
- Retained all seven underdogs, their selectors, snapshot dates and final scores. This is useful original evidence rather than word-count padding.
- Retained Patterson's Toledo miss next to the Tulsa hit. Removed the repetitive closing and the unsupported flourish that this was the 'first receipt worth revisiting'.
- The favorite section explicitly explains that 27 picks represent eight games and that the full covered slate went 10–1. This avoids presenting repeated votes as independent outcomes.
- Replaced internal terms such as 'mapped hard picks' with readable methodology copy without changing the analytical filter. One week does not establish predictive skill.
- Removed the link to the Week 1 page from the opening because that page is the intended publishing destination. Keep event and receipt links, plus a natural link to the current slate and methodology. Do not add unrelated team/pundit links just to increase link counts.

### Design and metadata implementation contract

These are requirements for the later publishing task, not completed work:

1. Preserve `https://pundits.pro/ncaaf/2026/week-1/` as the self-canonical page. Do not mint separate favorites/underdogs versions of the same weekly synthesis. Keep the existing archive's full receipts accessible below the report.
2. Render the article, H2s, result figures and data table in initial HTML. Charts supplement that content. Use captions naming the unit (picks or games), date and coverage; use text labels alongside color. Do not bury the only numerical evidence inside an image or interaction.
3. Use the proposed descriptions in HTML and social metadata as appropriate. The current helper shares title/description defaults; separate social copy needs an explicit implementation override if used. Do not invent an OG image URL now. Use the existing content-versioned image workflow and validate the rendered image and preview metadata at implementation time.
4. Keep the archive's truthful CollectionPage and breadcrumb markup. If the published page embeds an Article/BlogPosting entity for this original report, connect it to the page and visible article section, with the real publisher, actual byline if assigned, matching headline/image and actual article publication/modification dates. Do not label pundits as the article authors or use their source dates as article publication dates. Article markup is not a requirement to rank or a guarantee of special presentation.
5. Preserve the archive's original publication history. Adding the report is a material update to an existing page, not justification to reset that page's first-publication date. Record the article section's own publication time only when it is actually published. No fabricated author/reviewer credentials or automatically refreshed dates.
6. Run the repository release checks and inspect rendered metadata, schema, canonical, image and mobile layout during implementation. None can be certified from a Markdown draft. No keyword-density target, meta-keywords tag, FAQ inflation, or speculative Dataset markup is needed.

### Sources for the recommendations

- [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link): concise descriptive titles, a clear primary heading, and possible automated title rewriting.
- [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet): useful page-specific meta descriptions and query-dependent snippets.
- [Google helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): original analysis and reader value.
- [Google Article structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/article): truthful article entities and descriptive properties.

### What success can establish

After publication, inspect this exact URL in Search Console and measure its result/underdog/favorite query impressions, clicks and click-through rate over subsequent weeks. Use actual query data to refine titles; do not repeatedly rewrite them before enough observations accumulate. Metadata improves clarity and eligibility for relevant discovery but cannot establish ranking potential on its own. Search demand after Week 1 remains time-sensitive.
