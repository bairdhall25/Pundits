# Pundits — v1 Public Launch ("Opening Weekend")

> Status: Historical. Durable decisions adopted from this specification now live in `docs/product/`; its GitHub Pages deployment guidance is obsolete.

Date: 2026-08-25
Status: Current — extends the 2026-08-24 prototype spec for the first public share. Where they conflict, this document wins.

## Problem

Sports media rewards heat, not accuracy. Pundits do not carry a public record. A take is an unpriced bet. Kalshi already prices the same outcomes. Pundits never have to put the money down.

## What v1 is

The existing prototype (worktree `.worktrees/pundits-prototype`: Next.js static export on GitHub Pages, games-first home, futures peek row, The Table, The Book) hardened to a **publicly shareable, fully accurate** site for the 2026 opening weekend — CFB Week 1 (Sep 3–7) and NFL Week 1 (Sep 9–14).

Kalshi is the ruler. Clear first-person leans map onto frozen Yes/No prices as implied $100 picks. Everything on the page is real: real people, real photos, real quotes at real URLs, real cents with per-price sources.

## Launch decisions (2026-08-25, approved)

1. **Ship gate: Friday/Saturday Sep 4–5, cards full.** Build now; run capture Wednesday–Saturday as picks actually publish (Big Noon/podcasts Wed–Fri, staff-picks columns Thu–Fri, College GameDay Sat 9/5 from Baton Rouge). Share when the marquee cards have real faces on both sides. The MOCK banner comes off only when the last illustrative quote is purged.
2. **Roster: go wide (~40).** Union of the current 11 and the verified candidate lists in `docs/roster-20.md` (~41 after dedup). Every pundit gets `sport: "ncaaf" | "nfl" | "both"` (McAfee is `both`). **No verified photo → not shipped** (Schrager, Nick Wright, Matthew Berry sit out unless a press photo is sourced during the build).
3. **Week 0 (Sat Aug 29: UNC–TCU Dublin, NC State–Virginia) appears on home only if a v1 roster voice has a verified lean on it by Thursday.** Otherwise home leads with Week 1 labeled "Opening weekend."
4. **Invented 2025 records are cut.** The leaderboard ranks by this week's live activity (mapped picks, pending count). 2026 records start 0–0 and grow honestly. Backfilling a real 2025 record is post-v1 work.

## Product rules (capture integrity — enforce verbatim)

- Map **clear first-person leans only**. Weasels (could, if healthy, I like, chance, sleeper, "I don't know if they win it all") stay unmapped `soft` in The Book.
- Do **not** stretch a futures pick onto a game (Herbstreit "ND wins the title" is not ND vs Wisconsin).
- Do **not** attribute McAfee Show guest picks to Pat McAfee. Name the speaker (A.J. Hawk and Darius Butler picks are theirs, never Pat's).
- Empty sides are OK. Fake faces are not. Illustrative/placeholder quotes never ship.
- Cents come from a Kalshi freeze only, **each price with its own `sourceUrl` + `sourcedAt`**. Never convert sportsbook moneylines without a Kalshi reprint.
- Quotes must be verified at their source URL before entering the ledger. If a quote cannot be verified, drop it.
- No pundit ships without a real verified photo of that person.

## Information architecture (unchanged from prototype, listed for completeness)

| Surface | Job |
|---|---|
| Home (`/`) | This-weekend games first (NCAAF, then NFL), each card YES faces vs NO faces with frozen cents; then futures peek row, The Table peek, The Book peek. |
| Event permalink (`/picks/[slug]`) | One card alone — the shareable object. (The app's committed copy decision is "picks, not bets"; the legacy `/bets/[slug]` route is removed.) |
| Leaderboard | Live-activity board (mapped picks, pending counts). 2026 all 0–0 at launch. |
| The Book | Every captured take, hard and soft; mapped calls show the Kalshi strip. |
| Pundit profile (`/pundits/[id]`) | Photo, sport tag, implied $100 book (pending at risk), full book. ×~40. |

## Verified opening-weekend slate (fact-checked 2026-08-25, sources in `docs/week1-leans.md`)

- NCAAF: Thu 9/3 Colorado at Georgia Tech (ESPN) · Fri 9/4 Miami at Stanford (ESPN) · Sat 9/5 Baylor vs Auburn (ABC, Atlanta), Boise State at Oregon (CBS), Clemson at LSU (ABC 7:30) · Sun 9/6 Ole Miss vs Louisville (ABC, Nashville), Wisconsin vs Notre Dame (NBC, Lambeau) · Mon 9/7 SMU at Florida State (ESPN).
- NFL: **Wed 9/9** Patriots at Seahawks (NBC Kickoff — Wednesday is real, moved off Rosh Hashanah) · Thu 9/10 49ers vs Rams (Melbourne, Netflix, Rams home) · Sun 9/13 Bills at Texans (CBS 1:00), Commanders at Eagles (FOX 4:25), Cowboys at Giants (SNF) · Mon 9/14 Broncos at Chiefs (MNF).
- Week 0 (conditional): Sat 8/29 UNC vs TCU (Dublin), NC State at Virginia.

## Data model

Static JSON is the whole truth. No backend, no database, no cron. GitHub Pages static export stays the host.

- `data/pundits.json` — ~40 entries: `id`, `name`, `outlet`, `photo`, `sport`. No records stored on the pundit.
- `data/events.json` — per event: `slug`, `kind` (`game` | `future`), `title`, `contractName` (actual Kalshi contract/ticker), teams, kickoff, network, `yesCents`, `noCents`, **`sourceUrl`, `sourcedAt` per event**, `onHome`, `sport`, `homeRank`. Known defect to fix: the Rams Super Bowl 16¢/86¢ entry is corrupt and must be re-frozen.
- `data/calls.json` — per call: `id`, `punditId`, `claim` (verbatim), `source`, `sourceUrl`, `sourceDate`, `kind` (`hard`|`soft`), `subject`, `paysOn`, `status` (`pending`|`hit`|`miss`), optional `eventSlug` + `side` (`yes`|`no`) when mapped. Convention: game events are framed so YES = away team wins; `contractName` records the real Kalshi contract so the convention can't silently invert.

**Intake format:** capture runs (Grok's or Claude's) stage findings in `docs/` tables with columns `pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft` (`docs/week1-leans.md` is the current instance). A human-or-agent mapping pass promotes verified hard rows into `calls.json`. Docs are staging; JSON is truth.

## The capture run (process, not software)

A run is a checklist executed on demand — target cadence Wed, Thu, Fri, Sat morning before the Friday/Saturday share:

1. **Capture** — mine shows/columns/podcasts for roster voices' opening-weekend picks.
2. **Verify** — every quote checked at its URL; correct speaker; drop what can't be verified.
3. **Map** — clear leans get `eventSlug` + `side`; weasels stay `soft` unmapped.
4. **Freeze** — refresh Kalshi cents; each price gets `sourceUrl` + `sourcedAt`.
5. **Publish** — build, deploy, click the live site like a fan.

## Front-end work (delta on existing app; screenshot critique 2026-08-25)

- Populated side renders **first** on mobile stacking; an empty side collapses to one thin row.
- Faces up from ~36–44px to 48–56px minimum (the spec promise is *faces*).
- Desktop hero uses the width (type scales past the current 68px cap, or first marquee card sits beside the hero).
- Peek carousels become 4-up grids at ≥1024px; "swipe" hint is mobile-only.
- Kalshi cents move up a contrast tier (they are load-bearing, currently dim 11px).
- Top nav gets a scroll affordance at small widths (fade or partial item), matching the jump chips.
- Leaderboard/Table reworked per launch decision 4 (activity board, no invented 2025 column).

## Honesty

Footer on every page: hypothetical $100 · Kalshi snapshot, not live · not affiliated with Kalshi or the pundits · they did not place these picks. Every price and quote traceable to a source URL.

## Ship gates (all must pass before the public share)

1. Zero illustrative quotes anywhere; every claim verified at its URL with the correct speaker.
2. Every cent has `sourceUrl` + `sourcedAt`; no null-cent event on home.
3. Schedule facts verified (done 2026-08-25; re-check kickoff times at freeze).
4. Every shipped pundit has a verified real photo.
5. Honesty footer on every page; MOCK banner removed.
6. Marquee cards (Clemson–LSU, ND–Wisconsin, Patriots–Seahawks) have at least one real face, ideally both sides.
7. Phone (390) and desktop (1440) pass the front-end delta list above.
8. `vitest` green, `next build` clean, live URL clicked end-to-end.

## Non-goals for v1

- Backend, database, cron, live Kalshi API (a run is edit-JSON + redeploy).
- User accounts, comments, betting/"pick this" buttons, X posting.
- Real 2025 record backfill (post-v1; nothing invented meanwhile).
- GameDay-picks module (Eaves's ask — parked until the season, per 2026-08-25 decision in `docs/feedback.md`).
- Sports beyond FBS CFB + NFL.

## Errors

- No matching Kalshi contract → call stays Book-only.
- Ambiguous take → `soft`.
- Pundit with zero calls → profile still works ("No calls yet").
- Missing/unverifiable photo → pundit benched, not faked.
- One source fails during a run → publish the rest.

## References

- `docs/roster-20.md` — verified 40-candidate roster with photo URLs (2026-08-25).
- `docs/week1-leans.md` — verified Week 0/Week 1 leans with sources (2026-08-25).
- `docs/feedback.md` (worktree) — Eaves/Logan reactions and decisions.
- 2026-08-24 prototype spec — base design this extends.
