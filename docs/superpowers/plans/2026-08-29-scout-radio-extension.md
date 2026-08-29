# Scout radio extension implementation plan

Status: Implemented

Date: 2026-08-29

## Outcome

Implement the approved Scout density architecture and make sports radio an explicit, bounded source lane inside Shows Scout. Radio picks remain picks by named people, never picks by a station or show.

## Product constraints

- Hunt qualified event density on homepage games, not raw pick volume.
- Count only mapped hard straight-up winner picks.
- YES remains the away team and NO remains the home team.
- Scout stages evidence in `docs/runs/`; it never edits `data/`.
- Radio audio must have a durable episode, clip, transcript, or show-note URL that Audit can reopen.
- Live-only audio, callers, anonymous station consensus, polls, ATS-only picks, totals, and season opinions do not qualify.
- Off-roster radio personalities are Candidates. Promote does not auto-roster them.

## Implementation

1. Add a deterministic density script and fixture tests that produce `## Dispatch` from live events, calls, and the bring-onto-home queue.
2. Split the current Grok Scout into Coordinator, Shows, X, and News jobs that share one run-file mailbox.
3. Add NCAAF and NFL show maps plus an explicit radio section inside the Shows map.
4. Add a radio pilot policy:
   - hunt only `empty-side`, `off-home`, and `thin` Dispatch games;
   - use national rostered shows first, then no more than two local archived shows per matchup;
   - perform one bounded radio fallback per sport/pick window, not another daily routine;
   - stop after the curated sources and two reasonable named searches per under-dense game;
   - record radio sources opened, hard rows, Candidates, and failures in Dropped.
5. Add News and add-list maps, update the run template, and retarget X to Dispatch.
6. Update bot standing prompts, cadence, product decision log, and Scout operating documents.

## Cost gate

Radio uses the existing Shows Scout and its existing schedule. Do not add a fourth hunter or enable Grok on-demand auto top-up for this pilot.

For the first two operating weeks:

- note Grok Bot weekly usage before and after the Shows pass;
- target no more than 10–15% incremental weekly usage from radio;
- keep a radio source when it produces at least one Audit-passing mapped pick per roughly ten durable sources opened, or when it repeatedly supplies a strategically important empty side;
- narrow or remove sources that repeatedly yield inaccessible audio, callers, ATS-only material, or general discussion.

These are operating gates, not guarantees. Grok's subscription allowance and source accessibility are external state.

## Validation

- Fixture tests cover empty-side, thin, dense, off-home, mixed NCAAF/NFL, futures exclusion, and malformed bring-onto-home input.
- The live CLI prints homepage games and excludes futures.
- Bot prompts preserve named-speaker attribution, SU-only mapping, candidate staging, and no-`data/` ownership.
- `npm test` passes.

No site UI, backend, deployment, or editorial JSON change is part of this plan.

## Implementation record

Completed 2026-08-29.

- Repository: density Dispatch, source maps, split Scout instructions, mailbox template, tests, and operating docs are in place.
- Grok Bot: the existing Shows Scout now uses the bounded radio workflow on its weekday 11:00 AM and Saturday 12:15 PM routines.
- Cost control: the Sunday 12:45 PM, weekday 4:00 PM, and weekday 9:00 PM Shows routines were paused, not deleted. No radio-only routine was added.
- Validation: the Scout fixture suite and full repository test suite passed. No `data/*.json` file was changed.
