# Weekly growth report

Status: Operational

Copy this file to `docs/runs/YYYY-MM-DD-weekly.md` (week-ending ET date). Fill every cell from the collection steps below. Write `n/a` plus why when a source is missing. A report not exposed is not zero. Do not infer repeat visitors from aggregate views. Self-replies and paid impressions are not organic success.

End with exactly one next experiment or decision.

```
# Weekly report — YYYY-MM-DD

Status: Evidence

Window (ET):
Operator:
Experiment status: pending / in progress / readout due
Do not mark the three-slate experiment successful in this file unless all three approved slates have settled and been reviewed.

## Capture
## Search
## Site
## Social
## Retention
## Three-slate
## One next experiment or decision
```

## Capture

Run `npm run metrics:capture` in this repository (optional `--as-of YYYY-MM-DD`, optional `--source-hours N` only when that duration was actually measured). Paste the table.

| Metric | How to reproduce | If missing |
|---|---|---|
| Mapped hard picks on approved targets | Output of `metrics:capture` | n/a |
| Approved-target coverage / empty sides | Same table | n/a |
| Missing locators | Same table | n/a |
| Promoted picks per source-hour | Pass `--source-hours` from a timed Scout window | No duration → n/a. Do not use “a run file exists” as hours. |
| Source-to-live lead | `firstPublishedAt` minus source time when both exist | Absent `firstPublishedAt` → n/a. Never substitute `sourceDate`. |
| Pre-kickoff lead | `firstPublishedAt` vs event kickoff | Same |
| Rework | Count Audit restage/correction rows in the week's `docs/runs/` | Missing notes → n/a, not zero |

Proposed targets in `docs/capture-targets.json` are not hunt coverage.

## Search

Google Search Console → Performance. Export the week. Keep these rows distinct; do not add them:

| Surface | Filter | If the filter is not in the UI |
|---|---|---|
| Web | Search type = Web | n/a — not exposed |
| News tab | Search type = News | n/a — not zero News clicks |
| Google News app/site | Appearance or Discover/News property if shown | n/a |
| AI Overviews / AI Mode | Search appearance filter if shown | n/a — Google not showing it is not zero citations |

Split clicks and impressions by page type using the URL:

- Game: `/picks/{slug}/` with no extra path segment
- Receipt: `/picks/{slug}/{punditId}/`
- Profile: `/pundits/{id}/`

Landing-page engagement after a search click uses on-site events in **Site**, not Search Console.

## Site

GA4 property `G-41GCD1K1PD`. Custom events only (do not double-count `page_view`):

| Question | Event | Breakdown |
|---|---|---|
| Game landings | `event_detail_open` | `page_type=game`, `surface` |
| Receipt landings | `pick_story_open` | `page_type=receipt`, `surface` |
| Profile landings | `pundit_profile_open` | `page_type=profile` |
| Evidence use | `source_open` | `source_type` |
| Native share | `share_intent` | `share_channel=native`, `page_type` |
| Attributed social visits | event params `acq_source` / `acq_medium` / `acq_campaign` / `acq_content`, or GA session source/medium `x` / `social` | Keep `paid` separate |

If the GA4 UI or export does not show a field, write `n/a`. Do not use unique-pageview vs view ratios as retention.

## Social

Use the Reviewer run `docs/runs/YYYY-MM-DD-social.md` and one new `docs/social/scoreboard.md` row. Classify every item: original / outside-thread-reply / self-link-reply / other-self-reply. Reach: organic / paid / n/a.

| Metric | Rule |
|---|---|
| Organic response 24h / 72h | Only if a snapshot was captured at that age. Current metrics after 72h are not a 24h reading. Pending if the post is younger than the window. |
| Outside responses | `outside-thread-reply` only |
| Our replies | `self-link-reply` + `other-self-reply`; listed, not counted as outside response |
| Paid | Separate row. Never fold into organic views |
| URL clicks, profile visits, follows | Logged-in X surface or operator export only. Else `n/a` |
| Attributed site engagement | GA `acq_*` / session campaign from bot-distributed links |

Unavailable metrics stay `n/a`, never invented zeros.

## Retention

Requires a consent-compatible GA4 returning-user or cohort report with an explicit sample size. If that report is not available, the whole section is `n/a`. Do not infer repeats from aggregate views.

## Three-slate

Copy the scorecard in `docs/runs/2026-09-08-three-slate-scorecard.md`. Dates come from approved rows in `docs/capture-targets.json`. Leave a slate pending until it has settled and been reviewed. Engineering's sample report is not a successful experiment.

## One next experiment or decision

One sentence. Prefer: keep formats that earn outside responses and useful visits; redirect Scout toward events/sources with demand; cut routine originals if response remains absent.
