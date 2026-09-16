# College football Week 2 pick report

Status: Evidence

Prepared September 16, 2026. The user authorized writing and publishing this issue at the existing `/ncaaf/2026/week-2/` URL. Base revision: `8ffc303`. No editorial JSON was changed.

## Editorial decision

Lead with Howard and Portnoy calling Michigan against the tracked majority. Michigan's 17–10 win accounts for both underdog hits and all six favorite misses. Include Portnoy's Ohio State miss, distinguish selections from games, and keep the four-game coverage limit prominent. This is descriptive straight-up analysis, not spread grading, betting returns or a claim of predictive skill.

The published September 16 social index (`generatedAt: 2026-09-16T03:53:31.834Z`) and current-main ledger agree:

| Group | Picks | Hits | Misses | Distinct games |
|---|---:|---:|---:|---:|
| All | 32 | 22 | 10 | 4 |
| Favorites | 26 | 20 | 6 | 4 |
| Underdogs | 6 | 2 | 4 | 3 |

Thirteen pundits; zero pending, missing-price or exactly-50-cent selections; no duplicate pundit/event pairs or grade/score conflicts. Michigan is the only winning selected underdog. Favorites went 3–1 at game level. The three underdog teams are Michigan (Howard, Portnoy), Ohio State (Klatt, Meyer, Portnoy) and Kentucky (Herbstreit).

## Implementation

- Reuse Week 1's charts, table, method, broadcast styling and collapsed full ledger. Separate the reviewed Week 2 narrative from Week 1's Tulsa narrative.
- Keep self-canonical URL, CollectionPage schema, archive navigation and original receipts. Add issue-specific search/social copy and a corresponding share image through the existing renderer.
- Derive counts, names, scores, prices and dates from the ledger. Publish only this reviewed issue; keep later weeks on the normal archive. If the central Michigan result, winning selectors, losing-favorite distribution, companion miss or covered slate changes, fall back to the archive pending editorial review.
- Howard's legacy selection remains explicitly labeled as a reported selection. Do not manufacture dialogue or reasons.

## Methodology impact

No eligibility, evidence, grading, record or snapshot semantics change. Use the same below-50/above-50 dated-snapshot classification and straight-up scope as Week 1. No public methodology change is required. The full archive remains available to inspect all 32 selections.

## Verification

Release verification includes analytical regression/correction tests, the repository full check, desktop/mobile report and archive interaction, Week 1 regression, metadata/canonical checks and inspection of the rendered share image. Production verification and IndexNow submission use the existing deployment pipeline. Execution results are recorded in the release PR.
