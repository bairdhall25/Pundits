# Dense marquee cards — hold through this week

Status: Working decision. Not an implementation plan.
Date: 2026-08-30.

Operator 2026-08-30: optimize for **dense marquee cards**, not more object types. **Do not implement** Bets pages, fantasy, bulk roster, or extra homepage games until this week’s capture (Clemson–LSU / NFL openers) is observed.

## Goal

A fan opening pundits.pro should see several named, sourced **winner** picks on each homepage game, preferably disagreement. Density is mapped hard SU: both sides ≥1 and total ≥3. That is Dublin-shaped. It is not raw page count.

## What is not the bottleneck

The roster is already large (~49). Most of those voices have zero mapped **games**. Empty-side cards (Clemson YES, Patriots/49ers/Bills YES, Lambeau fully empty) are a capture problem: factories were dark in Week 0, and the SU bar correctly refused beat-writer fills (McGraw / Fiutak / Tilock / Wells as Candidates only).

## Levers considered

| Lever | Verdict | Why |
|---|---|---|
| Fantasy / player props | Stay parked (`docs/fantasy.md`) | Different ruler and homepage job. Does not fill Clemson YES. |
| Extra games on home | No | Miami–Stanford / Baylor–Auburn without faces make the first screen worse. Lambeau stays off-home until a roster SU. |
| Bulk roster (SI/On3 staffers) | No | Would have filled Virginia NO; would also turn the product into a clip dump. Compton worked because the operator chose him. |
| Loosen SU (“leaning” = pick by default) | No | McElroy was an operator override. Keep the bar. |
| Fan-facing Bets (spreads/totals on the game card) | Defer | Already staged in run-file Bets (Compton -7.5, Staples -3.5, Big Cat Under 23.5). A strip on `/picks/{game}/` can enrich a card later. It does **not** count toward density. Favorite laying points may still imply SU; dog covers and totals stay Bets-only. Do not ship this to camouflage an empty favorite. |
| Capture empty-side SU | This week’s job | Scout hunts Clemson YES, then NFL empty YES, then one Lambeau SU. Roster only people who actually lock those games (add-list: Fornelli, Bud Elliott, Rico; Wells if he keeps locking CBS HQ). Promote still does not auto-roster. |

## This week’s operating rule

- Clemson–LSU is the CFB card that matters before Saturday 9/5 (GameDay Baton Rouge).
- NFL three stay empty-side hunts through 9/9.
- Settled Week 0 stays Final, not a hunt target.
- Recap after Grader is owed; it does not write JSON.
- Reopen this file after Week 1 factories actually tape. If Scout still returns empty-side on Clemson YES and the NFL dogs, the bottleneck is Scout, not the calendar.

## Approaches parked until then

1. **Capture-only** (likely still right): no product change; hunt empty sides; tiny opinionated roster adds.
2. **Bets strip on the same card**: only after the favorite has at least one SU.
3. **Widen who gets a face**: auto-roster add-list / radio-pilot after one quote — rejected for now.
