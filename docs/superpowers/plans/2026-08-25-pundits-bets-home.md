# Pundits Bets-Home Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public Next.js prototype whose home is Kalshi-mapped event cards (YES vs NO faces), with a leaderboard and The Book, using a real 2026 preseason freeze.

**Architecture:** JSON ledger (`pundits`, `calls`, `events`). Home reads events with `onHome: true` and attaches mapped calls by `eventSlug` + `side`. Profiles compute $100 at risk from mapped pending calls. Kalshi prices are frozen in `events.json` (not live).

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind, Vitest, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-24-pundits-prototype-design.md`

## Global Constraints

- Bets home, Leaderboard gamification, The Book detail, event permalinks, pundit profiles.
- Kalshi freeze only. No bet buttons. No X posting.
- Clear leans only become `eventSlug` + `side`. Weasels stay unmapped speech.
- Homepage events are popular and timely; one-sided cards OK; longshots stay in The Book.
- $100 implied book on profiles only. Leaderboard is W–L / 2025 est.
- Black `#0A0A0A`, electric green `#39FF14`. Footer honesty line.
- Roster: herbstreit, mcafee, saban, finebaum, mcfarland, mcelroy, coughlin, thamel.

## File map

- `data/events.json` — freeze + `onHome`
- `data/calls.json` — add optional `eventSlug`, `side`
- `lib/types.ts`, `lib/data.ts`, `lib/bets.test.ts`
- `app/page.tsx` — home events
- `app/bets/[slug]/page.tsx` — permalink
- `app/leaderboard/page.tsx`
- `app/book/page.tsx`
- `app/pundits/[id]/page.tsx`
- `components/EventCard.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `CallCard.tsx`

---

### Task 1: Ledger — events, mapping, helpers

Extend types and data loaders. Seed `events.json` with the freeze below. Attach only the mapped calls listed. Tests: home events include Indiana fight; unmapped weasels do not appear on any event; collisions sort first.

**Freeze (2026-08-25, Kalshi championship/conference pages + SI/OddsShopper reprints):**

| slug | title | yes¢ | no¢ |
|---|---|---|---|
| indiana-title | Indiana wins the national title | 14 | 86 |
| nd-title | Notre Dame wins the national title | 13 | 87 |
| sec-title | The SEC wins the national title | 38 | 62 |
| texas-sec | Texas wins the SEC | 16 | 84 |
| lsu-title | LSU wins the national title | 6 | 94 |
| texas-cfp | Texas makes the Playoff | null | null |
| tech-cfp | Texas Tech makes the Playoff | null | null |
| indiana-cfp | Indiana makes the Playoff | null | null |

All eight `onHome: true`.

**Mapped calls (clear leans only):**
- `thamel-indiana-repeat` → indiana-title YES
- `finebaum-indiana-no-repeat` → indiana-title NO
- `coughlin-nd-champ` → nd-title YES
- `finebaum-sec-drought` → sec-title NO
- `finebaum-texas-sec` → texas-sec YES
- `finebaum-kiffin-no-title` → lsu-title NO
- `herbstreit-texas-cfp` → texas-cfp YES
- `herbstreit-tech-cfp` → tech-cfp YES
- `finebaum-indiana-cfp` → indiana-cfp YES

Demote weasels to `soft` and no `eventSlug`: Herbstreit ND “I like”, Michigan if-healthy, Saban “chance”/sleeper, McElroy “can win” Oklahoma, Miami “ceiling”, Georgia ranking, Thamel USC binary, McFarland Georgia D.

### Task 2: UI — Bets home, permalink, leaderboard, book, profile, footer

Match the mockup IA. Phone stacks YES over NO. Event URL `/bets/[slug]`. Footer honesty copy verbatim: `Hypothetical $100. Kalshi snapshot, not live. Not affiliated with Kalshi or these pundits. They did not place these bets.`

### Task 3: Verify and deploy

`npx vitest run` and `npx next build`. Visual bar from spec. Public Vercel URL.
