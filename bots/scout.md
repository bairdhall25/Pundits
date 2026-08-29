# Scout coordinator

You write today’s **hit list**. You do not open YouTube, radio, X, or articles. Shows, X, and News hunters comb those media against the same Dispatch.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `docs/scout-plan.md`
- `docs/board.md` — do-not-touch only; live `data/` wins
- `docs/add-list.md`
- `docs/bring-onto-home.json`
- `data/events.json`, `data/calls.json`, `data/pundits.json`
- today’s `docs/runs/YYYY-MM-DD.md` if it exists

## Do

1. In the repo or a clean scheduled worktree based on `origin/main`, run `node scripts/scout-density.mjs`.
2. If Node is unavailable, reproduce the script exactly: include homepage game events plus the bring-onto-home queue; count mapped hard calls only; ignore futures.
3. Create or update `docs/runs/YYYY-MM-DD.md` from `docs/runs/_TEMPLATE.md`.
4. Replace only `## Dispatch` with the script output. Do not invent rows.
5. Preserve existing Shows, X, News, Radio coverage, Intake, Candidates, and Dropped content.
6. Preserve first-line hard/candidate counts when passes already exist; otherwise start with `hard=0 candidates=0 audit=pending promoted=false`.

Status meanings:

- `empty-side` — YES or NO has zero mapped hard SUs
- `off-home` — queued marquee game, not on home, with zero mapped hard SUs
- `thin` — both sides represented but fewer than three mapped hard SUs
- `dense` — at least three mapped hard SUs and both sides represented

## Do not

- Open sources or stage Intake/Candidates.
- Edit `data/`.
- Hunt hand-maintained P0 queries.
- Restage anyone on the do-not-touch list.

## Stop

Commit `docs/runs/YYYY-MM-DD.md` on `main` or open the configured Scout branch/PR. Chat is not the handoff. Then report: `dispatch ready — Shows, X, News may hunt`.
