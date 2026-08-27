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
   Games carry `kickoffDate` and `season`. Event slugs always end in
   `-{season}` (`clemson-at-lsu-2026`). `season` is the year the
   regular season starts, not the kickoff calendar year: a January 2027
   playoff/bowl/CFP/Super Bowl of the 2026 season stays `-2026` (Kalshi
   "2027 NFL Champion" is that same season). Next season's Clemson-LSU
   is `clemson-at-lsu-2027`, not an overwrite. Bare pre-season URLs 301
   via `public/_redirects`. Display the span as `2026–27`.
4. FREEZE — refresh Kalshi cents for events whose picks changed; every
   price gets sourceUrl + sourcedAt. If a source publishes only one
   side's probability, record the complement (noCents = 100 − yesCents)
   and note in the run report that this convention is in use.
5. PUBLISH — promote verified hard rows into `data/calls.json` (unique
   `punditId` + `eventSlug` + `side` + quote + sourceUrl + sourceDate).
   The next build mints a pick story at `/picks/{eventSlug}/{punditId}/`
   and lists it on `/stories/`. Do not paste article copy into JSON.
   `npx vitest run` && `npx next build` green, commit, push, verify
   the story URL on https://pundits.pro/. If the URL set grew, resubmit
   https://pundits.pro/sitemap.xml in Search Console / Bing.

## Intake table schema (staging docs, e.g. docs/week1-leans.md)
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |

Promotion: only verified hard rows become calls.json entries. The row's
pundit must exist in data/pundits.json; the eventSlug in data/events.json.

## Week 0 gate (Thursday 2026-08-27)
If a roster voice has a verified lean on unc-vs-tcu-2026 or ncsu-at-uva-2026:
freeze those cents, set onHome true, map the calls. Otherwise Week 0
stays off home. Before flipping onHome, verify kickoff time and
network against a source and record that source URL in the run report.

## After every run, report
- new hard mapped calls (count, by event)
- story paths minted (`/picks/{slug}/{pundit}/`)
- which home cards still have an empty side
- any demoted/benched data (no source, no photo)
