# Pundits roadmap

Status: Operational

The product goal is to make public sports predictions accountable: capture the original take, preserve the frozen market context, and close the loop when the event settles.

## Phase 0 — reliable shipping

Status: implementation complete; awaiting push and the first CI run.

- [x] Make Cloudflare Pages project `pundits` the sole production deployment contract.
- [x] Replace the GitHub Pages deployment workflow with CI-only verification.
- [x] Add a local Wrangler dependency and a reproducible `npm run deploy` command.
- [x] Add `npm run check` for tests, production build, routes, canonical URLs, sitemap, and redirects.
- [x] Document production and preview release steps.
- [x] Upgrade Next.js and affected transitive dependencies in a dedicated change, with a clean build and browser regression pass.
- [x] Add an on-demand live post-deploy smoke check for routes, canonical paths, and redirects.
- [x] Make social-preview integrity release-blocking with content-versioned cards, decoded-image checks, and live monitoring.
- [x] Keep authenticated Cloudflare deployment as an explicit local release step; CI verifies every change without holding production credentials.

Exit criteria: one documented deployment path, green CI, reproducible local preflight, and no GitHub Pages base path in production output.

## Phase 1 — close the accountability loop

- Treat this as the product gate: do not start new platform scope while open marquee games stay empty-side.
- [x] Grade the first settled slate through Grader and Promote (Week 0, 2026-08-29).
- [x] Verify pending, hit, and miss states on event, take, pundit, leaderboard, and home surfaces.
- Add result-state fixtures, including inconsistent grading evidence.
- [x] Publish a recap within 24 hours of settlement (`docs/runs/2026-08-31-recap.md`; next recap after Clemson).

Exit criteria: a visitor can move from the original quote and frozen price to the final result and record.

## Phase 2 — reduce conceptual load

- Keep The Book as a Takes view and remove its duplicate global-navigation state.
- Replace ambiguous `Live` labels with `Open` or `Pending` where appropriate.
- Frame the pre-result leaderboard as `Most on record`.
- Collapse secondary mobile filters behind `Filter & sort`.
- Reduce repeated copy on individual take pages without removing source evidence or SEO structure.
- Post-grade comprehension (2026-09-01): results-first table, no public YES/NO on Book/profiles, `vs` matchup copy, compact empty futures. Plan: `docs/superpowers/plans/2026-09-01-post-grade-comprehension.md`.

Exit criteria: a first-time fan can distinguish Picks, Takes, Pundits, pending status, and settled performance without learning internal vocabulary.

## Phase 3 — strengthen operations and speed

- Generate appropriately sized WebP or AVIF portraits.
- Add browser smoke checks at 320 px, 390 px, and desktop.
- Make every event kind explicit in data.
- Track source-to-capture, settlement-to-grade, and grade-to-recap time.

Exit criteria: routine releases are fast, assets are light, and editorial freshness is measurable.

## Phase 4 — prove growth before expanding scope

- Measure qualified event density, not raw call or page count: covered events, two-sided events, picks per featured event, and resolution horizon.
- Measure matchup-detail opens, take-story clicks, evidence-source clicks, settled-story shares, and return visits.
- Revisit licensed team logos only after the source, rights, fallback, and accessibility plan is approved.
- Revisit new modules or sports only after the accountability loop demonstrates repeat use.

Accounts, comments, betting controls, live odds, a backend, and additional sports remain out of scope until the core loop proves demand. Fantasy Football / player props: parked — `docs/fantasy.md`.
