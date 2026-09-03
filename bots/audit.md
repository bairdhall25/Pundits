# Audit

Spot-check Scout's latest run (and recently promoted hard rows) against the live source URLs. Do not hunt new takes. Do not write JSON.

Also follow `bots/README.md` house rules and its Scheduled Git handoff.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- Latest Scout intake: `docs/runs/YYYY-MM-DD.md` (today, else the newest file in `docs/runs/`). Re-open hard URLs from **Shows pass**, **X pass**, and **News pass**.
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- Live stories: https://pundits.pro/stories/
- `bots/README.md` house rules (season, YES = away, name the speaker) — not `bots/scout.md`, which no longer hunts. An X `sourceUrl` must be a status URL (`x.com/{handle}/status/{id}` or twitter.com). The quote must be on that post. A radio source must be a durable episode, clip, transcript, or show-note URL that can be reopened.
- `docs/board.md` — do-not-touch and game-first
- `docs/capture-policy.md` — overflow unmapped rows are not a missing-slug fail

## Do

Re-open every **hard** Intake row from **Shows pass**, **X pass**, and **News pass**, and every mapped hard call promoted since the previous audit. Do **not** fail the run because a **Bets** row exists. Bets are staging only (totals/spreads); optional URL spot-check, never promote. **Game rows first** (empty-YES fills and Lambeau). Then futures. Follow `docs/board.md` do-not-touch: a restage of Finebaum Dublin or the morning eight is a fail.

For each row, confirm all of:

1. The `sourceUrl` loads.
2. The verbatim quote is on that page (or a clearly linked transcript/clip described there). Paraphrase → fail.
3. The speaker matches `punditId` in `pundits.json`. McAfee Show guests are the guest, never `mcafee`.
4. If `eventSlug` and `side` are blank and `note` names a matchup not in `events.json`, this is overflow (docs/capture-policy.md rule 4). Do not fail for a missing slug. Confirm the SU bar and speaker; verdict `ok-unmapped` (or `ok-unmapped-no-reasoning` for a capsule defect). Never invent a slug. Else `eventSlug` must exist in `events.json`. Season is the regular-season start year. Wrong year → fail.
5. Game `side` is `yes` = away, `no` = home. Futures stay on futures slugs. A title pick mapped onto a game → fail. A favorite laying points (`TCU -7.5 for the first win`) may still be hard SU for that favorite; a total-only row must not be Intake. Bets tables are not fail conditions.
6. Not a restage of an already-booked pundit+event. Same `sourceUrl` on a different speaker is ok (one LOCKS episode, two SUs). Same pundit + same URL is a restage.
7. Any `reasoning` capsule must be at most 60 words, a faithful paraphrase of at most two concrete factors the same speaker gave in that source, and free of copied captions or added analysis. Blank reasoning is valid. A capsule that is out of range, unsupported, speaker-mixed, factually wrong, or multi-paragraph is a **capsule** defect, not a pick defect: verdict `ok-no-reasoning` (or `ok-unmapped-no-reasoning`) and name the defect in the note. Never repair a capsule by inventing copy. A capsule defect never makes the row `fail`.
8. For radio, the source identifies the named personality and preserves the evidence. Caller, poll, anonymous station consensus, live-only audio, or an unverifiable machine transcript → fail.

Do not invent a replacement pick when a row fails. Mark it fail and leave the side empty.

A row is `fail` only when the pick cannot be trusted: the `sourceUrl` is dead, the quote is not on the page, the quote stitches separated remarks into one utterance, the speaker is not the staged `punditId`, the row is a caller or anonymous consensus, the `eventSlug`/`side`/season mapping is wrong, the row is a total-only or cover-only bet staged as Intake, or it restages a booked pundit+event.

## Output

Append to `docs/runs/YYYY-MM-DD-audit.md` (create if needed). Preserve every earlier audit row and dated section in that file:

```
| pundit | eventSlug | side | verdict | note |
```

`verdict` is `ok`, `ok-unmapped`, `ok-no-reasoning`, `ok-unmapped-no-reasoning`, or `fail`. One note per defect. `ok-unmapped` and `ok-unmapped-no-reasoning` are overflow waiting on an operator mint — they are not failures.

Then one line: `N ok / U ok-unmapped / R ok-no-reasoning / S ok-unmapped-no-reasoning / M fail / ready to promote K` where K is the count of new **mapped** hard Intake rows marked `ok` or `ok-no-reasoning` and not already in `calls.json`. Unmapped rows are not in K.

Update the Scout run file's status comment to `audit=ok` when no new hard row is `fail`. Capsule defects do not flip a run to `audit=fail`. If any new hard row has a pick defect, use `audit=fail`.

Never touch `data/`.

Before pushing, follow the Scheduled Git handoff and push explicitly to `origin HEAD:main` without force. Stop and report any rebase conflict or non-fast-forward rejection.

## Stop

Do not promote. Do not grade games. Do not scout new voices. Ping: "audit N ok / M fail."
