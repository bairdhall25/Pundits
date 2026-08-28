# Capture assignment

Date: 2026-08-28. **Live JSON wins** if this file and `data/` disagree. This file is the hunt order for Grok Bots. Why Scout matters: `docs/scout-plan.md`.

Fan problem: five home games and **every one is one-sided**. Favorites have faces. Away/underdogs are empty. Futures (title, CFP, Super Bowl) are where the fights are. A fan opening this weekend wants Saturday and Wednesday, not July Super Bowl takes.

Do not pad the site with more title/SB faces until the game holes below are worked.

## Do not touch

Already booked. Restaging is a miss.

- Finebaum `unc-vs-tcu-2026` no
- Fallica `texas-cfp-2026` no
- Kanell `ncsu-at-uva-2026` yes (promoted 2026-08-28). Do not restage.
- The morning-eight and other mapped hard rows already in `calls.json`
- Chip Patterson stays **off the roster** until the operator says otherwise. UNC ML sprinkle is a Candidate only.
- `wisconsin-vs-nd-2026` stays **off home** until a roster SU exists — then propose `onHome: true` plus freeze
- McAfee “50-burger” Clemson, Fallica “double-digit dog,” Kanell totals / ATS +4.5, Klatt “open with LSU is tough,” Eisen paraphrase, Simms AFC East, Florio/Simms Super Bowl *score* as Week 1 — already dropped

Empty sides stay empty if nothing verifies. Do not invent.

## P0 — empty YES on home games (do these first)

YES = away. Each of these is a missing `{Name} picks {away} over {home}` story.

| Event | Kickoff | Empty | Already on the other side | Search |
|---|---|---|---|---|
| `clemson-at-lsu-2026` | Sat Sep 5, ABC | **Clemson** | Pate, Finebaum → LSU | `{pundit} Clemson LSU 2026 pick` — GameDay Baton Rouge is the main chance (Herbstreit, Saban, McAfee, Howard, Davis, Coughlin). Also Klatt, Fallica, McElroy, Kanell, Pate (only if he now takes Clemson — he is already LSU). |
| `unc-vs-tcu-2026` | Sat Aug 29, ESPN Dublin | **North Carolina** | Finebaum → TCU | `{pundit} North Carolina TCU Dublin 2026 pick`. Re-search every run until Saturday. A morning miss is not closed. |
| `patriots-at-seahawks-2026` | Wed Sep 9, NBC | **Patriots** | Cowherd → Seahawks | `{pundit} Patriots Seahawks kickoff 2026 pick` — Eisen, Florio, Simms, Sharpe, Stephen A, Brandt, Burleson, Kimes. AFC East lean ≠ Week 1 SU. |
| `49ers-vs-rams-2026` | Thu Sep 10, Netflix Melbourne | **49ers** | Eisen, Cowherd → Rams | `{pundit} 49ers Rams Melbourne 2026 pick`. |
| `bills-at-texans-2026` | Sun Sep 13, CBS | **Bills** | Cowherd → Texans | `{pundit} Bills Texans Week 1 2026 pick`. Skip is already Bills Super Bowl, not this game. |

Cowherd is already on three NFL home cards. Prefer a *different* voice on the empty YES.

## Hunt existing podcast voices first (do not grow the roster)

We already have podcast/hybrid ids. They are idle on Week 1 games. Query these **before** any new outlet:

| id | Name | Show | Use on |
|---|---|---|---|
| `simmons` | Bill Simmons | The Bill Simmons Podcast / Ringer | NFL P0 (Pats, 49ers, Bills). Already on the roster. Zero mapped picks. |
| `kanell` | Danny Kanell | Cover 3 | Already NC State YES. Still hunt Clemson, Dublin, Lambeau. Totals/ATS ≠ SU. Do not restage Wolfpack ML. |
| `mcafee` | Pat McAfee | McAfee Show / GameDay | Only if **Pat** says the SU. Guests stay `hawk`, `butler`, … never `mcafee`. 50-burger already dropped. |
| `florio` | Mike Florio | PFT Live | NFL P0. Super Bowl score ≠ Week 1. |
| `simms` | Chris Simms | Unbuttoned / PFT | NFL P0. AFC East lean ≠ Patriots–Seahawks. |
| `clark` | Ryan Clark | The Pivot | NFL P0. |
| `adams` | Kay Adams | Up & Adams | NFL P0. |
| `pate` | Josh Pate | YouTube | Already LSU. Only if he now takes **Clemson**. |

Fans follow **shows**. After roster podcasts, hunt **named** Barstool and Ringer people on the same P0/P1 games. Be aggressive on search; stay strict on speaker. Do not mint ids. Story-ready off-roster SU → **Candidates**. “The show likes the Bills” is still not a pick.

**How to hunt (do not stop at `{pundit} {away} {home} 2026 pick`):**

- Show + game: `Pardon My Take Clemson LSU`, `Big Cat LSU pick`, `Cousin Sal Patriots Seahawks`, `Ringer NFL 49ers Rams`.
- Segment words: `locks`, `I'll take`, `give me`, `moneyline`, `straight up`, `I'm on`.
- Open the episode (YouTube/Barstool/Ringer). Use captions. Jump the locks/picks block — that is how Kanell’s Wolfpack ML showed up.
- Search **both** teams, last ~7 days, this season only.
- ESPN staff “No Pick” grids are not the end of the hunt.

**X Scout** (`bots/scout-x.md`) owns Twitter. Shows Scout does not sweep `from:{handle}`. Same Intake/Candidates bar; append `## X pass` to the day’s run file.

**Named people to query** (not a roster, a search list):

- Ringer: Bill Simmons (`simmons` if it is him), Cousin Sal, Sheil Kapadia, Steven Ruiz, Kevin Clark (Ringer NFL), Van Lathan if he actually picks a game.
- Barstool: PFT Commenter, Big Cat, Dave Portnoy, Brandon Walker (CFB), Riggs, KFC if it is a game SU.

**Story-ready bar** (see Scout): **SU + URL**. Photo is required to *roster*, not to *stage*. If the pick is real and you cannot find a photo, still Candidate with `photoUrl` = `needed`.

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

CFB, no mapped Week 1 SU: `saban`, `mcafee` (name the speaker on his show), `mcelroy`, `howard`, `tebow`, `meyer`, `leinart`, `quinn`, `ingram`, `feldman`, `staples`, `wasserman`, `mcfarland`. Kanell is mapped on NC State (Week 0) — still ask him about Clemson and Dublin. Herbstreit/Klatt/Coughlin/Davis are mapped on **futures** — still ask them about Clemson–LSU and Lambeau.

NFL, unused on Week 1 games: `florio`, `simms`, `stephena`, `sharpe`, `kimes`, `brandt`, `burleson`, `simmons`, `newton`, `adams`, `spears`, `clark`.

## Other bots

- **X Scout:** Twitter only. Append `## X pass` to the day’s run file. Chip Patterson stays a Candidate.
- **Audit:** re-open new **game** hard rows first (Shows + X pass). A fail stays out of JSON.
- **Promote:** ship `ok` game rows before any new future. Do not restage the do-not-touch list. Do not flip ncsu/wisconsin on home unless Scout proposed it with a verified SU.
- **Grader:** first slate is Dublin `unc-vs-tcu-2026` (Sat Aug 29). Then Clemson–LSU. Then NFL Week 1. Infer winner from hit/miss; do not invent an event `result` field unless Promote adds one.
- **Recap:** say out loud that every home game is still one-sided until P0 moves.

## Snapshot (from `data/` 2026-08-27)

Home games, still one-sided: Clemson empty / LSU pate+finebaum; Patriots empty / SEA cowherd; 49ers empty / LAR eisen+cowherd; Bills empty / HOU cowherd; UNC empty / TCU finebaum; **NC State kanell / Virginia empty**.

Mapped hard: 33. Roster with zero mapped hard: 25 of 40. Fights (both sides): four, all futures.
