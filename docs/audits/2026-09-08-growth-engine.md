# Growth engine audit — September 8, 2026

Status: Evidence

## Decision

Keep the source-backed pick ledger, current social card system, and permanent search graph. Improve the selection and publication of the underlying stories before increasing posting volume or adding channels. Fix attribution and publication semantics first; refresh Scout's operating policy next; test a simpler social program and richer existing receipt pages over three settled slates.

This is an audit and proposed order of work, not an adopted change to capture policy, editorial eligibility, bot instructions, or the public methodology. No editorial JSON or production code was changed.

## Evidence and limits

- Repository inspected against freshly fetched `origin/main` at `6e4470a` (September 8, 19:09 ET). The operator checkout was 71 commits behind and dirty; it was not pulled, reset, or used as current editorial truth. Relevant unchanged code was read locally and compared against main.
- Current-main JSON: **106 calls, 83 hard mapped calls, 45 graded hard mapped calls, 44 events (22 games)**. Of 83 hard mapped calls, **29 have a nonempty reasoning field**. Nonempty does not mean useful or verified reasoning. These are corpus counts, not measures of audience demand.
- Live receipt HTML and structured data inspected for Brandt/49ers, Finebaum/LSU, and Saban/LSU; live robots, news sitemap, social index, About, and methodology inspected. Representative source and audit records were checked. This is not a fresh independent audio audit of all 83 mapped calls or every final score.
- Logged-in Google Search Console: Web report covers August 25–September 6, **808 impressions, 10 clicks, 1.2% CTR, 7.4 average position**. September 4/5/6 impressions: 134/437/189; clicks: 1/3/3. The News search-type filter showed **0 impressions and 0 clicks**. That filter measures the News tab of Search, not every Google news surface. The AI-report link returned to Web performance; distinct AI metrics were not obtained.
- Logged-in X: account showed **5 followers and 109 posts**. A recent consecutive sample of **15 originals dated September 5–7**, excluding the minutes-old September 8 post, had impressions of 61, 118, 36, 24, 18, 32, 49, 23, 26, 47, 24, 52, 25, 32, 23: **590 total; median 32; range 18–118**. All showed zero likes and reposts. Their one-reply counts must not be treated as independent fan engagement; self-link replies are part of the publishing workflow. This is a recent sample, not a complete weekly export or causal experiment.
- The September 7 SMU–FSU original had 118 impressions, zero profile visits/follows/shares/bookmarks; its verified self-link reply had 60 impressions, one profile visit, zero follows. URL clicks were not exposed on the inspected detail screens. X's displayed engagement rates are not equivalent to site visits or audience endorsement.
- The earlier 6,911-view post was boosted, per the operator correction in `docs/runs/2026-09-01-social.md`. It is not evidence for organic tagged-post performance.
- No GA traffic/retention export, paid-spend export, server crawler-log audit, or comprehensive missed-picks benchmark was available. No conversion, retention, scouting recall, or cost-per-pick claims are inferred from missing data.

## Findings ranked for action

| Priority | Finding | Why it matters | Proposed action |
|---|---|---|---|
| P1 | Recap-table wording is rendered as the pundit's spoken quotation | Weakens the defining source-evidence promise | Reopen affected rows; obtain original exact wording or explicitly distinguish reported selections through an approved evidence-type policy |
| P1 | Scout notes leak into reasoning, and reasoning exists in JSON-LD without visible page copy | Misattributes rationale and reduces structured-data fidelity | Audit the reasoning cohort; omit invalid capsules; render valid reasoning visibly and derive markup from that same content |
| P1 | Source date substitutes for Pundits publication date; news recency is relative to newest stored source | Misstates publication history and can keep old entries in the news sitemap | Add truthful publication/update timestamps and an actual two-day publication window |
| P1 | Scout has no upcoming college targets and uses density to stop valuable capture | Chokes next-week inventory and excludes recognizable voices | Adopt rolling slate selection and source completion separate from homepage density |
| P1 | Social selection rewards ledger updates more than a compelling event story | Many posts ship without earning a reaction | Keep cards; narrow to timely disagreements and resolved disagreements; test editorial selection |
| P2 | Feed detection treats yesterday's unseen show as waiting | Creates avoidable missed-pick risk | Track episode inspection state and review recent unprocessed relevant episodes |
| P2 | Shared event prices change older receipts and social wording obscures timing | Can imply a contemporaneous price that was never captured | State the actual event-snapshot date; separately decide whether immutable per-call snapshots are needed |
| P2 | Approval and review handoffs remain partly manual and inconsistent | Valuable evidence stalls; performance learning is not reliably recorded | Use row-level disposition, routine roster/overflow decisions, and a current weekly social review |

P1 means address before scaling distribution, not proof of a search penalty or of fabricated underlying picks.

## 1. Social engine

### What is worth preserving

The product has real facts to distribute, attractive reusable cards, recognizable people, honest hits and misses, and a working publication pipeline. The recent data does not identify image design as the bottleneck. Keep the designs stable while changing editorial selection so the experiment remains interpretable.

### Strategy gap: the news is buried under bookkeeping

Current patterns repeatedly lead with cents, an isolated winner, and a closer such as “Logged” or “Called it.” An unfamiliar fan has to infer why the claim matters. A 94-cent favorite winning is routine; giving that pick a celebratory post is usually a weak use of a small account's attention budget. That is an editorial hypothesis, not a proven algorithm effect.

There are a dozen named post patterns, daily slot expectations, mandatory card rules, tag gates, and repeated closers. This complexity makes compliance easier to optimize than relevance. The rules also prohibit repeating an archetype even when consecutive events may warrant the same useful treatment.

Tagging has now actually been attempted. The inspected Fornelli, Clay Travis, Finebaum, and Patterson Flowers posts received 24, 18, 49, and 24 impressions, respectively, with no likes or reposts. Do not keep prescribing tagging as if it were an untested missing feature, or credit the historical boosted post to tagging.

### Accuracy and operational gaps

- [Clemson reply](https://x.com/Pundits_/status/2096366842399117337): it names Kanell and Wrighster backing Clemson and then says “Empty side.” That is internally contradictory, even though the underlying picks are real.
- [Fornelli receipt](https://x.com/Pundits_/status/2096646653621235784) says “Cover crushed.” The operating ledger grades winner selections, not a separate ATS result. A winner alone does not prove a cover. The phrase needs verified line-and-score evidence and an explicit distinction, or omission.
- “Took LSU at 78¢” compresses a public opinion and a later Kalshi snapshot into language resembling a wager. Prefer the picked team first, then “Kalshi snapshot: [price], [date]” when price adds value.
- `bots/poster.md` reconstructs novelty from posts **since midnight**. Its effective deduplication is daily, not the lifetime of a pending take or result. This is a repeat-post risk, not proof that every observed post was duplicated. Maintain a lightweight publication ledger keyed by call/event, state/version, post ID, and timestamp, or inspect sufficient prior history. Do not build a general backend for this.
- `bots/reviewer.md` still frames private metrics around a CSV, while the logged-in X Content detail view exposes some metrics at five followers. The overview itself says detailed engagement metrics require 50 followers. Record the fields actually available rather than treating all private metrics as unavailable.
- Latest committed social review remains September 1; no September 7 review was found on current main. Reviewer prioritizes a working-set handle list, while `reply-guide.md` also permits high-traction tracked-game debates. Resolve the mismatch so valid experiments are not rejected by a stale review rule.

### Recommended three-slate social test

Choose three well-covered games per slate, subject to actual evidence. Produce a pregame disagreement and a postgame resolution for each where both moments exist. This is an experiment allocation, not a permanent posting quota. Ordinary single-pick posts require a concrete reason to care: a notable underdog, genuinely relevant new voice, or source-backed explanation. Silence remains valid.

Example using the September 8 ledger, as draft copy only:

> Kyle Brandt picks San Francisco. Cowherd, Rich Eisen and Jason McIntyre pick the Rams. Four tracked calls, one holdout ahead of Thursday's opener.

This foregrounds the disagreement without pretending the four people are the entire expert universe. Add the verified quote or a source-grounded reason where available; keep market context secondary. Do not invent reasons to make it more colorful.

Use a small amount of operator editing on the highest-value posts while bots handle preparation and timing. Separately test a few evidence-bearing replies that directly answer active conversations. Existing cards can remain the supporting asset. Outreach to shows or pundits would need a separate explicit send instruction; none was sent during this audit.

Measure each post at comparable ages (24 and 72 hours): outside replies excluding our own, likes/reposts/bookmarks, relevant account amplification, profile visits, follows, and attributable site engagement. Track self-link replies separately. Keep paid reach separate. At this scale, treat repeated outside responses across slates as directional evidence; do not claim statistical significance from a few posts. If there is still no outside response after three slates, reduce routine originals and test a different audience or distribution relationship instead of increasing automated volume.

## 2. Scout pipeline

### It works, but the rules limit its value

The September 8 Brandt pick is a positive end-to-end example. Shows found a 49ers winner in GMFB; Audit reopened the Apple episode and linked transcript, identified Brandt, and approved the mapping; Promote published it that evening. The live 49ers event now has one San Francisco voice and three Rams voices. Original episode publication was about 11:11 ET, staging was recorded around 16:35–17:55, and the observed live social index was generated at 23:23:28Z. These are distinct milestones, not a measured capture-hour cost.

The same day's logs show substantial audio/transcription work and honest dry passes. The main problem is not demonstrated lack of effort. It is a narrow target function and incomplete evidence packaging.

### S1 — rolling slate selection is missing

Current main has **zero NCAAF game events with kickoff dates on or after September 8**. The watchlist contains Wisconsin–Notre Dame, Miami–Stanford, and Baylor–Auburn, all settled. The density script's current output is only Bills–Texans, Patriots–Seahawks, and 49ers–Rams. Six other upcoming NFL games have one mapped call each but are off-home and not on the watchlist, so they are not Dispatch targets.

The hunt strategy cannot reliably build next-week college coverage from that list. Create a rolling, operator-selected priority slate before midweek sources publish. Keep event minting conservative; a proposed matchup can live in staging until a real verified pick exists. Refresh the list after each slate rather than leaving dated launch-week instructions active.

### S2 — display density should not end source capture

`scout-density-lib.mjs` marks a game dense at three total hard mapped picks with both sides represented. Ordinary new-voice hunting then stops. `docs/runs/2026-09-05f-gameday-restage.md` explicitly says **seven GameDay desk rows were restaged after the operator overrode dense/wrong-side skipping**. The earlier handoff explicitly authorized capturing the GameDay desk despite density.

Promote this successful exception into a proposed operating rule: complete the named picks from a selected high-value source on priority games, even if the visual card is already dense. Keep homepage truncation separate. Do not broaden to indiscriminate all-sports scraping.

Also stop treating every one-sided game as an unlimited hunt obligation. In current sorting, empty-side rows are ordered alphabetically by slug, not kickoff proximity: Bills precedes Patriots even though Patriots plays sooner. Prioritize deadline, source likelihood, recognizable missing voices, and recent dry coverage. An empty underdog side may be correct; it should not consume every marginal hour.

### S3 — freshness is not inspection state

The seven factory alarms cover Finebaum, Cover 3, BFW, Pate, Herd, Eisen, and McAfee. They omit several productive sources listed elsewhere, including GMFB (the latest actual hit), See Ball Get Ball, and Clay Travis. Hunters compensate manually.

`classifyItem` labels a relevant episode from yesterday `waiting`; the playbook says to skip it. A read-only probe reproduced this with an unseen September 7 NFL picks episode inspected September 8. `latestUsable` selects one usable item, which can also hide earlier relevant episodes beneath newer general discussion.

Use a bounded recent-episode queue with published time, source, inspected state, source locator, and next check. Retain short official clips when they contain complete evidence rather than rejecting solely for short format. Reopen only when new evidence or an unprocessed relevant episode exists. Preserve source windows and bounded radio fallback.

### S4 — preserve evidence needed downstream

Brandt's Scout timestamp was about 12:06–12:38; Audit located the verified passage at 09:40–09:48 in the linked transcript. The public row preserves the Apple URL but has no structured timestamp or transcript URL. That friction matters when fans or answer engines want to verify a quote.

Proposed evidence fields: evidence kind (spoken quote versus reported selection), primary/secondary source role, exact locator, verified quote, optional actual rationale, source publication time, first captured time, audited time, and first live time. Capture these only when known; never backfill invented precision. Add fields through an approved schema change, preserving existing IDs and URLs.

### S5 — handoff reliability and yield measurement

The September 5 audit had seven good mapped rows alongside an unrelated failed overflow row and told Promote not to proceed under the day-level failure without operator correction. That is evidence of a batch gate interfering with row-level approvals. Make row disposition authoritative while ensuring failed or superseded evidence cannot slip through; preserve the audit trail.

Audit should assess actual reasoning, not only pick eligibility. The newest Brandt row was approved with a capsule saying it was a clear Week 1 winner in a predictions hour. That explains why Scout accepted the row, not why Brandt made the pick. Several other capsules similarly restate the wager category.

Candidates and unmapped overflow need a regular operator decision window. Do not silently auto-roster or loosen the team-analyst boundary. Remove closed decisions from the active queue while retaining history. Record explicit no-run/blocked states for each source lane; current recent mailbox evidence is much stronger for Shows/X than for a News pass.

Primary Scout scorecard: promoted relevant picks per source-hour, percentage live before kickoff and lead-time distribution, priority-event coverage, named-source diversity, missing source locators, and failure/rework reasons. Source-hour efficiency cannot be calculated from the current incomplete timestamps. To estimate missed-pick recall, benchmark a few designated shows against a human-checked complete set rather than counting search attempts.

## 3. Accuracy, SEO, and AEO

### A1 — distinguish quoted speech from a secondary table's selection label

The GameDay restage document explicitly calls the seven strings “recap labels, not spoken ESPN clip.” Nevertheless, `Receipt.tsx` surrounds `call.claim` with quotation marks and places the pundit's name beneath it. `articleJsonLd` generates “Nick Saban said” before “LSU over Clemson.” The live Saban receipt confirms that output. A correct team selection is not evidence of those exact spoken words.

Reopen this cohort through Audit/Promote. Under the existing verbatim-quote policy, prefer an original clip/transcript. If the product wishes to accept documented selection grids as a separate evidence category, adopt that explicitly and render “Cole's recap lists Saban selecting LSU” rather than invented direct speech. Update methodology, FAQ JSON-LD, About, templates, and tests together. Keep published receipts accessible and make corrections traceable.

### A2 — valid reasoning is valuable content, but currently hidden on receipts

29/83 mapped calls have a reasoning field. The receipt route renders a quote, grade sheet, and related picks; neither it nor `Receipt.tsx` renders the capsule. Yet `pickStory` puts it in `NewsArticle.articleBody`, including wording such as “The reasoning Kyle Brandt gave,” followed by the operational note.

Render a concise, audited “Why he picked them” section when the source contains actual rationale. Do not impose a word count or generate filler for winner-only sources. Derive articleBody from what the reader can actually see, using correct tense after settlement. Google explicitly says structured data must represent visible content: [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

### A3 — publication dates need a separate contract

`datePublished`, RSS `pubDate`, and news `publication_date` all use `sourceDate`. The Finebaum page reports June 23 as article publication in JSON-LD even though that is the original source date, not established Pundits page publication. The visible page shows source date and graded date, but no Pundits byline or first-publication timestamp.

Add truthful firstPublishedAt/updatedAt semantics. Show source date separately. Link a truthful editorial byline to publisher/accountability information; do not invent a reporter. Keep the pundit as the subject, not the author. Historical migration should use verified publication evidence and label uncertainty.

`recentNewsTakes` computes two days relative to the newest stored source, not the current date. In a publishing pause, old entries can remain indefinitely. Current production happens to have a September 8 Brandt entry only, so the stale-window condition is a verified code defect, not an observed stale live sitemap today. Google asks for articles first published on the site within the last two days: [news sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap). Preserve archive URLs in the normal sitemap; do not reset original publication dates when a grade changes. Static output needs a reliable expiry/update mechanism.

### A4 — “frozen” is presently an event snapshot, not immutable capture-time pricing for every call

Prices live on Event; adding a new mapped face refreshes that event's price for all linked receipts. Brandt's promotion changed 49ers/Rams to 36/65 cents on September 8. Existing Cowherd/Eisen/McIntyre receipts now use that event snapshot too. Finebaum's June quote carries September market context.

Avoid “what the market believed at the time” unless the time is explicitly the displayed snapshot. The methodology currently says context when the pick was captured, which is too strong for a shared refreshed event price. The minimum correction is truthful snapshot wording across site and social. If immutable per-call pricing is desired later, preserve separate capture snapshots; never invent historical prices. This is a public-semantics change requiring synchronized methodology/FAQ updates.

Make winner-only grading explicit when evidence originated as a point-spread pick. A favorite winning without covering must not be portrayed as success on the original spread recommendation. Keep the current winner product distinct from a future ATS product.

### A5 — grow useful answers on existing URLs

The durable graph is already sensible: event, named pick, pundit, team, weekly archive, result. The early highest-impression pages are largely matchup pages. Individual pages have earned a few clicks, but the sample is too small to choose a universal winning page type.

Recommended receipt anatomy, generated from verified fields on the existing canonical URL:

1. Direct answer: person, picked team, opponent, event date, and current result state.
2. Evidence: exact quotation or explicitly labeled reported selection, source, date, and locator.
3. Actual source-grounded rationale, if supplied.
4. Distinctive context: named agreement/disagreement and tracked sample size, not vague consensus claims.
5. Dated optional market context, with no suggestion of a wager or contemporaneous price.
6. Result and grading scope, followed by relevant next links.

Add visible event summaries such as who picked each side and what happened. Profiles should make the current tracked picks and dated record easy to answer. Favor a complete paragraph plus precise table over repeated boilerplate, FAQ inflation, or another URL for the same pick.

AEO here is answer clarity plus provenance and accessibility. Google says no special schema or additional optimization is required for its AI features beyond sound SEO: [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features). Do not promise citations from llms.txt or adding FAQs. Live robots allows general crawling, with explicit training-bot exclusions; OAI-SearchBot is not specifically blocked. OpenAI distinguishes search access from GPTBot training controls: [publisher FAQ](https://help.openai.com/en/articles/12627856). This robots observation does not prove all WAF/crawler requests succeed.

The live receipts already include `max-image-preview:large`. Spot checks confirmed the old Wisconsin URL redirects 301 to its season URL and the slashless Michigan URL redirects 308 to the trailing-slash URL. Historic URL variants in Search Console alone are not proof of a current canonical failure. Do not rename pages or remove archived URLs to tidy that report.

## 4. Can “Finebaum picks Alabama” reach news aggregators?

**Yes, this type of sourced sports reporting can be eligible for Google news surfaces. Eligibility does not guarantee distribution, and a NewsArticle label or news sitemap does not create a news audience.** Google automatically considers eligible web content; applying through Publisher Center is not the missing step. [Publisher Center overview](https://support.google.com/news/publisher-center/answer/9606538?hl=en).

The stronger version is a timely report that says who picked Alabama against whom, where and when they said it, their actual reason, and what makes that call relevant. Pundits can add original value by comparing verified voices and closing the result loop. The weak version is a short quote surrounded by generated generic football paragraphs and a later price.

Do this on the existing pick URL with a source-grounded template. It does not require bots to author standalone SEO articles, nor a duplicate news route for every receipt. A hypothetical headline is “Paul Finebaum picks Alabama over [opponent], citing [verified reason].” Bracketed facts are required evidence, not permission to invent a story. A June prediction discovered in September should be framed as archival context unless a new development makes it timely.

| Surface | Practical path | Present assessment |
|---|---|---|
| Google News / News tab / Top stories | Crawlable original-value reporting, clear attribution/dates/publisher, appropriate freshness | Plausible experiment after corrections. News-tab impressions currently zero; other news-surface reach not established. |
| Google Discover | Relevant timely content, compelling representative images, sound page experience | Keep as upside, not forecast traffic. Existing social cards need no redesign for X; a less text-heavy licensed/editorial image variant may suit discovery better. |
| MSN | Separate partner publishing/feed workflow and publisher standards | Not unlocked by SEO markup alone. Check current onboarding before integration; no application or acceptance was attempted. |

Google distinguishes the News app/site, News tab, and Top stories: [news surfaces](https://support.google.com/news/publisher-center/answer/9607025?hl=en). Its transparency requirements include clear dates, bylines, author/publisher information, and contact details: [News policies](https://support.google.com/news/publisher-center/answer/6204050?hl=en). Discover recommends large representative images and avoiding text-heavy previews: [Discover guidance](https://developers.google.com/search/docs/appearance/google-discover).

MSN's guidelines cover attribution, editorial accountability, rights, and publishing cadence; they restrict scraped aggregation without written permission. Treat a platform distribution agreement and media rights as a separate diligence step, not something a source link automatically solves. Do not inflate article counts to meet a platform category. [MSN publishing guidelines](https://support.microsoft.com/en-us/msn/partner-hub/publishing-guidelines-for-msn-partners). Apple News and other publisher programs were not fully evaluated here; no eligibility is claimed for them.

## 5. Recommended implementation sequence and acceptance checks

### First: correct the shared truth

- Audit the seven recap-label rows and the 29 nonempty rationale fields; route editorial corrections through Promote with a public correction trail where warranted.
- Define source date versus first publication/update date; make visible copy and structured data agree.
- Clarify shared snapshot timing and winner-versus-spread grading across methodology, its rendered FAQ JSON-LD, About, SEO text, feeds, social instructions, and tests.
- Verify a spoken-quote receipt, a reported-selection case if approved, a winner-only source, a genuine-rationale source, and a graded spread-origin pick. Simulate a publishing pause for the news sitemap. These checks test real failure modes.

### Second: fix next-week supply

- Refresh the priority slate now; establish a routine roll-forward before pick shows publish.
- Separate source completion from display density and prioritize kickoff proximity.
- Add high-yield source alarms and recent-unprocessed episode handling.
- Establish row-level approval disposition and a bounded roster/overflow decision queue.
- Success: no priority game is absent from Dispatch due solely to an expired watchlist; no designated desk pick is skipped solely because a card is dense; every proposed row retains reopenable evidence.

### Third: run three slates with one coherent distribution experiment

- Keep social cards stable; emphasize event disagreement and resolution, with a small edited sample and relevant replies.
- Improve existing receipt/event pages with visible audited rationale and provenance.
- Record Web versus News results, indexed landing pages with clicks, meaningful site engagement by acquisition source, outside social responses, and capture-to-live lead time.
- Evaluate repeat visits only with actual analytics. Use performance to allocate the next slate's scouting attention, not to relax verification or retroactively cherry-pick records.

No product expansion, backend, paid boost, automatic roster growth, or mass article generation is needed to run this test.

## Source map for follow-up work

Repository paths refer to inspected main `6e4470a`; use that revision when reconstructing evidence, since local files may be older.

- Scout policy: `docs/capture-policy.md`, `docs/scout-plan.md`, `docs/pick-shows.md`, `docs/bring-onto-home.json`, `bots/scout*.md`, `scripts/scout-density-lib.mjs`, `scripts/scout-feeds-lib.mjs`.
- Operational evidence: `docs/runs/2026-09-05-gameday-handoff.md`, `2026-09-05f-gameday-restage.md`, `2026-09-05-audit.md`, `2026-09-08.md`, `2026-09-08e-afternoon-shows.md`, `2026-09-08-audit.md`.
- Publishing semantics: `lib/types.ts`, `lib/seo.ts`, `lib/feeds.ts`, `components/Receipt.tsx`, `app/picks/[slug]/[punditId]/page.tsx`, `app/methodology/page.tsx`, `lib/social.ts`.
- Social operating rules: `bots/poster.md`, `bots/reply.md`, `bots/reviewer.md`, `docs/social/{voice,post-patterns,tagging,schedule,reply-guide,scoreboard}.md`.
- Live examples: [Brandt](https://pundits.pro/picks/49ers-vs-rams-2026/brandt/), [Finebaum](https://pundits.pro/picks/clemson-at-lsu-2026/finebaum/), [Saban](https://pundits.pro/picks/clemson-at-lsu-2026/saban/), [original recap table](https://gamedaycole.com/2026/09/05/week-1-2026-saturday-morning-college-gameday-picks-stanford-steve-celebrity-guests-super-dog-picks-and-more/), [social index](https://pundits.pro/social/cards.json).

## Verification

Read-only probes reproduced current Dispatch, the yesterday-as-waiting feed classification, main JSON counts, live publication metadata, visible/structured content divergence, and redirect behavior. Browser inspection confirmed the Search Console and X metrics above. Methodology impact was assessed: the proposed attribution, timing, and grading-clarity changes require synchronized visible methodology and FAQ verification when implemented; this audit itself changes no public behavior.

`npm run check:fast` passed in the operator checkout: 414 tests across 43 files and run-file validation. This is a documentation-change check on that checkout, not validation of the fetched main revision, a full editorial accuracy audit, or a deployment gate. No release was attempted.
