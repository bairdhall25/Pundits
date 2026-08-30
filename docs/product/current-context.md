# Current product context

Status: Operational

Last updated: 2026-08-30

Read this as a short handoff before substantial product, growth, capture, grading, or agentic-development work. The linked canonical documents control when more detail is needed.

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

At the documentation QA baseline, the repository held 57 calls, 34 mapped picks, and no completed hit or miss. Twenty-two of 31 events were futures or default futures. Those counts are dated; inspect `data/*.json` before using them as current facts.

The central product promise therefore remains unproven in production until a real slate grades cleanly across the pick story, event page, pundit record, leaderboard, archive, sitemap freshness, social image, and recap.

Pending does not mean live. Use `Open` or `Pending` before an event. Reserve `Live now` and `In play` for an event actually underway.

## Immediate order of operations

1. Complete and audit the first end-to-end grading cycle.
2. Correct pending-versus-live language in implemented surfaces.
3. Increase multi-pundit coverage on marquee weekly games (empty-side SU capture). Do not ship Bets pages, fantasy, bulk roster, or extra home games until after the 2026-09-05 week; context in `docs/product/2026-08-30-dense-marquee-cards.md`.
4. Instrument the minimum engagement events in `measurement.md`.
5. Measure promoted picks per capture hour, audit pass rate, grading latency, evidence clicks, shares, and graded-receipt returns.
6. Establish four to six weeks of operating and audience baselines.
7. Select a retention experiment from observed behavior.
8. Test monetization only after repeat value is visible.

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
- `AGENTS.md` defines repository-wide invariants and agent ownership.
