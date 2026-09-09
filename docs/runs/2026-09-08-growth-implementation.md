# Growth-engine implementation journal

Status: Evidence

Product manager: Codex. Engineer: Grok. Product owner: Baird.

This journal records engineering progress on [the 2026-09-08 plan](../superpowers/plans/2026-09-08-growth-engine-implementation.md). It is not a Scout intake run. It does not set editorial `audit=` or `promoted=` flags. It does not edit `data/*.json`.

Branch: `codex/growth-engine-phase-2`. Code/JSON baseline: `6e4470a`. Docs handoff: `5a31459`.

## QA pause (2026-09-08)

Engineering paused after Phase 2 per Codex: QA accuracy and Scout before expanding into SEO, social, or measurement.

- QA queue: [#22](https://github.com/bairdhall25/Pundits/pull/22) → [#23](https://github.com/bairdhall25/Pundits/pull/23) → [#24](https://github.com/bairdhall25/Pundits/pull/24) → [#25](https://github.com/bairdhall25/Pundits/pull/25)
- Parked drafts: [#26](https://github.com/bairdhall25/Pundits/pull/26) (3A), [#27](https://github.com/bairdhall25/Pundits/pull/27) (4)
- Parked branches, no PR: `codex/growth-engine-phase-3b`, `codex/growth-engine-phase-5`
- Grok resumes those later PRs after Codex accepts Phases 1–2. Do not deploy or post to X from this journal.

## Phase 0 — current truth and correction inventory

Outcome required: engineering starts from current code and an inspectable list of affected records, not from assumptions about the September 8 snapshot.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Inspect current implementations of types, SEO, feeds, social, Receipt, pick routes, methodology, source-selection scripts, bot prompts, and active run files | yes | Paths cited in the inventory; Scout scripts inspected only |
| Dated correction inventory in `docs/runs/` with stable call IDs, surfaces, evidence, defect, disposition, verification | yes | [2026-09-08-growth-correction-inventory.md](./2026-09-08-growth-correction-inventory.md) |
| Cover the seven GameDay recap-label rows | yes | Identified by Cole `sourceUrl` + restage doc; Cole page loaded 2026-09-08 |
| Cover every currently nonempty `reasoning` field (do not hard-code 29) | yes | Live count is 29 of 83 hard mapped; all 29 tabulated |
| Distinguish invalid rationale from an invalid pick | yes | Six operational capsules proposed for reasoning removal; picks stay |
| Source URL loading alone does not verify a quote or speaker | yes | GameDay Cole load confirms labels, not spoken wording. Reasoning classified from stored text |
| Publication history: commit ≠ first live publication; unknown stays unknown | yes | Brandt / Finebaum / Saban notes; no Cloudflare deploy logs in git |
| Inventory preserves originals and routes editorial changes to Audit/Promote | yes | No JSON edits |
| Baseline counts and missing fields reproducible | yes | Count table + absent `firstPublishedAt` / evidence-kind fields |
| No editorial JSON modified to create a clean fixture | yes | `data/*.json` untouched |
| Initiative referenced from product README, current-context, ROADMAP without replacing other priorities | yes | this Phase 0 change |
| Journal does not impersonate Scout or set editorial flags | yes | this file |

### Checks run

`npm run check:fast` on this worktree after the inventory and canonical-doc pointers were written: **pass**. Inexpensive tests 429 passed / 44 files; `validate:runs` passed on `docs/runs`. Note emitted: `check:fast is not a release gate.`

Phase 0 is documentation only. `npm run check` (full production-style) is not required for this phase and was not run as a release gate. No production deploy.

### Remaining product decisions

None invented. Real gaps Phase 0 cannot close:

1. **GameDay original evidence.** If Audit cannot recover spoken GameDay wording for the seven published rows, Codex still owns the narrow record-disposition rule (legacy reported-selection display vs a later void/correction state). Brief decision 5 already forbids newly mapped picks from unverified table labels. Phase 1 can implement truthful legacy presentation without expanding eligibility.
2. **Reasoning JSON.** Engineering will omit operational capsules from Phase 1 rendering. Actual field deletion or rewrite from source is Audit/Promote. Mixed rows (`kanell-western-michigan-at-michigan-20260903`, `kanell-fiu-at-usf-20260903`, `patterson-oklahoma-state-at-tulsa-20260903`) need Audit before a keep-or-remove call.
3. **First-publication schema.** Exact field names, optionality, date-only vs datetime, and what evidence counts as first live publication. No deploy logs are in this repository; unknown historical times must remain absent rather than backfilled from `sourceDate` or git commit time.
4. **News-sitemap expiry ownership.** Phase 1B needs a proposed static-output refresh; whether a scheduled empty deploy is the mechanism is a later review item, not a claim that a schedule is running.

Parked by the brief and not reopened: immutable per-call prices, ATS product, new sports, backends, aggregator enrollment, production deploy, live X posts.

## Phase 2 — Scout queue, source completion, and handoffs

Outcome required: the next week's relevant evidence is found before kickoff without grinding indefinitely on the same empty side.

Branch: `codex/growth-engine-phase-2`. Base SHA: `6287abaf07ab910cba1addec9ad6e373fde46f44`. This journal is not a Scout intake run and does not set `audit=` / `promoted=` flags.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Upcoming NCAAF absence is flagged | yes | Live `ncaafAbsenceFlag` on current `data/events.json` + `docs/capture-targets.json`; Dispatch coverage flag. Proposed Week 2 shortlist is labeled proposed. |
| Approved dense game still source-completes a newly available GameDay voice | yes | `scripts/scout-density.test.mjs` source-completion fixture |
| Unseen yesterday episode remains eligible | yes | `classifyItem` unprocessed fixture in `scripts/scout-feeds.test.mjs` |
| Newer irrelevant episode does not hide a relevant one | yes | `classifyQueue` / `inspectableEpisodes` fixture |
| Dry episode is not reprocessed without cause | yes | ledger `outcome: dry` fixture; reopen only with `reopenReason` |
| Same-day imminent target precedes a later equal-priority one | yes | Patriots before Bills at equal priority |
| Unrelated failed row does not block an approved row | yes | `promoteReadyRows` Howard ok + Portnoy fail |
| Modified row cannot reuse approval | yes | quote change invalidates `rowId` |
| Past or settled event cannot receive pregame hunting | yes | settled → Grader or omit; past kickoff without a final → Grader; missing kickoff is not live |
| Current-main dry run does not publish data | yes | `node scripts/scout-density.mjs --dry-run` and `node scripts/scout-feeds.mjs --dry-run` print only |
| Journal is not a Scout intake and does not set editorial flags | yes | this file |

### Checks run

On this worktree after the Phase 2 code and operating-doc edits:

- `npm test`: **pass**, 453 tests / 47 files.
- `npm run check:fast`: **pass**. Inexpensive tests 452 passed / 46 files; `validate:runs` passed on `docs/runs`. Note: `check:fast is not a release gate.`
- `node scripts/scout-density.mjs --dry-run`: printed Dispatch + proposed shortlist + decision queue. Coverage flag: upcoming NCAAF game events: 0. Hunt order Patriots (Sep 9 empty-side) → 49ers (Sep 10 dense source-complete) → Bills (Sep 13 empty-side). Did not write `data/*.json`.
- `node scripts/scout-feeds.mjs --dry-run`: printed the recent-unprocessed queue including GMFB / See Ball / Clay Travis. GMFB `i=1000788488079` stayed inspected/hit and was not re-queued. Did not write `data/*.json` or mark new episodes inspected.

No production deploy. No `data/*.json` edits. Methodology page was not changed: this phase is operating policy, not public pick-eligibility semantics.

### Remaining product decisions

1. **NCAAF Week 2 shortlist.** Engineering bootstrapped four source-backed proposed games (Oklahoma at Michigan; Ohio State at Texas; Arizona State at Texas A&M; Alabama at Kentucky). Codex/PM must approve, replace, or defer. Silence is not “no college work” and is not permission to scout every game. No public events were minted.
2. **NFL add-ons.** Broncos–Chiefs, Commanders–Eagles, and Packers–Vikings are proposed only. Approved openers stay Patriots / 49ers / Bills.
3. **Factory IDs.** GMFB Apple `1171438277`, See Ball Get Ball `1769665459`, and Clay Travis `1498106610` are verified from existing repo URLs. No guessed IDs. No remaining factory-ID gap for those three.
4. **Episode ledger writer.** Shows is instructed to persist inspection outcomes in `docs/scout-episodes.json`. Coordinator feed checks only discover. Whether Coordinator should auto-write `outcome: discovered` on every feeds run is left to Codex; the CLI remains print-only by default so a dry run cannot mark episodes inspected.

Parked by the brief and not reopened: auto-roster, photo bypass, team-analyst eligibility, bulk event minting, new bots, `data/*.json` edits, production deploy, live X.

### Next phase

Codex QA of Phase 1 ([#24](https://github.com/bairdhall25/Pundits/pull/24)) and this Phase 2 PR ([#25](https://github.com/bairdhall25/Pundits/pull/25)). Grok does not start further phases until that review. SEO/social/measurement remain parked.
