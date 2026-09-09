# Scout acceptance fixes

Status: Evidence

Correction to Phase 2 PR #25 (`773e708`). Implements the three findings in the PM Scout QA report on branch `codex/scout-qa-report`. This is an engineering record, not a Scout intake run.

## Delivered

- Approved unpublished matchups enter Dispatch using stable target IDs, matchup/season, kickoff, priority and designated sources. No editorial event is minted. Unmapped Intake can carry targetId and matchup through row-level Audit; Promote retains its explicit mint gate.
- Audit evidence-v2 binds source date and optional rationale in addition to speaker, quote, URL and mapping. Unmapped target/matchup context is bound too. Missing or old hashes require a fresh audit; historical published records are unchanged. Mapped routing notes and milestone timestamps are not evidence edits.
- A specific reopenReason can reopen recent hit/opened/dry episodes. recordEpisodeInspection preserves target/segment coverage and history and consumes the reason, preventing repeat retries. Coordinator stays print-only.
- Applied PM selection: four college Week 2 games approved for bounded scouting; three extra NFL games deferred. Existing NFL openers remain. Official schedule links recorded in capture-targets.json were checked in the preceding PM QA. Hunting approval does not authorize public events, new roster members or homepage placement.
- Updated Coordinator, all Scout lanes, Audit, Promote, capture policy, current context and run template.

## Verification

- npm test: 470 tests passed in 48 files.
- check:fast: 469 tests plus run validation passed; final scoped tests rerun after the whitespace-only reopen guard adjustment.
- Twelve acceptance regression cases exercise proposed-to-approved unpublished Dispatch, parsed unmapped Intake, Audit/mint gate, seven evidence edits, legacy approvals, harmless metadata, expiry/defer rules, and one-shot episode reopening with preserved coverage.
- Live-data dry run prints four college staging targets and three NFL openers with designated sources, without writing editorial JSON.
- git diff --check passed. No data/*.json changes.
- Methodology impact checked: internal capture routing and approval enforcement preserve public eligibility, grading, attribution and frozen-market semantics. No public methodology/FAQ edit is needed.

## Rollout boundary

This correction is stacked on the unmerged Phase 2 branch, not deployed main. The bot workflows read main, so they will not pick this up until the Scout changes and correction are integrated. No site release, live social action, or new source verification is claimed. A bounded live Scout/Audit run is still the operational yield check after integration. Full production build/release verification remains required before any deployment; this change does not deploy.
