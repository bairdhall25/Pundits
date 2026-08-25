# Pundits — Preseason Prototype Design

Date: 2026-08-24
Status: Draft for review

## Problem

Sports media rewards heat, not accuracy. Pundits do not carry a public record. Closest-to-the-work “experts” can be bad predictors, and nothing scores the call after the game.

Pundits is a public analytics site that captures what college football pundits predict and shows the book: live calls waiting to be validated, and a record once games exist.

This document is the **fun prototype**, not a long-term platform. No commitment to historical backfill, auto-update, or taking the product further.

## Goals

- A public site fans would actually open, the way they check scores.
- Eight national CFB voices with real photos and profile pages.
- Capture hard *and* soft takes from web + shows. Score only hard calls.
- First publish is the **preseason book** (almost all pending) plus estimated 2025 records so the leaderboard is not empty.
- Re-runnable on demand. No cron. Later runs (when asked) add calls and grade resolved games.
- Looks like broadcast CFB: College GameDay-adjacent, black field, electric green accent.

## Non-goals (this prototype)

- X / social posting
- Accounts, comments, or an admin UI
- A Saturday (or any) automatic job
- Scoring soft takes (“they’re done,” “he’s washed”)
- Live in-show transcription
- Betting lines as a first-class object
- Sports other than FBS college football
- Accurate 2025 history (estimates are fine; replace later only if we care)
- Dispute/moderation product (fix the ledger and republish)

## Who it’s for

One public ledger. Fans, media, and bettors can all use it. V0 success is **fans looking at it a lot** — the site has to be worth lingering on, not a clever archive.

Operator is a non-engineer co-founder. Agents do capture, ledger updates, and publish. The founder only steps in if something is wrong.

## Prototype shape

Ledger-first static-enough site. No database.

```
data/pundits.json    roster, photos, estimated 2025, 2026 W-L
data/calls.json      the book (hard and soft)
public/photos/       headshots, one per pundit
app pages            leaderboard, pundit profile, call feed
```

A **run** is an agent pass: pull sources → write JSON → republish. First run = this moment (late August 2026, preseason). Week 0 games begin 2026-08-29; the interesting object is still the pending 2026 book, not grades.

Host: public Vercel URL. Open it like a fan.

## Roster

Mix of GameDay faces (draw) and weekday/studio voices (volume). Eight people:

| id | Name | Outlet | Role on the board |
|---|---|---|---|
| herbstreit | Kirk Herbstreit | College GameDay | Marquee |
| mcafee | Pat McAfee | GameDay / McAfee Show | Marquee + midday volume |
| saban | Nick Saban | ESPN / GameDay | Marquee |
| finebaum | Paul Finebaum | Finebaum / ESPN | Midday take factory |
| mcfarland | Booger McFarland | ESPN studio desk | Saturday picks |
| mcelroy | Greg McElroy | ESPN | Numbers on teams |
| coughlin | Stanford Steve Coughlin | College GameDay | Picks are the job |
| thamel | Pete Thamel | ESPN | Insider claims that resolve |

Do not add Rece Davis or Desmond Howard in V0 (host/vibes, thinner books). Do not add Corso. Swap only if a source pass comes up empty for someone.

## Site

Three pages. No fourth (no per-game “everyone’s pick” page).

**Leaderboard (home).** Default sort: estimated 2025 accuracy, high to low. Each row: headshot, name, outlet, estimated 2025 accuracy, 2026 record (starts 0–0), pending call count. Rows link to the profile. It should read like a broadcast graphic, not a spreadsheet.

**Pundit profile.** The destination. Large photo, name, outlet, estimated 2025 + 2026 0–0, then the **book**: every live call, hard and soft, with what it pays on. Hard calls wait for a result. Soft takes stay so the page sounds like them. This is “active picks coming up for validation.”

**Call feed.** Recent takes across the eight, so discourse is not buried in profiles. Preseason mix: win totals, playoff/CFP, Week 1 (and Week 0) games, Heisman, overrated/underrated, coaching/CFP bids.

No login. No share-to-X. No comments.

## Look

- Black field (`#0A0A0A` background, near-black cards).
- Electric green `#39FF14` as the only loud color: rank, accuracy, hits, pending pulse, hover, key numbers.
- White / light gray for reading. No third accent.
- GameDay-adjacent: big faces, big type, broadcast graphics, Saturday-morning personality. Not terminal, not a blog.
- Real headshots on every leaderboard row and every profile. Profiles should feel like a player page, not an article byline. Store one public press photo per pundit in `public/photos/{id}.jpg` (or `.png`). Do not generate fake faces.

## Call model

A call is one claim from one pundit.

| Field | Rule |
|---|---|
| `id` | Stable string |
| `pundit_id` | One of the eight |
| `claim` | Quote or clean paraphrase |
| `source` | Show or article name + date + URL when we have one |
| `kind` | `hard` or `soft` |
| `subject` | Team, player, award, or job |
| `pays_on` | What resolves it (e.g. `2026-08-29 TCU vs UNC`, `2026 CFP`, `2026 Heisman`, `2026 SEC title`) |
| `status` | `pending` \| `hit` \| `miss` |

**Hard:** game winner, win total, playoff/CFP bid, championship, Heisman, coaching job, “X happens by date.” These get `hit` / `miss` on a later run.

**Soft:** “this team is done,” “overrated,” “he’s the best coach,” vibes. Logged, shown on the profile, never scored in this prototype.

First run: almost all `pending`. `hit`/`miss` only if something has already resolved (unlikely before Week 0).

Estimated 2025 W-L and accuracy live on the pundit, not on individual 2025 calls. Inventing a 2025 call ledger is out of scope. The 2025 numbers are plausible inventions so the board looks alive — they do not need a citation, a disclaimer, or a later backfill plan.

## On-demand run

No clock. Someone asks to run it (founder, via agents).

1. Pull recent public web + shows for the eight: GameDay clips/recaps, McAfee Show, Finebaum, College Football Live / ESPN studio, columns (Thamel, McElroy).
2. Extract takes into `calls.json`. Tag `hard`/`soft`, source, `pays_on`.
3. First run: seed estimated 2025 records on each pundit so the leaderboard has numbers. 2026 records start 0–0. The 2026 book must be real extracted takes from current preseason shows/columns — not lorem ipsum and not a crafted fake slate.
4. Deploy the site to Vercel.
5. Later run: merge new calls; for hard calls whose `pays_on` has a result, set `hit` or `miss` and bump 2026 W-L.

Wrong extraction: edit the JSON (or rerun) and republish. That is the editorial loop.

Capture is **not** live TV. YouTube, official recaps, show pages, and articles only.

## Components

| Unit | Does | Depends on |
|---|---|---|
| Ledger (`data/*.json`) | Source of truth for pundits and calls | Nothing |
| Photos (`public/photos/`) | Headshots referenced by pundit id | Ledger `photo` paths |
| Site | Renders leaderboard, profile, feed from the ledger | Ledger + photos |
| Run (agents) | Capture → write ledger → republish | Public web/shows, ledger, host |

The site never invents records at request time. If the JSON doesn’t have it, it isn’t on the page.

## Stack

Small Next.js app (App Router) on Vercel. JSON in-repo, no CMS, no database, no auth. Each run updates the JSON (and photos if needed) and deploys. The live site is always the latest ledger snapshot.

This is enough to look like a product and to rerun without standing up infrastructure.

## Errors and empty states

- Pundit with zero calls: profile still works; book shows “No calls yet.”
- Missing photo: do not ship that pundit until there is a headshot.
- Ambiguous take: store as `soft` rather than force a hard grade.
- Unresolvable hard call (game cancelled, weasel): leave `pending` or drop it on a rerun. No `void` status in V0.
- Failed source pull for one pundit: still publish the other seven.

No user-facing error product. If the site is wrong, we fix data.

## Testing (prototype bar)

No test suite required. Before calling it done:

- Leaderboard renders eight people with photos, estimated 2025 numbers, 0–0, pending counts.
- Each profile opens, photo is large, book lists hard and soft calls with `pays_on`.
- Call feed shows mixed claims, not only one pundit.
- Desktop and phone both look like a broadcast board, not a broken article.
- Electric green is the only accent; background is black.

## Later (not this prototype)

Only if the snapshot is interesting: real 2025 backfill, in-season grading as a habit, X as a megaphone, more roster, soft-take scoring, a per-game picks board. None of that is implied by shipping V0.
