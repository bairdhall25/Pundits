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

Search **by event**, not by whoever ranks on the first query. For every `onHome` game plus Week 0 and any faceless marquee (`wisconsin-vs-nd`): query `{pundit name} {away} {home} 2026 pick` for the high-yield voices (Finebaum, Herbstreit, Klatt, Pate, Cowherd, Fallica, Kanell, McElroy, Eisen, Florio, Simms, McAfee — name the speaker). Then mine that day's First Take / The Herd / GameDay podcast / Big Noon. Empty YES sides are a target, not a shrug.

1. Roster voices only. Off-roster Week 0 staff stays in Dropped.
2. Open the source URL. Confirm the quote, the speaker, and that it is **this season's** matchup (the one in `events.json`). If you cannot open it, drop it.
3. Classify:
   - Clear first-person lean on a listed **game** dated in the last ~21 days → `hard`, fill `eventSlug` + `side` (`yes` = away).
   - Same lean but older than 21 days → still hard if it is clearly this season's meeting, and mark **vintage** in Dropped or a note column. Prefer a fresher quote if one exists.
   - Weasel, hypothetical, season-record, or "I like them" with no game → `soft`, leave event/side blank.
   - Title / playoff / Super Bowl take → futures slug only. Never onto that team's game. Do not treat a title pick as a Week 1 SU.
   - One quote may map to two futures only if both sides are explicit (e.g. "Stafford wins it" → `rams-sb` yes and `bengals-sb` no). Mark `same quote` on the second row so it is not two discoveries.
4. Freeze only events that gained a new mapped face this run (or a Week 0 gate flip). Prefer a Kalshi market page. A reprint is fine if it names Kalshi. In the Freeze block, write **price date** (when the page printed the cents) and **sourcedAt** (when you fetched it). If price date is more than 7 days old, say so — do not let the card imply the number is today.
5. Week 0 (`unc-vs-tcu`, `ncsu-at-uva`): a verified roster lean means propose `onHome: true` plus freeze. No roster lean → leave off home. Re-search Week 0 every run until Saturday; a morning miss is not a closed case.

## Output

Reply with four blocks, nothing else.

**Intake** (staging table — this is the product):

```
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |
```

`pundit` is the `id` from `pundits.json`. `sourceDate` is `YYYY-MM-DD`. Quote is their words, not a paraphrase. Put **game** rows first, then futures.

**Dropped** — each with one reason (wrong year, unverifiable, off-roster, weasel already captured, guest mis-attributed, …).

**Freeze** — events whose cents you actually re-sourced this run, or "none".

**Home cards** — for every `onHome` game: YES faces, NO faces, empty sides. Call out fully empty cards.

If you can write to the repo, append the same four blocks under a dated heading in `docs/week1-leans.md` (or `docs/runs/YYYY-MM-DD.md` once week 1 is over). Never touch `data/`.

## Stop

Do not add calls, do not commit JSON, do not run tests, do not deploy. Ping the operator: "ready to promote N hard rows."
