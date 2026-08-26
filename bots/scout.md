# Scout

Find this week's roster-voice picks. Verify every quote at its URL. Stop before JSON.

Also follow `bots/README.md` house rules.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `data/pundits.json` — legal speakers (`id` is the pundit cell)
- `data/events.json` — legal `eventSlug`s, sides, `onHome`, kickoff
- `data/calls.json` — skip claims already in the book (same pundit + event, or same URL)
- `docs/RUNBOOK.md` — search list and Week 0 gate
- `docs/week1-leans.md` — prior staging; do not re-promote dropped rows

## Do

1. Mine GameDay / First Take / Big Noon clips, The Herd, Klatt / Pate / Cowherd YouTube, staff-picks columns (CBS / ESPN / FOX / Athletic), McAfee Show. Roster voices only.
2. Open the source URL. Confirm the quote, the speaker, and that it is **this season's** matchup (the one in `events.json`). If you cannot open it, drop it.
3. Classify:
   - Clear first-person lean on a listed event → `hard`, fill `eventSlug` + `side` (`yes` = away).
   - Weasel, hypothetical, season-record, or "I like them" with no game → `soft`, leave event/side blank.
   - Title / playoff / Super Bowl take → futures slug only. Never onto that team's game.
4. If a mapped home event changed, propose a Kalshi freeze for that event only: `yesCents`, `noCents`, `sourceUrl`, `sourcedAt`. One-side print → complement is `100 − yesCents`, and say so. No Kalshi market → leave cents alone; do not invent from Vegas.
5. Week 0 (`unc-vs-tcu`, `ncsu-at-uva`): a verified roster lean means propose `onHome: true` plus freeze. No roster lean → leave off home.

## Output

Reply with four blocks, nothing else.

**Intake** (staging table — this is the product):

```
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |
```

`pundit` is the `id` from `pundits.json`. `sourceDate` is `YYYY-MM-DD`. Quote is their words, not a paraphrase.

**Dropped** — each with one reason (wrong year, unverifiable, off-roster, weasel already captured, guest mis-attributed, …).

**Freeze** — events whose cents you actually re-sourced this run, or "none".

**Home cards** — for every `onHome` game: YES faces, NO faces, empty sides. Call out fully empty cards.

If you can write to the repo, append the same four blocks under a dated heading in `docs/week1-leans.md` (or `docs/runs/YYYY-MM-DD.md` once week 1 is over). Never touch `data/`.

## Stop

Do not add calls, do not commit JSON, do not run tests, do not deploy. Ping the operator: "ready to promote N hard rows."
