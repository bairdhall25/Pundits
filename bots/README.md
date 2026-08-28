# Grok Bots

No backend. JSON in this repo is the record. **Scout is the product.** Empty Scout intake means empty cards; the rest of the stack cannot invent faces.

| Bot | File | Job |
|---|---|---|
| Scout | `bots/scout.md` | Hunt and verify this week’s SU leans. Write `docs/runs/`. Never `data/`. |
| Promote | `bots/promote.md` | Write Scout's hard rows into `data/`, run tests, publish |
| Grader | `bots/grader.md` | After games settle, propose hit/miss on mapped hard calls |
| Recap | `bots/recap.md` | Read the ledger and report who is actually on record |
| Audit | `bots/audit.md` | Re-open Scout URLs and spot-check mapping; no JSON |

Scout does not grade and does not write JSON. Promote does not hunt new takes. Audit does not hunt new takes. Grader does not hunt new takes. Recap does not keep its own scorebook. **None of them write articles.**

## Pipeline (no chat paste)

Git is the mailbox. Grok Build / Promote reads GitHub, not a pasted Scout reply.

1. **Scout** commits `docs/runs/YYYY-MM-DD.md` (`audit=pending`, `promoted=false`). Never `data/`.
2. **Audit** re-opens every new hard URL, writes `docs/runs/YYYY-MM-DD-audit.md`, sets `audit=ok` or `audit=fail`.
3. **Promote** (this repo) loads that run file from `main`, ships only `ok` hard rows into JSON, tests, deploys, sets `promoted=true`.
4. **Grader** after kickoff. **Recap** after Grader.

Launch-week cadence: Scout morning. Audit as soon as the run file lands (or a scheduled sweep). Promote when `audit=ok` and `hard>0`. Do not ping a human to copy-paste the five blocks.

## Pick stories (SEO)

The web app, not the bots, writes crawlable stories.

1. Scout stages a **story-ready** hard row (first-person, `eventSlug`, `side`, verbatim quote, source URL, date).
2. Promote (Grok Build / Codex in this repo) writes it into `data/calls.json`.
3. The next static build mints `/picks/{eventSlug}/{punditId}/` via `lib/seo.ts` `pickStory()` — headline like “Finebaum picks TCU over North Carolina,” underdog from Kalshi cents, then the quote.
4. `/stories/` lists every minted story. Sitemap `lastmod` is the call’s `sourceDate`.

Do not paste essay copy into `docs/`. If the quote is not first-person and on a listed event, there is no story. Soft rows stay in The Book only.

## Point a Grok Bot at its file

Each Bot's standing instructions (paste as-is):

**Scout** (paste this — longest job, most important)

```
You are the Pundits Scout, the most important job at Pundits.
The site only shows picks you verify. Empty YES sides are empty stories.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/scout-plan.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/board.md
Repo: https://github.com/bairdhall25/Pundits

Hunt P0 empty away-sides on home games first. Tokens are not scarce — open extra episodes (locks / I'll take / moneyline). Named Barstool and Ringer speakers as Candidates. Never mint ids. Never touch data/. Commit docs/runs/YYYY-MM-DD.md. Chat is not the handoff.
```

**Promote**
```
You are the Pundits promoter.
At the start of every job, fetch and follow:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/promote.md
Repo: https://github.com/bairdhall25/Pundits
```

**Grader**
```
You are the Pundits Grader.
At the start of every job, fetch and follow:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/grader.md
Repo: https://github.com/bairdhall25/Pundits
```

**Recap**
```
You are the Pundits Recap.
At the start of every job, fetch and follow:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/recap.md
Repo: https://github.com/bairdhall25/Pundits
```

**Audit**
```
You are the Pundits Audit.
At the start of every job, fetch and follow:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/audit.md
Repo: https://github.com/bairdhall25/Pundits
```

Cadence (launch week): Scout Wed–Sat morning, writing `docs/runs/YYYY-MM-DD.md`. Audit as soon as that file lands, or a scheduled sweep. Promote when Audit is `ok` and `hard>0`. Grader after each settled slate (Week 0 Sat 8/29, then Week 1, then NFL Week 1). Recap after Grader, or on request.

## House rules

Owned here so the files do not fork them.

1. **Scout, Audit, Grader, and Recap do not edit** `data/calls.json`, `data/events.json`, or `data/pundits.json`. They stage in `docs/`. **Promote** is the one Bot that writes JSON, runs tests, and publishes.
2. **Roster and events are live files**, not memory. Load `data/pundits.json` and `data/events.json` at the start of the job. Hunt order is `docs/board.md`. Hunt hard (show + matchup + locks, open the episode). Tokens are not scarce — open extra clips rather than stopping at a headline miss. Named Barstool/Ringer speakers as Candidates. Never “the show.” Scout does not mint ids. Promote does not auto-roster. Group vs group is parked.
3. **Clear first-person leans only** map to an event. Weasels stay `soft`, unmapped.
4. **YES = away team wins** on game events. Futures map only to futures slugs. Never stretch a title pick onto a game.
5. **Name the speaker.** McAfee Show guest picks belong to the guest (`hawk`, `butler`, …), never `mcafee`.
6. **Kalshi is the ruler.** Cents come from a Kalshi page or a Kalshi reprint, each with `sourceUrl` + `sourcedAt`. Do not convert sportsbook moneylines.
7. **Wrong season → drop.** Same teams in a prior year is not this event. Event slugs always end in `-{season}` (`clemson-at-lsu-2026`), where season is the year the regular season starts — a January 2027 bowl/playoff/Super Bowl is still 2026. Next season's rematch is a new slug.
8. Unverifiable quote → drop. Empty sides are fine. Fake quotes are not.

Product rules in full: `docs/superpowers/specs/2026-08-25-pundits-v1-launch-design.md`. Capture checklist: `docs/RUNBOOK.md`.
