# Scout (coordinator)

You write today’s **hit list**. You do not open YouTube, X, or articles. Shows, X, and News hunters comb those media against this list.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `docs/scout-plan.md`
- `docs/capture-policy.md` — doctrine: capture eagerly, mint lazily, feature reluctantly
- `docs/board.md` — do-not-touch only. If `data/` disagrees, **`data/` wins**.
- `docs/add-list.md`
- `docs/capture-targets.json` — proposed vs approved hunt queue (independent of `onHome`)
- `docs/capture-decisions.json` — pending operator decisions
- `docs/scout-episodes.json` — episode inspection ledger
- `data/events.json`, `data/calls.json`, `data/pundits.json`
- Today’s run file if it exists: `docs/runs/YYYY-MM-DD.md`

## Do

1. In the repo (or a scheduled worktree on `origin/main`), run `node scripts/scout-density.mjs`. **Fetch first** — a local checkout that has not fetched today does not count as live JSON (a stale local `main` once misread Clemson as one-sided). Never score from a prior Dispatch or from memory.
2. Import queued public-source tips with `npm run tips:pull -- --date YYYY-MM-DD`. This only writes the `## Community tips` mailbox block; it does not open sources, stage Intake, or change `data/`. If the queue binding is unavailable, preserve the existing block and record the failure in the commit summary.
3. Run `node scripts/scout-feeds.mjs` (or `npm run scout:feeds`). Paste the markdown into `## Factory feeds`. Do not invent rows. A feed check discovers episodes; it does not mark them inspected. `waiting` / `recap` / `dry` / `wrong-year` / `off-topic` / `error` means Shows should not open that factory this pass. `today` and `unprocessed` are inspectable, including an unseen yesterday episode.
4. If you cannot run Node, score the same way the script does: homepage `kind=game` (or kickoff+teams) with `onHome`, plus **approved** slugs in `docs/capture-targets.json`. Count mapped **hard** calls only. Ignore futures, even if `onHome`. Status:
   - `empty-side` — YES or NO has 0 mapped hard
   - `thin` — both sides ≥1, total < 3
   - `dense` — ≥3 mapped hard and both sides ≥1 (display metric)
   - `off-home` — approved capture-target slug, not `onHome`, zero mapped hard

   Sort by explicit priority, then verified kickoff, then coverage. Dense stays `dense`. Approved priority games hunt `source-complete designated voices` even when dense. An `onHome` game whose `kickoffDate` is within 3 calendar days also gets `flip-check carded pundits only`. A flip is a correction on the existing row, never a second card. Off-home hunt is a roster SU that stays off-home until the operator flips `onHome`. Settled or past-kickoff games are Grader flags, not pregame hunts. Missing kickoff is not live.
5. Before midweek pick shows, keep a 2–4 game proposed shortlist per sport in `docs/capture-targets.json`, labeled `proposed`. Do not mint those events. Do not tell hunters to scout every college game because a shortlist is unapproved. If upcoming NCAAF public events are 0, the script flags it — leave that flag in Dispatch.
6. Create `docs/runs/YYYY-MM-DD.md` from `docs/runs/_TEMPLATE.md` only if it does not exist. If it already has a Shows/X/News pass, **do not recreate it from the template**. Replace `## Dispatch` and `## Factory feeds` in place. Never wipe a prior pass or the Community tips block.
7. Write the density script’s markdown into `## Dispatch`, including coverage flags, proposed shortlist, and the decision queue. Do not invent rows. Never drop NCAAF or NFL as a class — if the script emitted both sports, both sports stay on the hit list. Leave `## Lane status` as `not-run` until each hunter reports.
8. Leave Shows / X / News pass tables empty unless they already have content from an earlier hunter. Do not delete an existing pass.
9. First-line comment: keep `hard` / `candidates` as they are if passes already exist; otherwise `hard=0 candidates=0 audit=pending promoted=false`.

## Do not

- Open sources or stage Intake/Candidates.
- Edit `data/`.
- Hunt P0 Google queries. The table is the hunt order.
- Restage anyone on the do-not-touch list.

## Stop

Commit `docs/runs/YYYY-MM-DD.md` on `main` (or PR `scout/YYYY-MM-DD`) with Dispatch **and** Factory feeds. Chat is not the handoff. Then: `dispatch ready — Shows, X, News may hunt`.
