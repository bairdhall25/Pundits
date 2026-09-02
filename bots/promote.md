# Promote

Take Scout's latest intake and write it into JSON. Run tests. Publish. Do not hunt new takes.

Also follow `bots/README.md` house rules 2–8 and its Scheduled Git handoff.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `bots/scout.md` — what Scout already verified (you do not re-mine)
- Latest Scout intake: `docs/runs/YYYY-MM-DD.md` on GitHub `main` (today, else the newest file). Include Intake rows from **Shows pass**, **X pass**, and **News pass**. Do not wait for a chat paste.
- Matching Audit: `docs/runs/YYYY-MM-DD-audit.md`. Prefer promoting only rows Audit marked `ok`. If Audit has not run and the operator asked you to ship anyway, say so in the commit.
- `data/pundits.json` — legal `punditId`s
- `data/events.json` — legal `eventSlug`s, YES = away
- `data/calls.json` — skip same pundit+event. Two speakers on one `sourceUrl` is two rows (Cover 3 LOCKS). Skip if this pundit already has that event or already used that URL.
- `docs/board.md` — do-not-touch list; promote **game** `ok` rows before new futures
- `docs/capture-policy.md` — doctrine: capture eagerly, mint lazily, feature reluctantly
- `docs/RUNBOOK.md`

## Do

1. Promote **only new hard mapped rows** from Intake that Audit marked `ok` (or say if Audit has not run). Soft rows stay staging-only / unmapped. Dropped rows stay out. **Bets** tables (totals/spreads/team totals) stay out of JSON until a later product pass. **Game SU rows before futures.** Do not restage the do-not-touch list in `docs/board.md`. Do not set `onHome: true` unless the operator explicitly asked this pass to flip that slug (docs/capture-policy.md rule 7). A watchlist SU is not a homepage flip.
2. Match existing `calls.json` shape. `punditId` must exist. Mapped rows need a legal `eventSlug`. `side` is `yes` or `no`. `kind: hard`, `status: pending`. Id pattern like `fallica-texas-cfp-20260825` (pundit-slug-date, unique). If Audit approved a non-empty Intake `reasoning` capsule, copy that source-grounded paraphrase into the optional call `reasoning` field exactly as staged. Do not generate, expand, or repair it during Promote; omit the field when blank.
3. Freeze cents **only** for events that gained a new mapped face this run (or a Week 0 gate flip). Prefer a live **kalshi.com** event page as `sourceUrl`, and store the Kalshi `ticker` (e.g. `KXNCAAFGAME-26AUG29UNCTCU`). A reprint may sit in the run file; it should not be the fan-facing price link when the Kalshi page exists. Both sides as printed. Do not convert Vegas. If price date is more than 7 days old, keep Scout's note in the commit message.
4. Do not restage already-booked rows. Do not invent quotes. Do not map title/playoff takes onto games.
5. **When to mint (docs/capture-policy.md rule 6):** create a new event only with ≥1 verified SU in hand for it, or when its slug is in `docs/bring-onto-home.json`. Never mint ahead of both — a pickless, unwatched event is a dead row. New events are born `onHome: false` and, when a Kalshi market exists, get their freeze (cents + ticker + sourceUrl + sourcedAt) **in the same commit**. No freeze backfills. Event slugs always end in `-{season}` (`clemson-at-lsu-2026`, `texas-cfp-2026`, `rams-sb-2026`). `season` is the year the **regular season starts**, not the kickoff calendar year and not Kalshi's champion year. A January 2027 bowl / playoff / CFP / Super Bowl of the 2026 season stays on `-2026` even if `kickoffDate` is `2027-01-…` and Kalshi says "2027 NFL Champion". Next season's rematch is `clemson-at-lsu-2027`. Never mint a bare matchup URL. Games need `kickoffDate` (`YYYY-MM-DD`). Every event needs `season`. If you rename a published slug, add 301s in `public/_redirects`.
6. Empty mapped Intake → no-op for calls. Say so. **Never delete events** (docs/capture-policy.md rule 9). Audit `ok-unmapped` overflow rows: if the operator asked this pass to mint them, mint the event `onHome: false` with freeze in the same commit (step 5) and write the mapped call. If not asked, list them in the commit message and leave `data/`.
7. **Candidates are not auto-rostered.** Do not invent `pundits.json` ids from Scout’s Candidates table unless the operator explicitly asked this Promote pass to add them. Follow `docs/product/roster-growth.md`: association (guest/fill-in on a roster factory) may be eligible; a team analyst picking their own team is not a pundit — never roster those even if asked without an operator override of that definition. If Candidates is non-empty and you were not asked to roster, list them in the commit message and leave `data/pundits.json` alone.

8. **Roster add (when the operator asked this pass).** Do not hand-edit a subset of files. Prefer the official X avatar for the handle when it is a usable face. If it is not (full-body, logo, meme), fall back to a Commons / outlet / talent still. Show the operator the source, wait for confirm, write `public/photos/{id}.jpg|png`, then run `node scripts/roster-add.mjs apply docs/runs/YYYY-MM-DD-roster-{id}.json`. The helper fail-closes unless photo, `pundits.json`, mapped hard SUs, `bots/scout-x.md` handle, `docs/pick-shows.md` factory voice, and `docs/roster-pipeline.json` are all present. Spec: `docs/superpowers/specs/2026-09-02-roster-promotion-design.md`. Then `npx vitest run`. Do not download the photo inside the helper. Do not ship Bets rows. Do not flip `onHome`.

## Publish

`npx vitest run` && `npm run build` && `npm run verify:static` green, then commit, push, and deploy Cloudflare Pages project `pundits` with `GITHUB_PAGES` unset. Static verification may append newly minted URLs to `docs/seo/permalinks.txt`; include that ledger update in the promotion commit. `npm run build` renders per-page OG images before the static export. A promoted hard row mints `/picks/{eventSlug}/{punditId}/` on the next static build via `lib/seo.ts` `pickStory()`.

Set the Scout run comment to `promoted=true` in the same commit (keep `hard=N`).

Before pushing, follow the Scheduled Git handoff: fetch again, rebase and rerun the full validation gate if `origin/main` advanced, then push explicitly to `origin HEAD:main` without force. If deploy or live verification fails after the commit reaches `main`, report the pushed SHA and the failed stage prominently; do not claim the run shipped successfully. The daily deploy job is the recovery path for an already-committed promotion.

## Stop

Do not hunt new takes (Scout). Do not grade (Grader). Do not write recap copy (Recap).
Scores (`awayScore`, `homeScore`, `resultUrl`) may be written as soon as the authoritative box score exists, even if some mapped calls on that slug are still pending. Do not invent scores.
