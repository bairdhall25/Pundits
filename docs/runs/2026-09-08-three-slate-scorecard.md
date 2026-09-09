# Three-slate scorecard

Status: Evidence

Product manager: Codex. Engineer: Grok. Operational owners fill later reviews.

This is instrumentation plus a sample readout from data that actually exists on 2026-09-08. It is **not** a successful experiment. The three approved NFL Week 1 slates have not all settled and have not been reviewed under this scorecard.

Approved dates are from `docs/capture-targets.json` (`state: approved` only). Proposed college games are not slates.

| Slate | Event | Kickoff (ET date) | Status |
|---|---|---|---|
| 1 | Patriots at Seahawks (`patriots-at-seahawks-2026`) | 2026-09-09 | pending — not yet reviewed after settlement |
| 2 | 49ers vs Rams (`49ers-vs-rams-2026`) | 2026-09-10 | pending |
| 3 | Bills at Texans (`bills-at-texans-2026`) | 2026-09-13 | pending |

Reproduce capture rows with `npm run metrics:capture`. Reproduce search/social/site rows from [weekly-report.md](../product/weekly-report.md). `n/a` includes the reason.

## Capture (live JSON, 2026-09-08)

Dated sample of live JSON on 2026-09-08, not a CI invariant. Later Promote onto an empty side can change these counts.

| Slate | Mapped hard | Both sides | Empty | Missing locators | Picks / source-hour | Source-to-live | Pre-kickoff lead | Rework |
|---|---|---|---|---|---|---|---|---|
| Patriots at Seahawks | 1 | no | yes (Patriots) | 1 of 1 | n/a — no measured source-hours | n/a — `firstPublishedAt` absent | n/a — `firstPublishedAt` absent | n/a — not a JSON field |
| 49ers vs Rams | 4 | yes | none | 4 of 4 | n/a | n/a | n/a | n/a |
| Bills at Texans | 2 | no | yes (Bills) | 2 of 2 | n/a | n/a | n/a | n/a |

Totals: 7 mapped hard picks on 3 approved targets. Proposed targets are excluded.

## Search (dated baseline, not this experiment)

Source: 2026-09-08 growth audit, Search Console through 2026-09-06. Not a three-slate result.

| Surface | Impressions | Clicks | Notes |
|---|---|---|---|
| Web | 808 | 10 | Early site total through Sep 6. Not split by these three URLs in the audit export. |
| News tab | n/a | n/a | Audit: no News-tab search impressions. Not recorded as zero clicks of a News property we did not see. |
| Google News app/site | n/a | n/a | Not exposed in the audit export. |
| AI Overviews / AI Mode | n/a | n/a | Not exposed. |

Landing-page engagement by type after search clicks: n/a — no GA4 export in this engineering pass.

## Site (on-site analytics)

| Event | Available now | Notes |
|---|---|---|
| `event_detail_open` / `pick_story_open` / `pundit_profile_open` | Instrumented | `page_type` + object IDs. Counts pending a GA4 export after deploy. |
| `source_open` | Instrumented | Evidence / Kalshi. |
| `share_intent` | Instrumented | `share_channel=native` only. Profile shares included. |
| Bot-attributed visits | Instrumented | Allowlisted `acq_*` from campaign landing URLs. Native share has no UTM. |
| Retention 7/28 day | n/a | No consent-compatible cohort export. Aggregate views are not repeat visitors. |

## Social (organic vs paid vs self)

| Window | Organic originals | Outside-thread replies | Self-replies | Paid | 24h organic | 72h organic | URL clicks | Profile visits / follows |
|---|---|---|---|---|---|---|---|---|
| Audit sample 2026-09-05–07 (15 posts) | see audit: median 32 impressions, no likes/reposts in that sample | n/a in that sample breakdown | self-link replies exist as the destination pattern; not counted as outside response | ~6,900-view post is **boosted**; keep separate | n/a — no 24h snapshot | n/a — no 72h snapshot | n/a | n/a |
| Scoreboard week ending 2026-09-01 | Organic best 172 views (Dublin recap) | n/a | n/a | Ledger Move 6911 boosted | n/a | n/a | n/a | n/a |

Self-replies and paid impressions are listed so they cannot inflate organic success. Reviewer continues to classify each item.

## Experiment readout

**Not successful. Not failed. Not run.** The three approved slates have not been measured after settlement. Passing tests and shipping instrumentation do not establish audience demand.

## One next experiment or decision

After slates 1–3 settle, keep formats that earn outside responses and useful attributed visits; if organic originals still show no outside response, cut routine originals before adding volume. Do not change eligibility or erase losing receipts from this sample.
