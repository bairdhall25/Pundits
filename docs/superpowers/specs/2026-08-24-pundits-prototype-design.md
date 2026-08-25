# Pundits — Preseason Prototype Design

Date: 2026-08-24
Status: Current — supersedes the earlier leaderboard-first draft

## Problem

Sports media rewards heat, not accuracy. Pundits do not carry a public record. A take is an unpriced bet. Prediction markets (Kalshi) already price the same outcomes. Pundits never have to put the money down.

## What this is

A **fun public analytics site** for college football pundits. Not a Kalshi clone, not an exchange, not a Twitter account.

Kalshi is the **ruler**: a frozen snapshot of real Yes/No prices. Clear leans from the roster map onto those contracts as **implied $100 bets**. Ranking is still W–L. Dollars live on the profile as “if they’d been filled.”

Twitter / a friend lands on an **event card**: one upcoming market, faces on YES and faces on NO.

## Goals

- A site a sports fan would actually open from a shared link.
- Homepage = **active bets**: popular, timely CFB events, each with opposing sides (one-sided cards are OK).
- Leaderboard = **gamification** (who’s supposed to be good).
- The Book = **detail** (every captured take).
- Event permalinks you can text (`/bets/indiana-title`).
- Eight national CFB voices, real photos, GameDay-adjacent look.
- Capture hard and soft takes. Only **clear leans** become Kalshi rows. Soft / weasel stays speech.
- First publish is preseason: almost all pending, invented 2025 records on the table (backdate later if we care).
- Re-runnable on demand. No cron.

## Non-goals

- X / social posting (a URL is the share)
- User betting, play-money, or “Bet this”
- Live Kalshi API
- Order books, spreads, totals as first-class homepage objects
- Scoring soft takes
- Accounts, comments, admin UI
- Sports other than FBS CFB
- Accurate 2025 history (estimates are fine)

## Who it’s for

Fans first. Media and bettors can use the same ledger. Success = people look at the **event cards** and send a link. The table is a second visit.

Operator is a non-engineer co-founder. Agents capture, map, freeze, publish. Founder only steps in on a bad mapping.

## Information architecture

| Surface | Job |
|---|---|
| **Bets (home)** | Popular upcoming events. Each card: title, Kalshi freeze, YES column, NO column, faces + a quote. Collisions (both sides) sort first. One-sided is OK. |
| **Leaderboard** | Rank by estimated 2025 accuracy. 2026 starts 0–0. No dollar column. |
| **The Book** | Full take feed, hard and soft. Mapped calls show the Kalshi strip. |
| **Event permalink** | Same card as home, one event. This is the tweet/text object. Not a nav tab. |
| **Pundit profile** | Photo, 2025 est., 2026 0–0, implied book ($100 each, open at risk, settled $0), then full book. |

## Homepage events

Editorial, not exhaustive. Only **popular and timely** CFB markets: national title, CFP make for relevant teams, SEC / Big Ten / ACC / Big 12 champs, Heisman, a hot coaching seat if it’s in the discourse.

Do not dump every mapped longshot on home (e.g. West Virginia to win the title stays in The Book unless it becomes a real story).

One-sided cards stay if the event itself is big.

## Mapping rules

A take becomes an implied bet only when:

1. It is a **clear side** on a **named outcome** that has (or is) a Kalshi Yes/No, and
2. A reasonable listener would say they are on that side.

Weasels, vibes, and “could / if healthy / I don’t know if they win it all” stay **soft** in The Book. They do not get a homepage face.

If two clear leans collide on the same contract, that card is the shareable object.

## Call + implied bet

Call fields stay: id, punditId, claim, source, sourceUrl, sourceDate, kind (`hard` \| `soft`), subject, paysOn, status (`pending` \| `hit` \| `miss`).

Optional implied-bet fields (only if mapped):

- `venue`: `kalshi`
- `contractId` / contract name
- `side`: `yes` \| `no`
- `priceCents` at freeze
- `eventSlug` for the permalink

**$100 rule (profile only):** each mapped pending call is $100 at risk on that side. Settled later: +$100 hit / −$100 miss. Crude on purpose. Leaderboard does not rank on this.

## Roster

Same eight: Herbstreit, McAfee, Saban, Finebaum, McFarland, McElroy, Coughlin, Thamel.

## Look

Black `#0A0A0A`, electric green `#39FF14` only accent, white/gray reading. GameDay-adjacent: big faces, big type, broadcast graphics. Real headshots. Not terminal, not a sportsbook wall of moneylines.

## Stack

Small Next.js app on Vercel. JSON ledger in-repo. Kalshi prices frozen into that JSON (one snapshot per run). No database, no auth.

A **run**: pull shows/web for the eight → extract takes → map only clear leans onto the editorial event list → freeze Kalshi prices → publish.

## Honesty

Footer on every page, short: hypothetical $100, Kalshi snapshot not live, not affiliated with Kalshi or the pundits, they did not place these bets.

## Errors

- No matching contract → take stays in The Book only.
- Ambiguous → `soft`.
- Pundit with zero mapped bets: profile and book still work.
- Missing photo: do not ship that pundit.
- Failed source for one pundit: still publish the rest.

## Prototype done-check

- Home is event cards with YES/NO faces; collisions first; popular/timely only.
- One-sided cards allowed on those events.
- Leaderboard exists as a second view; 2026 0–0; 2025 estimates OK.
- The Book lists hard and soft.
- Event URL opens that card alone.
- Profile shows implied $100 book.
- Footer honesty line.
- Desktop and phone: YES/NO readable (stack on phone).
- Black + electric green only.

## Later

Live prices, weekly GameDay moneylines, more roster, real 2025 backfill, X posting, comments. None implied by this prototype.
