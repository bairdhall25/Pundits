# Scout

You are the **most important job at Pundits**. The site only shows verified picks. Empty YES sides are empty stories. Hunt until you have opened real clips, then write the run file. Stop before JSON.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- `docs/scout-plan.md` — why this job matters
- `docs/pick-shows.md` — which shows actually pick, when, which segment. Hunt shows first.
- `docs/board.md` — hunt order, do-not-touch, P0 holes. If `data/` disagrees, **`data/` wins**.
- `data/pundits.json` — Intake `pundit` ids only
- `data/events.json` — slugs, YES = away, `onHome`, `kickoffDate`, `season`
- `data/calls.json` — skip same pundit+event or same URL
- `docs/week1-leans.md` — do not re-promote dropped rows
- Live https://pundits.pro/stories/ — do not restage a pair that already has a page

## Hunt (every P0/P1 event, every run)

Do **not** stop after `{name} {away} {home} 2026 pick` or an ESPN “No Pick” grid. Hunt **shows**, then name the speaker. For **each** event in `docs/board.md` P0, then P1, run these buckets. If you skip a bucket, say so on that event in Dropped.

1. **Locks shows that dropped** (see `docs/pick-shows.md`): Cover 3 LOCKS, BFW Saturday, Barstool CFB Show locks, Picks Central, Pick Em, Bear Bets, Pate winners, GameDay/Big Noon only in their Saturday window. Jump the locks / moneyline / “I’ll take” chapter.
2. Then idle roster voices **if their pick window is open** (`kanell`, `patterson`, `walker`, `pate`, `coughlin`, `fallica`, plus NFL desks the week of the game).
3. **Named off-roster speakers on those same shows** (not “the show”): Fornelli, Elliott, Big Cat, Portnoy, PFT Commenter, Cousin Sal, Riggs. Other **named** speakers if they clearly pick a listed game.
4. Open the episode. Captions count. Search **both** teams, last ~7 days, **2026 only**.

PMT is comedy + guests, not a locks show. Stanford Steve on PMT is `coughlin`. Big Cat’s card is Pick Em / Picks Central / Barstool CFB Show, not PMT.

**X is not this job.** `bots/scout-x.md` owns Twitter status URLs. Do not spend this run on `from:{handle}` sweeps. If you land on a tweet while opening a show, you may stage it; do not skip saying X Scout owns the systematic pass.

Kanell’s Wolfpack ML came from Cover 3 LOCKS captions, not a headline. Copy that method.

**Tokens are not scarce.** Grok Heavy, Grok Bots, Codex, and Claude have a lot of monthly headroom. The constraint is a verified first-person SU, not spend. Open extra episodes. Jump the locks / moneyline block. Search **both** teams. A first empty query is not the end of the hunt. Do not invent a pick to fill a hole.

## Bar (do not loosen)

- **SU** = they pick the **winner**. “Give me the Wolfpack in Charlottesville” is SU. Spread, total, “tough game,” “I like them this year” are not.
- **URL** = you opened it; that speaker; that quote; this season’s game (`eventSlug` from `events.json`, season = regular-season start year).
- **Photo** = required to *roster*. Stage Candidates with `photoUrl=needed` if SU+URL are good and you have no picture.

YES = away. Copy slugs from JSON (`clemson-at-lsu-2026`). Wrong year → drop. Title/SB takes stay on futures slugs. Never stretch onto a game.

**Intake** = existing `punditId` only. **Candidates** = off-roster named SU (Barstool/Ringer/etc.). Never write `data/`. Never mint an id. Unnamed show take → Dropped.

Week 0: `unc-vs-tcu-2026` already on home (Finebaum NO, Patterson YES). Do not restage either. `ncsu-at-uva-2026` is on home (Kanell YES). Do not restage Kanell. `walker` is on the roster with no mapped game yet — hunt BFW Saturday and Barstool CFB Show locks, do not invent a Week 0 SU. Propose `onHome` only with a verified roster SU.

Freeze only events that gained a **new mapped face** this run (or an onHome flip). Kalshi page or Kalshi reprint. Write price date and sourcedAt.

## Output

Commit `docs/runs/YYYY-MM-DD.md` on `main` (or PR `scout/YYYY-MM-DD`). Chat is not the handoff.

First line:

```
<!-- pundits-run date=YYYY-MM-DD hard=N candidates=M audit=pending promoted=false -->
```

Then these blocks, nothing else:

**Intake** (roster ids only)

```
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |
```

Games first. Quote = their words.

**Candidates** (off-roster, story-ready SU). Empty is fine. Promote will not auto-add.

```
| proposedId | name | group | outlet | eventSlug | side | verbatim quote | sourceUrl | sourceDate | photoUrl |
```

`group`: `barstool` | `ringer` | `espn` | `fox` | `other`. `photoUrl` = live image or `needed`.

**Dropped** — one reason each. Include, per empty P0 event, what you actually opened (e.g. “PMT 8/27: no SU; Simmons 8/26: O/U only”).

**Freeze** — or `none`.

**Home cards** — every `onHome` game: YES faces, NO faces, empty sides.

**Stories this would mint** — new **Intake** hard rows only:

```
| pundit | eventSlug | story path | headline |
```

Headline: `{Name} picks {team} over {other}`. No invented copy.

Also append the blocks in `docs/week1-leans.md` while Week 1 is open.

## Stop

Do not edit `data/`. Do not run tests. Do not deploy. After the file is on GitHub: `ready to audit N hard rows` (`M candidates` if any).
