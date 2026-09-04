# Documentation map and authority

This file explains which documents direct current work and which are historical evidence. When documents disagree, use this order:

1. `AGENTS.md` for repository-wide agent rules.
2. `docs/product/` for current product strategy and decisions.
3. `docs/ROADMAP.md`, `docs/RUNBOOK.md`, and `bots/` for current execution.
4. Live code, tests, and `data/*.json` for implemented behavior and current counts.
5. Dated audits, plans, handoffs, run logs, and research as historical evidence.

Live code and JSON win on what is shipped. Current product documents win on intended behavior. A historical plan never overrides either one.

## Current canonical documents

| Area | Authority |
|---|---|
| Product strategy | `docs/product/` |
| Product decisions | `docs/product/decision-log.md` |
| Measurement | `docs/product/measurement.md` |
| Editorial trust and corrections | `docs/product/editorial-and-corrections.md` |
| Implementation priorities | `docs/ROADMAP.md` |
| Capture, URL, release, and deployment rules | `docs/RUNBOOK.md` |
| Capture vs homepage density | `docs/capture-policy.md` |
| Home and league display | `docs/product/featured-games.md` |
| Roster growth | `docs/product/roster-growth.md` |
| Bot roles and handoffs | `bots/README.md` and the relevant bot file |
| Active capture hunt | generated Dispatch, then `docs/capture-policy.md`, `docs/pick-shows.md`, `docs/news-beats.md`, and `bots/scout-x.md` |
| SEO work | `docs/seo-plan.md` plus the latest dated audit/approved fix plan |
| Parked fantasy/props scope | `docs/fantasy.md` |
| Competitor research | `docs/competitive/` |

## Evidence and operational logs

- `docs/runs/` records what a particular Scout or Audit run found. It is a mailbox and audit trail, not standing product strategy.
- `docs/week1-leans.md` is a cumulative capture record. Live JSON determines what is actually published.
- `docs/feedback.md` preserves user quotations and dated interpretations.
- `docs/roster-20.md` is dated roster research; current roster truth is `data/pundits.json`.
- `docs/audits/` contains point-in-time evidence. Findings remain useful, but implementation and later decisions may supersede recommendations.

## Historical implementation artifacts

Files under `docs/superpowers/specs/` and `docs/superpowers/plans/`, plus dated Grok handoffs, describe how earlier versions were designed or implemented. They contain obsolete references to Vercel, GitHub Pages, `/bets`, invented prototype data, earlier route shapes, and older UI language.

Use them to understand why a decision was made or to recover implementation detail. Do not execute them as current plans unless the operator explicitly reactivates one. Current production uses Cloudflare Pages project `pundits`, season-qualified `/picks/` routes, verified records, and the canonical product rules in `docs/product/`.

## Document status convention

New substantial documents should include one of these labels near the top:

- `Status: Canonical` — directs current product work.
- `Status: Operational` — current execution instructions that may change frequently.
- `Status: Active plan` — approved but not yet complete.
- `Status: Evidence` — point-in-time research, feedback, audit, or run output.
- `Status: Historical` — retained for context and no longer executable as current instruction.
- `Status: Parked` — intentionally out of scope until explicitly reopened.

When a plan completes, mark it historical or add an implementation note. Do not leave completed plans looking like active assignments.
