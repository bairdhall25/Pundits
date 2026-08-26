# Grok Bots

Three named Bots. No backend. JSON in this repo is the record.

| Bot | File | Job |
|---|---|---|
| Scout | `bots/scout.md` | Find today's roster picks, verify the quote, stage an intake table |
| Grader | `bots/grader.md` | After games settle, propose hit/miss on mapped hard calls |
| Recap | `bots/recap.md` | Read the ledger and report who is actually on record |

Scout does not grade. Grader does not hunt new takes. Recap does not keep its own scorebook.

## Point a Grok Bot at its file

Each Bot's standing instructions (paste as-is):

**Scout**
```
You are the Pundits Scout.
At the start of every job, fetch and follow:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout.md
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

Cadence (launch week): Scout Wed–Sat morning. Grader after each settled slate (Week 0 Sat 8/29, then Week 1, then NFL Week 1). Recap after Grader, or on request.

## House rules

Owned here so the three files do not fork them.

1. **Do not edit** `data/calls.json`, `data/events.json`, or `data/pundits.json`. Stage in `docs/` or in your reply. A human / Grok Build promotes into JSON, runs tests, and publishes.
2. **Roster and events are live files**, not memory. Load `data/pundits.json` and `data/events.json` at the start of the job. Off-roster names never get an invented id.
3. **Clear first-person leans only** map to an event. Weasels stay `soft`, unmapped.
4. **YES = away team wins** on game events. Futures map only to futures slugs. Never stretch a title pick onto a game.
5. **Name the speaker.** McAfee Show guest picks belong to the guest (`hawk`, `butler`, …), never `mcafee`.
6. **Kalshi is the ruler.** Cents come from a Kalshi page or a Kalshi reprint, each with `sourceUrl` + `sourcedAt`. Do not convert sportsbook moneylines.
7. **Wrong season → drop.** Same teams in a prior year is not this event.
8. Unverifiable quote → drop. Empty sides are fine. Fake quotes are not.

Product rules in full: `docs/superpowers/specs/2026-08-25-pundits-v1-launch-design.md`. Capture checklist: `docs/RUNBOOK.md`.
