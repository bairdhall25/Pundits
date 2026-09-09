# Growth QA corrections and acceptance plan

Status: Active plan

Owner: Codex (product and acceptance); Grok (engineering). Requested by Baird September 9, 2026. This authorizes preparation of corrections and test evidence, not production deployment, editorial promotion, roster approval, or live social posting.

## Outcome and starting point

Retain the implemented SEO page families and social design. Correct attribution, measurement, and lifecycle logic; then prove the remaining Scout and freshness operations. Do not restart the growth project or expand scope.

Source: [integrated QA](../../audits/2026-09-09-growth-integrated-qa.md). Reproducible combined baseline: `ef24db3`; report/probes committed as `7c16936` on `codex/growth-integrated-qa`. The baseline passed 565 tests, the production build, 217-page/216-image preview verification, and 24 route/viewport checks. These are historical results, not acceptance of the fixes.

Fetch before starting. Create an isolated `codex/` correction branch from the integrated QA branch, preserving the operator's dirty checkout. If the integration has since landed elsewhere, verify ancestry and use its current equivalent rather than replaying old merges. Keep corrections in reviewable commits on one branch; avoid another stack of dependent feature branches. Record the tested SHA in the final handoff.

## 1. Correct attribution in every generated card — P1

Primary surfaces: `lib/social-card/resolver.ts`, card models, `scripts/social-card/quote.tsx`, `lib/og.ts`, social index, asset fingerprints and renderer-source versions.

- Carry the existing evidence kind into every applicable take/profile card model. Reuse the page's evidence classification; do not build a competing heuristic.
- Spoken quotations retain quotation treatment. Reported selections show a readable “Reported selection” label and unquoted selection text. Remove claims such as “Original public quote” for that evidence kind, including proof/accessibility/index text.
- Preserve the approved layout, portraits, colors, frozen-price wording, result states, and canonical page URLs. Unknown evidence follows the existing evidence contract and must not acquire stronger attribution from the renderer.
- Ensure evidence-kind and renderer changes invalidate affected landscape and story assets and their versioned preview URLs. Cover resolver dependencies as well as renderer dependencies; a manual forced rebuild alone is insufficient.

Acceptance: Saban's Clemson receipt and profile, in landscape and portrait/story formats, agree with the page's reported-selection treatment. A verified spoken-quote control retains quotation marks. Inspect actual rendered PNGs, including cold and warm-cache output; demonstrate changed asset fingerprints after an evidence-only change. Revert synthetic changes after testing. Add regression coverage to existing model/render/cache tests, then run the full check. No editorial JSON edits to make fixtures work.

## 2. Make capture metrics defensible — P2

Primary surfaces: `lib/capture-metrics.ts`, `scripts/capture-metrics.ts`, existing tests, `docs/product/measurement.md`, and `docs/product/weekly-report.md`.

### Productivity and coverage

- Keep current coverage inventory separate from period productivity. The productivity measure is **newly promoted verified mapped picks per measured source hour**, not discoveries or lifetime inventory.
- Require an explicit reporting interval with timezone-qualified start/end, matching measured effort, and identifiable newly published calls. Use a half-open interval `[start, end)` and deduplicate calls across repeated targets. Do not infer effort from episode runtime, elapsed wall-clock time, or the existence of a run file.
- Provide a small validated reporting input outside `data/` if needed: interval, measured hours, and evidence/run references. Reuse reliable publication timestamps where available. Missing interval, uncertain numerator, missing/zero/invalid effort, or incompatible measurement scopes produce `n/a` with a reason. Never backfill publication timestamps to manufacture a ratio.
- For a complete measured interval with positive effort and zero qualifying promotions, report 0. Audited but unmapped candidates remain separately described and are not promoted picks.
- Unpublished approved targets must visibly say “unpublished; no mapped coverage,” not `empty=none`. Preserve honest away/YES and home/NO coverage on mapped games.

Acceptance: a historical pick does not enter a new interval's numerator; two new qualifying picks over four measured hours yield 0.5; duplicates do not inflate it; interval boundaries, missing timestamps, invalid effort, and zero-yield runs behave explicitly. CLI output includes interval, count, effort, and unavailable reasons. Approved unpublished targets cannot appear complete.

### Timestamp precision

- Compute hour-level source-to-live and pre-kickoff lead only when both endpoints are valid instants with explicit timezone/offset. Do not parse a calendar date as midnight or derive time from display strings.
- Keep this correction small: date-only pairs are excluded from precise medians, with excluded counts and reasons. If no precise pairs remain, report `n/a`. Do not add a new kickoff-data migration or an uncertainty-range subsystem in this pass.
- Expose valid sample counts. A negative source-to-live interval is inconsistent evidence and must be flagged/excluded; a negative pre-kickoff lead is valid only with precise timestamps establishing actual late publication.

Acceptance: the audit's date-only September 9/noon example no longer reports -12 hours. Test timezone offsets, same-day dates, missing/invalid endpoints, precise early and late publication, and mixed populations. Update metric definitions and CLI/report examples together.

## 3. Make social novelty fail closed on uncertain state — P2

Primary surfaces: `lib/social-select.ts`, its tests, and callers/bot instructions that consume coverage inference.

- A predicted score is not a final result. Ambiguous result language is not a hit. Explicit pregame wording must not become a result because a score is present.
- Infer the historical post's state from defensible evidence. Current ledger state may check compatibility, but must not relabel an old pregame post as a result just because the game has since ended.
- Where a take's hit/miss cannot be established, return unknown. At the caller boundary, unknown or incomplete live coverage cannot grant permission to post.
- Preserve canonical destination matching across campaign URLs and the intended transition from a pregame post to a genuinely new graded receipt. Keep daily caps and tagging restrictions unchanged.

Acceptance: “Seattle to win 27–17 before kickoff” remains pregame/pending; “final 27–17” cannot alone prove an individual pick hit; contradictory language remains unknown; explicit verified hit and miss cases work. Duplicate pregame posts are skipped, a supported later result remains eligible, query parameters do not evade matching, and connector failure stays unavailable rather than dry/novel. Test the decision path, not only the regex helper. No live X posts are required.

## 4. Repair the Scout handoff and finish bounded acceptance

### Engineering and prompt corrections

- In `scripts/scout-feeds-lib.mjs`, replace the obsolete generated “Feed check only. Not inspected.” note after actual inspection. Preserve custom notes, coverage history, episode identity, and reopen behavior. Add a focused regression case.
- Review Shows/Audit/Promote instructions so reasoning is checked independently from pick validity. A capsule must explain factors the speaker gave for the pick, not SU/ATS routing or quote eligibility. Blank reasoning is valid. Do not add a keyword filter that claims to verify evidence.
- Ensure no-reasoning verdicts and ordinary promotion omit a rejected capsule while preserving the valid quote. Confirm changed rationale invalidates earlier evidence-bound approval.

### Operational acceptance, after corrections

Use the saved `test/scout-acceptance-2026-09-08` records as evidence, retaining originals. Append a clearly linked correction/re-audit record rather than silently rewriting the historical run. Reopen sources before issuing new verdicts.

1. Re-audit Alabama's capsule: omit it unless actual why-the-pick evidence is verified. Recheck Oklahoma's mixed capsule; preserve only source-supported rationale. Texas remains subject to the same standard. Event creation stays gated; three accepted unmapped picks do not mean three publishable picks.
2. Run Nick Wright through the corrected association workflow: speaker and quote verification, association eligibility, evidence-bound candidate verdict, generated packet, and Coordinator visibility. Prepare identity/handle/factory/photo proposal as applicable. A pick on an already-covered side does not disqualify the voice. Missing evidence or photo must produce an explicit next action. No roster add or invented consent.
3. Exercise News against currently approved, eligible targets and retry X access. Use current Dispatch rather than hunting historical games after kickoff. Preserve separate lane results: completed with findings, completed dry, blocked, or not run. Authentication failure cannot pass the X test.

Acceptance evidence: tested SHA, run paths, source locators, row identities/verdicts, packet path/state/next action, episode history, lane statuses, `validate:runs` result, and confirmation that no `data/` changes or promotions occurred. Source access failures remain explicit open items; do not hold all code corrections hostage to an unavailable connector.

## 5. Establish news-sitemap freshness ownership

Inspect `.github/workflows/news-sitemap-freshness.yml`, the freshness script/tests, and the actual operating setup against `docs/RUNBOOK.md`.

- Demonstrate with a fixed clock that current eligible publication entries expire after the configured two-day window and rebuilding produces a valid empty sitemap when appropriate. Preserve unknown/future timestamp exclusion and permanent ordinary sitemap URLs.
- Prepare a concrete operator/Promote handoff for the intended 6:30am ET empty rebuild: who runs it, where failures appear, and the recovery command. A check-only workflow is not a rebuild, and a proposed owner is not an active owner.
- Follow the existing local authenticated Cloudflare deployment contract. Do not introduce CI production credentials, a new hosting platform, or an unrelated scheduler. Record activation separately; this plan does not create a recurring task.

Acceptance: time-based regression passes, rebuild behavior is demonstrated locally, and operational ownership/activation evidence is recorded. Until ownership is active, label unattended freshness pending. Do not claim Google News/Discover inclusion from valid structured data or a valid news sitemap.

## 6. Final integrated verification and handoff

Grok runs focused regressions while editing plus `npm run check:fast`; then runs `npm run check` once on the final integrated candidate with `GITHUB_PAGES` unset. Repeat the full check only if later changes warrant it.

- Repeat the 24 browser route/viewport cases from `docs/audits/2026-09-09-browser-qa.mjs` against freshly built local output; visually inspect corrected cards.
- Verify canonical URLs, redirects, feeds, news sitemap, article body/structured text agreement, and methodology visible FAQ/FAQPage agreement. Perform the AGENTS methodology impact check: these corrections should restore the current public contract. Update public copy only if an actual public claim changes; update repeated claims together.
- Preserve the dated failing probes as historical evidence; put corrected expectations in the maintained test suite. Report how each reproduced defect is now resolved.
- Deliver one correction PR against the appropriate integrated base, with problem/behavior summary, final SHA, checks, before/after card evidence, metric examples, acceptance-run links, and remaining operational dependencies. Do not mix editorial promotion into the correction PR.

Codex reviews the diff and evidence. Engineering acceptance requires items 1–3, item 4's code/prompt behavior, freshness regression, and final checks. The candidate pipeline needs its live packet acceptance before being called operationally proven; X remains pending until access succeeds. Production release follows the existing main/clean-tree/check/deploy/live-verification contract, with explicit disposition of each open operational dependency.

The three-slate growth scorecard and four-to-six-week audience baseline remain follow-up measurement. They do not block completion of this correction PR, and a successful code release does not prove engagement or SEO growth.

## Grok execution prompt

> Implement `docs/superpowers/plans/2026-09-09-growth-qa-corrections.md`. Start from the current equivalent of `origin/codex/growth-integrated-qa` in an isolated worktree. Read AGENTS.md and the linked QA report. Complete the engineering corrections in order: evidence-aware cards and cache invalidation; scoped, precision-safe capture metrics; conservative social lifecycle inference; Scout note/rationale handoff. Then run the bounded operational acceptance and freshness checks where access permits. Keep one correction branch with reviewable commits. Preserve the current SEO strategy and visual design. Do not edit editorial data, promote, roster, post to X, deploy, or create scheduled tasks. Finish with the full integrated checks and one PR, including tested SHA and evidence for every acceptance criterion. Report external blockers precisely without claiming those tests passed or leaving independent corrections unfinished.
