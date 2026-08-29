# Pundits — Scout architecture

Date: 2026-08-29
Status: Current — approved design for how Scout finds picks. Implementation starts only after operator review of this file.

The site only shows verified picks. UI, Audit, Promote, and Grader cannot invent faces. Scout is the intake engine. This document replaces the launch-week “fill empty YES” hunt with a density engine that still keeps the SU bar.

## Problem

Today’s Scout is one morning Grok job that Google-searches empty-away holes against a short CFB YouTube list, plus an X handle sweep. That fails in three ways:

1. **Wrong success metric.** A second LSU voice is treated as optional. A blank Clemson row and a 2–0 chalk card are both misses. The product goal is qualified event density on homepage games, not a single face on the empty side.
2. **Wrong search shape.** The bot queries `{name} {game} pick` instead of combing the media where those people actually pick: shows, X, and bylined columns. When Cover 3 has not posted, the run files `hard=0` and stops. News is not a beat. NFL desks are “idle until the week of,” not a first-class list.
3. **CFB-shaped internals.** Cover 3, GameDay, and BFW are hardcoded as *the* hunt. NFL is already on the homepage (Patriots, 49ers, Bills). A later sport must be a new list, not a new Scout.

## Approved decisions (2026-08-29)

1. **Success is density on this week’s homepage games.** Several named, sourced winner-picks per `onHome` game, preferably disagreement. Filling an empty side is urgent. Stacking a third voice on the favorite still counts.
2. **Who:** current roster plus a short add-list. V1 add-list: Tom Fornelli, Bud Elliott, Rico Bosco. Photo still required to roster. Promote does not auto-add. Random beat writers do not mint pages.
3. **How:** medium scouts. Separate Shows, X, and News hunters comb their medium, then keep people on the roster or add-list.
4. **Beats in v1:** Shows (YouTube / podcasts / TV clips), X, News (bylined columns and expert-pick grids). X is the social beat. Instagram, TikTok, Reddit, and forums are out.
5. **Scorecard:** homepage **game** cards (`onHome` and `kind=game`), plus a short bring-onto-home queue (`docs/bring-onto-home.json`, currently `wisconsin-vs-nd-2026`). Title/SB futures can be `onHome` for the peek row; they are not Scout’s hunt target. No calendar-week math — `onHome` is the slate.
6. **Architecture:** a coordinator scores density and writes a hit list. Three beat scouts hunt from that list. They do not choose the week’s games. The coordinator does not open sources.
7. **Sports:** coordinator is sport-agnostic. Each beat has an NCAAF list and an NFL list. V1 fills those two. A later sport is a new section in the lists + `Sport` union + roster tags + events, not a new architecture.
8. **Stop line:** `empty-side` if either side has zero mapped hard SUs. `thin` if the card has fewer than three mapped hard SUs. `dense` if there are ≥3 mapped hard SUs **and** both sides have ≥1. Beats skip `dense` games unless a source they already opened for another game names this one.
9. **Mailbox and bar unchanged.** One `docs/runs/YYYY-MM-DD.md`. Scout never writes `data/`. SU = they pick the winner. URL must open. Same episode, two speakers, two rows. Audit re-opens. Promote is the only JSON writer. Grok hunts. Codex publishes.

## Density rule

Count only **mapped hard** calls (`kind=hard`, `eventSlug` set, `side` set). Soft rows, Candidates, and unmapped Book lines do not count.

| Status | Meaning | Hunt priority |
|---|---|---|
| `empty-side` | YES or NO has 0 mapped hard | First. The blank side is the story hole. |
| `thin` | At least one per side, total < 3 | Keep hunting, including stacking the favorite. |
| `dense` | ≥3 mapped hard and both sides ≥1 | Skip, unless a source already open names this game. |
| `off-home` | In the bring-onto-home queue, no roster SU yet | Hunt one roster SU so Promote can propose `onHome: true`. |

YES = away, NO = home. Unchanged.

Worked examples from the 2026-08-29 ledger:

- Clemson–LSU: Pate + Finebaum on LSU, nobody on Clemson → `empty-side`.
- NC State–Virginia: Kanell on NC State, Virginia empty → `empty-side`.
- UNC–TCU: Patterson vs Finebaum (2 total, both sides) → `thin`.
- A card with 2 LSU and 1 Clemson → `dense`.

## Components

```
homepage games (onHome) + add-list + do-not-touch
                 │
                 ▼
        scripts/scout-density.mjs
                 │
                 ▼
     Coordinator (bots/scout.md)
         writes ## Dispatch
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
  Shows         X          News
  scout       scout        scout
     │           │           │
     └───────────┴───────────┘
                 │
                 ▼
     docs/runs/YYYY-MM-DD.md
                 │
                 ▼
         Audit → Promote → site
```

### Coordinator — `bots/scout.md`

Replaces today’s combined plan-and-YouTube Scout. Loads GitHub `main`, runs (or pastes) the density script, writes `## Dispatch` into today’s run file, stops. Does not open YouTube, X, or articles.

If a hunter starts and `## Dispatch` is missing, **that hunter** may write Dispatch from the script and then hunt. A missed morning must not freeze the day.

### Shows — `bots/scout-shows.md`

YouTube, podcasts, TV clips with durable URLs. Hunt map: `docs/pick-shows.md` (NCAAF and NFL sections). Jump locks / moneyline / “I’ll take.” Captions count. PMT is not a locks show. Name the speaker; guests are not the host.

### X — `bots/scout-x.md`

Status URLs only. `from:{handle}` for roster + add-list handles, last 48 hours, both team names for `empty-side`, `thin`, and `off-home` games on Dispatch. Open the tweet. No YouTube. If the X connector is down, say so in Dropped; do not pretend a sweep happened.

### News — `bots/scout-news.md` (new)

Bylined columns and expert-pick grids. Hunt map: `docs/news-beats.md` (NCAAF and NFL sections). Durable article URL required. “No Pick” on a grid is Dropped with the URL opened. Unnamed “the desk likes Clemson” is Dropped. Paywall with no full article → drop; do not paraphrase a snippet.

### Density script — `scripts/scout-density.mjs`

Deterministic hit list from `data/events.json` + `data/calls.json` + `docs/bring-onto-home.json`. Include an event only if `kind === "game"` (or `kind` absent and a kickoff plus both teams exist) **and** (`onHome === true` or the slug is in the bring-onto-home list). Always exclude `kind === "future"`. Prints a markdown table the coordinator copies into Dispatch. Unit tests use fixture JSON, not live snapshots.

### Add-list — `docs/add-list.md`

Named people we are willing to photograph and roster this week. V1: Fornelli, Elliott, Rico Bosco (`photoUrl=needed` until a real headshot). Hunters stage them as Candidates. Operator/Codex adds `pundits.json` + photo. Not auto-rostered.

### Unchanged

`bots/audit.md`, `bots/promote.md`, `bots/grader.md`, `bots/recap.md`, house rules 1–10 in `bots/README.md`. Fantasy/props parked. Group vs group parked.

## Dispatch format

First line of the run file stays:

```
<!-- pundits-run date=YYYY-MM-DD hard=N candidates=M audit=pending promoted=false -->
```

Coordinator writes this block (hunters do not edit it except the “first hunter writes Dispatch” fallback):

```
## Dispatch

| eventSlug | sport | yes | no | status | hunt |
|---|---|---|---|---|---|
| clemson-at-lsu-2026 | ncaaf | (none) | pate, finebaum | empty-side | Clemson YES first, then a third voice |
```

Then each beat appends its own section, same tables as today:

`## Shows pass` · `## X pass` · `## News pass`

Each pass: Intake, Candidates, Dropped (what was actually opened), Freeze, Stories this would mint.

Rolled-up **Home cards** is written or refreshed by the last pass of the day so Audit sees one picture. Hard/candidate counts in the HTML comment are the sum of new rows across passes.

## Sport-agnostic machinery, sport-specific lists

Coordinator and the density script never hunt futures. They read `event.sport`. They do not know Cover 3 or the ESPN NFL grid.

Shows/X/News load the section matching sports that appear on Dispatch.

| Map | NCAAF (v1) | NFL (v1) | Later sport |
|---|---|---|---|
| `docs/pick-shows.md` | Cover 3 LOCKS, Pate, BFW Saturday, Barstool CFB Show, Pick Em, GameDay/Big Noon in-window | Eisen show, The Herd (name the speaker), Ringer NFL / Cousin Sal week-of, McAfee only if Pat picks | New section |
| `docs/news-beats.md` | On3 PICKING writeups if SU, Pate recaps, FOX/Fallica CFB, bylined ESPN CFB | ESPN/CBS expert-pick **pages**, PFT Florio, FOX Ruiz, bylined Ringer NFL copy | New section |
| X handles | existing CFB table in `pick-shows.md` / `scout-x.md` | existing NFL table; fill “find official” before the NFL week, do not hunt parody | New handles |

Adding a sport later (not v1 work): widen `Sport` / `PunditSport` in `lib/types.ts`, add events and roster tags, add a section to each map. Do not add a fourth hunter or a sport-specific coordinator.

V1 only fills NCAAF and NFL. A sport with no list: skip and write Dropped `no hunt map for {sport}`. Do not improvise Google.

## Cadence

Calendars differ; the coordinator still runs daily.

| Job | When | Why |
|---|---|---|
| Coordinator | Daily, cheap | Fresh hit list after overnight Promote |
| Shows NCAAF | Thu–Sat, plus Saturday GameDay window | Locks shows actually drop then. Week 0 GameDay is Sep 5, not Dublin. |
| Shows NFL | Tue–Sat of that NFL week | Expert grids and weekly pods. AFC East lean in August is not Week 1. |
| X | Twice daily, last 48 hours | Both sports on Dispatch |
| News NCAAF | Thu–Fri (staff/recaps), Saturday sweep | Columns lag the video locks |
| News NFL | Tue–Sat of that NFL week | Grids and PFT |
| Audit | When `hard>0` and `audit=pending` | Unchanged |
| Promote | When `audit=ok` and `hard>0` | Unchanged |
| Grader | After the event is final | Unchanged |

Empty morning is valid. Dropped must name what was opened (or that the factory had not posted). Inventing a pick to look busy is still a fail.

Tokens are not scarce. After the listed factories and two reasonable named searches per under-dense game, record the miss and move on.

## Failure cases

| Case | Rule |
|---|---|
| Factory not posted | Dropped: show, date, “not up as of {time}.” Do not keep searching synonyms of the same empty query. |
| X connector down | Dropped: `client-not-enrolled` (or equivalent). Do not claim a sweep. |
| Not a winner-pick | Drop. ATS, totals, “tough matchup,” title stretch, start/sit are not SU. |
| Same pundit + event already mapped | Skip. Same URL, different named speaker → new row. |
| Add-list, no photo | Candidate, `photoUrl=needed`. No page. |
| Paywall / URL does not load | Drop. Audit will fail it anyway. |
| Wrong season | Drop. Slugs end in `-{season}`. |
| Coordinator missed | First hunter writes Dispatch from the script, then hunts its beat. |
| No hunt map for a sport | Skip that sport. Say so. |
| Dense game | Skip unless an already-open source names it. |

## Files to change

| File | Change |
|---|---|
| `scripts/scout-density.mjs` | New. Hit list from JSON. |
| `scripts/scout-density.test.mjs` | Fixture cases: empty-side, thin, dense, off-home, NFL + NCAAF together, soft rows ignored. |
| `bots/scout.md` | Rewrite as coordinator. |
| `bots/scout-shows.md` | New. Current YouTube/podcast hunt body, retargeted to Dispatch. |
| `bots/scout-x.md` | Read Dispatch; hunt empty-side/thin only; fill official NFL handles. |
| `bots/scout-news.md` | New. |
| `bots/README.md` | Four Scout jobs in the table + paste-ready standing prompts. House rules stay. |
| `docs/pick-shows.md` | Add an NFL section. Keep NCAAF. Title it as the Shows hunt map. |
| `docs/news-beats.md` | New. NCAAF + NFL columns/grids. |
| `docs/add-list.md` | New. Fornelli, Elliott, Rico. |
| `docs/bring-onto-home.json` | New. Slug array the density script reads. V1: `["wisconsin-vs-nd-2026"]`. |
| `docs/board.md` | Do-not-touch + pointer at the density script and bring-onto-home file. Density numbers are not hand-edited P0 tables. |
| `docs/scout-plan.md` | Density goal; pointer to this spec. |
| `docs/runs/_TEMPLATE.md` | Dispatch block + Shows/X/News pass sections. |
| `docs/product/decision-log.md` | One accepted row: Scout is a density engine (coordinator + three beats). |
| `package.json` | No change if `vitest run` already includes `scripts/*.test.mjs` (it does, via `indexnow.test.mjs`). |

No app route, no UI, no `data/` edits in this work.

## Implementation order

1. Density script + tests. This is the scorecard. Ship it first so coordinator and hunters cannot disagree with JSON.
2. Lists: NFL section of `pick-shows.md`, `news-beats.md`, `add-list.md`, `bring-onto-home.json`, Dispatch template, board.md trimmed to do-not-touch.
3. Split bot prompts: coordinator, Shows, X update, News. README standing prompts.
4. Point Grok Bots at the new files. Add a News scheduled job. Coordinator is the existing Scout job with a new prompt. Codex stays Audit / Promote / Grader / deploy.

## Testing

- Density script: fixture events + calls covering empty-side, thin (2, both sides), dense (3+, both sides), off-home queue, mixed NFL/NCAAF, soft-only card stays empty-side, Candidate-only does not count.
- Docs and bot files: review only. No executable hunt tests.
- Do not loosen existing SU / unique-call / YES=away tests.

## Out of scope

- Auto-rostering Candidates.
- Instagram, TikTok, Reddit, forums.
- Live Kalshi API.
- Scout writing `data/`.
- Loosening SU.
- NBA/MLB/etc. hunt maps (slots only).
- Group vs group leaderboards.
- Fantasy / props.
- Site UI, EventCard split, social-engine bots.
- A backend, queue, or database for capture.

## Key decisions

| Decision | Why |
|---|---|
| Density, not empty-YES-only | Product brief: qualified event density on events fans care about. A 3–0 chalk card is still a thin argument. |
| Roster + short add-list | Recognizable voices. Open discovery becomes a beat-writer dump. |
| Medium scouts, not a person calendar | Operator chose beats (Shows, X, News). Person outlets live *inside* each map. |
| Coordinator does not hunt | Targeting and searching in one prompt produced dry “hard=0, done” mornings. |
| Home cards as scorecard | Finite, matches the fan surface. Bring-onto-home queue is the Lambeau escape hatch. |
| Sport-agnostic coordinator | NFL is already on home. Next sport must not fork Scout. |
| Stop at 3+ and both sides | “Several” with a number. Empty side always wins priority. |
| Deterministic density script | Bots must not eyeball JSON. |
| Grok hunts, Codex publishes | Existing ownership. Do not mix. |

## Open questions

None that block implementation. Operator resolved: density success, roster+add-list, medium scouts, Shows+X+News, home-card scorecard, orchestrator architecture, sport-agnostic lists, 3-and-both-sides stop line, density script in v1, this file order.

If the add-list grows, edit `docs/add-list.md` only. If the stop line changes, change one table in the density script and this spec.
