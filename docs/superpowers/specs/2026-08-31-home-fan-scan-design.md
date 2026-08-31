# Home fan-scan (spec)

Status: Active plan

Date: 2026-08-31. Scope: make the homepage talk like a sports show after
Open vs Final is in. No rebrand. No capture. No live scores.

Depends on `feat/event-state-home` including the follow-up that **keeps the
open marquee on the college board** (Clemson in the hero and under This week).

## Thesis

A fan should know, in one glance: **what game is next, who is on it, and
what already finished.** The Open vs Final split fixed time. The page still
leads with a product pitch, stamps **Kalshi** on every card, and buries the
Week 0 result in the archive.

## Binding decisions

1. **The hero's job is the next game.** Keep the green/black identity. On
   small screens the marquee card comes first (CSS `order`). The 72px
   “Who’s picking what” display shrinks so it does not beat the card to the
   fold. Eyebrow is sports time from the marquee (`Sat 7:30 ET · ABC`), not
   `Active picks · Week 1`. Lede is a short scan sentence from the faces:
   `Josh Pate and Paul Finebaum pick LSU. Nobody on Clemson yet.` No cents
   and no “as of” in that sentence. Trust bar stays. Duplicate Clemson on
   the college board stays.

2. **Scan cards do not say Kalshi first.** On `event-scan` cards, drop the
   Kalshi kicker. Title, then Open/Final + kickoff/network. The linked
   Kalshi tag stays on **detail** cards (`/picks/{slug}/`). Cents stay on
   the sides. This is not a rebrand.

3. **Finished week gets one recap line on home.** Reuse `weekRecord` /
   `weekResults` from `lib/archive.ts`. If a completed week has graded
   mapped picks, show it above the compact Final rows in the matching
   sport Weekend:

   `Week 0: experts went 2–4. Chip Patterson and Greg McElroy hit on North Carolina.`

   Link that line to `/ncaaf/2026/week-0/`. Do not invent a recap CMS.
   If nothing is graded yet, omit the line.

4. **Disagreements are long range.** The home peek is still futures. Change
   the kicker to `Season` and the when-line to `Titles and Super Bowls · not this week`
   so a fan does not read it as Saturday’s slate. Do not mix game cards into
   that row in this pass (Clemson has no fight).

## Parked

- Scout / empty Clemson YES / empty NFL dogs
- Changing table rank order or implying skill
- Deduping the hero card from the college board
- Rewriting Latest takes / The Book sort
- Live / In play
- OG card restyle
- New palette, type, or layout system

## Canonical docs this ships into

- `docs/product/experience-principles.md` §1 (hero is the matchup) and §5
  (Kalshi is not the scan kicker)
- `docs/product/decision-log.md` dated 2026-08-31 rows for hero-as-game and
  scan cards without a Kalshi kicker
