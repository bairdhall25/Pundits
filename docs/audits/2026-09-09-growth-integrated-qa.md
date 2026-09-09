# Growth implementation: combined QA

Status: Evidence

Reviewed September 9, 2026. **Release decision: hold for the corrections below.**

Combined baseline `ef24db3` on `codex/growth-integrated-qa`: Phase 5 (which contains 1, 2, 3A, 4) plus Phase 3B, Scout acceptance fixes, association workflow, and current main `df9ea50`. Integration resolved documentation conflicts without replacing the newer candidate Audit or social rules. No production merge, deployment, new editorial records, or live social posts.

## Findings requiring correction

### P1 — Reported selections still become spoken quotations in generated images

The Saban Clemson receipt correctly labels its evidence as a reported selection, without quotation marks. However, `lib/social-card/resolver.ts:252` passes the same recap label as quote/quoteExcerpt and its proof includes “Original public quote”. `scripts/social-card/quote.tsx:106` wraps it in quotation marks. The actual generated `public/og/takes/clemson-at-lsu-2026--saban.png` visibly says “LSU OVER CLEMSON”. Profile quote cards use the same unconditional treatment. `lib/og.ts` also retains unconditional quote inputs.

This makes shared cards contradict both the page and methodology. Add evidence-kind-aware presentation to image models/renderers while preserving the card design. Test both landscape and story formats, take/profile uses, and cache invalidation. A cards.json evidence field does not fix already-rendered pixels. Keep the current layout; this is a truth correction, not a redesign.

### P2 — Capture productivity mixes lifetime inventory with a run's effort

`lib/capture-metrics.ts` computes picksPerSourceHour as all mapped calls on approved targets divided by supplied sourceHours. There is no numerator time window or run identity; `asOf` is only a label. An old pick with two hours supplied for a new run yields 0.5 picks/hour even if that run found nothing. Existing data produces seven mapped picks regardless of which collection window the hours describe.

Require matching measured numerator and denominator windows (or explicit audited run IDs). Keep the metric unavailable until both exist. Coverage inventory can remain a separate count. Approved unpublished targets also print `empty=none` despite zero picks on both sides; label their state unpublished/unmapped or show the appropriate uncovered sides, rather than implying no coverage gaps.

### P2 — Midnight assumptions can reverse pre-kickoff timeliness

`lib/capture-metrics.ts` parses a date-only kickoff at UTC midnight and reports hour-level lead time. A September 9 pick published at noon UTC for a September 9 evening game is reported as **-12 hours**. The “mixed precision” note does not correct the false before/after implication.

Use a verified kickoff instant for hour-level timeliness. Otherwise report date-level uncertainty or a bounded range; do not report a precise negative lead. The same principle applies to source-to-live latency when sourceDate has no time. The reproducible probe uses synthetic data and changes no editorial records.

### P2 — Social coverage inference confuses score predictions with results

`inferCoverageState` in `lib/social-select.ts` classifies “Nick Wright picks Seattle to win 27–17 before kickoff” as an event result, because the score regex takes precedence. Passing that classification to decideNovelty allows the same pregame destination again. The take classifier likewise maps ambiguous result language to hit.

Require unambiguous outcome evidence or return unknown. A score prediction is not a final score; the event/call lifecycle should be checked. Add pregame-score, miss-without-the-word-miss, and ambiguous-text cases. This reproduces a defect in the new helper; no duplicate live post is claimed. Bot prompts already require reliable live coverage and should preserve that fail-closed rule.

## Acceptance-run assessment

Evidence reviewed: the user's [Scout run](https://github.com/bairdhall25/Pundits/blob/test/scout-acceptance-2026-09-08/docs/runs/2026-09-08-acceptance-test.md), [Audit](https://github.com/bairdhall25/Pundits/blob/test/scout-acceptance-2026-09-08/docs/runs/2026-09-08-acceptance-test-audit.md), and episode ledger. This review inspected their records, not a fresh audio verification.

- The test on `8251b1e` found three Pate picks on approved unpublished games and retained the explicit event-mint gate. That validates the key capture-before-minting path operationally.
- Shows completed; X was blocked and News not run. It is not a successful three-lane test. The NFL empty YES sides stayed empty rather than being invented.
- Pate's Alabama reasoning says he separates SU from ATS and uses explicit winner language. That is routing/grading explanation, not why Alabama should win. It should be omitted with `ok-unmapped-no-reasoning`; a valid pick need not fail. Oklahoma's capsule also contains routing language and deserves another rationale-only review. Do not publish those capsules unchanged. The proposed publicRationale helper does not detect new defective capsules; source Audit must do its job.
- Nick Wright was staged but expressly left without a Candidate Audit. This predates the association correction `3c8dd6d`. His wrong side relative to an empty-YES priority is not an eligibility failure. Run him through the corrected candidate Audit/decision-packet path before claiming that loop accepted.
- The episode helper preserves the old default note “Feed check only. Not inspected.” after inspection. Flags/history are updated, so this is a low-priority presentation defect. Replace only the obsolete generated note; retain real evidence notes and history.

## Passing checks and assessed areas

`npm run check` passed on the combined baseline: **565 tests / 58 files**, production TypeScript/build, static route/feed/permalink verification, and previews for **217 pages / 216 decoded images**. The image validator checks rendering/integrity; it does not verify attribution truth.

- Evidence and SEO: reported-label text on the receipt is corrected; Brandt's operational capsule is omitted. The sampled article bodies match the rendered paragraphs. Unknown publication timestamps remain absent. News eligibility uses first publication rather than source date. Existing URLs and permalink checks pass.
- Page families: sampled receipt, game, profile, team, league, and weekly archive pages load with matching canonical destinations. Result/history and current-pick distinctions are implemented. No generic article family was introduced.
- Methodology: visible FAQ answers match FAQPage structured answers in the browser; evidence and dated event-snapshot semantics are aligned on that surface.
- Social: caps are ceilings, novelty is lifecycle-wide in the design, unavailable metrics remain unavailable, and self/paid reach have separate categories. No live posting was performed.
- Scout and roster: previous regression cases remain green after integration. Candidate-only trigger, evidence identity, ordinary-promotion guard and packet states are covered. The live association cycle remains pending.

Browser harness: `node docs/audits/2026-09-09-browser-qa.mjs` against locally served `out` on port 8765. All **24 route/viewport checks passed**: eight representative routes at 320, 390 and 1440 pixels, with H1/main content, no horizontal overflow or runtime page errors, matching canonicals, visible article paragraphs and visible structured FAQ where applicable. It blocks third-party requests so QA does not pollute analytics. Results and screenshots are under `.agent-artifacts/growth-qa/`. It does not certify GA delivery, external links, real shares or live connectors.

Reproductions: `npx tsx docs/audits/2026-09-09-growth-probes.ts` prints the two metric defects and the social-state defect. A successful process exit is not acceptance; outputs intentionally show observed failures.

## Operational release gates

The news freshness workflow checks stale output but does not rebuild it. Confirm an actual rebuild owner/cadence and observe expiry before claiming unattended freshness. The three-slate scorecard is explicitly not run; it cannot be closed by engineering checks. Resolve the X connector separately and exercise News. No accounts, backend, extra sports or expanded eligibility are required for these corrections.

The SEO page strategy is substantially implemented and technically healthy. Keep those changes; correct the image attribution and measurement/social edge cases, then rerun affected checks and a final integrated release check. Do not treat the green build alone as permission to deploy.
