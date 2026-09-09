# PM acceptance review of growth corrections

Status: Evidence

Reviewed baseline: `d109a59` on `codex/growth-integrated-qa`. Decision: retain the corrections, but engineering acceptance remains open for two reproduced P2 defects. No production merge, deployment, editorial promotion, or live posts were performed.

## Remaining engineering findings

### P2: missing publication timestamps become a measured zero

`lib/capture-metrics.ts:240` skips calls with absent `firstPublishedAt`. With a valid September 9 UTC reporting interval, two measured hours, and one mapped call whose publication time is unknown, `picksPerSourceHour` returns `{ value: 0, promoted: 0 }`. The interval cannot establish that this call was published outside the window. This violates the acceptance requirement that an uncertain numerator remain unavailable. The lead-time collectors also skip these rows without including them in excluded counts.

Correction: unknown publication must make productivity unavailable unless separate trustworthy evidence establishes that the record is outside the window. Keep a proven empty window at zero. Count missing publication endpoints in latency exclusions. Test absent, blank, and mixed known/unknown publication stamps with positive effort; test a genuinely empty population separately. Do not backfill publication times or use source date as a proxy.

### P2: a final-score take still falls back to pending and permits reposting

For `inferCoverageState('Nick Wright picked Seattle. Final: Seattle 27, New England 17.', 'take')`, `lib/social-select.ts:181` returns `pending`. Passing this historical record to `decideNovelty` for a new `hit` at the same canonical receipt returns `allow`. The final-result evidence is present, but the word “picked” wins the fallback when no explicit hit/miss is given. This is precisely the case that should stay unknown until the individual outcome is established.

Correction: outcome evidence with no defensible take verdict must return unknown before the pending fallback. Preserve explicit pregame classification and genuine pending-to-graded transitions. Add the example above through both inference and novelty/selection; expected unknown and skip. Include the analogous losing final and ambiguous result wording. No duplicate live post is claimed.

## Corrections supported by this review

- Saban's reported selection now has no quotation marks in the generated take and profile images, in both landscape and story formats. All four actual PNGs were visually inspected. Evidence labels are visible and the design is preserved. Regression tests cover a spoken-quote control and evidence-dependent cache behavior.
- Interval bounds, deduplication, unpublished coverage labels, and precise-timestamp-only lead times are implemented. The missing-publication case above prevents full acceptance of measurement.
- Predicted scores no longer automatically become results; unknown prior coverage blocks novelty. The remaining final/picked case prevents full acceptance of social inference.
- Episode-note replacement and independent rationale verdicts have code/prompt coverage. No `data/` files changed between the plan baseline and reviewed commit.
- Freshness expiry tests and the pending owner/runbook are implemented. This is not unattended activation.

## Operational disposition

The saved [Scout re-audit](../runs/2026-09-09-growth-qa-scout-reaudit.md) is evidence from Grok, not fresh source verification by Codex in this review.

- Omny transcript access remains unresolved. Rationale omissions reduce attribution risk, but the rationale-only table must not be described as a fresh audio/quote audit. Preserve the original evidence and require accessible source verification for the next promotion decision.
- Nick Wright is correctly held at `needs-evidence`, with a visible decision packet. The blocked path works; successful end-to-end candidate acceptance is still unproven. Do not roster him from this status.
- News and built-in X search were exercised according to the saved run; that does not validate MCP `user-X`. Keep the connector-specific acceptance open.
- News-sitemap unattended freshness remains pending activation of the existing operational rebuild owner. No scheduler or credentials were added by this review.

## Verification

`npm run check` passed on `d109a59`: 612 tests in 58 files, run validation, TypeScript, production build (255 generated routes), static contracts, and preview verification across 217 pages and 216 decoded images. The build reused 430 cached assets, providing a warm-cache visual check; this review did not repeat a separate cold-cache build.

Read-only reproductions: `npx tsx docs/audits/2026-09-09-growth-corrections-probes.ts`. These use synthetic `fixtureCall`/`fixtureGame` values. They intentionally print the failures described above; an exit code of zero is not acceptance. No editorial records were changed.

The browser harness passed all 24 route/viewport cases at 320, 390, and 1440 pixels against the rebuilt output. Sampled article text and visible methodology FAQ match their structured content. No horizontal overflow or page runtime errors were observed. External analytics and connectors were blocked during this local browser check and are not certified by it.

## Next Grok patch

Implement only the two remaining P2 corrections above on the current integrated branch in an isolated worktree. Add focused regressions, run `npm run check:fast`, then the final `npm run check`. Preserve the accepted card, Scout, and freshness changes. Return the tested SHA and exact regression results. Keep external-source recovery and operator activation as explicit operational items; do not deploy, promote, or post as part of this patch.
