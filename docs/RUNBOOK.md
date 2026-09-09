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
   `npm run check` green, commit, push, deploy with `npm run deploy`, verify.
   `npm run check:fast` is for agent edits only and is not a release gate.
   the story URL on https://pundits.pro/. If the URL set grew, resubmit
   https://pundits.pro/sitemap.xml in Search Console / Bing.

## Release verification

Cloudflare Pages project: `pundits`. GitHub Actions runs CI only; it does not deploy.

Kickoff chips (Today / Tomorrow) are computed in the browser from Eastern
time. A stale build does not freeze those labels. Deploy when the book
changes (new pick, grade, freeze), not because the calendar flipped.

### News sitemap freshness — unattended ownership: pending

`news-sitemap.xml` is static. Eligibility is the current two-day UTC window on
`firstPublishedAt` only. Unknown or future timestamps are excluded. An empty
news sitemap is valid; do not invent `firstPublishedAt` to keep it populated.
Ordinary sitemap URLs stay permanent when news entries expire. A valid news
sitemap or `NewsArticle` label is not Google News or Discover inclusion.

**Activation: pending.** A check-only workflow is not a rebuild, and a proposed
owner is not an active owner. This plan does not create a recurring task, CI
production credentials, or a new host. Do not call the news-sitemap fix
operationally complete until both are true:

1. `.github/workflows/news-sitemap-freshness.yml` is installed on `main` and has
   been observed to run.
2. Operator / Promote has actually activated the 6:30am ET empty-rebuild slot.

| Role | Duty |
|---|---|
| GitHub Actions `News sitemap freshness` | Check-only. Cron `20 10 * * *` (10:20 UTC; 6:20am EDT). Runs `node scripts/news-sitemap-freshness.mjs --live` (`npm run news:freshness`). Permissions: `contents: read`. Does not rebuild or deploy. |
| Operator / Promote (intended owner) | 6:30am ET empty rebuild through the existing local authenticated Cloudflare contract. No `data/*.json` edits. GitHub Actions cannot deploy this project. |

**Where failures appear:** GitHub → Actions → workflow `News sitemap freshness` (schedule or `workflow_dispatch`). Local equivalent: `npm run news:freshness`. Fixed-clock check of a built file: `node scripts/news-sitemap-freshness.mjs out/news-sitemap.xml --now 2026-09-10T10:30:00Z`.

**Recovery command:** from a scheduled worktree (`npm run worktree -- create --name news-sitemap-YYYYMMDD`) whose tree is clean and whose `HEAD` equals `origin/main`, with `GITHUB_PAGES` unset: `npm run deploy`. That rebuilds static output at deploy time, including a valid empty news sitemap when nothing remains in the two-day window. Interrupted deploys resume with `npm run deploy -- --from <stage>`. Do not add a backend, a new host, or CI Wrangler credentials to make this unattended.

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

1. Confirm `HEAD` equals `origin/main` and the working tree is clean. The local
   branch name need not be `main`; an isolated `codex/` worktree is valid after
   it has pushed and fetched.
2. Run `npm run check` with `GITHUB_PAGES` unset.
3. Review the generated `out/_redirects` and `out/sitemap.xml` when routes changed.
4. If calling the news-sitemap fix complete, confirm the daily freshness workflow
   is on `main` and that empty-deploy ownership is actually active (not merely
   proposed). Until then, unattended freshness stays **pending**.
5. Run `npm run deploy` from that same checkout. The command enforces commit
   identity (not a local branch named `main`), checks that the candidate
   preserves every URL in the current production sitemap, deploys, and then
   verifies the exact live preview metadata and decoded images before notifying
   IndexNow. Each deploy stage is visible and timed in
   `.agent-artifacts/deploy-summary.json`. Do not treat `npm run check:fast` as
   a substitute for this release path.

Interrupted production deploys resume from the failed stage when the generated
output still belongs to `HEAD`. Use `npm run deploy -- --from <stage>`. Rebuild
only when `check` failed. A live-verification failure after upload is reported
by SHA and retried; IndexNow remains non-blocking.

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

## Weekly measurement

Copy `docs/product/weekly-report.md` into `docs/runs/YYYY-MM-DD-weekly.md`. Capture table: `npm run metrics:capture` with timezone-qualified `--start`/`--end` and measured `--source-hours` when a rate is claimed. Three-slate dates come from approved rows in `docs/capture-targets.json`. Unavailable metrics stay `n/a` with a reason; do not infer retention from aggregate views.

## Intake table schema (staging docs, e.g. `docs/runs/YYYY-MM-DD.md`)
| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |

Promotion: only verified hard rows become calls.json entries. The row's
pundit must exist in data/pundits.json; the eventSlug in data/events.json.
`reasoning` is optional reader-facing copy of at most 60 words explaining
why the speaker picked that side. `note` is run-only routing context
(including SU vs ATS splits) and never enters `data/`. Audit omits a
defective capsule with `ok-no-reasoning` without failing a valid pick.

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
