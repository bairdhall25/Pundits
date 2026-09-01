# Capture policy — capture eagerly, mint lazily, feature reluctantly

Date: 2026-09-01. Operator-ratified after the capture-vs-homepage-density review.
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
3. Dense games are skipped, **except**: an `onHome` game within 72h of kickoff gets one flip-check pass over already-carded pundits only. A quiet reversal on the marquee card is an integrity miss, not a density miss. Reversal = correction on the existing row, never a second card.
4. Overflow staging: a hunter already inside a source for a Dispatch hole may stage a hard SU on a listed game, or on an **unlisted** game as an unmapped call row (verbatim quote, source URL, source date — full SU bar, no "verify later" pile). Overflow never justifies opening a source. No vacuuming the FBS/NFL board.
5. Scout never mints events. Operator reviews staged unmapped rows daily: mint or discard.
6. Promote mints an event only with ≥1 verified SU in hand or explicit operator watchlist intent, and freezes the Kalshi price **in the same commit** when a market exists. No freeze backfills — a price sourced days after the pick is a different object; a missing freeze blocks `onHome`, not capture.
7. `onHome` floor: freeze + ≥1 verified SU face + operator flip. Both sides filled is a Dispatch hunt target, **not** an onHome gate (a both-sides gate would have delisted Patriots/Bills/49ers the week we proved the product).
8. Watchlist (`docs/bring-onto-home.json`) = current homepage holes + 2–4 operator-named games. Every entry is a promise: mintable within a day of a hit, or it comes off. A stale watchlist row recreates the dead-event problem upstream.
9. An event reaching kickoff with **zero mapped picks** is deleted from the ledger, not graded into an empty Final. Scope stays exactly zero-pick: a graded event is never deleted — that line is the integrity guarantee, and it is what keeps `/picks/{slug}/` permalinks safe (zero-pick pages have no card, no pundit page, nothing to have linked to).
10. Dataset floor, on-home or off: every call row machine-complete (`punditId`, `eventSlug` when mapped, `side`, `kind`, `sourceUrl`, `sourceDate`, `status`). No prose-only sourcing. Empty sides stay empty. Do not invent picks.

## One-way doors (why these rules are strict)

- **Deletion (rule 9)** kills a permanent URL — safe only while scoped to zero-pick events.
- **Freeze timing (rule 6)** — an unfrozen price is unrecoverable. Cost of the rule is an event shipping without a freeze; that only delays `onHome`.
- **Dataset floor (rule 10)** — laxity now is retroactive cleanup later; a data buyer queries the whole file, not the homepage.

Everything else here is a JSON/doc edit in git — cheap to amend.

## Where the rules are enforced (edits applied 2026-09-01)

- Rule 1 (fetch-first) and rule 3 (72h flip-check): `bots/scout.md`; the flip-check is computed by `scripts/scout-density-lib.mjs` (`inFlipWindow`) and shows up in the Dispatch `hunt` column.
- Rule 4 (overflow staging for unlisted games): `bots/scout-shows.md`, `bots/scout-x.md`, `bots/scout-news.md`.
- Rule 6 (when-to-mint + freeze-in-same-commit): `bots/promote.md` step 5.
- Rule 9 (zero-pick kickoff deletion): `bots/grader.md` proposes (`### Zero-pick deletions`), `bots/promote.md` executes.
- Rule 8 (watchlist discipline): `docs/bring-onto-home.json` — every entry mintable within a day of a hit, or it comes off.

## Standing operator decisions (as of 2026-09-01)

- Aug 30 hold runs through 2026-09-05: fill Patriots / 49ers / Bills YES and Wisconsin YES; no extra homepage games; Lambeau off home until a Wisconsin SU.
- Miami at Stanford and Baylor vs Auburn: **watchlisted 2026-09-01** (operator call). Scout hunts them off-home; freeze on first verified SU; onHome only after the hold and per rule 7.
