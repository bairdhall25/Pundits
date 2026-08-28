# Scout

Find this week's roster-voice picks. Verify every quote at its URL. Stop before JSON.

Also follow `bots/README.md` house rules.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `data/pundits.json` — legal speakers (`id` is the pundit cell)
- `data/events.json` — legal `eventSlug`s, sides, `onHome`, `kickoffDate`, `season`
- `data/calls.json` — skip claims already in the book (same pundit + event, or same URL)
- `docs/board.md` — **hunt order**. P0 empty YES on home games before futures. Do-not-touch list. If this file and `data/` disagree, `data/` wins.
- `docs/RUNBOOK.md` — search list and Week 0 gate
- `docs/week1-leans.md` — prior staging; do not re-promote dropped rows
- Live stories: https://pundits.pro/stories/ — a mapped pair already has a page; do not restage it

## Do

Search **by event**, in the order in `docs/board.md`. **P0 game SU rows first** — empty YES (away) on home games. Those mint SEO stories `{Name} picks {team} over {other}`. Do not spend the run adding another title or Super Bowl face while Clemson / Patriots / 49ers / Bills / UNC YES are empty.

For each P0/P1 event: query `{pundit name} {away} {home} 2026 pick`.

1. **Roster first**, including idle podcasts already in `pundits.json`: Simmons, Kanell, McAfee (Pat only — name the speaker), Florio, Simms, Clark, Kay Adams, plus GameDay / Big Noon / Cover 3.
2. Then **named Barstool and Ringer voices** on the same games (Cousin Sal, PFT Commenter, Big Cat, named Ringer NFL hosts). See `docs/board.md`. Off-roster Week 0 staff stays Dropped.
3. Then that day's First Take / The Herd / GameDay / PFT / Simmons / PMT / Ringer feeds. GameDay in Baton Rouge is the Clemson–LSU run — name the speaker (not “the desk”).

Never write `data/pundits.json`. Never mint an id. Story-ready off-roster SU goes in **Candidates**, not Intake. Unnamed “the show likes X” → Dropped.

4. Intake `pundit` must already exist in `pundits.json`. Off-roster Week 0 staff and unnamed show takes stay in Dropped.
5. Open the source URL. Confirm the quote, the speaker, and that it is **this season's** matchup (the one in `events.json` with that `season` / `kickoffDate`). Copy `eventSlug` from `events.json` — slugs always end in `-{season}` (`clemson-at-lsu-2026`). `season` is the year the regular season starts: a January 2027 bowl/playoff/CFP/Super Bowl is still `-2026`. Kalshi's "2027 NFL Champion" is that same 2026 season. Same teams next *season* is a **new event**, not this slug. If you cannot open it, drop it.
6. Classify:
   - Clear first-person lean on a listed **game** dated in the last ~21 days → `hard`, fill `eventSlug` + `side` (`yes` = away).
   - Same lean but older than 21 days → still hard if it is clearly this season's meeting, and mark **vintage** in Dropped or a note column. Prefer a fresher quote if one exists.
   - Weasel, hypothetical, season-record, or "I like them" with no game → `soft`, leave event/side blank.
   - Title / playoff / Super Bowl take → futures slug only. Never onto that team's game. Do not treat a title pick as a Week 1 SU.
   - One quote may map to two futures only if both sides are explicit (e.g. "Stafford wins it" → `rams-sb-2026` yes and `bengals-sb-2026` no). Mark `same quote` on the second row so it is not two discoveries.
7. Freeze only events that gained a new mapped face this run (or a Week 0 gate flip). Prefer a Kalshi market page. A reprint is fine if it names Kalshi. In the Freeze block, write **price date** (when the page printed the cents) and **sourcedAt** (when you fetched it). If price date is more than 7 days old, say so — do not let the card imply the number is today. Stories name the underdog from these cents; a stale freeze is a stale story.
8. Week 0 (`unc-vs-tcu-2026`, `ncsu-at-uva-2026`): a verified roster lean means propose `onHome: true` plus freeze. No roster lean → leave off home. Re-search Week 0 every run until Saturday; a morning miss is not a closed case.

A hard row is **story-ready** only if all of these are filled: `pundit` id (or a Candidate `proposedId`), `eventSlug` in `events.json`, `side`, verbatim first-person quote, `source`, `sourceUrl`, `sourceDate`. Candidates also need a real `photoUrl`. Missing any of those → drop or keep soft. You do not write the story body. The app templates it on promote.

## Output

Reply with these blocks, nothing else.

**Intake** (roster only — `pundit` is an existing `id`):

```
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |
```

`sourceDate` is `YYYY-MM-DD`. Quote is their words, not a paraphrase. Put **game** rows first, then futures.

**Candidates** (off-roster Barstool / Ringer / similar, story-ready only). Promote does not auto-add these. Empty is fine.

```
| proposedId | name | group | outlet | eventSlug | side | verbatim quote | sourceUrl | sourceDate | photoUrl |
```

`group` is `barstool`, `ringer`, `espn`, `fox`, or `other`. `proposedId` is a slug guess (`pft`, `bigcat`, `sal`). Photo must load. No photo → Dropped, not a candidate.

**Dropped** — each with one reason (wrong year, unverifiable, off-roster staff, weasel, “the show” with no speaker, guest mis-attributed, …).

**Freeze** — events whose cents you actually re-sourced this run, or "none".

**Home cards** — for every `onHome` game: YES faces, NO faces, empty sides. Call out fully empty cards.

**Stories this would mint** — one row per **new** hard mapped intake (omit anything already in `calls.json`):

```
| pundit | eventSlug | story path | headline |
```

`story path` is `/picks/{eventSlug}/{pundit}/`. Game headline: `{Full name} picks {their team} over {the other}`. Future: `{Full name} takes {title}` or `{Full name} against {title}`. Do not invent McAfee/SMU-style copy. If the promote pass ships the row, that path exists after the next build.

**Write the run file. Chat is not the handoff.** Commit `docs/runs/YYYY-MM-DD.md` on `main` (or open PR `scout/YYYY-MM-DD`) with this first line:

```
<!-- pundits-run date=YYYY-MM-DD hard=N audit=pending promoted=false -->
```

`hard=N` is new roster Intake hard rows not already in `calls.json`. Add `candidates=M` on that line if the Candidates table is non-empty. Then the blocks. Also append them under a dated heading in `docs/week1-leans.md` while Week 1 is open. Never touch `data/`.

Promote and Audit read this file from GitHub. Do not rely on anyone pasting your reply.

## Stop

Do not add calls, do not commit JSON, do not run tests, do not deploy. After the run file is on GitHub: "ready to audit N hard rows" (and “M candidates” if the Candidates table is non-empty).
