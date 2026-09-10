# Week 1 report design implementation

Status: Evidence

September 10, 2026. Branch: `codex/week1-report-design`, based on `origin/main` at `11cb108`. Release through PR, merge and Cloudflare production deployment authorized by the user; deployment evidence belongs in the PR. No tweet is part of this release.

## Delivered

- Existing `/ncaaf/2026/week-1/` becomes the reviewed College Football Pick Report above the complete archive. Original links, disagreements, graded picks and game cards remain.
- Server-rendered broadcast headline and scope, favorite/underdog result bars, responsive seven-underdog table, Patterson's sourced receipt with the companion Toledo miss, separate 11-game favorite chart, next-slate link and visible counting method.
- Existing black/green palette, Oswald headlines, Inter prose, Plex Mono numbers and approved portrait. CSS module is scoped to the report. Charts use labels and text alternatives; mobile table rows stack without horizontal scrolling.
- Approved search title/description and separate social copy; self-canonical and CollectionPage markup remain tied to the existing week URL. No invented publication date, author, new route or Article schema.
- Week 1 share card uses the existing renderer with favorite/underdog comparison bars and a correctly versioned metadata image URL. Other weeks retain their previous card format.

## Data and reuse

`lib/pick-report.ts` derives selections, distinct games and results from repository data. It rejects incomplete grades, missing scores/evidence/prices, ambiguous 50-cent classifications, duplicate pundit/game rows, missing pundits and grade/score contradictions. The approved editorial issue is explicitly limited to NCAAF Week 1, 2026. Other issues retain the established archive until separately reviewed.

If a correction invalidates the central narrative (one winning underdog selection, no losing favorite selections, Patterson/Tulsa as the exception), the normal archive remains at the same permanent URL rather than rendering stale editorial. Counts, scores, names and dates are derived in the component; the headline's numerical count is not hard-coded. The generic analysis helper can support later reviewed favorites/underdogs reports without enabling them automatically.

No editorial JSON changed. No backend, client chart dependency or new scoring formula was introduced. The component is a Server Component with ordinary links and HTML/CSS charts; its content remains available without interaction.

## Verification

- `npm run typecheck` passed.
- Full repository checks include the seven new analytical tests, the retained open-week social-card fallback, run-file validation, production build and static preview verification.
- Browser evidence: `.agent-artifacts/report-browser-verification.json`; screenshots at `.agent-artifacts/report-{1440,390,320}-{hero,article}.png`.
- Playwright checked the production export at 1440, 390 and 320px: one H1; seven table rows; no horizontal overflow; correct title, description, canonical, social title and versioned image; retained graded receipts; working methodology jump and receipt navigation; no runtime errors.
- Axe WCAG 2 A/AA scan of the report returned zero violations at each width. Visual inspection supplements the automated checks.
- Home, Week 0 and NFL Week 1 remain functional without the new editorial issue.
- Methodology impact: no change to eligibility, grading or market semantics. The article supplies its own descriptive price-group definition. Existing visible methodology and every structured FAQ answer were checked for agreement; no methodology edit was necessary.

The design review caught and corrected an overflowing social-card headline that image decoding alone did not catch. Final rendered card inspection is required alongside the automated image checks.

## Local preview

The exported preview runs at `http://127.0.0.1:3118/ncaaf/2026/week-1/`. To restart from this worktree after building, run `node .agent-artifacts/report-server.mjs` (the helper is a local ignored verification artifact). Use the normal repository build/deployment workflow for release; the preview server is not deployment infrastructure.

## Next week: template and league strategy decision

Before the next weekly report, evaluate a reusable template for ongoing favorite/underdog coverage. This pilot does not automatically enable next week's article. The shared analysis helper, result bars, responsive table, source receipts, counting method and social-card renderer are the starting point for a common College Football/NFL layout.

Whether the leagues need separate templates or only league-specific configuration and editorial strategy remains TBD. Review each league's coverage density, completed grading, meaningful sample size, publishing cadence and search intent before deciding. Keep their datasets and conclusions separate even if they share presentation code. Do not duplicate articles solely to target favorite and underdog keywords; evaluate whether each proposed article has a distinct, supported reader purpose.

Next-cycle work: separate this issue's Tulsa-specific narrative and eligibility guard from reusable presentation; choose the supported weekly angle from the actual ledger; review title, description and social copy; verify denominators, source receipts and correction fallback; and inspect desktop, mobile and the final share image before publication. Establish sample/coverage criteria during that review rather than inventing a threshold in this pilot.

The initial hypothesis is one shared visual template with reviewed league-specific copy and configuration. Compare reader response and available search/social evidence before investing in separate templates. Codex handles the article; Grok is reserved for separately authorized tweeting. The user plans to test this first production issue on the morning of September 11, 2026.

## Narrative refinement after production review

The user found the report/archive combination too dense and approved a story-led revision. The revised component replaces repeated labels and statistics with approximately 300 words connecting the week's results, Patterson's Tulsa hit and Toledo miss, and LSU/Notre Dame's concentration in the favorite record. The Tulsa receipt now precedes the underdog table. The extra hero statistic, game-level chart and separate concluding panel are removed; game-level context remains in the prose.

The full ledger is retained in server-rendered HTML inside a native, initially collapsed “Explore all Week 1 picks” disclosure. It supports keyboard use and works without JavaScript. Other week archives keep their existing expanded presentation. This supersedes the initial layout described above; the original editorial draft remains historical evidence.

The narrative/disclosure pattern is a candidate for next week's shared template review. No data, grading rules, methodology claims, canonical URL or metadata changed. Verification covers disclosure opening/closing, all 39 graded selections, mobile overflow, original receipt navigation, article accessibility and the existing fallback archives, in addition to the full repository release check.
