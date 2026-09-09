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

Run `npm run metrics:capture` with an explicit timezone-qualified `--start` and `--end` (half-open `[start, end)`) and `--source-hours N` only when that duration was actually measured. Optional `--report path.json` supplies the same interval, hours, and evidence/run labels. Do not infer hours from episode runtime, elapsed wall-clock, or a run file existing. Paste the table.

Example:

```
npm run metrics:capture -- --as-of 2026-09-09 --start 2026-09-09T12:00:00Z --end 2026-09-09T16:00:00Z --source-hours 4
```

Two newly promoted mapped picks in that window print `Picks per source-hour: 0.5`. A historical pick published before `start` is omitted. Missing interval or effort prints `n/a` with a reason. A complete window with positive effort and zero qualifying promotions prints `0`. Approved unpublished targets print `unpublished; no mapped coverage`, never `empty=none`.

Optional report JSON (outside `data/`):

```
{
  "interval": { "start": "2026-09-09T12:00:00Z", "end": "2026-09-09T16:00:00Z" },
  "sourceHours": 4,
  "evidence": ["docs/runs/YYYY-MM-DD.md"],
  "runIds": ["YYYY-MM-DD-scout"]
}
```

Evidence and run IDs are labels only.

| Metric | How to reproduce | If missing |
|---|---|---|
| Mapped hard picks on approved targets | Coverage inventory in `metrics:capture`. Not the period numerator. | n/a |
| Newly promoted mapped picks | Count of unique mapped hard calls whose `firstPublishedAt` is a timezone-qualified instant in `[start, end)` | No interval, or imprecise stamps overlapping the interval → n/a. Do not backfill `firstPublishedAt`. |
| Approved-target coverage / empty sides | Same table. Mapped games keep honest YES/NO empties. Unpublished approved targets say `unpublished; no mapped coverage`. | n/a |
| Missing locators | Same table | n/a |
| Promoted picks per source-hour | Matching `--start`/`--end` and measured `--source-hours` | Missing/invalid interval or effort, uncertain numerator, or hours longer than the interval → n/a. Do not use “a run file exists” as hours. Zero qualifying promotions with positive effort → 0. |
| Source-to-live lead | Hour-level median of timezone-qualified `firstPublishedAt` minus `sourceDate` | Date-only or timezone-less stamps are excluded, not parsed as midnight. Negative intervals are inconsistent evidence and are excluded. Absent `firstPublishedAt` → n/a. Never substitute `sourceDate` for publication. |
| Pre-kickoff lead | Hour-level median of timezone-qualified kickoff minus `firstPublishedAt` | Date-only kickoff/publication pairs are excluded (a noon publication vs a September 9 date-only kickoff is not −12 hours). Display kickoff strings are not used. A negative lead is valid only with precise timestamps that show late publication. |
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
| Game landings | `event_detail_open` + `surface=event` | `page_type=game` |
| Receipt landings | `pick_story_open` + `surface=take` | `page_type=receipt` |
| Profile landings | `pundit_profile_open` | `page_type=profile` |
| Listing clicks to games | `event_detail_open` | `surface=home` / `ncaaf` / `nfl` |
| Listing clicks to receipts | `pick_story_open` | `surface=stories` / `book` / `profile` |
| Evidence use | `source_open` | `source_type` |
| Native share | `share_intent` | `share_channel=native`, `page_type` |
| Attributed social visits | event params `acq_source` / `acq_medium` / `acq_campaign` / `acq_content`, or GA session source/medium `x` / `social` | Keep `paid` separate |

Do not sum an event name across surfaces as landings. A listing click plus the destination view is two events. If the GA4 UI or export does not show a field, write `n/a`. Do not use unique-pageview vs view ratios as retention.

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
