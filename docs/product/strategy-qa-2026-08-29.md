# Product strategy and documentation QA

Status: Evidence

Date: 2026-08-29

## Verdict

The product is pointed in the right direction: narrow accountability promise, strong evidence discipline, permanent receipts, frozen market context, and an explicit bias against premature infrastructure and monetization. The main strategic correction is to stop treating corpus size as the goal. The next proof is **dense coverage of events fans care about followed by fast, defensible grading**.

The repository currently has 57 calls and 34 mapped picks, but no hit or miss. Until the first real slate grades cleanly, the core promise remains designed rather than proven.

## What is right

- Named people and exact public evidence create a more compelling object than generic prediction scraping.
- Empty sides are preserved instead of filled with weak inferences.
- Kalshi is used as frozen context rather than live odds or a claim that pundits bet.
- Static, derived pages make one verified object reusable across search, social, profiles, events, teams, and archives.
- URL permanence allows results to compound instead of disappearing with the weekly slate.
- Scout/Audit/Promote/Grader separation is a sensible control against automated fabrication.
- The roadmap correctly keeps accounts, comments, more sports, live odds, and a backend out of scope.
- Pundit Ledger should be monitored, not copied feature for feature.

## Corrections made by this QA

1. Established a documentation authority map so old plans cannot override current product or deployment rules.
2. Reframed volume as qualified event density, not raw calls or pages.
3. Added an operating and product measurement framework with stage gates.
4. Added attribution, source hierarchy, correction, dispute, and rights guidance.
5. Made the first reliable grading loop an explicit product gate.
6. Clarified that hypothetical $100 is secondary analysis; the fan promise is the public call and result.
7. Reserved `Live now` and `In play` for events actually underway.

## High-priority product risks

### 1. Accountability is not proven yet

All current calls were pending at the QA baseline. The first completed games must grade through every dependent surface: pick story, event, pundit record, leaderboard, weekly archive, sitemap freshness, OG image, and recap.

### 2. The corpus is future-heavy

Twenty-two of 31 events are futures/default futures. Futures create slow feedback and weak habit. Weekly games create urgency, grading frequency, receipts, and repeat visits. Continue keeping valuable futures, but the acquisition wedge should be marquee weekly games.

### 3. Coverage is too thin at the event level

Raw pick growth can hide one-sided cards. Prioritize multiple recognizable voices and genuine disagreement on a smaller set of important events before adding isolated long-tail claims.

### 4. Fan and betting language can drift

The price is differentiated and early feedback supports it. Hypothetical P&L, `at risk`, YES/NO, and repeated Kalshi framing can still make the product feel like a betting interface. Keep the frozen probability at scan; place market mechanics and hypothetical returns deeper, and test comprehension.

### 5. Current implementation still uses `Live` for pending

The new semantic decision conflicts with existing UI helpers and phrases such as `Live picks`. This is now documented debt: change unresolved pre-event states to `Open` or `Pending`; add a separate live-event state only when real game state exists.

### 6. Measurement is mostly email-only

Google Analytics and email-interest events exist, but the core journey—event opens, pick-story opens, evidence clicks, shares, and graded-receipt returns—is not instrumented. Do not build a large analytics system; add only the events required by the measurement framework.

### 7. Corrections are under-modeled

The data model lacks void/corrected/disputed states and explicit result evidence. The operational policy now prevents silent deletion, but the model should be designed after the first real edge case rather than prebuilt speculatively.

### 8. Source and asset rights can become a business constraint

Public quoting and linking are product strengths, but scaled commercial reuse, photos, market data, syndication, and partner APIs require explicit rights review. This matters before licensing or monetization, not after.

### 9. Capture economics are unmeasured

Agent tokens may be plentiful, but verification and operator attention are not. Track promoted picks per capture hour and audit pass rate by source. The scalable workflow is the one that reliably produces defensible picks, not the one that performs the most searches.

## Recommended order of operations

1. Complete and QA the first grading cycle.
2. Fix pending-versus-live language and verify the newly added grading freshness metadata on the first real result.
3. Increase density on marquee weekly events.
4. Instrument the smallest set of core engagement events.
5. Ship rapid receipts and weekly recaps; learn which artifacts travel.
6. Establish four to six weeks of operating and audience baselines.
7. Choose a retention test based on observed behavior.
8. Only then define the first monetization experiment.

## Questions that should remain open

- Is the frozen price the enduring product hook or primarily an acquisition device?
- Do fans care more about game-level consensus, individual personalities, or post-game records?
- Which voices drive clicks, and which voices will actually share their receipts?
- Does search compound faster around games, pundits, teams, or weekly result archives?
- Does hypothetical P&L improve understanding or add betting baggage?
- What correction state is needed after the first real dispute?
- What repeated behavior is strong enough to monetize without forcing the answer?

These should be resolved with observed behavior, not another feature brainstorm.
