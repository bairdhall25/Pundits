# Capture run

Status: Operational

A run is on-demand. Target cadence launch week: Wed, Thu, Fri, Sat morning.
Scout is the critical job (`docs/scout-plan.md`, `bots/scout.md`). Hunt order: `docs/board.md`. Mailbox: `docs/runs/YYYY-MM-DD.md` on GitHub, not a chat paste.

## Steps
1. CAPTURE — mine shows/columns/podcasts for roster voices' picks on the
   opening-weekend slate. Search: GameDay/First Take/Big Noon clips, The
   Herd, Klatt/Pate/Cowherd YouTube, staff-picks columns (CBS/ESPN/FOX/
   Athletic), McAfee Show (name the speaker!).
2. VERIFY — open every source URL; confirm the quote and the speaker.
   Unverifiable → drop.
   Sports-radio evidence must be a durable episode, clip, transcript, or
   show-note URL that Audit can reopen. Attribute the named personality,
   never the station, show, caller pool, poll, or anonymous consensus.
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
5. AUDIT — re-open new hard URLs (`bots/audit.md`). Failures stay out of JSON.
6. PUBLISH — promote verified hard rows into `data/calls.json` (unique
   `punditId` + `eventSlug`; quote, sourceUrl, and sourceDate on the row.
   Two speakers may share a URL).
   The next build mints a pick story at `/picks/{eventSlug}/{punditId}/`
   and lists it on `/stories/`. Do not paste article copy into JSON.
   `npm run check` green, commit, push, deploy with `npm run deploy`, verify
   the story URL on https://pundits.pro/. If the URL set grew, resubmit
   https://pundits.pro/sitemap.xml in Search Console / Bing.

## Release verification

Cloudflare Pages project: `pundits`. GitHub Actions runs CI only; it does not deploy.

Kickoff chips (Today / Tomorrow) are computed in the browser from Eastern
time. A stale build does not freeze those labels. Deploy when the book
changes (new pick, grade, freeze), not because the calendar flipped.
A 6:30am ET empty deploy is optional.

`npm run build` skips OG PNGs when data and `lib/og.ts` are unchanged. Use
`npm run og` to force a full card rebuild after OG layout changes.

Every generated landscape social card uses a content-derived `?v=` URL in
Open Graph and Twitter metadata. A quote, frozen price, grade, record, or card
layout change therefore gives link-preview crawlers a fresh asset URL without
changing the permanent page URL. `npm run check` validates every indexed
page's preview metadata and decodes every referenced image; blank, transparent,
oversized, malformed, or incorrectly sized cards fail the release.

The deploy command prepares an IndexNow hash manifest before upload and submits
only added, changed, or deleted sitemap URLs after live verification. It checks
the published key before notifying IndexNow and retries one verified 403 once;
IndexNow remains non-blocking because the sitemap is the durable discovery path.

## URL permanence (SEO-critical)

Data files are append-only. Never delete or rename a graded event, call, or
rostered pundit: every published URL is search equity, and a 404 burns it
permanently. Old weeks stay in `data/events.json` and `data/calls.json`
forever — they are the archive, not clutter. If a slug must change, add a 301
in `public/_redirects` (see the pre-season slug block there for the pattern).
Enforced: `npm run verify:static` maintains `docs/seo/permalinks.txt` (every
URL ever shipped in the sitemap) and fails the build if any of them stops
resolving. Commit ledger updates with the data that produced them.

Before deployment:

1. Confirm `main` is clean, pushed, and synchronized with `origin/main`.
2. Run `npm run check` with `GITHUB_PAGES` unset.
3. Review the generated `out/_redirects` and `out/sitemap.xml` when routes changed.
4. Run `npm run deploy` from `main` for production. The command enforces the
   clean/synchronized branch, checks that the candidate preserves every URL in
   the current production sitemap, deploys, and then verifies the exact live
   preview metadata and decoded images before notifying IndexNow.

For a branch preview, run `npm run check`, then use Wrangler with an explicit
non-main branch name. Do not use the production `npm run deploy` command.

`npm run verify:live` performs an Applebot-style sweep of all indexed live
pages and images and is also scheduled weekly in GitHub Actions. After
deployment, optionally spot-check:

- `/`
- `/stories/`
- `/book/`
- `/leaderboard/`
- `/ncaaf/` and `/nfl/`
- one event page
- one take story
- one pundit profile
- `/sitemap.xml`
- one bare pre-season URL redirect from `public/_redirects`

Do not set `GITHUB_PAGES` on Cloudflare or for a production-style local build.

## Intake table schema (staging docs, e.g. docs/week1-leans.md)
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |

Promotion: only verified hard rows become calls.json entries. The row's
pundit must exist in data/pundits.json; the eventSlug in data/events.json.

## Week 0 gate (Thursday 2026-08-27)
Done for both: Finebaum Dublin (`unc-vs-tcu-2026`) and Kanell Charlottesville (`ncsu-at-uva-2026`).
Before flipping onHome, verify kickoff time and
network against a source and record that source URL in the run report.
Chip Patterson UNC ML is rostered (`patterson`, Dublin YES). Brandon Walker is rostered (`walker`) with no mapped game yet — hunt BFW Saturday / Barstool CFB Show. Fantasy/props parked in `docs/fantasy.md`.

## After every run, report
- new hard mapped calls (count, by event)
- story paths minted (`/picks/{slug}/{pundit}/`)
- which home cards still have an empty side
- any demoted/benched data (no source, no photo)
