# Capture assignment

Date: 2026-08-31. **Live JSON wins** if this file and `data/` disagree. This file is do-not-touch, not the hunt order. Hunt order is today’s `## Dispatch` from `node scripts/scout-density.mjs`. Why Scout matters: `docs/scout-plan.md`. Which shows pick: `docs/pick-shows.md`.

Fan problem: homepage games are still one-sided favorites. Week 0 is Final. This week’s card is Clemson–LSU, then the three NFL openers. Do not pad with title/SB faces or extra faceless games.

Do not pad the site with more title/SB faces until Dispatch holes are worked.

## Do not touch

Already booked. Restaging is a miss.

- Finebaum `unc-vs-tcu-2026` no
- Patterson `unc-vs-tcu-2026` yes (promoted 2026-08-28). Do not restage.
- Fallica `texas-cfp-2026` no
- Kanell `ncsu-at-uva-2026` yes (promoted 2026-08-28). Do not restage.
- The morning-eight and other mapped hard rows already in `calls.json`
- `walker` is on the roster. Hunt BFW Thursday / Saturday locks and Barstool CFB Show. Do not invent a SU.
- `wisconsin-vs-nd-2026` has roster ND SUs (`wasserman`, `staples`) and stays **off home** while Wisconsin YES is empty (hold extra home games through 2026-09-05)
- Staples `clemson-at-lsu-2026` no (promoted 2026-08-31). Do not restage.
- Wrighster `clemson-at-lsu-2026` yes (promoted 2026-09-01). Do not restage.
- McElroy `clemson-at-lsu-2026` no and McElroy `wisconsin-vs-nd-2026` no (promoted 2026-09-01). Do not restage.
- Wasserman `wisconsin-vs-nd-2026` no and Staples `wisconsin-vs-nd-2026` no (promoted 2026-08-31). Do not restage.
- McAfee “50-burger” Clemson, Fallica “double-digit dog,” Kanell totals / ATS +4.5, Klatt “open with LSU is tough,” Eisen paraphrase, Simms AFC East, Florio/Simms Super Bowl *score* as Week 1 — already dropped

Empty sides stay empty if nothing verifies. Do not invent.

## How to hunt now

1. Run `node scripts/scout-density.mjs` (or read `## Dispatch` in today’s run file). Run `node scripts/scout-feeds.mjs` before opening a factory.
2. Shows / X / News hunt `empty-side`, then `off-home`, then `thin`. Skip `dense` unless Dispatch hunt says `flip-check`. Every pass covers **both** NCAAF and NFL Dispatch rows. Watchlist games (Wisconsin, Miami, Baylor) are hunted off-home; do not put them on `/` without an operator `onHome` flip. Doctrine: `docs/capture-policy.md`.
3. Shows uses the bounded sports-radio fallback in `docs/pick-shows.md` only after its normal high-yield programs.
4. Add-list: `docs/add-list.md`. Bring onto home: `docs/bring-onto-home.json`.
5. Futures are not the hunt target.

If this file and `data/` disagree, **`data/` wins**.

## Idle high-yield voices (use them on empty-side / thin, not on more titles)

CFB, no mapped Week 1 SU: `walker` (BFW Sat / Barstool CFB Show), `saban`, `mcafee` (name the speaker on his show), `mcelroy`, `howard`, `tebow`, `meyer`, `leinart`, `quinn`, `ingram`, `feldman`, `staples`, `wasserman`, `mcfarland`. Kanell is mapped on NC State; Patterson on Dublin UNC — still ask them about Clemson and Lambeau. Herbstreit/Klatt/Coughlin/Davis are mapped on **futures** — still ask them about Clemson–LSU and Lambeau. On3 *PICKING* UNC–TCU 8/25 is ATS cover, not SU.

NFL, unused on Week 1 games: `florio`, `simms`, `stephena`, `sharpe`, `kimes`, `brandt`, `burleson`, `simmons`, `newton`, `adams`, `spears`, `clark`, `pft`, `sal`, `kapadia`, `ruiz`. Barstool `bigcat` / `portnoy` are `both` — NFL empty-side and CFB locks shows.

## Other bots

- **X Scout:** Twitter only. Append `## X pass` to the day’s run file. `patterson` and `walker` are Intake.
- **Audit:** re-open new **game** hard rows first (Shows + X + News pass). A fail stays out of JSON.
- **Promote:** ship `ok` game rows before any new future. Do not restage the do-not-touch list. Do not flip ncsu/wisconsin on home unless Scout proposed it with a verified SU.
- **Grader:** Week 0 is done. Next: `clemson-at-lsu-2026` (Sat Sep 5), then NFL Week 1 (`patriots-at-seahawks-2026`, `49ers-vs-rams-2026`, `bills-at-texans-2026`). Infer winner from hit/miss; do not invent an event `result` field unless Promote adds one.
- **Recap:** first recap is `docs/runs/2026-08-31-recap.md`. Next recap after Clemson grades.

## Snapshot (from `data/` 2026-08-31)

Open home games: Clemson empty / LSU pate+finebaum+staples; Patriots empty / SEA cowherd; 49ers empty / LAR eisen+cowherd; Bills empty / HOU cowherd. Lambeau wasserman+staples ND NO, Wisconsin empty, stays off home. Week 0 Final: Dublin dense (Patterson/McElroy hit, Finebaum/Compton miss); Charlottesville Kanell+Patterson miss, Virginia still empty.

Four open home games are still one-sided, all favorites. Fantasy/props: parked in `docs/fantasy.md`.
