# Capture assignment

Date: 2026-08-28. **Live JSON wins** if this file and `data/` disagree. This file is the hunt order for Grok Bots. Why Scout matters: `docs/scout-plan.md`. Which shows pick: `docs/pick-shows.md`.

Fan problem: five home games and **every one is one-sided**. Favorites have faces. Away/underdogs are empty. Futures (title, CFP, Super Bowl) are where the fights are. A fan opening this weekend wants Saturday and Wednesday, not July Super Bowl takes.

Do not pad the site with more title/SB faces until the game holes below are worked.

## Do not touch

Already booked. Restaging is a miss.

- Finebaum `unc-vs-tcu-2026` no
- Patterson `unc-vs-tcu-2026` yes (promoted 2026-08-28). Do not restage.
- Fallica `texas-cfp-2026` no
- Kanell `ncsu-at-uva-2026` yes (promoted 2026-08-28). Do not restage.
- The morning-eight and other mapped hard rows already in `calls.json`
- `walker` is on the roster. Do not invent a Week 0 SU; hunt BFW Saturday / Barstool CFB Show locks.
- `wisconsin-vs-nd-2026` stays **off home** until a roster SU exists — then propose `onHome: true` plus freeze
- McAfee “50-burger” Clemson, Fallica “double-digit dog,” Kanell totals / ATS +4.5, Klatt “open with LSU is tough,” Eisen paraphrase, Simms AFC East, Florio/Simms Super Bowl *score* as Week 1 — already dropped

Empty sides stay empty if nothing verifies. Do not invent.

## P0 — empty YES on home games (do these first)

YES = away. Each of these is a missing `{Name} picks {away} over {home}` story.

| Event | Kickoff | Empty | Already on the other side | Search |
|---|---|---|---|---|
| `clemson-at-lsu-2026` | Sat Sep 5, ABC | **Clemson** | Pate, Finebaum → LSU | GameDay Baton Rouge Sat 9/5 (Herbstreit, Saban, McAfee, Howard, Davis, Coughlin). Also Cover 3 LOCKS, BFW Saturday, Klatt, Fallica, McElroy, Kanell. Pate only if he **flips** off LSU. |
| `patriots-at-seahawks-2026` | Wed Sep 9, NBC | **Patriots** | Cowherd → Seahawks | Eisen, Florio, Simms, Sharpe, Stephen A, Brandt, Burleson, Kimes — **the week of the game**. AFC East lean ≠ Week 1 SU. |
| `49ers-vs-rams-2026` | Thu Sep 10, Netflix Melbourne | **49ers** | Eisen, Cowherd → Rams | `{pundit} 49ers Rams Melbourne 2026 pick`. |
| `bills-at-texans-2026` | Sun Sep 13, CBS | **Bills** | Cowherd → Texans | `{pundit} Bills Texans Week 1 2026 pick`. Skip is already Bills Super Bowl, not this game. |

Cowherd is already on three NFL home cards. Prefer a *different* voice on the empty YES.

## Hunt pick shows first (see `docs/pick-shows.md`)

Do not lead with `{famous face} {game} 2026 pick`. Open the locks show, jump the segment, name the speaker.

**Open every run if they dropped:** Cover 3 LOCKS, BFW Saturday, Barstool CFB Show locks, Picks Central, Pick Em, Bear Bets, Pate winners. GameDay / Big Noon only on Saturday of that game.

Roster pick factories now on the ledger: `kanell`, `patterson`, `walker`, `pate`, `fallica`, `coughlin`. `walker` has no mapped game yet.

Idle NFL desks (`simmons`, `florio`, `simms`, `clark`, `adams`) — hunt the week of the game, not today.

Story-ready off-roster SU on those shows (Fornelli, Elliott, Big Cat, Portnoy, PFT Commenter, Cousin Sal) → **Candidates**. Photo required to roster. “The show likes the Bills” is still not a pick.

**X Scout** (`bots/scout-x.md`) owns Twitter. Shows Scout does not sweep `from:{handle}`. Same Intake/Candidates bar; append `## X pass` to the day’s run file.

Group vs group leaderboard is **parked**. Do not design it. Do not invent ESPN/Barstool records. Fill game cards first.

## P1 — faceless marquee (not on home yet)

| Event | Why | Rule |
|---|---|---|
| `wisconsin-vs-nd-2026` | Lambeau, NBC, national TV | One verified roster SU → propose `onHome: true` + freeze. Klatt undefeated/title is **not** this game. |

## P2 — other slate games (only if P0/P1 are dry)

`miami-at-stanford-2026`, `baylor-vs-auburn-2026`. Still no roster SU. Totals and “favorite by a TD” are not SU. Off-roster Week 0 staff stays Dropped. `ncsu-at-uva-2026` is **on home** (Kanell YES). Virginia NO is empty — not P0 (P0 is empty away).

## P3 — futures (do not hunt these to look busy)

Fights already exist: Indiana title, Texas CFP, Texas SEC, Rams SB. Do **not** add another Herbstreit title/CFP face unless Scout is done with P0–P1.

Only map a future if it is a new first-person lean **and** P0 produced nothing that run. Never stretch a title pick onto a Week 1 game.

## Idle high-yield voices (use them on P0, not on more titles)

CFB, no mapped Week 1 SU: `walker` (BFW Sat / Barstool CFB Show), `saban`, `mcafee` (name the speaker on his show), `mcelroy`, `howard`, `tebow`, `meyer`, `leinart`, `quinn`, `ingram`, `feldman`, `staples`, `wasserman`, `mcfarland`. Kanell is mapped on NC State; Patterson on Dublin UNC — still ask them about Clemson and Lambeau. Herbstreit/Klatt/Coughlin/Davis are mapped on **futures** — still ask them about Clemson–LSU and Lambeau. On3 *PICKING* UNC–TCU 8/25 is ATS cover, not SU.

NFL, unused on Week 1 games: `florio`, `simms`, `stephena`, `sharpe`, `kimes`, `brandt`, `burleson`, `simmons`, `newton`, `adams`, `spears`, `clark`.

## Other bots

- **X Scout:** Twitter only. Append `## X pass` to the day’s run file. `patterson` and `walker` are Intake.
- **Audit:** re-open new **game** hard rows first (Shows + X pass). A fail stays out of JSON.
- **Promote:** ship `ok` game rows before any new future. Do not restage the do-not-touch list. Do not flip ncsu/wisconsin on home unless Scout proposed it with a verified SU.
- **Grader:** first slate is Dublin `unc-vs-tcu-2026` (Sat Aug 29). Then Clemson–LSU. Then NFL Week 1. Infer winner from hit/miss; do not invent an event `result` field unless Promote adds one.
- **Recap:** say out loud that every home game is still one-sided until P0 moves.

## Snapshot (from `data/` 2026-08-27)

Home games: Clemson empty / LSU pate+finebaum; Patriots empty / SEA cowherd; 49ers empty / LAR eisen+cowherd; Bills empty / HOU cowherd; **UNC patterson / TCU finebaum**; **NC State kanell / Virginia empty**.

Dublin is two-sided. Four home games still one-sided, all favorites. Fantasy/props: parked in `docs/fantasy.md`.
