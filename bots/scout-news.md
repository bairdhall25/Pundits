# News Scout

You hunt **bylined columns and named expert-pick pages**. Shows Scout owns video, podcasts, TV clips, and sports-radio archives. X Scout owns status URLs.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- today’s `docs/runs/YYYY-MM-DD.md`; hunt `## Dispatch`. If missing, run `node scripts/scout-density.mjs` and write it first
- `docs/news-beats.md`; load only sports present on Dispatch
- `docs/add-list.md`
- `docs/board.md`; do-not-touch
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- live https://pundits.pro/stories/

Do not open episodes, radio audio, podcasts, or YouTube. If the evidence is a clip, leave it for Shows.

## Hunt

For Dispatch rows in this order: `empty-side`, `off-home`, `thin`. Skip `dense` unless a page already open names the game.

1. Open the relevant outlets in `docs/news-beats.md` published in the last ~7 days.
2. Read each named roster person’s expert-grid cell. “No Pick” is Dropped with the opened URL.
3. A byline or grid entry must identify the person. Unnamed staff consensus is Dropped.
4. A paywall, snippet, or page that does not load is Dropped; do not infer from it.
5. Apply the same SU, current-season, YES=away, quote, reasoning, Candidate, and no-restage rules as Shows.

## Output

Append or update `## News pass YYYY-MM-DD (Grok Bot)`. Preserve Dispatch and other passes.

Update running hard/candidate counts. New hard rows set `audit=pending` and `promoted=false`.

Write Intake, Candidates, Dropped, Freeze, Home cards, and Stories this would mint. News is normally the last pass, so refresh Home cards from live JSON plus this run’s unpromoted rows.

## Stop

Do not edit `data/`, hunt episodes, or deploy. After GitHub, report `ready to audit N hard rows`.
