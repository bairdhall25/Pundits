# Roster promotion pipeline (spec)

Status: Agreed 2026-09-02

Date: 2026-09-02. Scope: a completeness gate so Promote can roster an
association-eligible Candidate onto the app and onto tomorrow’s Scout maps
in one pass. First execution: Jason McIntyre (`jmac`).

Not in scope: auto-roster without the operator, minting events, `onHome`
flips, featured-game changes, a new bot, News-beats rows, team-analyst
hosts.

## Thesis

A roster add is not `pundits.json` plus a photo. The person must also be
Intake for later hunts (X handle, factory map) and legal for app tests
(photo file, mapped hard calls). Wrighster proved the hole: JSON and photo
shipped; `pick-shows.md` did not.

## Binding decisions

1. **Ask every time.** Scout still only stages Candidates. Promote still
   never mints a person until the operator says yes on that Candidate. The
   checklist is learned in use; it is not a silent auto-approve.

2. **Promote is the only `data/` writer.** The helper is a gate Promote
   must run, not a Roster bot. Scout never runs it.

3. **Photo is operator-confirmed.** The agent finds a rights-safe still
   (Commons, outlet press room, official talent page). The operator
   confirms the source. Then the file lands at `public/photos/{id}.jpg`
   or `.png`. The helper does not download images. `photoUrl=needed`
   cannot ship.

4. **Eligibility is `docs/product/roster-growth.md`.** Association
   (named guest/fill-in on a roster factory, first-person SU) may pass.
   `team-analyst` (beat / Locked On *[Team]* host picking that team)
   is a hard refuse, even if asked, unless the operator overrides the
   definition.

5. **Complete add (fail closed).** All of:
   - operator yes this pass
   - operator-confirmed photo file on disk
   - `data/pundits.json` row: `id`, `name`, `outlet`, `photo`, `sport`
   - each audited story-ready hard SU written to `data/calls.json`
   - Roster table row in `bots/scout-x.md` (`| {id} | Name | handle |`)
   - factory voice on `docs/pick-shows.md` (backtick `` `{id}` ``)
   - append-only ledger row in `docs/roster-pipeline.json`

6. **Ledger-scoped tests, not the historic 50.** `docs/roster-pipeline.json`
   lists ids this pipeline owns. Vitest requires photo + pundit row + X
   row + pick-shows mention **for those ids only**. Wrighster is backfilled
   onto the ledger (and onto pick-shows) so he is complete. Do not demand
   X/pick-shows rows for every existing pundit.

7. **Bets stay out.** Dog +points without a winner is not a mapped call.
   Favorite laying points may be SU and also Bets; Promote still does not
   ship the Bets table.

8. **Display and Dispatch do not change.** A new face on an already
   featured game does not flip `onHome` and does not mint events.

## Helper

`scripts/roster-add.mjs`

```
node scripts/roster-add.mjs apply docs/runs/YYYY-MM-DD-roster-{id}.json
node scripts/roster-add.mjs check [id]
```

`apply` writes the complete set or exits non-zero. `check` verifies ledger
ids (or one id). Manifests sit next to the mailbox.

Manifest shape:

```json
{
  "id": "jmac",
  "name": "Jason McIntyre",
  "outlet": "The Herd / FOX Sports",
  "sport": "both",
  "photo": "/photos/jmac.jpg",
  "photoSource": "https://…",
  "xHandle": "jasonrmcintyre",
  "factory": "The Herd",
  "eligibility": "association",
  "calls": [
    {
      "eventSlug": "49ers-vs-rams-2026",
      "side": "no",
      "claim": "…",
      "source": "The Herd",
      "sourceUrl": "https://podcasts.apple.com/…",
      "sourceDate": "2026-09-01"
    }
  ]
}
```

`eligibility` other than `association` (including `team-analyst`) refuses.
Missing photo file refuses. Existing `punditId`+`eventSlug` in `calls.json`
is skipped, not duplicated.

## First run: jmac

| Field | Value |
|---|---|
| id | `jmac` |
| name | Jason McIntyre |
| outlet | The Herd / FOX Sports |
| sport | `both` |
| xHandle | `jasonrmcintyre` |
| factory | The Herd |
| eligibility | association (Colin fill-in, 2026-09-01 Hour 2) |
| mapped | `49ers-vs-rams-2026` NO; `bills-at-texans-2026` NO |
| not mapped | Patriots +3.5 (Bets, dog with points) |

Photo is chosen and confirmed in the implementation pass, not in this spec.

## Bot and product copy

- `bots/promote.md`: new Roster add section (ask → photo confirm → apply →
  test → deploy). Step 7’s “do not invent ids unless asked” stays; the
  helper is how “asked” is executed.
- `docs/product/roster-growth.md`: point at the helper and ledger. Scout
  still does not mint. Operator still asked each pass.
- `bots/scout-x.md` / `docs/pick-shows.md`: no behavior change except the
  rows the helper inserts. Shows Intake remains “existing `punditId`”.
- `docs/product/current-context.md`: one line that roster adds go through
  the helper. Featured sort is implemented (`lib/featured.ts`); do not
  leave “until the sort is implemented.”

## Methodology

Public methodology does not change. Who may be a pundit is already
`roster-growth.md`. This spec does not loosen the SU bar, freeze, or
grading.

## Done when

- Helper + ledger tests green
- Wrighster on the ledger and on pick-shows
- JMac on disk, in JSON, on X table, on The Herd line, two mapped SUs
- `npm test` green; `npm run check` before deploy
- Operator confirmed the JMac still before apply
