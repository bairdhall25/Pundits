# Capture policy — capture eagerly, mint lazily, feature reluctantly

Date: 2026-09-01. Operator-ratified after the capture-vs-homepage-density review.
Cleanup 2026-09-01: published slugs stay append-only; overflow is Audit-ok and operator-gated to mint; flip-check is 3 calendar days on `kickoffDate`.

This is doctrine. Hunt order stays in today's `## Dispatch`. Do-not-touch stays in `docs/board.md`. If this file and `data/` disagree, **live JSON wins**.

## Why this exists

Two customers, one ledger. Fans get a dense homepage of verified faces on games they care about. Long term, the verified-pick dataset itself is the asset (agents and humans paying for access). Density constraints apply to **display**. The verification bar applies to the **dataset**, and applies hardest off-home: verbatim quote + source URL + source date + frozen price is the provenance chain that makes a row worth paying for. A row no fan ever sees must still be machine-complete.

## The doctrine

- **Capture eagerly.** A verified hard SU is worth staging even when its game will never be carded.
- **Mint lazily.** An event exists in `events.json` only because a verified pick needs a home or the operator watchlisted the game. Never mint ahead of both.
- **Feature reluctantly.** `onHome` is earned, not defaulted. New events are born off-home.

## Operating rule (Scout / Promote / Coordinator)

1. Coordinator computes Dispatch from **fresh `origin/main` JSON** at pass time — fetch first, or run in a scheduled worktree on `origin/main`. Never from a checkout that has not fetched today, and never from a prior Dispatch or from memory. (2026-09-01: a local `main` sat 33 commits behind origin and misread Clemson as one-sided.)
2. Hunt order per pass, both sports: `empty-side` on homepage → watchlist (`off-home`) → `thin`. `dense` = ≥3 mapped hard AND both sides ≥1, verified against live JSON.
3. Dense games are skipped, **except**: an `onHome` game whose `kickoffDate` is within **3 calendar days** (UTC date of that field minus 72 hours) gets one flip-check pass over already-carded pundits only. That is a date window, not 72 clock hours before 7:30 ET. A quiet reversal on the marquee card is an integrity miss, not a density miss. Reversal = correction on the existing row, never a second card.
4. Overflow staging: a hunter already inside a source for a Dispatch hole may stage a hard SU on a listed game, or on an **unlisted** game as an unmapped Intake row — verbatim quote, source URL, source date, full SU bar, `eventSlug` blank, matchup in `subject`. Overflow never justifies opening a source. No vacuuming the FBS/NFL board.
5. Scout never mints events. Audit does **not** fail a blank `eventSlug` on an overflow row that otherwise clears the SU bar — verdict `ok-unmapped`. Operator reviews `ok-unmapped` rows: mint or discard.
6. Promote maps ordinary `ok` rows as usual. It mints a new event from `ok-unmapped` rows **only when the operator asked this pass to mint them**: `onHome: false`, freeze (cents + ticker + sourceUrl + sourcedAt) **in the same commit** when a Kalshi market exists, then the mapped call. No freeze backfills — a missing freeze blocks `onHome`, not capture. If the operator did not ask, list the unmapped rows in the commit message and leave `data/`.
7. `onHome` floor: freeze + ≥1 verified SU face + **explicit operator flip this pass**. Both sides filled is a Dispatch hunt target, **not** an onHome gate (a both-sides gate would have delisted Patriots/Bills/49ers the week we proved the product). Scout does not propose the flip; Promote does not infer it.
8. Watchlist (`docs/bring-onto-home.json`) = current homepage holes + 2–4 operator-named games. Scout hunts them off-home. Every entry is a promise: mintable within a day of a hit, or it comes off. A stale watchlist row recreates the dead-event problem upstream.
9. **Published event slugs are append-only.** Do not delete an event that already has a public `/picks/{slug}/` (Miami and Baylor already do). A zero-pick game that reaches kickoff is not graded into an empty Final and is not deleted — it stays off-home / waiting. Avoid *new* dead rows by not minting events that have no SU and are not watchlisted.
10. Dataset floor, on-home or off: every call row machine-complete (`punditId`, `eventSlug` when mapped, `side`, `kind`, `sourceUrl`, `sourceDate`, `status`). No prose-only sourcing. Empty sides stay empty. Do not invent picks.

## One-way doors (why these rules are strict)

- **Published URLs (rule 9)** — append-only. Deleting a shipped slug breaks permalinks, sitemap, redirects, and `verify:static`. Do not walk that door.
- **Freeze timing (rule 6)** — an unfrozen price is unrecoverable. Cost of the rule is an event shipping without a freeze; that only delays `onHome`.
- **Dataset floor (rule 10)** — laxity now is retroactive cleanup later; a data buyer queries the whole file, not the homepage.

Everything else here is a JSON/doc edit in git — cheap to amend.

## Where the rules are enforced

- Rule 1 (fetch-first) and rule 3 (3-day flip-check): `bots/scout.md`; the flip-check is computed by `scripts/scout-density-lib.mjs` (`inFlipWindow`) and shows up in the Dispatch `hunt` column.
- Rule 4 (overflow staging): `bots/scout-shows.md`, `bots/scout-x.md`, `bots/scout-news.md`.
- Rule 5 (Audit `ok-unmapped`): `bots/audit.md`.
- Rule 6 (when-to-mint + freeze-in-same-commit + operator mint gate): `bots/promote.md`.
- Rule 7 (no inferred onHome): `bots/promote.md`; Dispatch hunt for off-home is “roster SU, stay off-home until operator flip.”
- Rule 8 (watchlist): `docs/bring-onto-home.json`.
- Rule 9 (append-only events): `bots/grader.md` and `bots/promote.md` do **not** delete events.

## Standing operator decisions (as of 2026-09-01)

- Aug 30 hold runs through 2026-09-05: fill Patriots / 49ers / Bills YES and Wisconsin YES; no extra homepage games; Lambeau off home until an operator `onHome` flip.
- Miami at Stanford and Baylor vs Auburn: **watchlisted 2026-09-01**. Scout hunts them off-home; freeze on first verified SU; onHome only after the hold and per rule 7.
- Homepage **display** (which games fill `/`) is `docs/product/featured-games.md`. That waterfall does not change Dispatch and does not authorize an `onHome` flip.
- **Who may roster** is `docs/product/roster-growth.md`. Association on roster factories is eligible. Team analysts (beat/homer picking their team) are not pundits. Team podcasts may still be sources for independent voices.
