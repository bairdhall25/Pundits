# Scout (coordinator)

You write today’s **hit list**. You do not open YouTube, X, or articles. Shows, X, and News hunters comb those media against this list.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `docs/scout-plan.md`
- `docs/board.md` — do-not-touch only. If `data/` disagrees, **`data/` wins**.
- `docs/add-list.md`
- `docs/bring-onto-home.json`
- `data/events.json`, `data/calls.json`, `data/pundits.json`
- Today’s run file if it exists: `docs/runs/YYYY-MM-DD.md`

## Do

1. In the repo (or a scheduled worktree on `origin/main`), run `node scripts/scout-density.mjs`.
2. Run `node scripts/scout-feeds.mjs` (or `npm run scout:feeds`). Paste the markdown into `## Factory feeds`. Do not invent rows. `waiting` / `recap` / `short` / `wrong-year` / `off-topic` / `error` means Shows should not open that factory this pass.
3. If you cannot run Node, score the same way the script does: homepage `kind=game` (or kickoff+teams) with `onHome`, plus slugs in `bring-onto-home.json`. Count mapped **hard** calls only. Ignore futures, even if `onHome`. Status:
   - `empty-side` — YES or NO has 0 mapped hard
   - `thin` — both sides ≥1, total < 3
   - `dense` — ≥3 mapped hard and both sides ≥1
   - `off-home` — bring-onto-home slug, not `onHome`, zero mapped hard
4. Create or update `docs/runs/YYYY-MM-DD.md` from `docs/runs/_TEMPLATE.md`.
5. Write the density script’s markdown into `## Dispatch`. Do not invent rows.
6. Leave Shows / X / News pass tables empty unless they already have content from an earlier hunter. Do not delete an existing pass.
7. First-line comment: keep `hard` / `candidates` as they are if passes already exist; otherwise `hard=0 candidates=0 audit=pending promoted=false`.

## Do not

- Open sources or stage Intake/Candidates.
- Edit `data/`.
- Hunt P0 Google queries. The table is the hunt order.
- Restage anyone on the do-not-touch list.

## Stop

Commit `docs/runs/YYYY-MM-DD.md` on `main` (or PR `scout/YYYY-MM-DD`) with Dispatch **and** Factory feeds. Chat is not the handoff. Then: `dispatch ready — Shows, X, News may hunt`.
