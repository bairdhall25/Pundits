# Scout is the product

Date: 2026-08-28.

The site already looks like a fan product: chips, even cards, who-picked-whom SEO. It cannot invent faces. **If Scout does not land story-ready SU leans, the homepage stays one-sided chalk.** UI, Audit, Promote, and Grader only ship what Scout verifies.

## Tokens

The monthly budget (Grok Heavy, Grok Bots, Codex, Claude) is large. **Do not hunt like tokens are scarce.** Open the episode. Jump locks. Read captions. Query named people twice if the first pass is empty. The scarce thing is a verified SU, not API spend. Inventing a pick to look productive is still a fail.

## Goal

A fan opening pundits.pro should see **several named, sourced winner-picks on each homepage game**, NCAAF and NFL, preferably disagreement.

Success is density, not a single face on an empty side:

- `empty-side` (a homepage game with nobody on YES or nobody on NO) is urgent.
- `thin` (both sides have someone, total mapped hard SUs < 3) still counts — stacking the favorite is success.
- `dense` (≥3 mapped hard and both sides ≥1) is done for the week.

Architecture: `docs/superpowers/specs/2026-08-29-scout-architecture-design.md`.

## Pipeline

1. **Coordinator** writes `## Dispatch` from `node scripts/scout-density.mjs` into `docs/runs/YYYY-MM-DD.md`. Does not hunt.
2. **Shows / X / News** append their passes against Dispatch (`empty-side`, then `off-home`, then `thin`; skip `dense`). Shows includes a bounded durable-radio fallback after its normal programs. Never `data/`. Fantasy/props stay parked (`docs/fantasy.md`).
3. **Audit** re-opens URLs (including `x.com/.../status/...`).
4. **Promote** ships `ok` **roster** hard rows. Candidates are not auto-rostered. App mints `/picks/{slug}/{pundit}/`. Poster tweets the live URL. Poster does not hunt.

## Quality bar

- **SU** — they pick a winner of a listed game.
- **URL** — you opened it; that speaker; this season.
- **Photo** — required to join the roster, not to stage a Candidate (`photoUrl=needed` is allowed).

## Cadence

Week 0 is graded. Settled games are not hunt targets.

**This week (CFB Week 1):**

| When | Job |
|---|---|
| Daily | Coordinator Dispatch from `node scripts/scout-density.mjs`. X twice daily. |
| Tue 9/2 | X. No Shows NCAAF (Thu–Sat). NFL Shows/News wait until Tue of that NFL week (9/8). |
| Thu 9/3 | Cover 3 **Week 1 LOCKS** — first high-yield factory. Shows + News NCAAF. Clemson YES first. |
| Fri 9/4 | Shows + News. Miami–Stanford is off-home; do not hunt unless it lands on Dispatch. |
| Sat 9/5 | **GameDay Baton Rouge** is the Clemson YES run (Herbstreit / Saban / McAfee / Howard / Davis / Coughlin). Big Noon same window. Grader after Clemson is final, not before. Recap after Grader. |
| Sun 9/6 | Lambeau stays off-home until a roster SU. |
| Tue 9/8–Wed 9/9 | NFL empty YES (Patriots, then 49ers, then Bills) through Kickoff Wednesday. |

Hunt order is Dispatch: Clemson YES, then NFL empty YES, then one Lambeau SU. Do not fill Miami–Stanford or Baylor–Auburn. `ruiz` is FOX Sports — not Ringer NFL. Bets/fantasy/bulk roster stay parked through this week.

## What we will not do in this pass

- Auto-add pundits from Candidates.
- Group competition UI.
- Invent quotes or stretch titles onto games.
- Add a radio-only bot or routine. The pilot uses the existing Shows schedule and is capped at two local archives per under-dense matchup.
