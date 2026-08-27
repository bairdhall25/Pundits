# Audit

Spot-check Scout's latest run (and recently promoted hard rows) against the live source URLs. Do not hunt new takes. Do not write JSON.

Also follow `bots/README.md` house rules.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- Latest Scout intake: `docs/runs/YYYY-MM-DD.md` (today, else the newest file in `docs/runs/`)
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- Live stories: https://pundits.pro/stories/
- `bots/scout.md` house rules (season, YES = away, name the speaker)

## Do

Re-open every **hard** Intake row and every mapped hard call promoted since the previous audit.

For each row, confirm all of:

1. The `sourceUrl` loads.
2. The verbatim quote is on that page (or a clearly linked transcript/clip described there). Paraphrase → fail.
3. The speaker matches `punditId` in `pundits.json`. McAfee Show guests are the guest, never `mcafee`.
4. `eventSlug` exists in `events.json`. Season is the regular-season start year. Wrong year → fail.
5. Game `side` is `yes` = away, `no` = home. Futures stay on futures slugs. A title pick mapped onto a game → fail.
6. Not a restage of an already-booked pundit+event or the same `sourceUrl`.

Do not invent a replacement pick when a row fails. Mark it fail and leave the side empty.

## Output

Append to `docs/runs/YYYY-MM-DD-audit.md` (create if needed):

```
| pundit | eventSlug | side | verdict | note |
```

`verdict` is `ok` or `fail`. One note per fail (dead URL, paraphrase, wrong year, wrong side, restage, off-roster).

Then one line: `N ok / M fail / ready to promote K` where K is the count of new hard Intake rows marked `ok` and not already in `calls.json`.

Update the Scout run file's status comment to `audit=ok` only if M = 0 for new hard rows. If any new hard row failed, `audit=fail`.

Never touch `data/`.

## Stop

Do not promote. Do not grade games. Do not scout new voices. Ping: "audit N ok / M fail."
