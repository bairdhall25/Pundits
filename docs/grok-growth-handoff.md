# Grok engineering handoff — growth engine

Status: Active plan

Product manager: Codex. Engineer: Grok. Product owner: Baird.

## Start here

Implement the phased plan in [2026-09-08-growth-engine-implementation.md](superpowers/plans/2026-09-08-growth-engine-implementation.md). The product decisions and page-type SEO contracts are in [the execution brief](product/2026-09-08-growth-execution-brief.md). The evidence is in [the audit](audits/2026-09-08-growth-engine.md).

The handoff package is on GitHub branch `codex/growth-engine-handoff`. Read all three documents from that branch, then fetch the latest `origin/main` and implement in a new isolated `codex/` worktree. Do not work from Baird's dirty operator checkout or reset it. Keep the brief/plan accessible on your implementation branch without importing unrelated changes.

Follow AGENTS.md and its required canonical reads. Reconcile implementation drift against the audited baseline `6e4470a`; do not redo completed work or quote old counts as current.

## Copyable task prompt

> You are the engineer for Pundits.Pro; Codex is the product manager. Read `docs/grok-growth-handoff.md`, `docs/product/2026-09-08-growth-execution-brief.md`, `docs/superpowers/plans/2026-09-08-growth-engine-implementation.md`, and `docs/audits/2026-09-08-growth-engine.md` from GitHub branch `codex/growth-engine-handoff` in `bairdhall25/Pundits`. Then fetch current main, create an isolated codex worktree, and implement the plan in ordered, separately reviewable phases. Start with evidence/publication correctness and the Scout queue, then page-type SEO, social policy, and measurement. Keep the existing cards, permanent URLs, static architecture, and verification bar. Route editorial corrections through Audit/Promote; do not manufacture evidence or historical publication timestamps. Run each phase's required checks and provide concrete preview evidence plus a draft PR. Do not deploy production or post to X from this engineering task. Record progress and unresolved decisions in `docs/runs/YYYY-MM-DD-growth-implementation.md`. Continue independent authorized work when a particular correction is blocked. Bring Codex a product decision only when the plan cannot resolve it, with the exact evidence, proposed choice, and impact.

## Report back per phase

1. Phase and acceptance criteria completed; commit and PR link.
2. What changed for a fan or operator; before/after example.
3. Checks run and outcomes; preview screenshots or rendered HTML/JSON evidence where relevant.
4. Editorial corrections staged versus actually promoted, with source evidence.
5. Methodology and FAQ impact, including rendered verification.
6. Remaining product decisions, real blockers, and next phase.

No invented progress, metric values, successful deploys, original quotes, or inferred approvals. Source and publication correctness outrank shipping a filled card.
