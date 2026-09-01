# Current product context

Status: Operational

Last updated: 2026-09-01

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

Week 0 graded on 2026-08-29: Dublin 2–2 (Patterson and McElroy hit; Finebaum and Compton miss) and Charlottesville 0–2 (Kanell and Patterson miss). Recap is `docs/runs/2026-08-31-recap.md`. Live JSON wins for current counts.

The first slate closed on pick stories, event pages, records, leaderboard, and social cards. Repeat the loop on Clemson–LSU and the NFL openers before treating the promise as proven.

Pending does not mean live. Use `Open` or `Pending` before an event. Reserve `Live now` and `In play` for an event actually underway.

## Immediate order of operations

1. Every Scout pass hunts remaining empty-side SUs in **both** NCAAF and NFL: Patriots / 49ers / Bills YES, and Wisconsin YES (Lambeau stays off-home until a roster SU). Clemson is dense — do not restage. Do not ship Bets pages, fantasy, bulk roster, or extra home games until after the 2026-09-05 week; context in `docs/product/2026-08-30-dense-marquee-cards.md`.
2. Grade Clemson–LSU after the final, then recap within 24 hours.
3. Grade NFL Week 1 as those games settle.
4. Instrument the minimum engagement events in `measurement.md`.
5. Measure promoted picks per capture hour, audit pass rate, grading latency, evidence clicks, shares, and graded-receipt returns.
6. Establish four to six weeks of operating and audience baselines.
7. Select a retention experiment from observed behavior.
8. Test monetization only after repeat value is visible.

## Capture vs display (working, 2026-09-01)

Homepage (`onHome`) is a curated first screen, not the hunt universe. `/ncaaf/` and `/nfl/` already show ledger games with picks, plus a waiting list for games with none. Scout Dispatch is homepage games plus `docs/bring-onto-home.json` (today: Wisconsin–ND). A pick for a game not in `events.json` cannot be mapped.

Do not add extra homepage games through 2026-09-05. After this week, reopen as: operator names a small watchlist; Scout hunts it (overflow is allowed if a show already opened names another game); Promote keeps new events off-home until the card has at least one verified SU, preferably both sides. Skip dense events, not a sport.

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
- Should Scout capture more games than the homepage features, and when does a watchlist game earn `onHome`?

## Authority and next reads

- `README.md` in this directory defines the canonical product-document set.
- `strategy-qa-2026-08-29.md` contains the full dated assessment.
- `measurement.md` defines metrics and stage gates.
- `editorial-and-corrections.md` defines trust and correction policy.
- `docs/README.md` distinguishes current authority from historical plans and evidence.
- `AGENTS.md` defines repository-wide invariants and agent ownership.
