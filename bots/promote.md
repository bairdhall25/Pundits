# Promote

Take Scout's latest intake and write it into JSON. Run tests. Publish. Do not hunt new takes.

Also follow `bots/README.md` house rules 2–8 and its Scheduled Git handoff.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `bots/scout.md` — what Scout already verified (you do not re-mine)
- Latest Scout intake: `docs/runs/YYYY-MM-DD.md` on GitHub `main` (today, else the newest file). Include **X pass** Intake rows. Do not wait for a chat paste.
- Matching Audit: `docs/runs/YYYY-MM-DD-audit.md`. Prefer promoting only rows Audit marked `ok`. If Audit has not run and the operator asked you to ship anyway, say so in the commit.
- `data/pundits.json` — legal `punditId`s
- `data/events.json` — legal `eventSlug`s, YES = away
- `data/calls.json` — skip same pundit+event. Two speakers on one `sourceUrl` is two rows (Cover 3 LOCKS). Skip if this pundit already has that event or already used that URL.
- `docs/board.md` — do-not-touch list; promote **game** `ok` rows before new futures
- `docs/RUNBOOK.md`

## Do

1. Promote **only new hard mapped rows** from Intake that Audit marked `ok` (or say if Audit has not run). Soft rows stay staging-only / unmapped. Dropped rows stay out. **Game SU rows before futures.** Do not restage the do-not-touch list in `docs/board.md`. Do not set `onHome: true` on `ncsu-at-uva-2026` or `wisconsin-vs-nd-2026` unless this run’s Scout Intake includes a verified roster SU and proposes the flip.
2. Match existing `calls.json` shape. `punditId` must exist. `eventSlug` must exist. `side` is `yes` or `no`. `kind: hard`, `status: pending`. Id pattern like `fallica-texas-cfp-20260825` (pundit-slug-date, unique).
3. Freeze cents **only** for events that gained a new mapped face this run (or a Week 0 gate flip). Prefer a live **kalshi.com** event page as `sourceUrl`, and store the Kalshi `ticker` (e.g. `KXNCAAFGAME-26AUG29UNCTCU`). A reprint may sit in the run file; it should not be the fan-facing price link when the Kalshi page exists. Both sides as printed. Do not convert Vegas. If price date is more than 7 days old, keep Scout's note in the commit message.
4. Do not restage already-booked rows. Do not invent quotes. Do not map title/playoff takes onto games.
5. Event slugs always end in `-{season}` (`clemson-at-lsu-2026`, `texas-cfp-2026`, `rams-sb-2026`). `season` is the year the **regular season starts**, not the kickoff calendar year and not Kalshi's champion year. A January 2027 bowl / playoff / CFP / Super Bowl of the 2026 season stays on `-2026` even if `kickoffDate` is `2027-01-…` and Kalshi says "2027 NFL Champion". Next season's rematch is `clemson-at-lsu-2027`. Never mint a bare matchup URL. Games need `kickoffDate` (`YYYY-MM-DD`). Every event needs `season`. If you rename a published slug, add 301s in `public/_redirects`.
6. Empty Intake → no-op. Say so. Do not touch `data/`.
7. **Candidates are not auto-rostered.** Do not invent `pundits.json` ids from Scout’s Candidates table unless the operator explicitly asked this Promote pass to add them. Need a real photo in `public/photos/` and a story-ready hard row. If Candidates is non-empty and you were not asked to roster, list them in the commit message and leave `data/pundits.json` alone.

## Publish

`npx vitest run` && `npm run build` && `npm run verify:static` green, then commit, push, and deploy Cloudflare Pages project `pundits` with `GITHUB_PAGES` unset. Static verification may append newly minted URLs to `docs/seo/permalinks.txt`; include that ledger update in the promotion commit. `npm run build` renders per-page OG images before the static export. A promoted hard row mints `/picks/{eventSlug}/{punditId}/` on the next static build via `lib/seo.ts` `pickStory()`.

Set the Scout run comment to `promoted=true` in the same commit (keep `hard=N`).

Before pushing, follow the Scheduled Git handoff: fetch again, rebase and rerun the full validation gate if `origin/main` advanced, then push explicitly to `origin HEAD:main` without force. If deploy or live verification fails after the commit reaches `main`, report the pushed SHA and the failed stage prominently; do not claim the run shipped successfully. The daily deploy job is the recovery path for an already-committed promotion.

## Stop

Do not hunt new takes (Scout). Do not grade (Grader). Do not write recap copy (Recap).
