# Home and league display tiers (spec)

Status: Agreed 2026-09-03

Date: 2026-09-03. Scope: display rules for `/`, `/ncaaf/`, `/nfl/`, and
week archives so capture can stay eager without turning those pages into
ledgers.

Not in scope: Scout / Audit / Promote / Grader behavior, `onHome` flips,
new event flags, kickoff timestamps in JSON, network/GameDay size
tie-break, methodology FAQ copy (unless a public sentence claims every
complete game lives on `/`), day-of-week subheads.

## Thesis

Capture logs every audited pick. Display decides how heavy the card is
and which page it leads. Home is a featured board with a short hint to
go deeper. League pages are the TV slate for the live week (and later
weeks that already have picks). Settled older weeks live on week archive
URLs for search, sharing, and receipts.

Do not require two opposing picks for a game to exist. One-sided games
stay on the site. They just do not get a portrait card unless they have
at least two rostered faces.

## Binding decisions

1. **One coverage rule, two slot policies.** Coverage tier is the same
   on every surface. Home applies slot caps. League and week archives
   do not.

2. **Coverage tier is derived.** `full` if both sides are filled **or**
   there are at least two unique rostered faces with photos. Otherwise
   `compact`. Not a new event field. Not `onHome`.

3. **Home is featured plus a short teaser.** Hero, up to 3 full cards
   per sport, next 2 leftover complete games per sport as compact rows,
   at most 2 latest Final rows per sport, plus the week-recap link.
   Remaining complete games leave `/`.

4. **League is a schedule, not a density stack.** Open/in-play games
   stay in kickoff order. Full vs compact is the card treatment in that
   order. A Friday one-pick game stays above a Sunday three-pick game.

5. **League shows live weeks, not the season.** A live week is any week
   that still has an open or grading pick-backed game, plus any later
   week that already has a pick-backed game. Fully settled earlier weeks
   leave the league page. Their canonical URL is the week archive.

6. **Previous weeks are teased, not listed.** The league page may link
   the previous week (“Week 0 is final →” or the recap line). It does
   not render that week’s game list. Archives stay indexable and
   shareable.

7. **Schedule sort uses real kickoff, not the display string.** Rank by
   `kickoffDate`, then parsed kickoff time, then coverage, then slug.
   Pin still wins the homepage hero only.

8. **Capture does not change.** Logging a pick does not auto-feature it.
   Promote still needs an explicit operator `onHome` flip. Home still
   does not consult `onHome`.

## Coverage tier

A **carded** pick is a mapped hard call (`kind: "hard"`, `eventSlug`,
`side`) from a rostered pundit whose `photo` is non-empty.

| Tier | Test |
|---|---|
| `full` | Both sides have at least one carded pick, **or** at least two unique carded faces |
| `compact` | Everyone else with at least one mapped hard pick |

Empty side is honest. A three-face one-side card (Wisconsin) is `full`.
A one-face card (Patriots) is `compact`. Two faces on the same side is
`full`.

`featured` exists only on home: the hero. It is selected from complete
cards (see Home). It is not a coverage tier.

## Complete card vs league-eligible

**Complete card** (home pool): `kind: "game"`, freeze (`yesCents`,
`noCents`, `sourceUrl`), at least one carded pick, status `open` or
`grading`. Incomplete cards never take the hero, a full home slot, or
the home teaser.

**Complete Final** (home Final rows): same freeze + carded pick, status
`final`.

**League-eligible:** `kind: "game"` and at least one mapped hard pick.
Freeze is not required. Zero-pick waiting rows stay off `/ncaaf/` and
`/nfl/`. Futures stay in the futures block.

Week archives use league-eligible games for that sport/season/week.

## Schedule sort

Waterfall, in this order:

1. **Pin** (home hero only). Active if `data/featured-pin.json` `until`
   is inclusive of today and the slug is in the complete-card pool.
2. **When.** Sooner `kickoffDate`. Then parsed kickoff time. Missing
   `kickoff` sorts last on that date.
3. **Coverage.** More unique carded faces, then both sides filled, then
   disagreement (both sides, or someone on the dog).
4. **Slug.** Stable final tie-break. Network/GameDay size stays
   deferred.

No audience-timezone tweak. No weighted score.

### Kickoff parse

`kickoff` is a display string with no AM/PM (`Sat 7:30 ET`,
`Sun 1:00 ET`, `Fri 9:00 ET`). String sort is wrong (`Fri 9:00 ET`
ranks after `Fri 10:30 ET` as text). Empty string currently sorts
*first*; missing times must sort *last* on that date.

Football heuristic, applied only for sort. Parse the first `h:mm` in
the string. Ignore the day-of-week token and the timezone suffix.
`kickoffDate` owns the day.

| Input | Minutes from midnight |
|---|---|
| `12:00` / `12:30` | noon (hour 12 stays 12) |
| hour `1`–`11` | PM (add 12 hours) |
| hour `0` or `13`–`23` | unparseable → missing |
| no `h:mm` (`TBD`, `Sat Night ET`, `Noon ET`) | missing |
| missing / `undefined` / `""` | missing |

Examples: `Sun 1:00 ET` = 780, `Sat 3:30 ET` = 930,
`Sat 7:30 ET` = 1170, `Fri 9:00 ET` = 1260, `Mon 10:30 ET` = 1350,
`12:00` = 720. Do not write a new JSON field this pass. Same-date
missing times then fall through to coverage, then slug. Across dates,
`kickoffDate` still wins.

## Home (`/`)

Home is a featured board with a hint to go deeper, not the ledger.

### Open / grading

- **Hero.** One complete card. Active pin if present; otherwise the
  first two-sided complete card in schedule order; otherwise the first
  complete card. An empty-side card must not beat a two-sided open game
  for the hero. The hero does not repeat in College or NFL.
- **Full cards.** Up to 3 per sport, excluding the hero. Only `full`
  coverage-tier complete cards. Fill in schedule order. College and NFL
  fill separately so one sport cannot eat the other.
- **Compact teaser.** Next 2 leftover complete cards per sport, in
  schedule order, as `CompactEventCard`. Leftovers include one-face
  games **and** `full`-tier games that missed the 3-card cap. Then the
  existing “Full slate →” link to `/ncaaf/` or `/nfl/`.
- A `full`-tier leftover that makes the teaser is compact on `/` and
  full again on the league page.
- A leftover that misses the 2-row teaser does not appear on `/`.

Home’s open pool is every complete card, any week. Later weeks only
reach home if they win slots. Because when is first, a Week 2 game does
not beat a still-open Week 1 game.

### Settled

- Keep the week-recap link when one exists.
- At most 2 latest complete Final rows per sport (existing `FinalRow`).
- Older Finals live on the league page only while that week is live,
  otherwise on the week archive.

### Unchanged on home

How it works, sport filter, jump nav, futures peek, latest takes, table,
The Book, email form. Hero stability on a static rebuild has no previous-hero
memory. Pin is the stability mechanism. Unpinned hero is rebuilt from
the waterfall (two-sided first, else first complete card). Do not add a
last-hero file this pass.

## League (`/ncaaf/`, `/nfl/`)

These pages are the live slate. Every pick-backed game on a live week
still appears.

### Which weeks

Group by `{ season, week }`, not by `week` alone. “Later” means higher
season, then higher week. Previous week is the next-lower `{ season,
week }` that has league-eligible games, not `week - 1` arithmetic
(College Week 0 is a real week).

- **Live weeks:** every `{ season, week }` that has at least one open or
  grading league-eligible game, plus any **later** pair that has at
  least one league-eligible game (open, grading, or final).
- **Previous week:** the next-lower `{ season, week }` with
  league-eligible games. Tease only: recap line or “Week N is final →”
  linking to the week archive. Do not list those games.
- **Older weeks:** archive links already on the page. Do not list games.
- **Missing `week` or `season`:** omit from labeled weeks. Append those
  games on `unscheduled` so they do not disappear. No such rows exist
  in live JSON today; still test it.

If **no** week has an open or grading game (Tuesday after the slate
settles, next week has no picks yet), the most recently settled week
stays on the page as a Final board until a later week has a pick. The
page must not go blank and must not dump the season.

Do not build the open list by concatenating `partitionGames` buckets.
Open and grading stay in one schedule-ordered list. Only `final` splits
below. A Friday grading game must not drop under a Sunday open game.

### Layout of a live week

Labeled week block (existing copy style: “Week 1 · Sep 3–7”).

1. **Still open / in play.** League-eligible games with status `open` or
   `grading`, schedule order. Render `EventCard` if coverage tier is
   `full`, `CompactEventCard` if `compact`. Mixed in one list. Do not
   group full cards above compact cards.
2. **That week’s Finals.** Status `final`, compact `FinalRow` receipts.
   No cap. This is only the current live week’s settled games, so the
   list stays short. Friday’s result sits here, not above Saturday’s
   remaining games.

A later live week is its own labeled block below, same rules.

### Unchanged on league

Futures block, waiting futures, team links, week-archive path links.
Copy that every game here has at least one verified pick still holds
for the listed slate.

## Week archives

`/ncaaf/{season}/week-{n}` and `/nfl/{season}/week-{n}` remain the
canonical, indexable, shareable URL for a week. Do not rename or delete
them.

Inside a single week, use the same coverage treatment: schedule order,
`EventCard` vs `CompactEventCard`. The whole week may be final; still
use the full card when the game has both sides or two faces so the
archive pays off results. Keep the existing “Who was right” recap list
and week prev/next nav.

## Shared helper

Keep the logic in `lib/featured.ts`. Pages choose slots; they do not
reimplement the rule.

Extend, do not fork:

- `coverageTier(event, calls, pundits) → "full" | "compact"`
- `sortBySchedule(events, calls, pundits)` (date, parsed time, coverage,
  slug)
- `getHomepageFeaturedGames(...)` already returns hero, per-sport full,
  compact, final. Cap compact at 2. Cap final at 2. Sort remaining
  compact by schedule, not by leftover density-first grouping.
- `getLeagueSlate(sport, events, calls, pundits)` returns live weeks in
  `{ season, week }` order, each with `{ open, final }`, optional
  `unscheduled`, plus optional previous-week tease
  `{ season, week, href, line }`.
- `getLeagueGames` is eligibility only (sport + game + mapped hard
  pick). It must not call `getSlateGames` and must not sort by
  `onHome` / `homeRank`. Leave `getSlateGames` in `lib/data.ts` for
  callers that still want that editorial sort.
- `getWeekArchiveGames(sport, season, week, events, calls, pundits)`
  is league-eligible games for that week in schedule order. Week
  archives use this. Leave `gamesForWeek` in `lib/archive.ts` for
  sitemap, OG, and `weekRecord`.

`displayTier` for home may still return `featured | full | compact`.
League does not use `featured`.

## UI

Reuse `EventCard`, `CompactEventCard`, and `FinalRow`. Do not invent a
third card. Compact rows already show teams, kickoff, frozen cents,
pick count, and take links without a portrait row.

`app/page.tsx` `Weekend` already renders full then compact then Final.
Pass the capped arrays. Compact heading stays a short hint
(“More games with verified picks” is fine) because the teaser is no
longer the rest of the slate.

`components/SportSlate.tsx` switches from one `EventCard` list to week
blocks. `components/WeekArchive.tsx` maps each game through the coverage
tier.

## Docs to update in the implementation PR

- `docs/product/featured-games.md` — display contract for home **and**
  league. Replace “uncapped compact so no complete game is dropped from
  `/`.”
- `docs/product/current-context.md` — Capture vs display paragraph.
- `docs/product/decision-log.md` — amend the 2026-09-01 featured-games
  row (home caps, league schedule, live-week scope).
- `docs/product/README.md` and `docs/README.md` — featured-games is no
  longer homepage-only.
- `docs/capture-policy.md` — one line that homepage/league display is
  this contract; Dispatch unchanged.

Methodology page: no change unless a public sentence claims every
complete game is on `/`. This pass does not change pick eligibility,
evidence, mapping, freeze, grading, or records.

## Tests

Table-driven in `lib/featured.test.ts` (and SportSlate/archive tests if
those pages gain week grouping). Minimum cases:

- Coverage: both sides → full; two faces one side → full; one face →
  compact; photo-less pundit does not count as a face.
- Kickoff parse: day-of-week in the display string is ignored; the clock
  is what ranks. On the same `kickoffDate`, `1:00` before `3:30` before
  `7:30` before `9:00` before `10:30` (afternoon, then night). Missing
  or unparseable `kickoff` last on that date. Across dates,
  `kickoffDate` still wins (`2026-09-04` before `2026-09-05` even when
  Friday is 9:00 and Saturday is 3:30).
- Home: pin beats a sooner one-sided opener; empty-side cannot take
  hero when a two-sided card exists; 4 full-tier College games → 3 full
  + 1 compact teaser; 5 leftover compact-tier → 2 teaser, 3 omitted;
  Finals cap at 2 latest; unpriced mapped game off home, on league;
  `onHome` ignored.
- League: Friday compact above Sunday full; Week 0 omitted from
  `/ncaaf/` while Week 1 has open games; Week 2 appears below Week 1
  when it has picks; previous week is tease only; no open weeks → most
  recently settled week remains as Finals; zero-pick games excluded.
- Hero does not repeat in the College/NFL full lists.

`npm test` for the helper. `npm run check` because routes and UI
change.

## Worked example (live JSON as of 2026-09-03)

College complete open games, hero likely Clemson (6 faces, both sides).

Home College: full UCLA (2), Wisconsin (3), SMU (2 both). Teaser:
Toledo (Friday, 1 face) then Baylor (Saturday 3:30, 1 face, timed
kickoff before Saturday games with no `kickoff` string). Final: Dublin
and Charlottesville (already two). Boise, FIU, Oklahoma State, and
Western Michigan live on `/ncaaf/` as compact rows. Clemson is hero,
not repeated.

Home NFL: full 49ers (3) and Bills (2). Teaser: Patriots then the next
leftover. Commanders, Cowboys, Dolphins, Packers, Ravens, Broncos live
on `/nfl/` as compact rows.

`/ncaaf/`: Week 1 only (Week 0 is previous, tease + archive). Friday
Toledo compact, then Saturday games in kickoff order with Clemson/UCLA
full and one-pick games compact, then Sunday Wisconsin full, Monday SMU
full. No Week 0 game list.

`/nfl/`: Week 1 chronological. Patriots compact, 49ers full, Sunday
one-pick compact with Bills full, Monday Broncos compact.

Exact occupants follow the helper, not this paragraph. Live JSON
moves; fixture tests lock the rules. The live snapshot asserts caps,
hero identity, and “omitted leftovers are absent,” not this slug list.

## Error and empty states

- No complete cards: home has no hero and no sport boards; How it works
  and peeks still render.
- A sport has full cards but no leftovers: omit the compact teaser
  block, keep “Full slate →”.
- A sport has no Finals: omit the Final heading.
- League with no league-eligible games: existing empty board, no fake
  waiting game rows.
- Expired or unknown pin: ignore, fall through to two-sided then first
  complete card.

## Out of this pass

- Capture policy, minting, freeze-in-same-commit, Dispatch hunt order
- New `displayTier` / `kickoffAt` fields on events
- Network, GameDay, ranked-matchup size tie-break
- Day subheads inside a week
- Changing week-archive URLs or adding 301s
- Accounts, live odds, extra sports, Bets pages
)