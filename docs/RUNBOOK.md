# Capture run

A run is on-demand. Target cadence launch week: Wed, Thu, Fri, Sat morning.
Grok Bot standing instructions: `bots/` (Scout / Grader / Recap). This runbook is the shared checklist; those files are what each Bot reads.

## Steps
1. CAPTURE — mine shows/columns/podcasts for roster voices' picks on the
   opening-weekend slate. Search: GameDay/First Take/Big Noon clips, The
   Herd, Klatt/Pate/Cowherd YouTube, staff-picks columns (CBS/ESPN/FOX/
   Athletic), McAfee Show (name the speaker!).
2. VERIFY — open every source URL; confirm the quote and the speaker.
   Unverifiable → drop.
3. CLASSIFY + MAP — clear first-person lean on a listed event → hard +
   eventSlug + side (yes=away). Weasel or season-long take → soft, no
   mapping. Futures picks map to futures slugs only — never onto a game.
4. FREEZE — refresh Kalshi cents for events whose picks changed; every
   price gets sourceUrl + sourcedAt. If a source publishes only one
   side's probability, record the complement (noCents = 100 − yesCents)
   and note in the run report that this convention is in use.
5. PUBLISH — `npx vitest run` && `npx next build` green, commit, push,
   verify live site.

## Intake table schema (staging docs, e.g. docs/week1-leans.md)
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |

Promotion: only verified hard rows become calls.json entries. The row's
pundit must exist in data/pundits.json; the eventSlug in data/events.json.

## Week 0 gate (Thursday 2026-08-27)
If a roster voice has a verified lean on unc-vs-tcu or ncsu-at-uva:
freeze those cents, set onHome true, map the calls. Otherwise Week 0
stays off home. Before flipping onHome, verify kickoff time and
network against a source and record that source URL in the run report.

## After every run, report
- new hard mapped calls (count, by event)
- which home cards still have an empty side
- any demoted/benched data (no source, no photo)
