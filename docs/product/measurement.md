# Measurement framework

Status: Canonical

## Measurement principle

The early product should optimize for a trustworthy accountability loop and concentrated fan value, not raw pages, pundits, or scraped claims. Measurement must distinguish corpus growth from product use.

## Stage objective

The present objective is:

> Repeatedly cover events fans care about with verified named picks, grade those picks quickly and correctly, and turn the results into content people discover, share, or return to see.

## Early north-star candidate

Use **weekly verified-pick engagements** as the working north-star candidate: visits in which a person opens, shares, or follows through to evidence for a mapped pick or graded receipt.

This is a hypothesis until enough traffic exists to validate it. Raw sessions and raw page count are context, not product value.

## Operating scorecard

### Corpus quality

- New verified mapped picks.
- Newly promoted verified mapped picks per measured source hour in an explicit timezone-qualified `[start, end)` interval. Coverage inventory (mapped hard picks currently on approved targets) is a separate count, not the productivity numerator. The rate is `n/a` until both the interval and measured effort exist; do not divide lifetime inventory by a run's hours, and do not infer hours from episode runtime, wall-clock, or a run file existing. Zero qualifying promotions with positive measured effort is 0.
- Promoted picks per source/show.
- Hour-level source-to-live and pre-kickoff lead only from timezone-qualified instants. Date-only stamps are excluded from those medians, not parsed as midnight.
- Audit pass rate by source and Scout workflow.
- Rejection rate and reasons: vague, wrong speaker, wrong season, weak source, or semantic mismatch.
- Share of mapped picks with primary/original sources versus secondary quotation sources.
- Correction or dispute rate.

### Event density

- Tracked events with at least one verified pick.
- Events with picks on both sides.
- Median verified picks per featured event.
- Distinct pundits, outlets, and source programs per featured event.
- Share of homepage events with a recognizable named voice.
- Share of new picks resolving within 7, 30, and 180 days.

Event density matters more than adding another isolated future. A fan gets more value from three credible voices arguing about tonight's game than from three unrelated season-long assertions.

Do not present several voices from the same segment or repeated versions of one take as statistically independent consensus. Show the underlying people and sample size.

### Accountability operations

- Eligible settled picks graded.
- Median and p90 settlement-to-grade time.
- Median grade-to-recap time.
- Conflicting or incomplete grade evidence.
- Record reconciliation failures across public surfaces.

Target once grading begins: every objectively settled mapped pick is graded, with routine game picks updated within 24 hours. Tighten the target after several real slates establish the operating baseline.

### Acquisition

- Search impressions, clicks, and click-through rate by page type.
- Social impressions, engagements, link clicks, and shares by artifact type.
- Referral visits from covered pundits and outlets.
- Organic performance by earned-tag moment: Roll Call, Flowers, and Milestone.
- Tagged-pundit or outlet amplification: replies, reposts, and quote-posts; keep paid reach separate.
- Separate originals, outside-thread replies, and self-link replies. Unavailable metrics stay n/a.
- Indexed valid pages versus submitted valid pages.

### Activation and engagement

- Homepage-to-event detail open rate.
- Takes-feed-to-pick-story open rate.
- Evidence-source click rate.
- Share-button use and successful shares where measurable.
- Graded-receipt views.
- Email-interest view-to-success conversion by placement.

### Community tip operations

- Tips received and duplicate rate.
- Received-to-mailbox and received-to-Audit latency.
- Audit pass rate and promoted-tip rate.
- Featured-event coverage holes filled by a community tip.
- Tip handling time by source lane.

### Retention

- Seven-day and 28-day return rate.
- Share of visitors who view both a pre-event pick and a later result.
- Repeat visits to a pundit, team, event, or weekly archive.
- Email subscribers who later engage when alerts actually exist.

## Required event vocabulary

Behavioral analytics should use stable object IDs, never email addresses or quote text:

- `event_detail_open`: `event_slug`, `sport`, `surface`, `page_type=game`.
- `pick_story_open`: `event_slug`, `pundit_id`, `status`, `surface`, `page_type=receipt`.
- `pundit_profile_open`: `pundit_id`, `surface=profile`, `page_type=profile`.
- `source_open`: `event_slug`, `pundit_id`, `source_type`.
- `share_intent`: `artifact_type`, optional `event_slug`, optional `pundit_id`, optional `status`, `page_type`, `share_channel=native`. Profile shares omit `event_slug`.
- `filter_use`: `surface`, `filter_name`, `filter_value`.
- Existing email-interest events remain as implemented and must not include PII.
- `tip_form_view`, `tip_submit`, `tip_success`, and `tip_error`: `placement`, optional `event_slug`, optional `side_hint`, `page_path`, and optional `error_type`. Never send the submitted URL, pundit name, timestamp hint, or free text.

Do not add instrumentation merely because it is measurable. Each event should answer a named product question.

## Fire-once contract

GA4 `page_view` comes from the existing `gtag('config')` snippet on first load. Custom events are not a second page-view system. Do not add another analytics product, and do not sum `page_view` with `event_detail_open` / `pick_story_open` / `pundit_profile_open` as two page loads.

| Event | Fires once when | Named question |
|---|---|---|
| `event_detail_open` `surface=home` (or league) | Click from a listing card | Homepage-to-event (or league-to-event) open rate |
| `event_detail_open` `surface=event` | Game page view | Game-page landings, including search |
| `pick_story_open` `surface=stories` / `book` / `profile` | Click from that listing | Feed/profile-to-receipt movement |
| `pick_story_open` `surface=take` | Receipt page view | Receipt landings and evidence-ready views |
| `pundit_profile_open` | Profile page view | Profile landings |
| `source_open` | Click of evidence or Kalshi | Evidence-source click rate |
| `share_intent` `share_channel=native` | On-site Share sheet action | Native share use by page type |

`page_type` is `game` / `receipt` / `profile` so Search Console and on-site events can be compared on the same page contracts. Stable IDs only: `event_slug`, `pundit_id`. Never email, quote text, or submitted tip URLs.

Native site Share copies the canonical URL. Bot-distributed links are separate campaign URLs. See [weekly report](./weekly-report.md) for collection.

## Campaign links

Bot self-replies and other bot-distributed destination links use `utm_source=x`, `utm_medium=social`, `utm_campaign=organic-original` or `organic-reply`, and `utm_content=game|receipt|profile`. Paid links, if they ever exist, use `utm_medium=paid` and stay out of organic totals.

Those query params are not indexable URL variants: canonical tags, sitemaps, Open Graph `og:url`, and native share links stay on the slash-terminated canonical with no `utm_`. Campaign params on a landing URL survive trailing-slash normalization and are stored in `sessionStorage` as allowlisted `acq_*` fields so later custom events stay attributed after in-site navigation. Arbitrary query values are dropped so campaign fields cannot carry PII.

Novelty matching strips query strings. Searching live coverage by canonical `pageUrl` still matches a campaign self-reply.

## Retention

Seven-day and 28-day return, and “viewed a pick then a later result,” require a consent-compatible analytics cohort. Aggregate page views, even if they exceed sessions, are not repeat visitors. If GA4 returning-user or cohort reports are not available, write `n/a` and the sample size. Small cohorts stay labeled small; do not announce statistical significance.

## Stage gates

### Gate 1 — accountability works

- Multiple real events have settled.
- All eligible mapped picks have defensible grades.
- Public records reconcile.
- Grading and recap happen reliably without emergency manual repair.

### Gate 2 — distribution repeats

- Weekly search/social packages ship on schedule.
- At least one artifact type repeatedly earns discovery or sharing.
- Event and pick-story engagement is measurable.
- Traffic is not explained entirely by the operator's own promotion.

### Gate 3 — retention signal

- A cohort returns for later picks, results, records, or weekly archives.
- The return behavior is strong enough to identify a recurring job.

### Gate 4 — monetization experiment

- The customer and recurring job are explicit.
- The experiment does not weaken editorial independence or source trust.
- There is enough baseline activity to judge the test.
- The first test is narrow and reversible.

Do not invent hard revenue thresholds before four to six weeks of measurement. Use the initial baseline to set realistic targets, then record them in the decision log.

## Reporting cadence

- After each slate: capture, coverage, grade latency, errors, and recap performance.
- Weekly: acquisition, engagement, return behavior, and best/worst artifacts.
- Monthly: corpus composition, search compounding, partnership/competitor changes, and whether a stage gate has been reached.

Every report should end with one decision or experiment, not a dashboard dump.
