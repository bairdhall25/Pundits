# Homepage display tiers plan

Status: Proposed — see § Operator decisions before implementing

Date: 2026-09-03

Owner: Codex

## Goal

Separate **logging a pick** from **how prominently its game is shown**, so every
verified pick can mint a permanent URL without competing for a scarce homepage
slot. Add a third display weight — compact — beneath featured and full.

Operator framing, 2026-09-03: *"We should log all picks for SEO growth but just
figure out which games to show in full on the site. Almost like another display
rule: Featured > Full card games > compact card games."*

## Problem

`onHome` is one boolean doing two unrelated jobs: whether a pick should exist,
and how prominent its game is. Three concrete failures today:

1. **A home game was silently displaced.** `getHomepageFeaturedGames` fills each
   sport from a date-ordered list capped at `sectionLimit = 3`. Minting
   `dolphins-at-raiders-2026` (off-home, 1 face) tied `bills-at-texans-2026`
   (on-home, 2 faces) on `kickoffDate` 2026-09-13 and took its slot. A real home
   game left `/` because an overflow mint was logged for SEO.
2. **The cap drops games entirely.** With every card full-size, three is all that
   fits. Right now **six** open games with verified picks are excluded from `/`
   outright rather than shown smaller.
3. **`onHome` is not read by the homepage at all.** It gates `getWeekend`, but
   `isCompleteFeaturedCard` never checks it, so `docs/board.md`'s "do not put
   them on `/` without an operator `onHome` flip" was already untrue before
   today — Baylor and Wisconsin were on `/` this morning.

## Already decided — do not re-litigate

[`docs/product/featured-games.md`](../../product/featured-games.md) (2026-09-01)
is the operator-agreed display rule and this plan extends it rather than
replacing it. Carried forward unchanged:

- **No weighted score.** The board must stay explainable.
- **Sort waterfall, in order: Pin → When → Coverage → Size (tie-break only).**
- Pool is open/grading **games** that are a complete card: a mapped hard pick
  from a rostered face with a photo, plus a freeze.
- `/ncaaf/` and `/nfl/` are already full slates — every game with ≥1 mapped hard
  pick. **The SEO/logging half of the operator's framing is already correct**;
  what is missing is the tiering on `/`.
- That doc already states the target: *"Replace `onHome` as the homepage gate
  with this sort. `onHome` can become the pin, or go away."*

## Change 1 — implement the documented sort, and revert the stopgap

`lib/featured.ts`, `sortFeaturedGames`.

Commit `b1d7191` added an `onHome` priority immediately after Pin as a stopgap
for failure 1. It works, but it is **not the documented waterfall** — it inserts
a step ahead of `When`, and `featured-games.md` puts Coverage third with no
`onHome` step at all.

The documented order fixes that regression on its own and better:
`bills-at-texans` has 2 faces, `dolphins-at-raiders` has 1, so **Coverage breaks
the tie in Bills' favour without reference to `onHome`.**

Remove the `homeOrder` comparator added in `b1d7191` and implement the real
waterfall:

1. **Pin** — `activePinnedSlug`, already implemented.
2. **When** — `kickoffDate`, then the stored `kickoff` string. Already implemented.
3. **Coverage** — more mapped hard faces, then both sides filled, then
   disagreement. `coverage()` already returns `{ faces, bothSides, disagreement }`
   and is currently used only for the hero. Promote it into the comparator.
4. **Size** — tie-break only. Defer; leave the existing `slug` tie-break until
   there is a data source for network/ranked matchup that is not a score.

## Change 2 — three display tiers

New exported function in `lib/featured.ts`:

```ts
export type DisplayTier = "featured" | "full" | "compact";
export function displayTier(event, calls, pundits, pin, asOf): DisplayTier
```

Rules, derived — not a score, and no new per-game operator flag:

- **featured** — the pinned game; else the first game in waterfall order that is
  two-sided. This is exactly today's `pinned ?? twoSided ?? sorted[0]` hero
  logic, lifted out and named.
- **full** — `coverage().bothSides`, **or** `coverage().faces >= 2`.
- **compact** — everything else in the pool, i.e. a complete card with ≥1 mapped
  hard pick from a rostered face.

Not in the pool at all: zero mapped picks. `capture-policy` rule 6 already
forbids minting an event without ≥1 verified SU, so an empty shell never reaches
`/`. `miami-at-stanford-2026` is the live example — 0 faces, correctly absent.

`getHomepageFeaturedGames` gains `ncaafCompact` / `nflCompact` alongside the
existing arrays. **`sectionLimit` continues to cap full cards only. Compact rows
are uncapped**, which is what removes the scarcity that caused failure 1 — a
newly minted overflow game can no longer displace anything, because it lands in
a tier with no fixed slots.

## Change 3 — the compact card

`components/EventCard.tsx` gains a `compact` variant, or a sibling component.
Frontend design work, not just data. Minimum content: teams, kickoff, frozen
cents, face count, and the pick pages it links to. It must not carry the full
card's portrait row — that weight is what makes three the cap.

A compact card is a **link surface**, so every logged pick stays one click from
`/` and keeps its internal-link value. That is the SEO half of the operator's
framing.

## Worked example — live data, 2026-09-03

| Game | Faces | Sides | Tier |
|---|---|---|---|
| clemson-at-lsu-2026 | 6 | both | **featured** |
| smu-at-fsu-2026 | 2 | both | full |
| wisconsin-vs-nd-2026 | 3 | one | full |
| ucla-at-cal-2026 | 2 | one | full |
| baylor-vs-auburn-2026 | 1 | one | compact |
| 49ers-vs-rams-2026 | 3 | one | full |
| bills-at-texans-2026 | 2 | one | full |
| patriots-at-seahawks-2026 | 1 | one | compact |
| commanders/cowboys/ravens/packers/dolphins/broncos | 1 each | one | compact |
| miami-at-stanford-2026 | 0 | — | not shown |

**Nothing is dropped.** Today six of these are excluded from `/` entirely.

Two consequences the operator should see before this ships:

- `patriots-at-seahawks-2026` is `onHome: true` and holds a full NFL slot today,
  but has one face. Derived rules demote it to compact. `featured-games.md` says
  *"Empty side is honest and may stay in a section (Patriots with nobody on the
  dog)"* — under tiers it still appears, just smaller. If the operator wants it
  full regardless, that is what the pin is for.
- `smu-at-fsu-2026` auto-promotes to full the moment Patterson's SMU pick lands
  opposite Kanell's FSU. Nobody has to notice or flip anything. That is the
  behaviour the tiering is for.

## Change 4 — `onHome` disposition

Do **not** remove `onHome` in this pass. It is referenced in 53 files, including
`docs/board.md`, `docs/capture-policy.md` rule 7, `bots/promote.md`, all three
Scout prompts, `lib/data.ts` (`getWeekend`) and `scripts/scout-density-lib.mjs`.
Ripping it out alongside a display change makes both harder to review.

This pass: tiers are derived and `onHome` stops being consulted by the homepage
(it already effectively wasn't). Keep it as the operator's explicit
featured/pin-adjacent signal and as the Dispatch input it is today. A later pass
can collapse `onHome` into the pin once the waterfall has shipped and settled.

## Operator decisions

1. **Full-card threshold.** `faces >= 2` is proposed. `>= 3` gives a tighter
   board; two-sided always qualifies either way. Live data: at `>= 2` the NFL
   board is 2 full + 7 compact; at `>= 3` it is 1 full + 8 compact.
2. **Does `onHome: true` force at least `full`?** Proposed no — the pin covers
   it, and forcing it re-creates the flag-driven problem. Says whether Patriots
   keeps a full slot today.
3. **Compact cap.** Proposed uncapped. If `/` gets long once the NFL slate
   fills, a "show more" cut is the follow-up, not a hard limit that drops games.

## Verification

1. `npm run check` green.
2. A fixture off-home 1-face game resolves `compact`, appears in the compact
   array, and **does not** displace an on-home 2-face game from the full array.
3. The `b1d7191` regression has a named test: two games tied on `kickoffDate`,
   the one with more faces takes the full slot regardless of `onHome`.
4. Both existing off-home tests still pass unchanged — "lets an off-home mapped
   game reach league immediately and home only by the waterfall" and "puts an
   off-home settled complete card in homepage Final". They encode deliberate
   design; a change that breaks them is wrong.
5. Pin still overrides every tier.
6. Live board after the change matches the worked example above.

## Out of scope

- Capture policy. Minting rules do not change; `capture-policy` rule 6 still
  requires ≥1 verified SU per event.
- Grading, market semantics, URL structure, methodology copy.
- A weighted score, live trending, injury/weather/handle inputs.
- Removing `onHome`.
- League pages. `/ncaaf/` and `/nfl/` are already full slates and stay as-is.
