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
- Promoted picks per capture hour and per source/show.
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

- `event_detail_open`: `event_slug`, `sport`, `surface`.
- `pick_story_open`: `event_slug`, `pundit_id`, `status`, `surface`.
- `source_open`: `event_slug`, `pundit_id`, `source_type`.
- `share_intent`: `artifact_type`, `event_slug`, optional `pundit_id`, `status`.
- `filter_use`: `surface`, `filter_name`, `filter_value`.
- Existing email-interest events remain as implemented and must not include PII.
- `tip_form_view`, `tip_submit`, `tip_success`, and `tip_error`: `placement`, optional `event_slug`, optional `side_hint`, `page_path`, and optional `error_type`. Never send the submitted URL, pundit name, timestamp hint, or free text.

Do not add instrumentation merely because it is measurable. Each event should answer a named product question.

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
