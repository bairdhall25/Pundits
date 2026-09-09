# Current product context

Status: Operational

Last updated: 2026-09-08

Read this as a short handoff before substantial product, growth, capture, grading, or agentic-development work. The linked canonical documents control when more detail is needed.

A growth-engine implementation is active. Codex is the product manager; Grok is the engineer. Intended behavior is in the [2026-09-08 execution brief](./2026-09-08-growth-execution-brief.md) and [implementation plan](../superpowers/plans/2026-09-08-growth-engine-implementation.md). Shipped behavior remains live code and `data/*.json`. Phase 0 current-truth inventory: [correction inventory](../runs/2026-09-08-growth-correction-inventory.md). This pointer does not replace the capture and grade order of operations below.

## Business thesis

Pundits.Pro is an accountability product for sports predictions. It preserves a named pundit's public pick, exact evidence, and frozen market context, then grades the result and keeps the receipt permanently accessible.

The near-term goal is not monetization or maximum page count. It is to prove that Pundits.Pro can repeatedly:

1. capture defensible picks around events fans care about;
2. create useful comparison and disagreement at the event level;
3. grade the picks quickly and accurately;
4. turn each verified object into useful product, search, and social surfaces; and
5. cause people to return for results, records, or the next slate.

The operating target is **qualified event density**, not raw volume. A smaller slate with several credible voices on each marquee game is more useful than many isolated futures or thin pages.

## Current product truth

Week 0 graded on 2026-08-29: Dublin 2–2 (Patterson and McElroy hit; Finebaum and Compton miss) and Charlottesville 0–2 (Kanell and Patterson miss). Recap is `docs/runs/2026-08-31-recap.md`.

Friday Week 1 graded on 2026-09-05 (`767f9e9`): Miami 45–6, Clay Travis hit; Toledo 20–30, Patterson miss. Proposal `docs/runs/2026-09-05-grade.md`. Live JSON wins for current counts.

Clemson at LSU (Sat 7:30 ET ABC) is the open hero: 2–7 (Wrighster/Kanell Clemson YES; Pate, Finebaum, Staples, McElroy, Clay Travis, Fornelli, Pollack LSU NO). The first slate closed on pick stories, event pages, records, leaderboard, and social cards. Repeat the loop on Clemson–LSU and the NFL openers before treating the promise as proven.

Pending does not mean live. Use `Open` or `Pending` before an event. Reserve `Live now` and `In play` for an event actually underway.

Saturday operating mailbox: `docs/runs/2026-09-05-gameday-handoff.md`.

## Immediate order of operations

1. **Scout queue (Phase 2):** hunt **approved** capture targets in `docs/capture-targets.json` — Patriots / 49ers / Bills — plus current `onHome` games. Upcoming public NCAAF events are 0; a proposed Week 2 shortlist is waiting on PM selection. Do not scout every college game. Density does not stop designated high-value sources on approved priority games. Doctrine: `docs/capture-policy.md`.
2. Grade NFL Week 1 as those games settle (Patriots Wed, 49ers Thu, Bills Sun). Flag overdue ungraded games for Grader; do not keep pregame-hunting them.
3. Soft-launch public-source tips through event pages and the footer. Treat every submission as an untrusted Scout lead; review quality and operational load after three settled slates.
4. Instrument the minimum engagement events in `measurement.md`.
5. Measure promoted picks per capture hour, audit pass rate, grading latency, evidence clicks, shares, graded-receipt returns, and qualified tip yield.
6. Establish four to six weeks of operating and audience baselines.
7. Select a retention experiment from observed behavior.
8. Test monetization only after repeat value is visible.

## Capture vs display

Canonical capture: `docs/capture-policy.md`. Canonical home and league display: `docs/product/featured-games.md` (implemented in `lib/featured.ts`). Canonical who-may-roster: `docs/product/roster-growth.md`. Capture eagerly, mint lazily, feature reluctantly. Featured is a waterfall (pin → when → coverage → size), not a score and not “both sides or nothing.” `/` derives featured, full (both sides or at least two faces), a two-game compact teaser, and at most two Final receipts per sport, without consulting `onHome`; the hero does not consume a full-card slot. `/picks/` combines the full NCAAF and NFL boards with All selected. League pages are live-week TV slates with the same full/compact coverage rule and no slot cap. Scout still hunts `onHome` games plus **approved** rows in `docs/capture-targets.json`. Proposed matchups are not hunt targets. Overflow unlisted SUs stage as unmapped rows; Promote mints them only when asked. Roster adds go through `scripts/roster-add.mjs` after the operator says yes and confirms the photo. Published event slugs are append-only. Do not infer an `onHome` flip from the featured waterfall.

## Guardrails

- A public prediction is not automatically a mapped pick; preserve the qualification and sourcing standard.
- Do not fill empty sides with weak inference.
- Do not describe a frozen Kalshi price as live odds or imply the pundit placed a wager.
- Records must show graded sample size and should not imply predictive skill prematurely.
- Do not let model training crawler policy accidentally determine search and retrieval visibility; those are separate controls.
- Do not silently delete or rewrite published receipts. Follow the corrections policy.
- Do not introduce accounts, comments, additional sports, live odds, a general backend, or complex scoring without explicitly reopening the parked scope.

## Competitive context

Pundit Ledger is an active adjacent product worth monitoring monthly. Its in-play feed was judged weak from a sports-fan perspective at the August 2026 baseline, but that is evidence about its current experience, not proof that it cannot improve. Treat the builder as a possible future partner as well as a competitor. Record new evidence in `docs/competitive/` and avoid strategy based on assumptions about the founder's persistence or business experience.

## Open questions

- Is the strongest repeat-use object the game consensus, the individual pundit, or the graded weekly recap?
- Is frozen market probability an enduring product hook or mainly an acquisition device?
- Which voices generate traffic, and which will share their receipts?
- Which generated artifacts earn indexing, engagement, or sharing rather than merely existing?
- What correction or dispute states become necessary after real edge cases occur?
- What repeat behavior is strong enough to support a monetization experiment?

## Authority and next reads

- `README.md` in this directory defines the canonical product-document set.
- `strategy-qa-2026-08-29.md` contains the full dated assessment.
- `measurement.md` defines metrics and stage gates.
- `editorial-and-corrections.md` defines trust and correction policy.
- `docs/README.md` distinguishes current authority from historical plans and evidence.
- `docs/capture-policy.md` is the capture vs homepage-density doctrine.
- `docs/product/featured-games.md` is the homepage featured-game display rule.
- `docs/product/roster-growth.md` is who may join the roster (association, not team analysts).
- `AGENTS.md` defines repository-wide invariants and agent ownership.
- `docs/runs/2026-09-05-gameday-handoff.md` is today’s Saturday operating mailbox (GameDay override, grade order, resume prompt).
