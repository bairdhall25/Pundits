# Fantasy / player props — PARKED

Status: **parked**. Do not implement. Do not add a Fantasy chip to `SportFilter`. Do not mint `sport: "fantasy"` or `kind: "prop"` until this file is un-parked by the operator.

Date: 2026-08-28.

## Why this is not a third sport yet

NCAAF and NFL cards are still one-sided on five home games. Fantasy is a huge audience. It is also a **different product** from “who picked the winner at a frozen Kalshi moneyline.”

## Two products (do not mix)

### A. Players / props (could fit this repo later)

Kalshi already lists football player contracts: weekly yard **ladders** (50+ / 100+ / 150+), TDs, receptions; season thresholds (4000+ passing, 1250+ receiving); rushing-yards leader; MVP. Polymarket lists anytime TD and receiving-yards O/U.

That maps if — and only if — the speaker **named the threshold or the TD**, same as a game SU.

Would need:

- `EventKind: "prop"`
- YES = the named threshold hits (not away-team)
- New Scout list (Fallica, Coughlin, people who say “over 80”)
- EventCard / OG / Grader / headlines that are not “picks TCU over North Carolina”
- Freeze still Kalshi (`venue: "kalshi"`). Polymarket is a reprint, not a second ruler, unless we add `venue` per event on purpose.

Label this **Players** or **Props**, not Fantasy Football.

### B. True fantasy (new product)

Start/sit, weekly rankings, waivers, draft. Scored on **PPR (or half-PPR) finish**, not Kalshi.

“Start Justin Jefferson” is not “Jefferson 70+ receiving yards at 61¢.” Mapping that is the same stretch we forbid for title → game.

Would need a second ruler, a weekly player slate, a Fantasy Scout bot (Wed–Sun volume), and a different homepage job. Roster sketch (not minted): Matthew Berry (no photo last pass), Field Yates, Daniel Dopp, Mike Clay, Jake Ciely. `adams` only if she actually ranks.

## What we will not do while parked

- A `/fantasy/` sport next to `/ncaaf/` and `/nfl/`
- Promoting Kimes “Jefferson fantasy top-10” onto a Kalshi ladder
- Mixing Polymarket cents into a Kalshi freeze
- Diverting Shows Scout off Cover 3 / BFW / GameDay / Pick Em

## Un-park trigger

Operator says so **after** NFL Week 1 game boards have two-sided cards (or after we decide empty YES is no longer the hole). Then write a real design: event shape, YES meaning, Scout list, scoring, and whether the chip is Players or Fantasy.

Until then this file is the whole plan.
