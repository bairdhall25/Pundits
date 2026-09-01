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

**Every Coordinator / Shows / X / News pass hunts both NCAAF and NFL.** Dispatch is the full homepage slate. Do not park a sport because the calendar said “CFB day” or “wait for NFL week.” Skip `dense` events and settled games only. Factory *windows* still apply (GameDay Saturday, Big Noon Saturday) — that is which episode to open, not which sport to drop.

**This week (CFB Week 1 / NFL Week 1 preview):**

| When | Job |
|---|---|
| Daily | Coordinator Dispatch from `node scripts/scout-density.mjs` plus Factory feeds from `node scripts/scout-feeds.mjs`. Shows, X, and News hunt every under-dense Dispatch row in **both** sports. X twice daily. |
| Weeknights | Open Finebaum / Pate / Always CFB / On3 **and** Herd / Eisen / McAfee when Factory feeds say `today`. Wisconsin YES and NFL empty YES stay open. Clemson is dense — skip unless a source already opened names it. |
| Thu 9/3 | Cover 3 **Week 1 LOCKS** — first high-yield CFB factory. Still hunt NFL empty YES in the same pass. |
| Fri 9/4 | Shows + News, both sports. Miami–Stanford is off-home; do not hunt unless it lands on Dispatch. |
| Sat 9/5 | **GameDay Baton Rouge** plus Big Noon. Grader after Clemson is final, not before. Recap after Grader. Still hunt NFL empty YES. |
| Sun 9/6 | Lambeau stays off-home until a roster Wisconsin SU. |
| Through Kickoff Wed 9/9 | Keep NFL empty YES (Patriots, 49ers, Bills) on every pass, alongside remaining NCAAF holes. |

Hunt order is Dispatch: `empty-side` (NCAAF and NFL), then `off-home`, then `thin`. Skip `dense`. Do not fill Miami–Stanford or extra home games through 2026-09-05. `ruiz` is FOX Sports — not Ringer NFL. Bets/fantasy/bulk roster stay parked through this week.

## What we will not do in this pass

- Auto-add pundits from Candidates.
- Group competition UI.
- Invent quotes or stretch titles onto games.
- Add a radio-only bot or routine. The pilot uses the existing Shows schedule and is capped at two local archives per under-dense matchup.
