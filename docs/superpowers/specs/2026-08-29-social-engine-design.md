# Pundits — The Social Engine (agentic X marketing system)

Date: 2026-08-29
Status: Current — approved design for the Grok Post Poster and Reply Guy system.
Evidence base: `docs/social/research-2026-08-29.md` (Ringer / Barstool / data-flex account research, sourced).

## Problem

Pundits runs agentic social marketing on X via two Grok bots — a Post Poster (new posts) and a Reply Guy (engaging existing threads) — with no repo-hosted instructions, no image discipline, and no schedule. The recurring failure is images: Grok-generated graphics look off-brand and untrustworthy, while the build already renders branded cards for every event, take, and pundit that go unused. There is no social media hire; the guardrails, templates, and calendar must live in the repo, the same way Scout's do.

## Approved decisions (2026-08-29)

1. **Voice: The Receipts Guy**, tuned by research to the blend: *a dry, obsessive scorekeeper who talks like a fan at the bar — Ringer sentences, Barstool tempo, Opta discipline.* Grok composes copy **freely under guidelines** (no fill-in-the-blank scripts); post patterns are example-driven.
2. **Images: three tiers, chosen by what the post is about.** Tier 1 (mandatory for any post about a specific pundit/pick/event/result): attach the site's pre-rendered cards natively; link in a self-reply. Tier 2 (editorial/discussion posts): Grok may generate images only from brand-spec prompt templates. Tier 3 (replies): text-first. The bots can attach images from URLs (confirmed).
3. **Scope:** bot instruction files, `docs/social/` playbook, weekly schedule, and a card-index build step. No posting automation in this repo, no analytics pipeline, X only, no pre-composed post queue.
4. **Both bots are read-only.** They never touch `data/`, never write `docs/runs/`, never grade, never edit the site. They read the live site, the card index, and the playbook.

## Files

| File | Job |
|---|---|
| `bots/poster.md` | Post Poster instructions (fetch-at-start pattern, like Scout) |
| `bots/reply.md` | Reply Guy instructions |
| `bots/README.md` | Add both bots to the table + paste-ready standing instructions + house-rule additions |
| `docs/social/README.md` | Strategy overview; how playbook, bots, and card index fit |
| `docs/social/voice.md` | Receipts Guy voice guide: the blend, registers, good/bad examples |
| `docs/social/images.md` | The tier system + brand image spec + Tier-2 prompt templates |
| `docs/social/post-patterns.md` | The nine archetypes (below), example-driven |
| `docs/social/reply-guide.md` | Reply Guy targeting, value rules, caps, disengage rules |
| `docs/social/schedule.md` | Weekly calendar keyed to the CFB/NFL rhythm |
| `docs/social/research-2026-08-29.md` | Evidence base (committed alongside this spec) |
| `scripts/build-social-index.mjs` | Emits `public/social/cards.json` at build time |

## The image system

- **Tier 1 — Receipts (mandatory).** Any post about a specific pundit, pick, event, or result attaches a pre-rendered card: `/og/events/{slug}.png`, `/og/takes/{slug}--{punditId}.png`, `/og/pundits/{id}.png`, or the `/og/stories/...` 1080×1920 variants. Native image in the post, pundits.pro link in the first self-reply. Fallback if attach fails: link post, X renders the OG card.
- **Tier 2 — Editorial (fenced creativity).** Prompt templates in `images.md` encode the brand: `#0a0a0a` ground, `#39ff14` accent, condensed headline type, dark and text-light; **no human likenesses, no team logos, no fabricated numbers, no fake screenshots.** Slots (matchup names, week number) give Grok latitude inside the identity.
- **Tier 3 — Text only.** Default for replies; a card only when it directly answers the thread.
- **Hard rule (kills the current failure mode):** never AI-generate a real person's face or likeness; never fabricate a screenshot or stat graphic. When in doubt: real card or no image.

## The card index

`scripts/build-social-index.ts` (tsx, matching `render-og.tsx`; pure logic in `lib/social.ts`) runs with the build and writes `public/social/cards.json`: for each event, take, and pundit — page URL, OG card URL, story card URL, frozen cents, raw `kickoff`/`kickoffDate`, settled state, per-take status (pending / hit / miss), and pundit record. Time-relative words ("tonight", "live") are never baked in at build time — they'd go stale and the product gives them strict meanings; bots compute proximity from `kickoff` at post time. Bots fetch `https://pundits.pro/social/cards.json` at job start. Ships with a test (repo convention: assert behavior, not live-data snapshots) and a `verify-static` route check. Freshness rides the existing game-day deploy cadence (RUNBOOK).

## Voice (summary — full guide in `docs/social/voice.md`)

- **From The Ringer:** claim-as-question (assert something checkable; disagreement is the reply mechanic); quote-lede with the pundit named; two registers (essay voice for analysis, fragments/caps live); reaction-cycle not scoop race; self-aware about being a receipts machine.
- **From Barstool:** speed around live moments (fast graded receipts); fan-at-the-bar rhythm; one persona unwaveringly committed to the bit (the scorekeeper who never loses the book); harvest-and-recirculate fan replies; lo-fi screenshots over polish; self-deprecation when house leans miss.
- **From Opta/FCT/Kalshi:** number first, one comparison that creates stakes, zero hedging; personality confined to a fixed slot (a dry closer); receipts applied evenly to hits and misses; the timestamp does the comedic work; never post a number that isn't already on the site.

## Post archetypes (full patterns in `docs/social/post-patterns.md`)

The Receipt · The Freeze · The Number · The Disagreement · The Slate · The Ledger Move · Live register · The Self-Grade · The Harvest. Each pattern names its image tier and register; all example-driven, none scripted.

## Guardrails (enforce verbatim in both bot files)

1. Never repost third-party video or images. Own cards, own data, attributed screenshots of public statements only.
2. Critique the pick, never the person. No dunking on ordinary users, no quote-posting individuals for mockery, no dogpile framing, professionals' takes only.
3. Never "lock," "can't lose," "free money," "guaranteed" — even as a joke. Never urge anyone to bet. Prices are accountability evidence, not tips. Never imply a pundit placed a wager.
4. Irreverence budget: takes, hubris, bad predictions. Never identity, appearance, personal life, tragedy, or injuries.
5. No manufactured feuds, no rage-bait, no politics or culture war. The controversy is the data.
6. No fake authenticity: the bot never claims to have watched a game or have money down. Its stake is the ledger.
7. Every number in a post must be verifiable on pundits.pro at post time. Speed without verification is Kalshi's documented failure mode and our differentiator.

## Link + platform rules

- The post body never carries a link. Full receipt in image/text; "full ledger →" link in the first reply; site URL in bio.
- Optimize for replies and quote-posts (Grok-era feed ranking weights conversation).
- Ops note for Baird (outside repo scope): run the account on X Premium — free-account link/reach collapse is severe enough to sink the strategy.

## Weekly schedule (full calendar in `docs/social/schedule.md`)

| Day | Post Poster | Reply Guy |
|---|---|---|
| Tue–Wed | Week preview, disagreements forming, leaderboard talkers | Daily sweep: pundit posts, big debate threads |
| Thu | CFB night game: Tonight package → same-night receipt | Game-thread presence |
| Fri | Weekend slate, bold calls at long cents | Daily sweep |
| Sat | Morning slate → receipts as games settle → night recap | Heavy: gameday debates, "who called it" |
| Sun | NFL mirror of Saturday | Heavy |
| Mon | Leaderboard movement, week recap, MNF Tonight | Recap threads, pundit victory laps |

Reply Guy caps: bounded replies per day, one exchange per thread, disengage rules in `reply-guide.md`.

## Testing

- `build-social-index` gets a unit test asserting shape and state derivation (pending/tonight/live/hit/miss) from fixture data, not live snapshots.
- `verify-static` asserts `/social/cards.json` exists in the build output.
- Docs are validated by review; bot files carry no executable behavior.

## Out of scope

Posting automation or schedulers in this repo; analytics; platforms beyond X; pre-composed post queues; merch; paid distribution.
