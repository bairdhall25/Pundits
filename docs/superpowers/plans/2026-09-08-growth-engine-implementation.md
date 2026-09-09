# Growth engine implementation plan for Grok

Status: Codex QAing Scout (#25); Grok resuming later phases in parallel

Date: September 8, 2026. PM: Codex. Engineer: Grok. Owner: Baird.
Paused for PM QA: 2026-09-08. Later phases resumed 2026-09-08 without touching the Scout PR.

## Objective

Make the verified-pick pipeline reliably produce timely, accurately attributed content that each search surface and social post can use. Preserve the existing product and card designs. Deliver small, reviewable engineering changes followed by a measurable three-slate experiment; do not equate implementation completion with proven growth.

Read [the product brief](../../product/2026-09-08-growth-execution-brief.md) for decisions and page-type contracts, and [the audit](../../audits/2026-09-08-growth-engine.md) for evidence. This plan translates those decisions into work; the audit's alternative ideas are not an instruction to implement all of them.

## QA handoff (pause after Phase 2)

Engineering stopped expanding after Codex's correction: finish the current coherent work, report checks, and stop for review. Prioritize Scout's ability to find timely, verified picks and the accuracy fixes before SEO, social, or measurement expansion.

Code/JSON baseline remains `6e4470a`. No production deploy. No live X. No `data/*.json` edits. Operator checkout was not used.

### Codex QA queue (this order)

| Order | PR | Phase | What to accept |
|---|---|---|---|
| 1 | [#22](https://github.com/bairdhall25/Pundits/pull/22) | Handoff docs | Plan, brief, audit, Grok assignment |
| 2 | [#23](https://github.com/bairdhall25/Pundits/pull/23) | Phase 0 | Correction inventory; intended vs shipped pointers |
| 3 | [#24](https://github.com/bairdhall25/Pundits/pull/24) | Phase 1 accuracy | Reported vs spoken, rationale visibility, publication dates, snapshot/winner-only language, methodology FAQ |
| 4 | [#25](https://github.com/bairdhall25/Pundits/pull/25) | Phase 2 Scout | Rolling targets, source completion, episode state, row-level Audit/Promote |

Phase 1 required `npm run check` (passed). Phase 2 required logic tests and `check:fast` (passed). Fast checks are not a release gate.

### Parallel engineering (do not mix with Scout QA)

Grok resumed later phases while Codex reviews Scout. Do not rebase these onto #25 until Codex is done.

- [#26](https://github.com/bairdhall25/Pundits/pull/26) Phase 3A SEO receipts/games/profiles (stacked on Phase 1)
- Phase 3B team/league/week SEO (stacked on 3A)
- [#27](https://github.com/bairdhall25/Pundits/pull/27) Phase 4 social (stacked on the Phase 1+2 merge; leave Scout base frozen)
- Phase 5 measurement / three-slate scorecard (stacked on 3A+4)

### Resume notes

1. Isolated `codex/` worktree. Do not use the operator checkout.
2. Do not edit `codex/growth-engine-phase-2` / #25 while Codex is on it.
3. After Scout QA, rebase 4 and 5 onto the accepted Scout tip if it moved.
4. Keep one PR per phase. Do not deploy or post to X from the engineering task.

### Open Codex decisions (accuracy + Scout)

1. If Audit cannot recover spoken GameDay wording for the seven Cole rows, keep the reported-selection display or add a void/correction state.
2. Approve, replace, or defer the proposed NCAAF Week 2 shortlist and NFL add-ons. Silence is not “no college work.”
3. Mixed reasoning capsules after Audit: keep or remove (`kanell-western-michigan-at-michigan-20260903`, `kanell-fiu-at-usf-20260903`, `patterson-oklahoma-state-at-tulsa-20260903`).
4. Whether any historical `firstPublishedAt` can later be proven from Cloudflare deploy logs. Unknown stays unknown.

## Working protocol

1. Read AGENTS.md, product README/current-context, docs README, ROADMAP, RUNBOOK, relevant product docs, live types/JSON, and bots README. Read additional relevant skills for the implementation stack.
2. Fetch current main; create an isolated `codex/` worktree from it. Install dependencies there. Never borrow operator generated output or modify the dirty saved checkout. Baseline was `6e4470a`; reconcile later changes before editing.
3. Keep the product brief, plan, audit, and handoff accessible from your branch. Reference this initiative from product README/current-context and ROADMAP in the first implementation PR, clearly separating intended behavior from shipped behavior. Preserve other active priorities.
4. Use one reviewable commit group/PR per phase. Phase 2 can progress while individual Phase 1 source corrections await Audit. Phase 3 depends on Phase 1's content contract; Phase 4 depends on usable Scout/content output. Do not spawn new bots or projects as a substitute for fixing existing ones.
5. Maintain `docs/runs/YYYY-MM-DD-growth-implementation.md` with `Status: Evidence`, completed criteria, exact verification results, remaining decisions, and links. The implementation journal must not impersonate a Scout intake run or set editorial audit/promoted flags.
6. Run `npm run check:fast` during ordinary edits, `npm test` for data/logic changes, and `npm run check` for route/UI/SEO/build/release-affecting changes. Keep GITHUB_PAGES unset. A full production-style check is required before requesting release review; fast checks alone are not sufficient.
7. Provide draft PRs and preview evidence for PM review. This engineering handoff does not authorize production deployment, live X posting, account enrollment, paid promotion, or third-party outreach. Prepare concrete deliverables before raising a necessary decision. Existing separately authorized editorial operations remain governed by their own workflow.

## Phase 0 — establish current truth and a correction inventory

**Outcome:** engineering starts from current code and an inspectable list of affected records, not from assumptions about the September 8 snapshot.

Inspect current implementations of `lib/types.ts`, `lib/seo.ts`, `lib/feeds.ts`, `lib/social.ts`, `components/Receipt.tsx`, pick routes, methodology, source-selection scripts, bot prompts, and active run files.

Create a dated correction inventory in `docs/runs/` with stable call IDs, affected surfaces, evidence URL/locator, exact defect, proposed disposition, and verification status. Cover the seven GameDay recap-label rows and all currently nonempty reasoning fields; do not hard-code the historical count of 29 if main has changed. Distinguish invalid rationale from an invalid pick. Source URL loading alone does not verify a quote or speaker.

Identify where publication history can be substantiated from successful deployment records, publicly recorded publication, and repository history. A commit alone is not proof of first live publication. Record unknown dates as unknown.

**Acceptance:** the inventory identifies every relevant current row, cites evidence, preserves originals, and routes editorial changes to Audit/Promote. Baseline counts and missing fields can be reproduced. No editorial JSON is modified merely to create a clean fixture or preview.

## Phase 1 — correct evidence presentation and publication semantics

**Outcome:** a person, Google, and a social bot receive the same faithful description of what was said, when Pundits published it, and what the snapshot means.

### 1A. Evidence and rationale

- Preserve the qualification bar. New reported-selection labels do not qualify as exact spoken quotes. Reopen legacy GameDay rows for original source evidence through Audit; do not invent wording or silently delete their permanent URLs.
- Implement a truthful legacy presentation for any unresolved table-label row: identify it as a reported selection from the named source, remove the implication of direct speech, and show an appropriate evidence-review/correction explanation. Preserve the original recorded evidence for auditability. This display correction does not by itself authorize a change to a grade or record calculation.
- If recovering evidence would require a new eligibility or record-disposition rule, present that narrow decision to Codex with affected IDs and a proposed resolution. Continue other Phase 1 tasks meanwhile. Do not silently declare the row fully verified or a new result status.
- Add a reusable evidence presentation contract supporting verified source locators (timestamp, section, transcript URL) where known. Do not guess precise locators or relabel a secondary source as primary.
- Render actual audited rationale visibly on receipt pages. Omit the section for winner-only sources or invalid/unavailable rationale. Audit/Promote removes defective capsules; engineering does not rewrite the pundit's reasoning.
- Generate `articleBody` from the same reader-visible content model. Avoid hidden substantive claims, internal routing language, duplicated price sentences, and present-tense pregame copy after settlement.

### 1B. Publication dates and feeds

- Add explicit first-publication and material-update metadata distinct from source publication and grade time. Use the smallest schema consistent with existing static JSON ownership; document exact fields, optionality, precision, and migration. Editorial metadata changes go through Promote.
- First-publication time is immutable once established. Unknown historical times remain absent or explicitly unknown; no fallback that presents sourceDate, current build time, or arbitrary noon as first publication. Preserve date-only precision when that is all the evidence supports.
- Show a truthful Pundits editorial byline, original source date, site publication date when known, and material update/grade date with unambiguous labels. The pundit is the subject, not the writer of the Pundits page. Link publisher identity to About; never invent staff members.
- Use those semantics consistently in visible HTML, article metadata, JSON-LD, RSS, and news sitemap. A grade can change updatedAt without changing original publication.
- Fix news eligibility to the actual current two-day publication window, excluding future or unknown publication timestamps. Retain every archival URL in the normal sitemap. Empty news sitemaps are valid during quiet periods; do not manufacture fresh publication.
- Solve expiry for static output. Prefer a narrowly scoped refresh through existing deployment machinery, with documented ownership and a scheduled runtime check. Do not add a general backend. Provide the proposed automation/configuration as reviewable code/config, not a claim that a new schedule is running. The release checklist must require the expiry mechanism to be active before calling the news-sitemap fix operationally complete.

### 1C. Market and grading language

- Keep shared event-level prices and existing calculations. Call them the displayed dated Kalshi snapshot. Do not say they necessarily represent market conditions when the original prediction was spoken or first captured.
- Remove “took [team] at [price]” from generated copy where it implies a wager. Use picked-team language and separately labeled snapshot context.
- For spread-origin evidence used as a winner pick, explicitly identify that the tracked result is straight-up winner-only. Do not claim a cover from a hit status. Bets/ATS product work remains parked.
- Synchronize methodology and its FAQ JSON-LD, About, Terms if affected, canonical description in `lib/site.ts`, feeds, public template copy, and social instructions wherever those claims recur. Do not alter factual history to fit new prose.

**Likely files:** `lib/types.ts`, `lib/seo.ts`, `lib/feeds.ts`, `lib/site.ts`, receipt and take templates, social serializers, `app/methodology/page.tsx`, About/Terms as needed, editorial/corrections docs, Audit/Promote instructions, and relevant tests. Locate exact current files rather than copying an old implementation.

**Acceptance evidence:** rendered visible text and parsed JSON-LD for an original spoken quote, a legacy reported selection awaiting correction, a winner-only source, valid rationale, invalid rationale omitted, a June source first published later, a graded spread-origin call, and an event price refreshed after an older call. Test a quiet period beyond two days and a grade update that does not create a new publication. Verify no canonical URLs disappear. Required logic tests and full `npm run check` pass. Show both visible methodology and rendered FAQ JSON-LD.

## Phase 2 — make Scout complete valuable sources and cover the next slate

**Outcome:** the next week's relevant evidence is found before kickoff without grinding indefinitely on the same empty side.

### 2A. Rolling target queue

- Introduce a small, versioned capture-target document/config independent of public display flags. It must support proposed matchups before minting a public event, approval/selection state, sport, season, source-backed kickoff/window, priority, and expiry. Reuse existing watchlist structures where practical; avoid parallel competing target lists.
- Coordinator produces a proposed next-slate shortlist before midweek pick shows publish, retaining active unsolved priority games. Default proposed size: 2–4 marquee games per sport, adjustable by PM. This is a proposal cap, not automatic event minting or permission to scout every game.
- Bootstrap a source-backed current shortlist as a concrete PM review artifact. Clearly label proposed versus approved targets. Existing approved targets can continue; lack of a new selection must be visible, not silently interpreted as “no college work.”
- Select by explicit priority and verified kickoff proximity before coverage deficit. Use source likelihood and recent dry attempts to guide work inside a target. Do not sort equal-priority empty games alphabetically ahead of imminent games.
- Expire settled targets out of the active queue but preserve public URLs and historical logs. Flag overdue ungraded games for Grader instead of treating them as pregame hunts. Missing/uncertain kickoff must not create a false live state.

### 2B. Source completion and episode state

- Preserve density as a display/coverage metric; it is no longer a stop condition for new named picks from designated high-value sources on approved priority games.
- Complete the relevant named selections from those sources, including favorite-side voices. Keep corrections/flip checks distinct from new calls. Do not turn source completion into a whole-board scrape.
- Replace “published today = inspectable” with a bounded recent-unprocessed episode queue. Persist source/episode identity, publication time, inspected status, source locator, last attempt, and outcome in existing file-based infrastructure. A fresh feed check does not imply the episode was inspected.
- Consider all relevant recent episodes, not just the newest item in a mixed feed. Avoid reprocessing dry episodes unless there is a stated new reason. Retain strict source verification and bounded local radio fallback.
- Add verified factory identifiers for current high-yield sources missing from alarms, including GMFB, See Ball Get Ball, and Clay Travis. Do not guess IDs. Allow a durable official short clip when it contains complete attributable evidence; duration alone is not a rejection reason.
- After source windows and bounded attempts are exhausted, record a dry target and next meaningful check. Honest empty sides are acceptable. Capture yield is not improved by repeatedly transcribing irrelevant hours.

### 2C. Audit/Promote handoffs

- Make approval disposition row-specific with stable identity/version so an unrelated failed overflow row does not automatically block verified mapped rows. A changed quote invalidates its old approval; duplicates and superseded rows must be detected.
- Preserve Audit/Promote role separation and audit-required default. Promote cannot infer approval from a day-level tally or “URL returned 200.”
- Give Candidates and verified overflow an explicit queue of needed decisions. No auto-roster, photo approval bypass, or new eligibility for team analysts. Propose a regular decision review in the operating schedule; do not create a new bot.
- Require each expected Shows/X/News lane to report completed, dry, blocked, or not run. A missing run is not a dry hunt. Preserve source-access failures and do not claim a sweep after a connector failure.
- Log source discovered/published, staged, audited, promoted, and verified-live milestones where observable. Do not backfill missing times from sourceDate.

**Likely files:** `scripts/scout-density*`, `scripts/scout-feeds*`, run validation and template, `docs/capture-policy.md`, `docs/scout-plan.md`, `docs/pick-shows.md`, `docs/news-beats.md`, watchlist/target config, `bots/scout*.md`, `bots/audit.md`, `bots/promote.md`, `bots/README.md`, canonical decision/current-context docs.

**Acceptance:** upcoming NCAAF absence is flagged; an approved game with existing density still captures a newly available GameDay voice; an unseen yesterday episode remains eligible; a newer irrelevant episode does not hide a relevant one; a dry episode is not reprocessed without cause; a same-day imminent target precedes a later equal-priority one; an unrelated failed row does not block an approved row; a modified row cannot reuse approval; a past or settled event cannot receive pregame hunting by accident. Demonstrate with meaningful fixtures and a current-main dry run that does not publish data. Run required logic checks and run validation; do not rely on a screenshot with invented picks.

## Phase 3 — implement the SEO contract for each existing content type

**Outcome:** each URL answers its own question well, using the same verified ledger.

Work in two increments: **3A receipts/games/profiles**, then **3B teams/leagues/weeks**. Start with the page-type matrix in the product brief and write a compact implemented-contract table recording intent, content floor, title/H1, schema, internal links, lifecycle, and analytics event. Do not create duplicate routes just to target wording variants.

### 3A. Receipts, game comparisons, pundit profiles

- Receipts: direct answer first, source and actual rationale, clear publisher/timestamps, disagreement context, dated optional price, result/grading scope. A short winner-only receipt may remain short; do not synthesize rationale. Keep existing URL and contextual navigation.
- Game pages: human-readable summary of who selected each team, tracked counts and named disagreement, accessible source-backed entries, event date, and result. Never describe the tracked subset as a complete survey of all experts. Keep incomplete sides honest. Answer “who picked this game?” without requiring opening every card.
- Profiles: current mapped picks, dated season record with graded sample, linked historical receipts, and accurate outlet identity. Do not imply comprehensive career performance or predictive skill. Retain empty-profile earned-indexing gates.
- Contextual links: receipt → game/source/profile; game → individual receipts and relevant team/week; profile → current and past evidence. Do not make previous/next links the only meaningful path.

### 3B. Team, league, weekly archive

- Team pages identify the next covered matchup and available named picks, then relevant historical results. Distinguish no captured pick from no scheduled game.
- League pages retain current live-week board behavior and link to the week's permanent archive. No new homepage/display sorting policy or card redesign.
- Weekly archives progress from open picks to final results at the same season/week URL. Recap synthesis highlights verified disagreement outcomes and linked receipts. No independent news story for every single grade.
- Preserve noindex/earned-indexing logic and archives. Technical fixes must not delete URLs appearing in the permalink ledger.

### Search, news, and answer-engine presentation

- Titles/H1 should naturally identify the relevant person, teams, and event context. Avoid boilerplate keyword repetition or unsupported “best experts” claims.
- Use schema appropriate to the actual content: Article/NewsArticle for truthful editorial receipts, existing WebPage/CollectionPage/person/team structures as appropriate elsewhere. Do not restore SportsEvent markup contrary to current repo policy or add FAQPage to every page.
- Derive schema and snippets from the same public content contract. Ensure links, text, and evidence survive server rendering/static export and work without client-only interactions.
- Preserve crawler/search access and current `max-image-preview:large`. Verify live configuration separately from source robots; do not toggle Cloudflare security or training settings to pursue rankings.
- Use existing card previews in this phase. A future news-specific image variant is optional, deferred, and must have appropriate rights. No aggregator onboarding or claim of guaranteed inclusion.

**Acceptance:** show one representative page per changed type at mobile and desktop, with pending and graded examples where applicable. Inspect visible text, metadata, canonical, structured data, and contextual links. Check an empty-side game and a source without rationale. Confirm old slugs still redirect and archives remain indexable under existing rules. Run full `npm run check` and appropriate browser smoke checks. Document how each template satisfies its assigned search question rather than merely increasing text length.

## Phase 4 — simplify social selection while preserving the cards

**Outcome:** the existing bots select meaningful verified stories and can be evaluated against actual outcomes.

- Reconcile Poster, Reply Guy, Reviewer, schedule, voice, tagging, images, and post patterns. Remove conflicting or obsolete launch-week instructions. Preserve earned tags and approved handles; do not add generic tagging or engagement bait.
- Set the primary editorial order: pregame disagreement; postgame resolution of that disagreement; selective notable individual call. Other patterns remain optional only when they offer new value. Do not require a different archetype merely to alternate formats.
- Daily caps remain caps. Remove any implication that bots must fill every slot. Routine favorite wins and near-zero-sample records need a specific reason to merit a post.
- Keep actual cards and visual design. Use team/pundit/event language first; prices only when they explain the story and always as dated snapshots. No “cover” claims from winner-only grades, fake feud, or manufactured viewing experience.
- Fix novelty checking across the relevant pick/result lifecycle, not just since midnight. For the first implementation retain Poster/Reply Guy read-only repository ownership: use verified live timeline/search keyed by canonical destination, call/event and state; if coverage cannot be established, skip rather than assume novelty. If this proves impractical, propose a minimal persistent publication log and its writer/ownership contract as a discrete PM decision, not a backend.
- Make content available to bots with truthful evidence type/locator, actual rationale if any, snapshot date, event/result scope, and canonical destination. Version derived payloads compatibly; don't silently break current cards.json consumers.
- Reviewer separates originals, outside-thread replies, self-link replies, paid reach, and organic response. Collect available logged-in metrics through supported access; no promise that a connector provides fields it does not expose. Record missing data as unavailable.
- Prepare an offline sample for three current or historical evidence-backed matchups: pregame and result versions, chosen card, rationale for selection, and reasons routine candidates were skipped. These are review drafts, not live posts.

**Acceptance:** replay a fixture timeline crossing midnight and show duplicates skipped; distinguish a newly graded result from its original pending post; contradictory “empty side” and unsupported cover language fail review; no false quotation or missing-price-time implication in drafts; all tags have approved provenance; unavailable metrics remain blank/n/a. Show before/after samples without changing images. Run relevant logic tests and `check:fast`; full check if public payload/build behavior changes.

## Phase 5 — measurement and the three-slate readout

**Outcome:** the next prioritization decision is based on useful evidence, not counts of posts or pages.

- Verify existing analytics events fire once at the intended interaction/view. Avoid creating a second analytics system or double-counting page loads. Preserve no-PII constraints.
- Record page_type and stable object IDs where needed to compare the page contracts. Match new fields to named analytical questions, not a broad instrumentation inventory.
- Define attributable outbound social campaign links without changing canonicals or creating indexable URL variants. Treat native site share links separately from bot-distributed links. Verify campaign parameters survive navigation and canonical metadata remains clean.
- Add a lightweight weekly report template and reproducible collection instructions for Search Console, X, and available site analytics. No dashboard/backend is needed. Keep Web, News tab, Google News app/site if available, and AI metrics distinct. A report not exposed is not zero.
- Report Scout promoted picks per measured source-hour when available, source-to-live and pre-kickoff lead time, approved-target coverage, missing locators, and rework. No duration means no efficiency calculation.
- Report search clicks and landing-page engagement by type; organic social response at 24/72 hours; outside responses versus our own replies; profile visits/follows and attributed site engagement when available. Keep paid metrics separate.
- Retention requires actual consent-compatible analytics evidence; do not infer repeat visitors from aggregate views. Show small cohort sizes and uncertainty.
- Set up a three-slate scorecard with dates filled from the eventual approved slate. Engineering delivers instrumentation and a sample report using actual available data, clearly marking the rest pending. Operational owners run subsequent reviews. Do not mark the experiment successful before those slates occur.

**Decision at the end:** retain formats that repeatedly earn outside responses and useful visits; redirect scouting toward relevant events/sources showing demand; reduce routine originals if response remains absent. Do not change eligibility, erase losing receipts, or announce statistical significance from tiny samples.

**Acceptance:** an operator can reproduce every reported metric or see why it is unavailable; self-replies and paid impressions cannot inflate organic success; a test navigation has correct campaign/canonical handling; each page contract has a measurable action; report ends with one next experiment/decision. Run required checks for actual code changes.

## Review and release checklist

- Every implemented phase has linked acceptance evidence and a draft PR; avoid one oversized unreviewable change.
- No unrelated operator changes included; source SHA and branch base stated.
- Editorial corrections are clearly separated from engineering changes and follow Audit/Promote. No invented quotes, reasoning, publication history, prices, or scores.
- Methodology visible text and rendered FAQ match changed semantics; repeated About/Terms/entity/feed claims checked.
- Existing public routes, source links, redirects, structured data, feeds, and archives preserved.
- Full production-style check passes for release-affecting work; browser verification covers changed public surfaces. No production deployment claimed from a local build.
- Scheduled/configured behaviors distinguish prepared, installed, and actually observed. News expiry and weekly roll-forward are not complete merely because instructions mention them.
- PM handoff summarizes what works, what remains blocked by a real decision, and which experiment outcomes are still unmeasured.

## Explicit non-goals

Card redesign; new sports; accounts/comments/personalization; betting controls or ATS scoring; live odds; a general backend; automatic bulk roster growth; immutable historical price reconstruction; duplicate article routes; generic AI-written football essays; mass FAQ/schema generation; paid boosts; aggregator registration or media licensing negotiations; deployment or live social activity from the engineering task.
