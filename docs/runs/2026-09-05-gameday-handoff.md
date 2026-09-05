# GameDay handoff — 2026-09-05

Status: Operational
Operator: driving to Folly Beach; laptop open after GameDay.
Resume from this file, not chat. Live JSON on `origin/main` wins.

HEAD at write: `767f9e9` — Friday Week 1 grades shipped and deployed.

## Resume prompt (paste after GameDay)

```
Resume from docs/runs/2026-09-05-gameday-handoff.md on origin/main.
Operator is back after College GameDay. Work in a scheduled worktree.
Do not hunt from the dirty operator checkout.

If GameDay desk locks exist and are not yet in data/:
1) Shows (or this session) stages named SUs into today's run file
2) Audit
3) Promote onto clemson-at-lsu-2026 only (operator override of dense-skip for GameDay desk)
Then grade Saturday finals as they settle, Clemson last. Recap within 24h of Clemson.
```

## What shipped this morning

Promote GRADE-only. SHA `767f9e9`. Live verified.

| call | side | result | status |
|---|---|---|---|
| clay-travis-miami-at-stanford-20260903 | yes (Miami) | Miami 45–6 | hit |
| patterson-toledo-at-michigan-state-20260903 | yes (Toledo) | Toledo 20–30 | miss |

Proposal + promotion note: `docs/runs/2026-09-05-grade.md`.
Live: [Clay Miami HIT](https://pundits.pro/picks/miami-at-stanford-2026/clay-travis/), [Patterson Toledo MISS](https://pundits.pro/picks/toledo-at-michigan-state-2026/patterson/).

`cards.json` `generatedAt` 2026-09-05T12:38:33Z. Kickoff chips are client-side; no empty deploy needed for the clock.

## Operator decisions this pass (not doctrine rewrites)

1. **GameDay desk SUs on Clemson–LSU ship anyway.** Dense-skip stays for ordinary hunting. This factory is the exception. Capture every named first-person winner from the GameDay desk onto `clemson-at-lsu-2026`. Do not mint a second event. Do not skip new faces because the card is already 2–7.
2. **One card, scan vs ledger.** Homepage scan may truncate. Event page lists everyone. Do not invent a Clemson pick to “balance” a LSU pile. Wrighster + Kanell remain the dog story.
3. **Do not redesign the hero before kickoff.** Mobile hero already shows 2 faces/side then `+N more`. Desktop scan currently lists all faces. If Promote lands a wall of LSU names, collapse desktop scan the same way — after the book change, not before. Social Split already overflows at 4 (`+N`).
4. **Hold through 2026-09-05:** no Bets pages, fantasy, bulk roster, extra homepage games, Wisconsin `onHome` flip, freeze refresh unless a new mapped face actually lands.

## GameDay voices (already rostered)

`herbstreit`, `saban`, `howard`, `davis`, `mcafee` (Pat only), `coughlin` (Stanford Steve; never `mcafee`).
Window: College GameDay Saturday, Baton Rouge, Clemson at LSU. Analysis / title talk / “50-burger” weasels ≠ SU. First-person winner only.
`pick-shows.md` expected Coughlin Clemson YES. Name the speaker. Guests stay the guest.

Big Noon is Bloomington, not Clemson. Meyer / Klatt / Quinn / Leinart / Ingram / Fallica map to *their* games (empty-side NFL / Wisconsin / overflow), not onto Clemson unless they actually pick it.

## Clemson card now (live)

YES Clemson 23¢: Wrighster, Kanell.
NO LSU 78¢: Pate, Finebaum, Staples, McElroy, Clay Travis, Fornelli, Pollack.
Hero on `/`. Kickoff Sat 7:30 ET ABC. Status `Open` until the game is actually underway, then `Live now` / `In play`. After the box: scores even if some calls still pending; `Final · Grading` until every mapped call is graded.

## Saturday mapped games (grade when box + Kalshi agree)

| slug | when | notes |
|---|---|---|
| baylor-vs-auburn-2026 | 3:30 ET ABC Atlanta | 1–2 (Elliott YES / Kanell+Pollack NO). Grade first this afternoon. |
| ucla-at-cal-2026 | Sat | 2–3 |
| fiu-at-usf-2026 | Sat | empty USF |
| oklahoma-state-at-tulsa-2026 | Sat | Patterson Tulsa |
| boise-state-at-oregon-2026 | Sat | Kanell Oregon |
| western-michigan-at-michigan-2026 | Sat | Kanell Michigan |
| clemson-at-lsu-2026 | 7:30 ET ABC | product game; grade tonight including GameDay rows; recap within 24h |

Skip settled: `unc-vs-tcu-2026`, `ncsu-at-uva-2026`, `miami-at-stanford-2026`, `toledo-at-michigan-state-2026`.
Wisconsin vs ND is Sunday 7:30 ET NBC Lambeau — still empty YES; off-home until operator flip. NFL empty YES (Pats / 49ers / Bills) still open; not tonight’s grade.

YES = away. Confirm school/ESPN box **and** Kalshi. If they disagree, stop.

## Capture mailbox (morning was dry)

`docs/runs/2026-09-05.md` Dispatch from ~8:10 AM ET is **stale on Miami** (now Final). Coordinator should refresh before the next hunt.
Shows sidecar `docs/runs/2026-09-05b-morning.md`: hard=0. GameDay/Big Noon were not on air (~8:15 AM). Re-open after locks hour.
X morning: empty Intake. X MCP `client-not-enrolled`; sweep was @Pundits_ Chrome.

After GameDay: append a Shows pass to today’s run (do not wipe). Audit if `hard>0`. Promote mapped `ok` / `ok-no-reasoning` GameDay rows onto Clemson. Mint overflow only if operator asks.

## Social

Saturday: 3–5 posts (Slate, Live register in window, Receipts as games settle, selective Flowers). Reply Guy heavy, 25-cap. Link in first self-reply. Tag only Roll Call / Flowers / Milestone. Miss receipts stay untagged. Dead air: post nothing. Cards at https://pundits.pro/social/cards.json.

## After Clemson final

1. Grader writes/appends `docs/runs/2026-09-05-grade.md` (preserve the Friday section). Never `data/`.
2. Promote ships `status` + `gradedAt` on calls; `awayScore` / `homeScore` / `resultUrl` on events. Match Week 0 / Friday shape. Update live-ledger tests if they assert counts/dates/week recap.
3. Scheduled worktree. `npm run check` with `GITHUB_PAGES` unset. Fetch, rebase, `git push origin HEAD:main` no force. Deploy from the same worktree.
4. Recap within 24h (`bots/recap.md`). Recap does not write JSON.
5. Ping when live, e.g. `grade shipped: Clemson–LSU …`

## Do not

Hunt from the dirty operator checkout (seo-plan, og.test, site.ts, finebaum.jpg, untracked plans/tmp). Do not Scout/Audit/Promote/Grade from that tree. Do not restage booked Clemson faces. Do not flip `onHome`. Do not freeze cents unless a new mapped face lands. Do not call unresolved games live. Do not ship Bets.

## Next session git

```
git fetch origin
npm run worktree -- create --name promote-20260905-gameday
# or: git worktree add -b codex/promote-20260905-gameday .worktrees/scheduled/promote-20260905-gameday origin/main
```

Then `npm ci` in that worktree. Never borrow operator `node_modules`.
