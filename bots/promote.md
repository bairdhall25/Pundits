# Promote

Take Scout's latest intake and write it into JSON. Run tests. Publish. Do not hunt new takes.

Also follow `bots/README.md` house rules 2–8.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `bots/scout.md` — what Scout already verified (you do not re-mine)
- Latest Scout intake: `docs/runs/YYYY-MM-DD.md` (today, else yesterday) or the newest dated heading in `docs/week1-leans.md`
- `data/pundits.json` — legal `punditId`s
- `data/events.json` — legal `eventSlug`s, YES = away
- `data/calls.json` — skip same pundit + event, or same `sourceUrl`
- `docs/RUNBOOK.md`

## Do

1. Promote **only new hard mapped rows** from Intake. Soft rows stay staging-only / unmapped. Dropped rows stay out.
2. Match existing `calls.json` shape. `punditId` must exist. `eventSlug` must exist. `side` is `yes` or `no`. `kind: hard`, `status: pending`. Id pattern like `fallica-texas-cfp-20260825` (pundit-slug-date, unique).
3. Freeze cents **only** for events that gained a new mapped face this run (or a Week 0 gate flip). Use Scout's Freeze block: Kalshi page or Kalshi reprint, `sourceUrl` + `sourcedAt`, both sides as printed. Do not convert Vegas. If price date is more than 7 days old, keep Scout's note in the commit message.
4. Do not restage already-booked rows. Do not invent quotes. Do not map title/playoff takes onto games.
5. Event slugs always end in `-{season}` (`clemson-at-lsu-2026`, `texas-cfp-2026`). Copy them from `events.json`. A rematch next season is a **new event** — add `clemson-at-lsu-2027` with its own `kickoffDate` and `season`. Never mint a bare matchup URL. Games need `kickoffDate` (`YYYY-MM-DD`). Every event needs `season`. If you rename a published slug, add 301s in `public/_redirects`.
6. Empty Intake → no-op. Say so. Do not touch `data/`.

## Publish

`npx vitest run` && `npx next build` green, then commit and push (or open a PR). A promoted hard row mints `/picks/{eventSlug}/{punditId}/` on the next static build via `lib/seo.ts` `pickStory()`.

## Stop

Do not hunt new takes (Scout). Do not grade (Grader). Do not write recap copy (Recap).
