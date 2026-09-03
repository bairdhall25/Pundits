# Featured games (homepage display)

Date: 2026-09-01. Operator-agreed display rule.
This is **display**, not capture. Hunt order stays `docs/capture-policy.md` and today’s `## Dispatch`. If this file and live JSON disagree, **JSON wins** for what is shipped; this file wins for intended homepage behavior until the code matches.

Do not use a weighted score. Do not special-case “time for this audience” (no US-primetime vs Melbourne adjustment).

## Why not a score

A number that mixes size, kickoff, and face count is arbitrary, jumpy, and hard to defend. The homepage should be explainable: soonest real card, densest first, operator can override.

## Slots

`/` has a hero plus two sections. Each section has full and compact display
tiers.

- **Hero** — one open (or grading) game.
- **College** — up to three full open/grading NCAAF cards, then every remaining
  complete game as a compact row. The hero does not repeat here.
- **NFL** — up to three full open/grading NFL cards, then every remaining
  complete game as a compact row. The hero does not repeat here.
- **Final** — settled complete cards from those boards, as receipts, not as the lead. `onHome` is not the gate.

`/ncaaf/` and `/nfl/` are the full slates: every **game** with ≥1 mapped hard pick. No zero-pick “waiting” rows on those pages. Futures stay in the futures block, not in this-week featured slots.

## Pool

Open or grading **games** that are a **complete card**: mapped hard pick from a rostered face (photo on file) and a freeze (cents + source). Incomplete cards (no pick, or no freeze) never take the hero. They may appear on a league page once they have a mapped pick even if still unpriced.

Settled games leave featured slots.

## Sort (waterfall, in this order)

1. **Pin.** Operator can force the lead game (Clemson this weekend; GameDay destination; spectacle; anything we’d call trending). A pin expires at that game’s kickoff unless renewed.
2. **When.** Sooner `kickoffDate`, then the stored `kickoff` string. No timezone-audience tweak. Past games are Final.
3. **Coverage.** More mapped hard faces, then both sides filled, then disagreement (someone on the dog / both sides, not a one-sided stack).
4. **Size (tie-break only).** Primetime network, GameDay / Big Noon, ranked matchup. Not a model.

Then fill College and NFL **separately** from that order so one sport cannot eat the page.

Size remains an intended final tie-break, but is currently deferred. Until it
has an explicit, consistently maintained source, an event slug is the stable
final tie-break.

## Display tiers

Display weight is derived from the pool; it is not a new event flag and does
not use `onHome`.

- **Featured** — the active pin; otherwise the first two-sided game in waterfall
  order; otherwise the first complete game.
- **Full** — a non-featured game with both sides filled or at least two unique
  rostered faces with photos.
- **Compact** — every other non-featured complete game. Compact rows show the
  teams, kickoff, frozen cents, face count, and direct links to each take without
  a portrait row.

The three-card section limit applies only to full cards. Additional full-tier
games fall through to the uncapped compact list so no complete game is dropped
from `/`.

## Hero vs section

- Empty side is honest and may stay **in a section** (Patriots with nobody on the dog).
- Empty side must not beat a two-sided open game for the **hero**.
- A one-pick watchlist SU (Miami, Baylor) belongs on `/ncaaf/` immediately. It reaches `/` only if it wins when + coverage, or if pinned.

## Stability

Do not reshuffle the hero on every Promote. Keep the current hero until it kicks off, unless a pin says otherwise, or a complete card is both **sooner** and **denser** (more faces or newly two-sided).

## What this is not

- Not Scout Dispatch. Logging a pick does not auto-feature it.
- Not `onHome` as a taste flag forever. Today’s `onHome` is the shipped featured set. The target is this waterfall. Until code uses it, do not infer `onHome` flips from this file — Promote still needs an explicit operator flip (`docs/capture-policy.md` rule 7).
- Not live trending, injury news, weather, handle, or follower counts.

Implementation brief for the first PR: `docs/superpowers/plans/2026-09-01-featured-games.md`.

Implemented in `lib/featured.ts`. The current operator pin lives at
`data/featured-pin.json`; `until` is inclusive through that calendar day.
`onHome` remains in the editorial and capture workflow for now, but the homepage
does not consult it. A later pass may collapse it into the pin or remove it once
the waterfall has settled. Capture policy does not change.
