# Featured games (home and league display)

Date: 2026-09-03. Operator-agreed display rule (amends 2026-09-01).
This is **display**, not capture. Hunt order stays `docs/capture-policy.md` and today’s `## Dispatch`. If this file and live JSON disagree, **JSON wins** for what is shipped; this file wins for intended display behavior until the code matches.

Do not use a weighted score. Do not special-case “time for this audience” (no US-primetime vs Melbourne adjustment).

## Why not a score

A number that mixes size, kickoff, and face count is arbitrary, jumpy, and hard to defend. Home should be explainable: soonest real card, densest first, operator can override. League pages follow the TV schedule.

## Slots

`/` is a featured board with a short hint to go deeper.

- **Hero** — one open (or grading) complete card.
- **College** — up to three full open/grading NCAAF cards, then the next two leftover complete games as compact rows. The hero does not repeat here.
- **NFL** — up to three full open/grading NFL cards, then the next two leftover complete games as compact rows. The hero does not repeat here.
- **Final** — at most two latest complete settled cards per sport, as receipts. `onHome` is not the gate.

Remaining complete games leave `/`. They live on `/ncaaf/` and `/nfl/`.

`/ncaaf/` and `/nfl/` are live-week slates: every **game** with ≥1 mapped hard pick on a live week, plus later weeks that already have picks. Fully settled earlier weeks leave the league page and live at the week archive URL. No zero-pick “waiting” rows. Futures stay in the futures block.

Coverage tier is the card treatment on league pages, not a grouping. A Friday one-pick game stays above a Sunday three-pick game.

## Pool

Open or grading **games** that are a **complete card**: mapped hard pick from a rostered face (photo on file) and a freeze (cents + source). Incomplete cards (no pick, or no freeze) never take the hero. They may appear on a league page once they have a mapped pick even if still unpriced.

Settled games leave featured slots.

## Sort (waterfall, in this order)

1. **Pin.** Operator can force the lead game (Clemson this weekend; GameDay destination; spectacle; anything we’d call trending). A pin expires at that game’s kickoff unless renewed.
2. **When.** Sooner `kickoffDate`, then parsed kickoff time. Football `kickoff` strings have no AM/PM: `12:xx` is noon, hours 1–11 are PM. Missing or unparseable times sort last on that date. No timezone-audience tweak. Past games are Final.
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

Home caps full cards at three per sport and leftover compact rows at two per
sport. Additional complete games are omitted from `/` and listed on the league
page. A full-tier leftover that makes the teaser is compact on `/` and full
again on `/ncaaf/` or `/nfl/` if it still meets the coverage test.

League pages do not cap either tier. They mix full and compact cards in
schedule order inside each live week. Open and grading stay in one list.
That week’s Finals sit under it as receipts. The previous week is a tease
plus archive link, not the game list.

## Hero vs section

- Empty side is honest and may stay **in a section** (Patriots with nobody on the dog).
- Empty side must not beat a two-sided open game for the **hero**.
- A one-pick watchlist SU (Miami, Baylor) belongs on `/ncaaf/` immediately. It reaches `/` only if it wins when + coverage, or if pinned.

## Stability

A static rebuild has no previous-hero memory. Pin is the stability mechanism. Unpinned hero is rebuilt from the waterfall: two-sided first, else the first complete card.

## What this is not

- Not Scout Dispatch. Logging a pick does not auto-feature it.
- Not `onHome` as a taste flag forever. Today’s `onHome` is the shipped featured set. The target is this waterfall. Until code uses it, do not infer `onHome` flips from this file — Promote still needs an explicit operator flip (`docs/capture-policy.md` rule 7).
- Not live trending, injury news, weather, handle, or follower counts.

Implemented in `lib/featured.ts`. The current operator pin lives at
`data/featured-pin.json`; `until` is inclusive through that calendar day.
`onHome` remains in the editorial and capture workflow for now, but home and
league display do not consult it. Capture policy does not change.

Spec: `docs/superpowers/specs/2026-09-03-home-league-display-design.md`.
