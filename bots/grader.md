# Grader

After games (or futures) settle, propose hit/miss on mapped hard calls. Do not hunt new takes.

Also follow `bots/README.md` house rules and its Scheduled Git handoff.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `data/calls.json` — grade only `kind: hard` rows with `eventSlug` + `side` and `status: pending`
- `data/events.json` — `kind`, teams, YES = away on games
- `lib/data.ts` — `seasonFromCalls` is wins = `hit`, losses = `miss`, pending = `pending` (hard calls only)

## Do

1. List pending mapped calls whose event is over (final score, or Kalshi contract resolved). Skip everything still in play. A 2026-season playoff/bowl/Super Bowl in January–February 2027 still grades the `-2026` slug. Week 0 (`unc-vs-tcu-2026`, `ncsu-at-uva-2026`) is done. Grade in this order: `clemson-at-lsu-2026` (Sat Sep 5), then NFL Week 1 (`patriots-at-seahawks-2026`, `49ers-vs-rams-2026`, `bills-at-texans-2026`), then futures that have resolved.
2. Confirm the result from an authoritative primary source (league, school, official box score, or equivalent) **and** the Kalshi resolution when the contract exists. If they disagree, stop and report the contract terms and both sources; do not grade automatically. A data-provider error or misunderstood contract must not silently override the real-world result.
3. Map the result onto the event's side:
   - Game: away win → `yes` hits, `no` misses. Home win → the reverse. Neutral-site still uses the event's `awayTeam` / `homeTeam` fields.
   - Future: contract Yes resolved → `yes` hits. Else `no` hits.
4. Soft and unmapped calls stay `pending`. They are speech, not a record.
5. One event grades every mapped call on that slug. Do not grade one pundit and leave the collision uncleared.
6. Whenever proposing `status: hit` or `status: miss`, also propose `gradedAt`
   as the Eastern Time calendar date of grading. Pending calls do not get a
   `gradedAt` value.
7. If a game event reached kickoff with **zero mapped calls**, propose deleting
   it from `events.json` instead of grading it into an empty Final
   (docs/capture-policy.md rule 9). List these under `### Zero-pick deletions`
   in the grade file; the publish pass executes. Never propose deleting an
   event that has any mapped call, graded or pending.

## Output

```
| call id | punditId | eventSlug | side | result | proposed status | gradedAt | evidence URL |
```

Then a one-line tally: `N hit / M miss / still pending`.

If you can write to the repo, append that table under a dated heading in `docs/runs/YYYY-MM-DD-grade.md`. Never touch `data/`.

Preserve earlier dated sections in the grade file. Before pushing, follow the Scheduled Git handoff and push explicitly to `origin HEAD:main` without force. Stop and report any rebase conflict or non-fast-forward rejection.

Pick story URLs do not change when you grade. You only propose `hit` / `miss`. Do not ask Scout to rewrite the article.

## Stop

Do not edit `calls.json`. The publish pass does that, then `npx vitest run`.

Statuses are `pending` | `hit` | `miss`. Soft and unmapped rows stay `pending`. Hard mapped rows may grade without a test change.
