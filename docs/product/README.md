# Pundits.Pro product documentation

Status: Canonical

This directory is the canonical starting point for product work. It condenses the durable decisions currently scattered across code, runbooks, audits, handoffs, and implementation plans.

## Product in one sentence

Pundits.Pro shows which teams named sports voices publicly picked, preserves the original quote and frozen market context, and records who was right after the event settles.

## Current stage

The product is in corpus-and-loop formation, before monetization optimization. The immediate job is to accumulate verified picks, grade them reliably, turn them into useful permanent pages and shareable media, and learn which surfaces produce repeat attention.

Volume alone is not the goal. The target is **qualified event density**: several named, sourced, objectively gradable predictions concentrated on events fans care about, creating useful disagreement, trustworthy results, and reusable distribution artifacts.

For a concise handoff of the present thesis, product truth, immediate priorities, and open questions, read [Current product context](./current-context.md).

## Canonical documents

- [Product brief](./product-brief.md): customer, problem, value proposition, stage, moat, and success definition.
- [Experience principles](./experience-principles.md): how the product should feel to a sports fan and how trust is presented.
- [Product system](./product-system.md): objects, states, routes, data ownership, lifecycle, and architecture contracts.
- [Growth and content loop](./growth-and-content-loop.md): how captured and graded picks become search, social, and retention inventory.
- [Measurement framework](./measurement.md): operating metrics, product signals, and stage gates.
- [Editorial and corrections policy](./editorial-and-corrections.md): attribution, source hierarchy, disputes, corrections, and rights boundaries.
- [Decision log](./decision-log.md): accepted, working, parked, and unresolved product decisions.
- [Strategy QA](./strategy-qa-2026-08-29.md): dated assessment of what is right, what is unproven, and what should happen next.
- [Dense marquee cards, hold through this week](./2026-08-30-dense-marquee-cards.md): 2026-08-30 decision to optimize for event SU density and defer Bets/fantasy/bulk roster until Week 1 capture is observed.
- [Featured games](./featured-games.md): home and league display waterfall (pin, when, coverage, size). Home is featured plus a short teaser. League pages are live-week slates. Not a score. Not capture.
- [Roster growth](./roster-growth.md): validation by association; team analysts are not pundits.

Supporting operational sources remain authoritative within their scope:

- `docs/product/current-context.md` — concise, dated handoff for the current operating stage.
- `docs/ROADMAP.md` — current implementation priorities.
- `docs/capture-policy.md` — capture vs homepage-density doctrine (Scout / Promote).
- `docs/RUNBOOK.md` — capture, publishing, URL permanence, and deployment.
- `bots/README.md` — bot ownership and handoffs.
- `docs/seo-plan.md` — programmatic search roadmap.
- `docs/competitive/` — competitor baselines and monitoring.
- `docs/README.md` — authority map for canonical, operational, evidence, and historical documents.
- `lib/types.ts` and `data/*.json` — implemented object model and current record.

## Repository snapshot

Observed 2026-08-29; this is a dated baseline, not a target to hard-code:

- 31 events: 9 games and 22 futures/default-future events.
- 57 captured calls: 39 hard and 18 soft.
- 34 mapped calls with an event and side.
- 48 rostered pundits and 29 teams.
- All 57 calls were pending; the first grading cycle had not yet landed.
- The test suite was green at the initial documentation baseline; always rerun it because active implementation work changes the count.

The app is a statically exported Next.js site deployed to Cloudflare Pages. Editorial JSON is compiled into event pages, pick-story pages, pundit profiles, team pages, weekly archives, feeds, sitemaps, structured data, and social images.

## How future agents should use these docs

1. Start here and read only the canonical document relevant to the requested change.
2. Inspect live code and data before quoting counts or describing current UI.
3. Check the decision log before reopening a parked scope or reversing an accepted decision.
4. Use dated audits and handoffs as evidence, not automatically as current instructions.
5. Update the relevant canonical document when a product decision materially changes.
6. Add a dated competitor observation only when new evidence changes the assessment.

The docs should describe product truth, not aspirations disguised as shipped behavior. Label hypotheses, future ideas, and current implementation separately.
