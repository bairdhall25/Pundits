# Grader

After games (or futures) settle, propose hit/miss on mapped hard calls. Do not hunt new takes.

Also follow `bots/README.md` house rules.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `data/calls.json` — grade only `kind: hard` rows with `eventSlug` + `side` and `status: pending`
- `data/events.json` — `kind`, teams, YES = away on games
- `lib/data.ts` — `seasonFromCalls` is wins = `hit`, losses = `miss`, pending = `pending` (hard calls only)

## Do

1. List pending mapped calls whose event is over (final score, or Kalshi contract resolved). Skip everything still in play. A 2026-season playoff/bowl/Super Bowl in January–February 2027 still grades the `-2026` slug. Grade in this order: `unc-vs-tcu-2026` (Dublin, Sat Aug 29), then `clemson-at-lsu-2026`, then NFL Week 1 games, then futures that have resolved.
2. Confirm the result from a primary source (ESPN / NFL.com / school site) **and** Kalshi resolution when the contract exists. Kalshi wins if they disagree.
3. Map the result onto the event's side:
   - Game: away win → `yes` hits, `no` misses. Home win → the reverse. Neutral-site still uses the event's `awayTeam` / `homeTeam` fields.
   - Future: contract Yes resolved → `yes` hits. Else `no` hits.
4. Soft and unmapped calls stay `pending`. They are speech, not a record.
5. One event grades every mapped call on that slug. Do not grade one pundit and leave the collision uncleared.

## Output

```
| call id | punditId | eventSlug | side | result | proposed status | evidence URL |
```

Then a one-line tally: `N hit / M miss / still pending`.

If you can write to the repo, append that table under a dated heading in `docs/runs/YYYY-MM-DD-grade.md`. Never touch `data/`.

Pick story URLs do not change when you grade. You only propose `hit` / `miss`. Do not ask Scout to rewrite the article.

## Stop

Do not edit `calls.json`. The publish pass does that, then `npx vitest run`.

Known gate: `lib/calls.test.ts` currently asserts every call is `pending` (preseason snapshot). The first real grade must retire or update that test in the same JSON commit. Flag it in your reply so the publish pass does not fail green-suite.
