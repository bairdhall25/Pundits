# Roster promotion pipeline — implementation plan

> **For agentic workers:** Execute inline in this session. TDD. JMac is the first real apply after the operator confirms the photo.

**Goal:** A Promote helper that fail-closes a complete roster add, then roster Jason McIntyre.

**Architecture:** `scripts/roster-add.mjs` reads a mailbox manifest and writes pundit, calls, X table, pick-shows, and `docs/roster-pipeline.json`. Tests cover the helper against a temp fixture root so live `data/` is not the test bed. Wrighster is backfilled onto the ledger. JMac apply is a second commit after photo confirm.

**Tech Stack:** Node ESM, vitest, existing JSON + markdown hunt maps.

**Spec:** `docs/superpowers/specs/2026-09-02-roster-promotion-design.md`

## Global constraints

- Scout never writes `data/`.
- Promote is the only JSON writer.
- Operator yes per Candidate. Photo operator-confirmed. Helper does not download images.
- `team-analyst` / non-`association` eligibility refuses.
- Ledger-scoped tests only. Do not require X/pick-shows for the historic 50.
- No `onHome` flip, no event mint, no Bets rows, no methodology rewrite.
- `npm test` for helper. `npm run check` before JMac ships.

## Files

- Create: `scripts/roster-add.mjs`
- Create: `scripts/roster-add.test.mjs`
- Create: `docs/roster-pipeline.json`
- Create: `docs/runs/2026-09-02-roster-jmac.json` (after photo confirm)
- Modify: `bots/promote.md`, `docs/product/roster-growth.md`, `docs/product/current-context.md`
- Modify on first apply: `docs/pick-shows.md` (wrighster backfill)
- Modify on JMac apply: `data/pundits.json`, `data/calls.json`, `bots/scout-x.md`, `docs/pick-shows.md`, `public/photos/jmac.jpg`

### Task 1: Helper + fixture tests

Export `checkRosterPipeline` and `applyRosterAdd` from `scripts/roster-add.mjs`. Tests use `os.tmpdir()`.

- [ ] Failing tests: association apply writes complete set; missing photo refuses; `team-analyst` refuses; duplicate pundit+event skipped; `check` fails if X row missing for a ledger id.
- [ ] Implement apply/check.
- [ ] Green, commit helper.

### Task 2: Bot/product copy + Wrighster ledger

- [ ] Empty live ledger `[]` then apply wrighster backfill (already in JSON/X; add `` `wrighster` `` on On3 pick-shows line).
- [ ] Promote.md roster-add section. Roster-growth points at helper. Current-context: helper + featured sort is live.
- [ ] `check` on live repo for wrighster.

### Task 3: JMac (after photo confirm)

- [ ] Operator confirms still.
- [ ] Manifest + `apply` + `npm run check` + deploy.
