# Week 1 report design implementation

Status: Evidence

September 10, 2026. Branch: `codex/week1-report-design`, based on `origin/main` at `11cb108`. Local implementation only; no production deployment or tweet.

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
