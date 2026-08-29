# Kalshi receipt links

> Implemented in-session after this plan. Fan-first cards; Kalshi is the receipt on pick detail.

**Goal:** Saturday (and other home-board) events carry a real Kalshi event ticker and kalshi.com URL. Pick-detail Market details shows the ticker and **Open on Kalshi →**. Homepage stays teams + quotes + cents. No Trade CTA. No live odds.

**Architecture:** Optional `ticker` on `Event`. `sourceUrl` on those events is the kalshi.com event page (reprint URLs leave the fan tap). Helpers in `lib/kalshi.ts` detect a Kalshi URL and build one from a ticker. `EventCard` in **detail** mode links the Kalshi badge and expands Market details. Scan/home cards keep a non-clickable Kalshi label so the whole card stays a pick permalink.

**Not in scope:** API worker, live reprice, YES/NO on scan cards, affiliation copy, homepage lede rewrite, auto-freeze on every deploy.

## Files

- `lib/types.ts` — `ticker?: string`
- `lib/kalshi.ts` — `isKalshiUrl`, `kalshiEventUrl`, `eventKalshiUrl`
- `lib/kalshi.test.ts`
- `lib/events.test.ts` — Saturday + home-board games have ticker + Kalshi `sourceUrl`
- `data/events.json`
- `components/EventCard.tsx`
- `scripts/verify-static.mjs`
- `bots/promote.md` — freeze `sourceUrl` prefers kalshi.com; store `ticker`

## Tickers (from Kalshi public events API, 2026-08-29)

| slug | event_ticker | page |
|---|---|---|
| unc-vs-tcu-2026 | `KXNCAAFGAME-26AUG29UNCTCU` | already on kalshi.com |
| ncsu-at-uva-2026 | `KXNCAAFGAME-26AUG29NCSTUVA` | replace SI reprint |
| clemson-at-lsu-2026 | `KXNCAAFGAME-26SEP05CLEMLSU` | |
| miami-at-stanford-2026 | `KXNCAAFGAME-26SEP04MIASTAN` | ticker only until priced |
| baylor-vs-auburn-2026 | `KXNCAAFGAME-26SEP05BAYAUB` | ticker only until priced |
| wisconsin-vs-nd-2026 | `KXNCAAFGAME-26SEP06WISND` | |
| patriots-at-seahawks-2026 | `KXNFLGAME-26SEP09NESEA` | |
| 49ers-vs-rams-2026 | `KXNFLGAME-26SEP10SFLAR` | |
| bills-at-texans-2026 | `KXNFLGAME-26SEP13BUFHOU` | |
| texas-cfp-2026 | `KXNCAAFPLAYOFF-26-TEX` | already on kalshi.com |

CFB page: `https://kalshi.com/markets/kxncaafgame/college-football-game/{ticker-lower}`  
NFL page: `https://kalshi.com/markets/kxnflgame/nfl-game/{ticker-lower}`  
Do not change cents or `sourcedAt` in this pass.

## Tasks

1. Helpers + tests (`lib/kalshi.ts`).
2. JSON tickers + Kalshi `sourceUrl` on priced games; ticker-only on unpriced Miami/Baylor.
3. EventCard detail: linked badge, Market details ticker + Open on Kalshi.
4. `events.test.ts` + `verify-static.mjs` for Dublin/NCSU.
5. Promote freeze note: prefer kalshi.com + ticker.

Homepage copy, American odds, and “not affiliated” stay as they are.
