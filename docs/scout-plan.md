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
2. **Shows / X / News** append their passes against Dispatch (`empty-side`, then `off-home`, then `thin`; skip `dense`). Never `data/`. Fantasy/props stay parked (`docs/fantasy.md`).
3. **Audit** re-opens URLs (including `x.com/.../status/...`).
4. **Promote** ships `ok` **roster** hard rows. Candidates are not auto-rostered. App mints `/picks/{slug}/{pundit}/`. Poster tweets the live URL. Poster does not hunt.

## Quality bar

- **SU** — they pick a winner of a listed game.
- **URL** — you opened it; that speaker; this season.
- **Photo** — required to join the roster, not to stage a Candidate (`photoUrl=needed` is allowed).

## Cadence

Saturday 8/29: Dublin 12:00 ET ESPN, then NC State 3:30. **GameDay is not this Saturday** (first 2026 show is Baton Rouge Sep 5). Pre-kick extras optional; **Grader after a final**, not before. BFW Saturday / Barstool CFB Show still skipped this week. `ruiz` is FOX Sports now — do not hunt him on Ringer NFL.  
Sep 5: GameDay Baton Rouge is the Clemson YES run.  
NFL openers: keep hunting named podcasts through Wed 9/9.

## What we will not do in this pass

- Auto-add pundits from Candidates.
- Group competition UI.
- Invent quotes or stretch titles onto games.
