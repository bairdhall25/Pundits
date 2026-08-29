# Capture assignment

Status: Operational. Live JSON wins.

Date: 2026-08-29. The deterministic hunt order comes from `node scripts/scout-density.mjs`, not hand-maintained P0 tables. Why Scout matters: `docs/scout-plan.md`. Source maps: `docs/pick-shows.md`, `docs/news-beats.md`, and `bots/scout-x.md`.

## How to hunt now

1. Run `node scripts/scout-density.mjs`, or read `## Dispatch` in today’s run file.
2. Shows, X, and News hunt `empty-side`, then `off-home`, then `thin`. Skip `dense`.
3. Shows includes the bounded sports-radio fallback in `docs/pick-shows.md`.
4. Add-list: `docs/add-list.md`. Bring onto home: `docs/bring-onto-home.json`.
5. Futures are not the Scout hunt target.

If this file and `data/` disagree, **`data/` wins**.

## Do not touch

Already booked or already rejected. Restaging is a miss.

- Finebaum `unc-vs-tcu-2026` no.
- Patterson `unc-vs-tcu-2026` yes.
- Fallica `texas-cfp-2026` no.
- Kanell `ncsu-at-uva-2026` yes.
- The morning-eight and every mapped hard row already in `data/calls.json`.
- `walker` is on the roster. Do not invent a game SU; hunt his actual picking segments.
- `wisconsin-vs-nd-2026` stays off home until a roster SU exists; then propose `onHome: true` plus a freeze.
- McAfee “50-burger” Clemson, Fallica “double-digit dog,” Kanell totals/ATS, Klatt “open with LSU is tough,” Eisen paraphrase, Simms AFC East, and Florio/Simms Super Bowl score as a Week 1 pick were already dropped.

Empty sides remain honest if nothing verifies. Group-vs-group, fantasy, props, callers, polls, and station consensus remain out of scope.

## Other bots

- **Coordinator:** writes Dispatch only.
- **Shows:** video, podcasts, TV clips, and bounded archived radio.
- **X:** status URLs only.
- **News:** bylined columns and named expert-pick pages.
- **Audit:** reopens every new hard source. A failure stays out of JSON.
- **Promote:** ships only audited roster rows; Candidates are not auto-rostered.
- **Grader:** acts only after an event is authoritatively final.
