# Scout is the product

Date: 2026-08-28.

The site already looks like a fan product: chips, even cards, who-picked-whom SEO. It cannot invent faces. **If Scout does not land story-ready SU leans, the homepage stays one-sided chalk.** UI, Audit, Promote, and Grader only ship what Scout verifies.

## Tokens

The monthly budget (Grok Heavy, Grok Bots, Codex, Claude) is large. **Do not hunt like tokens are scarce.** Open the episode. Jump locks. Read captions. Query named people twice if the first pass is empty. The scarce thing is a verified SU, not API spend. Inventing a pick to look productive is still a fail.

## Goal

A fan opening pundits.pro should see **several named, sourced winner-picks on each homepage game**, NCAAF and NFL, preferably disagreement.

Success is qualified event coverage on the approved slate, not a single face on an empty side:

- `empty-side` (an approved or onHome game with nobody on YES or nobody on NO) is urgent.
- `thin` (both sides have someone, total mapped hard SUs < 3) still counts — stacking the favorite is success.
- `dense` (≥3 mapped hard and both sides ≥1) is a **display** metric. It is not a stop on designated high-value sources for approved priority games (source-complete those named selections, including favorite-side voices). Flip-checks stay distinct from new calls.

Architecture: `docs/superpowers/specs/2026-08-29-scout-architecture-design.md`.

## Pipeline

1. **Coordinator** writes `## Dispatch` from `node scripts/scout-density.mjs` into `docs/runs/YYYY-MM-DD.md`, including coverage flags, proposed shortlist, and the decision queue. Does not hunt. Does not mint events. Produces a next-slate proposed shortlist (2–4 marquee games per sport) before midweek pick shows.
2. **Shows / X / News** append their passes against **approved** Dispatch rows (priority, then kickoff, then `empty-side` / `off-home` / `thin`). Source-complete designated factories on approved dense games. Skip ordinary dense hunting otherwise except `flip-check`. Each lane reports `completed` / `dry` / `blocked` / `not-run`. A missing run is not a dry hunt. Shows includes a bounded durable-radio fallback after its normal programs. Never `data/`. Fantasy/props stay parked (`docs/fantasy.md`).
3. **Audit** re-opens URLs (including `x.com/.../status/...`) and writes **row-specific** verdicts with stable `rowId`. An unrelated fail does not block other ok mapped rows.
4. **Promote** ships row-level `ok` / `ok-no-reasoning` **roster** hard rows whose current quote still matches Audit. Candidates are not auto-rostered. App mints `/picks/{slug}/{pundit}/`. Poster tweets the live URL. Poster does not hunt.

## Quality bar

- **SU** — they pick a winner of a listed game.
- **URL** — you opened it; that speaker; this season.
- **Photo** — required to join the roster, not to stage a Candidate (`photoUrl=needed` is allowed).

## Cadence

Week 0 is graded. Settled games are not hunt targets.

**Every Coordinator / Shows / X / News pass hunts both NCAAF and NFL approved targets.** Dispatch is `onHome` games plus **approved** rows in `docs/capture-targets.json`. Proposed matchups are not hunt targets and are not minted. Do not park a sport because the calendar said “CFB day” or “wait for NFL week,” and do not treat a missing college approval as “no college work.” Skip ordinary `dense` hunting except `source-complete` on approved priority games and `flip-check` on already-carded faces when `kickoffDate` is within 3 calendar days. Skip settled and past-kickoff games (flag Grader). Factory *windows* still apply (GameDay Saturday, Big Noon Saturday) — that is which episode to open, not which sport to drop. Doctrine: `docs/capture-policy.md`.

**Rolling cadence (replace launch-week dates):**

| When | Job |
|---|---|
| Daily | Coordinator Dispatch from `node scripts/scout-density.mjs` plus Factory feeds from `node scripts/scout-feeds.mjs`. Paste coverage flags, proposed shortlist, decision queue, and lane-status placeholders. Shows, X, and News hunt **approved** Dispatch rows in **both** sports. X twice daily. |
| Before midweek pick shows (Tue) | Coordinator proposes the next 2–4 marquee games per sport. PM approves or defers. Existing unsolved approved targets stay. |
| When Factory feeds say `today` or `unprocessed` | Open Finebaum / Pate / Cover 3 / See Ball / Clay Travis / BFW **and** GMFB / Herd / Eisen / McAfee. Do not skip a yesterday unprocessed episode. Do not reopen a dry episode without a new reason. |
| GameDay / Big Noon Saturday | Source-complete the named desk on approved priority games even if the card is already dense. |
| After kickoff | Grader on settled or overdue ungraded games. Scout does not keep pregame-hunting them. |

Hunt order is Dispatch: priority, then kickoff, then `empty-side` / `off-home` / `thin`. Source-complete designated voices on approved dense games. `ruiz` is FOX Sports — not Ringer NFL. Bets/fantasy/bulk roster stay parked.

## What we will not do in this pass

- Auto-add pundits from Candidates.
- Group competition UI.
- Invent quotes or stretch titles onto games.
- Add a radio-only bot or routine. The pilot uses the existing Shows schedule and is capped at two local archives per under-dense matchup.
