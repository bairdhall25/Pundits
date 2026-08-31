# Event state on home (spec)

Status: Active plan

Date: 2026-08-31. Scope: how game cards communicate **Open** vs **Final** vs
**grading**, and which of those belong in the homepage hero and “this week”
board. No rebrand. No live scores. No `Live` / `In play`.

## Thesis

A fan scanning the home page cannot tell which games are still ahead and which
are last week’s receipts. The product currently has one public event state,
**Final**, and it only appears when two different facts are both true: the
sporting event has a box score, and every mapped pick is graded.

Those are different states. Home should look forward. Finished games are
receipts, not the lead.

## Two facts

| Fact | Meaning | Signal in data | Public word |
|---|---|---|---|
| Game complete | The contest is over | `kind === "game"` and both `awayScore` and `homeScore` exist | **Final** |
| Picks finished | The ledger closed the loop | `settledSide(event, calls)` is non-null | Hit / Miss on faces; not a second event word |

Do not ship **Completed** or **Finished** as user-facing labels. Those were
diagnostic language. Sports copy stays **Open**, **Final**, **Hit**, **Miss**.

`Live now` and `In play` remain reserved until the product has authoritative
in-game state. Do not infer them from a past `kickoffDate`, a pending call, or
a missing score.

## Public event scan status

| Status | When | Card treatment | Home job |
|---|---|---|---|
| `open` | Game, no scores yet | Green **Open** chip next to kickoff. Today/Tomorrow still allowed. No Final band. | Feature and “this week” full cards |
| `grading` | Scores exist, at least one mapped call still `pending` | Loud **Final · Grading** band plus the score | Full card, below open games, until Promote grades |
| `final` | Scores exist and every mapped call is graded | **Final · {winner} {w}–{l}** band. Hit/Miss on faces. Quieter card. | Compact receipt row, not the lead |

Futures have no box score. They are `open` until `settledSide` is non-null,
then `final`. They do not use `grading`. They are not homepage game cards.

## Ranking rules

Do not flip `onHome` in JSON for this work. `onHome` stays the editorial
eligibility flag. View code decides weight.

1. **Hero** is the next `open` `onHome` game that has at least one mapped pick.
   Prefer NCAAF, then NFL. If none are `open`, use an `onHome` `grading` game
   with picks. **Never fall back to a `final` game.** If nothing qualifies, omit
   the hero card.
2. **This-week board** (home college and NFL sections, and `/ncaaf/` `/nfl/`
   slate): full `EventCard`s for `open`, then `grading`. `final` games with
   picks become compact receipt rows under a **Final** kicker.
3. **Week archives** keep full `EventCard`s, including `final`. That is the
   historical record.
4. Faceless games stay on the waiting list. That path does not change.

Live data at spec time: TCU and UVA are `final`; Clemson–LSU is `open`. The
hero must be Clemson–LSU. TCU must not lead the college board.

## Data contract

`settledSide` stays the grading inference from mapped calls. Do not add a new
event-result object.

`awayScore` / `homeScore` / `resultUrl` mean the game is complete. They may
exist **before** every mapped call is graded. When both scores and
`settledSide` exist, they must agree (away win ↔ `yes`). Scores still require
both numbers, a non-tie, and an https `resultUrl`.

`finalScoreParts` / `finalScoreLine` key off scores only. They must not wait
for `settledSide`. That is what lets a `grading` card show the box score.

Do not invent scores, and do not write scores onto open Week 1 games in this
change.

## Visual constraints

Keep the green/black broadcast identity. No palette, type, or layout rebrand.
No frontend-design identity pass.

- Reuse the existing `.kick-tag` treatment for **Open**.
- Reuse `.event-final` for the Final / Final · Grading band.
- `.event-settled` must actually change the card: quieter border, no fight
  emphasis. Today the class is applied and has no CSS.
- `.event-grading` keeps full card energy. Grading is the short payoff window.
- Compact `final` rows reuse the existing `.wait-row` shape with receipt copy,
  not a second EventCard.

One glance on a scan card must answer: is this still ahead, is the game over
and waiting on grades, or is this a receipt?

## Surfaces in scope

- `EventCard` (home, sport slate, event page)
- Home hero selection and college/NFL boards
- `/ncaaf/` and `/nfl/` slate lists
- Canonical product copy for the new state words
- Integrity tests and grader/promote notes so scores-before-grades is legal

## Surfaces out of scope

- OG / story cards
- Recap pages
- Leaderboard ranking
- Live game state, clocks, or in-play labels
- Extra homepage games, Bets, fantasy, roster expansion
- Flipping `onHome` on Week 0 events
- Inferring complete from `kickoffDate`

## Canonical docs this ships into

Once implemented, update:

- `docs/product/experience-principles.md` §6 (Final vs grading vs Open)
- `docs/product/decision-log.md` (accepted: home looks forward; scores may
  precede grades)
- `docs/product/product-system.md` derived-record paragraph (scores = complete,
  `settledSide` = finished)
- `bots/grader.md` / `bots/promote.md` only as needed so Promote may write
  scores when the box score exists even if a later pass still has to grade
