# Grok Bots

No backend. JSON in this repo is the record. **Scout is the product.** Empty Scout intake means empty cards; the rest of the stack cannot invent faces.

| Bot | File | Job |
|---|---|---|
| Scout | `bots/scout.md` | Hunt YouTube / podcasts / TV SU leans. Write `docs/runs/`. Never `data/`. |
| X Scout | `bots/scout-x.md` | Hunt X status URLs only. Append an X pass to the same run file. Never `data/`. |
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

## Scheduled Git handoff

Scheduled jobs start in the saved project only long enough to fetch and create their own worktree. They never inspect, edit, test, build, or deploy from the operator's checkout.

1. `git fetch origin`, then create a unique worktree under the ignored `.worktrees/scheduled/` directory from the fetched `origin/main`. A deploy-only job may use detached HEAD. A job that commits uses a unique temporary `codex/` branch. The branch name does not need to be `main`; the safety invariant is a clean worktree whose starting `HEAD` equals `origin/main`.
2. Build/deploy jobs run `npm ci` in the scheduled worktree before invoking package scripts. Never borrow generated files or `node_modules` from the operator's checkout.
3. Before a writer pushes, fetch again. If `origin/main` advanced, rebase the task commit onto it, re-check the resulting diff, and rerun any required validation. Push explicitly to `origin HEAD:main` without force. On a conflict or non-fast-forward rejection, stop and report; never overwrite the mailbox.
4. After a clean no-op or successful push/deploy, leave the worktree clean and remove it. Preserve a dirty or failed worktree only when its exact path and recovery state are reported.
5. GitHub, source URLs, npm, Cloudflare, and live verification require network access. If the unattended runtime cannot fetch, install, push, deploy, or verify, stop and report the missing capability rather than falling back to the operator's checkout.

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

Hunt pick shows first (docs/pick-shows.md): Cover 3 LOCKS, BFW Saturday, Barstool CFB Show, Picks Central, Pick Em. Then P0 empty away-sides. Tokens are not scarce — open the episode and jump the locks / I'll take / moneyline block. Named off-roster speakers on those shows as Candidates. Never mint ids. Never touch data/. Commit docs/runs/YYYY-MM-DD.md. Chat is not the handoff. X (Twitter) is X Scout's job — do not spend this run on status-URL sweeps.
```

**X Scout**

```
You are the Pundits X Scout. You hunt X (Twitter) only. Shows Scout owns podcasts and YouTube.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout-x.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/board.md
Repo: https://github.com/bairdhall25/Pundits

P0 empty away-sides first. from:{handle} {away} and from:{handle} {home}, last 48 hours. Open the status URL. Same Intake/Candidates/Dropped bar. Never mint ids. Never touch data/. Never tweet. Append ## X pass to docs/runs/YYYY-MM-DD.md (create if missing). Chat is not the handoff.
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
2. **Roster and events are live files**, not memory. Load `data/pundits.json` and `data/events.json` at the start of the job. Hunt order is `docs/pick-shows.md` then `docs/board.md`. Shows Scout hunts pick shows (locks / I'll take). X Scout hunts status URLs (`from:{handle}`, last 48 hours). Named off-roster speakers as Candidates. Never “the show.” Scout does not mint ids. Promote does not auto-roster. Group vs group is parked. Fantasy/props parked in `docs/fantasy.md`.
3. **Clear first-person leans only** map to an event. Weasels stay `soft`, unmapped.
4. **YES = away team wins** on game events. Futures map only to futures slugs. Never stretch a title pick onto a game.
5. **Name the speaker.** McAfee Show guest picks belong to the guest (`hawk`, `butler`, …), never `mcafee`.
6. **Kalshi is the ruler.** Cents come from a Kalshi page or a Kalshi reprint, each with `sourceUrl` + `sourcedAt`. Do not convert sportsbook moneylines.
7. **Wrong season → drop.** Same teams in a prior year is not this event. Event slugs always end in `-{season}` (`clemson-at-lsu-2026`), where season is the year the regular season starts — a January 2027 bowl/playoff/Super Bowl is still 2026. Next season's rematch is a new slug.
8. Unverifiable quote → drop. Empty sides are fine. Fake quotes are not.
9. **Same episode, two speakers is two rows.** Skip a restage of the same pundit+event (or this pundit already using that sourceUrl). Do not skip a second named speaker on the same URL.
10. **Capture the reason, not the transcript.** For a new hard pick, keep the decisive verbatim quote short, then add an optional 25–60 word `reasoning` capsule that paraphrases at most two concrete factors the same speaker actually gave in the same source. No new analysis, generic filler, play-by-play, or transcript dump. If the speaker gave only the pick, leave reasoning blank.

Product rules in full: `docs/superpowers/specs/2026-08-25-pundits-v1-launch-design.md`. Capture checklist: `docs/RUNBOOK.md`.
