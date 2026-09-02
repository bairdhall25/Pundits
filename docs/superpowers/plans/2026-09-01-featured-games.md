# Featured games — Codex PM brief

> **For Codex:** Review this brief and `docs/product/featured-games.md` first. Then write a short task-level implementation plan (files, pin schema, tests) and implement the smallest PR that matches the spec. Do not expand into Scout, roster, or capture. Do not invent a weighted score.

**Goal:** Derive homepage featured games from the agreed display waterfall, and make league pages list every game that has a mapped hard pick (no zero-pick waiting shells).

**Architecture:** Pure display over existing `events.json` + `calls.json`. Add a small pin file. Replace `getWeekend`/`marqueeGame` homepage gating that today uses `onHome` + `homeRank`. Do not change Scout Dispatch, Promote `onHome` flips, or editorial JSON to fill screenshots.

**Tech Stack:** Next.js static export, TypeScript, vitest, existing EventCard / SportSlate / homepage.

**Spec:** `docs/product/featured-games.md` (canonical). Capture doctrine: `docs/capture-policy.md` (do not implement capture here).

## Global constraints

- Display only. Logging a pick does not auto-feature it on `/`.
- No weighted score. No “time for this audience” (no US-vs-Melbourne tweak).
- Do not auto-flip `onHome`. Promote still needs an explicit operator flip (`docs/capture-policy.md` rule 7).
- Do not edit `data/calls.json` or `data/pundits.json` to improve screenshots.
- Data and published URLs are append-only. Do not delete Miami/Baylor events.
- Green/black broadcast identity. `Open` / `Pending` / `Live` / `In play` stay distinct; do not call unresolved games live.
- `npm test` for helper work. `npm run check` before done (routes/UI). Browser-check `/`, `/ncaaf/`, `/nfl/` desktop + mobile if tools exist.
- Keep the marquee game on its sport board as well as in the hero (existing home-fan-scan constraint).

---

## 1. Why this exists (product context)

Pundits.Pro is a static accountability site: named pundit, verbatim quote, source, frozen Kalshi price, later a grade. Success is **qualified event density**, not page count.

Two jobs got conflated:

1. **Capture** — Scout hunts Dispatch (homepage games + `docs/bring-onto-home.json`). Candidates sit in `docs/runs/` until operator-rostered. That is `docs/capture-policy.md`: capture eagerly, mint lazily, feature reluctantly.
2. **Display** — which games fill `/` vs `/ncaaf/` vs `/nfl/`. That is this job.

Chicken-egg we already closed in **policy**, not in this PR:

- Scout may hunt watchlist games (Wisconsin, Miami, Baylor) off-home.
- Overflow unlisted SUs stage as `ok-unmapped`; Promote mints only when asked.
- Published slugs are append-only (do not delete empty Miami/Baylor pages).
- Dense homepage games get a 3-calendar-day flip-check of carded faces (Dispatch hunt column), not a display rule.

**Hybrid we discussed and did not implement in this PR:** roster/watchlist SUs can be mapped **off-home** so they exist for SEO/agents and league pages, without putting them on `/`. This PR only makes the **display** side true: league page = any mapped-hard game; homepage = waterfall, not `onHome`.

Operator: few users now; social push next week. Mid-week display change is acceptable. Keep logging picks. Do not wait for a score.

## 2. Spec summary (do not contradict)

Read `docs/product/featured-games.md` in full. Short version:

**Slots on `/`:** hero (1) + College (up to 3 open/grading) + NFL (up to 3 open/grading) + Final receipts. Multiple games per section is required.

**Pool:** open or grading **games** that are a **complete card**: ≥1 mapped hard call from a rostered face with a photo file, **and** a freeze (`yesCents`/`noCents` + `sourceUrl`). Incomplete cards never take the **hero**. A game with a mapped pick but no freeze may appear on a **league** page.

**Sort (waterfall):**

1. Pin (expires at that game’s kickoff unless renewed)
2. When — sooner `kickoffDate`, then stored `kickoff` string
3. Coverage — more mapped hard faces, then both sides, then disagreement (someone on the dog / not a one-sided stack)
4. Size — tie-break only: primetime network, GameDay/Big Noon, ranked matchup

Fill College and NFL **separately**.

**Hero vs section:** empty side may sit in a section (Patriots with nobody on the dog). Empty side must not beat a two-sided open game for the hero.

**Stability:** do not reshuffle the hero on every Promote unless a pin says so, or a complete card is both **sooner and denser** (more faces or newly two-sided) than the current hero.

**League pages:** every game with ≥1 mapped hard pick. No zero-pick “Waiting for a verified pick” rows. Futures stay in the futures block.

**Not in spec:** live trending, injury, weather, handle, follower counts. Those are pins if needed.

## 3. What ships today (code)

| Surface | Behavior | Code |
|---|---|---|
| Homepage pool | `onHome && kind=game`, sort `homeRank` | `lib/data.ts` `getWeekend` |
| Hero | First open game with any call, NCAAF then NFL | `lib/data.ts` `marqueeGame` |
| Home sections | All open+grading weekend games (hero also stays on the board) | `app/page.tsx` |
| League games | All sport games, `onHome` first | `getSlateGames` |
| League cards | Games with **any** call on the slug | `SportSlate` `withPicks` |
| League waiting | Games with **zero** calls (Miami, Baylor) | `SportSlate` `waiting` |

Wisconsin (`onHome: false`, mapped ND picks) **already** appears on `/ncaaf/`. This PR must **keep** that, not invent it. Empty Miami/Baylor waiting rows must **go**.

`onHome` remains the capture/Dispatch signal until Promote is separately taught otherwise. This PR may **stop using `onHome` as the homepage gate**. Do not write `onHome: true` in JSON.

## 4. Target board after this PR (live JSON as of 2026-09-01)

Unless pin/data changed:

- **Hero:** Clemson at LSU (complete, two-sided, Saturday ABC). Pin Clemson for this weekend so a one-sided NFL opener cannot steal the hero on “sooner.”
- **College section:** Clemson (repeat OK). Wisconsin does **not** need to be on `/` (off-home, one-sided stack, Sunday). It **must** remain on `/ncaaf/`.
- **NFL section:** Patriots at Seahawks, 49ers vs Rams, Bills at Texans — empty YES allowed **in the section**.
- **`/ncaaf/`:** Clemson, Wisconsin, Week 0 finals that have mapped picks. **Not** Miami/Baylor until a mapped hard pick exists.
- **`/nfl/`:** the three openers (and any other mapped-hard NFL games). Futures stay in futures.

If the waterfall without a pin would make an empty-side NFL game the hero because it kicks sooner, **that is a spec miss** — empty side must not beat two-sided Clemson for the hero. Tests must lock that.

## 5. Pin storage (decision for this PR)

Use a tiny file, not `onHome`:

```json
{
  "slug": "clemson-at-lsu-2026",
  "until": "2026-09-05"
}
```

- `until` is the `kickoffDate` (inclusive pin through that calendar day) unless you document otherwise.
- Missing/expired pin → waterfall only.
- Invalid slug → ignore (do not crash the build).
- Path: `data/featured-pin.json`. Load next to other `lib/data.ts` loaders.
- This week: pin Clemson so the shipped lead game stays the lead.

Do not add `featured: true` on events. Do not reuse `homeRank` as the pin.

## 6. File map (expected)

Create:

- `data/featured-pin.json` — pin Clemson through 2026-09-05
- `lib/featured.ts` — pool, waterfall compare, hero, section fill, pin load
- `lib/featured.test.ts` — the tests below

Modify:

- `lib/data.ts` — homepage should call featured helpers; keep `getWeekend` only if still used, or stop using it on `/`
- `app/page.tsx` — featured College/NFL lists + hero from helpers
- `components/SportSlate.tsx` — mapped-hard games only; remove waiting list; fix lede (no “the rest stay here until someone takes a side” if that is no longer true)
- `lib/bets.test.ts` / `lib/data.test.ts` — any tests that assume homepage = `onHome` only or that `/ncaaf/` lists Miami with no picks
- `docs/product/featured-games.md` — one line: pin file path, and “implemented in `lib/featured.ts`” when true

Do not modify:

- `bots/**` except a comment would be wrong (prefer zero bot edits)
- `data/calls.json`, `data/pundits.json`, `data/events.json` `onHome` flags
- Scout density scripts
- Methodology page (display-only)

## 7. Suggested implementation order (PM may split)

1. **Helpers + tests first** (`lib/featured.ts`) — TDD. No UI until compare/hero/sections are green.
2. **Pin loader + expiry.**
3. **Wire homepage.** Hero + two sections. Keep hero on its sport board.
4. **Wire league pages.** Drop waiting list; mapped hard only.
5. **Fix snapshot/unit tests** that encoded old homepage/league membership.
6. **`npm run check`.** Browser `/`, `/ncaaf/`, `/nfl/` desktop and mobile.
7. **One line on the spec** that the sort is now in code.

### Coverage / disagreement (be explicit in code)

Mapped hard only (`kind === "hard"` and `eventSlug` + `side`). Unique pundits, not duplicate calls.

- Face count = unique `punditId` on the event
- Both sides = ≥1 `yes` and ≥1 `no`
- Disagreement / dog: both sides, or a pick on the side whose freeze cents are lower (underdog). A 5–0 stack ranks below 4–1 for coverage step 3 after face count.

### Size tie-break (keep dumb)

String/network heuristics on `network` + `kickoff` (ABC, NBC, ESPN, GameDay, Big Noon, primetime hours if present in the kickoff string). Optional: lower `homeRank` as a last resort **only after** the four waterfall keys. Do not build an AP-rank model.

### When

Parse `kickoffDate` as a date. Then `kickoff` string as a tie-break (lexicographic is OK if times are consistent like `Sat 7:30 ET`; do not invent timezone math).

### Stability

Implement as specified: given current pin + pool, compute a candidate hero from waterfall + empty-side exception; if a previous hero is still in the open/grading complete-card pool, keep it unless pin changed or the candidate is sooner **and** denser. Persistence: if the only memory is the pin file, then **without a pin, a full rebuild has no “previous hero.”** Acceptable v1: pin file is the stability mechanism; unpinned hero is pure waterfall + empty-side exception. Document that in the plan. Do not store a second “last hero” file unless tests cannot pass without it.

## 8. Tests that must exist

Use fixtures; do not mutate live `data/*.json` for the cases.

- Pin wins over a sooner one-sided NFL opener.
- Expired pin is ignored.
- Invalid pin slug is ignored.
- Empty-side complete card does not become hero when a two-sided complete card exists.
- Empty-side NFL opener **can** appear in the NFL section.
- Unpriced game (null cents) never in homepage hero/sections even if it has a mapped pick; it **can** appear on the league list.
- Game with zero mapped hard picks never on homepage or league game board.
- Wisconsin-style off-home with mapped picks appears on league, not on homepage unless it wins when+coverage or is pinned.
- College and NFL sections fill independently (a dense CFB slate does not steal NFL slots).
- Settled games are Final, not featured open slots.
- Sort is date-only: a Melbourne kickoff is not penalized for “not US primetime.”
- `homeHeroLede` / share tests still match the actual hero (Clemson this week).

## 9. Out of scope (reject if a PR includes these)

- Weighted featured score
- Audience-timezone / “time for this audience”
- Auto-roster of Candidates (JMac, Locked On hosts, etc.)
- Promoting mailbox Candidates
- Minting events from overflow
- Flipping `onHome` on Wisconsin/Miami/Baylor
- Deleting zero-pick events
- Scout density / flip-check / Dispatch changes
- Live trending, analytics, Kalshi volume
- New sports, accounts, live odds, Bets pages, fantasy
- Methodology copy (unless a user-facing claim about “waiting for a pick” on `/ncaaf/` is now false — then update SportSlate lede and any matching About/methodology **only if** that sentence exists there)

## 10. Review questions before you code

Answer these in the plan you write, then implement:

1. Confirm league pages already show off-home games with mapped picks (Wisconsin). The PR must not regress that.
2. Confirm homepage will still show one-sided NFL openers **in the NFL section** this week.
3. Confirm Clemson stays hero via pin, not via a magic score.
4. Confirm Miami/Baylor disappear from `/ncaaf/` waiting list until they have a mapped hard pick (pages at `/picks/{slug}/` remain, noindex-as-today).
5. Confirm Scout/Promote still treat `onHome` as today.

If any of those cannot be true, stop and say so. Do not “fix” by editing editorial JSON.

## 11. Done when

- `docs/product/featured-games.md` and this brief are both satisfied
- `npx vitest run` green
- `npm run check` green
- `/` still has a College section and an NFL section with multiple slots possible
- `/ncaaf/` has Wisconsin, not empty Miami/Baylor waiting rows
- No `onHome` writes; no Candidate roster; no capture-policy edits except a one-line “display implemented in lib/featured.ts” if useful

Ship as one PR. Smallest change that makes the spec true.
