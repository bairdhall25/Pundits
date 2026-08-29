# Pundits UI/UX Audit Fix Plan

> Status: Historical. The UI work was an earlier implementation slice; GitHub Pages and `GITHUB_PAGES=true` are no longer production instructions.

Date: 2026-08-26  
Status: Proposed  
Scope: Resolve the usability issues observed on the homepage, pick detail, leaderboard, Book, and pundit profile without changing the product's data model or editorial rules.

## Outcomes

1. A user can understand which team corresponds to YES and NO without learning a different ordering on each surface.
2. Every primary route works without horizontal page overflow at a 390px viewport.
3. Homepage cards remain scannable even when a source quote is long.
4. Pundit profiles do not repeat mapped calls in two consecutive sections.
5. The leaderboard and Book remain useful as the roster and ledger grow.
6. Metadata, navigation, and keyboard focus meet a practical accessibility baseline.
7. The first real pick is visible early enough on desktop that the homepage communicates the product, not only the brand.

## Constraints

- Keep static export and GitHub Pages deployment.
- Keep JSON as the source of truth; no backend, database, or live Kalshi integration.
- Preserve full verbatim quotes and source links on detail surfaces.
- Preserve the capture rule that game contracts use YES = away team wins.
- Do not hide empty sides or inactive pundits permanently; progressive disclosure is acceptable.
- Do not change call classification, grading, prices, or source data as part of this work.

## Delivery strategy

Ship this in four small changesets. Each should keep `npm test` and `npm run build` green so presentation work does not become entangled with ledger changes.

### Change 1 — Make market orientation stable and explicit

Files:

- `lib/data.ts`
- `components/EventCard.tsx`
- `app/picks/[slug]/page.tsx`
- `lib/data.test.ts`
- `lib/bets.test.ts`

Work:

1. Stop using pundit count to reverse the semantic YES/NO order returned by `sidesForCard`.
2. Render both the contract side and the team in every side label: for example, `NO · LSU · 2 pundits`, not only `LSU · 2 pundits`.
3. Keep YES first and NO second on desktop.
4. If populated-first stacking is retained on mobile, make that a presentation-only CSS decision and keep the explicit YES/NO label visible. Do not mutate the underlying side order.
5. Replace the pick page's separate freeze bar plus repeated event card with one detail composition. It should show:
   - matchup and schedule once;
   - YES/team and NO/team prices;
   - frozen date and price-source link;
   - pundits and quotes by side;
   - quote-source rows below.
6. Add tests asserting that side identity is stable regardless of which side has more calls.

Acceptance criteria:

- Clemson at LSU reads `YES · Clemson · 24¢` and `NO · LSU · 78¢` everywhere.
- Adding three NO calls and zero YES calls does not change the returned semantic order.
- A pick detail page does not repeat its title, schedule, and prices in adjacent blocks.
- Empty-side copy includes its contract side and team.

### Change 2 — Repair responsive hierarchy and density

Files:

- `app/globals.css`
- `components/EventCard.tsx`
- `app/leaderboard/page.tsx`
- `app/page.tsx`

Work:

1. Redesign leaderboard rows below 640px as a two-row grid:
   - row one: rank, avatar, name;
   - row two: live picks, 2026 record, total calls;
   - outlet may wrap under the name but must not force the metrics off-screen.
2. Ensure the document has no horizontal overflow at 320, 375, 390, and 430px.
3. Clamp quotes inside homepage and slate event cards to three lines on mobile and two lines on desktop. Keep full text available on the pick and pundit pages.
4. Keep the entire event card as the pick-detail target and each pundit row as the profile target.
5. Reduce the desktop hero's maximum size and/or vertical spacing so the first card's title and market price are visible at 1440×900.
6. Preserve the existing broadcast aesthetic and green/black visual system.

Acceptance criteria:

- The leaderboard produces no horizontal scrollbar at 390px.
- Rank, name, live picks, record, and call count are readable without horizontal scrolling.
- No homepage event card exceeds 360px solely because of quote length.
- The opposing side or empty-side row is visible without traversing multiple full screens.
- At 1440×900, the first NCAAF card's heading and price appear in the initial viewport.

### Change 3 — Remove repetition and add discovery controls

Files:

- `app/pundits/[id]/page.tsx`
- `app/leaderboard/page.tsx`
- `app/book/page.tsx`
- new `components/BookLedger.tsx` if client-side filtering is used
- `lib/data.ts`
- relevant tests in `lib/data.test.ts`

Work:

1. On a pundit profile, keep mapped calls under `Implied book` and show only unmapped/soft calls under `Other takes`. Do not render mapped calls twice.
2. Rename the second section accordingly and give it a useful empty state.
3. Default the leaderboard to pundits with at least one captured call. Put the complete roster behind an `All 40` toggle or native disclosure.
4. Keep rank deterministic within the active view: mapped pending, total calls, then name.
5. Add client-side Book controls that work with static export:
   - search quote, pundit, subject, or source;
   - sport: All / NCAAF / NFL;
   - kind: All / Hard / Soft;
   - mapping: All / Mapped / Unmapped.
6. Show the result count and a clear empty state. Provide a single Reset action when filters are active.
7. Keep the URL shareable if practical by mirroring filters to query parameters; do not make this a blocker for the first pass.

Acceptance criteria:

- No call card is duplicated within a pundit profile.
- An active pundit reaches `Other takes` without first scrolling through the same mapped ledger twice.
- The default leaderboard does not bury activity beneath zero-call rows.
- A user can isolate soft NFL takes and search for a pundit without a page reload.
- Filtering never changes the underlying order or content of `calls.json`.

### Change 4 — Accessibility and navigation polish

Files:

- `app/globals.css`
- `app/layout.tsx`
- `components/SiteHeader.tsx`
- `components/EventCard.tsx`
- `components/CallCard.tsx`
- `components/SiteFooter.tsx`

Work:

1. Replace `#6b6b6b` for meaningful small text with a token that reaches at least 4.5:1 against both `#0a0a0a` and `#141414`.
2. Raise critical metadata to at least 12px on mobile. Critical metadata includes schedule, freeze date, source date, side label, and status.
3. Give header links and important inline actions a minimum 44px touch target on mobile.
4. Add a visible `:focus-visible` treatment for links, scroller cards, event-card overlays, and source actions.
5. Add a skip-to-content link and a stable `id` on the main content landmark.
6. Mark the current primary navigation item with visual styling and `aria-current="page"`.
7. Keep the mobile navigation fade/partial-item affordance, but ensure keyboard focus scrolls the active item into view.
8. Verify that full-card overlay focus visibly outlines the card rather than an invisible zero-content element.

Acceptance criteria:

- Small meaningful text passes 4.5:1 contrast.
- All primary interactive elements have a visible keyboard focus state.
- Keyboard users can skip the sticky header.
- The current route is apparent visually and programmatically.
- Header navigation remains usable at 320px without hiding destinations.

## Verification matrix

Run after every changeset:

```text
npm test
npm run build
```

Browser verification:

| Surface | 390px | 768px | 1440px |
|---|---:|---:|---:|
| Home | no page overflow; opposing side discoverable | cards transition cleanly | first pick visible in initial viewport |
| Pick detail | stable YES/NO mapping; no duplicate summary | sources readable | single cohesive market composition |
| Leaderboard | two-row layout; no clipping | metrics align | compact table scan |
| Book | filters usable; result count visible | controls wrap cleanly | efficient multi-column/filter bar if warranted |
| Pundit profile | no duplicated calls | stats and book align | mapped and other takes clearly separated |

Interaction checks:

1. Tab from the skip link through header, card, pundit links, and external source links.
2. Activate a full event card and then a nested pundit link; each must reach the correct destination.
3. Apply and reset every Book filter combination.
4. Confirm horizontal scrollers still scroll and snap on touch widths.
5. Confirm every roster image loads and no browser console errors appear.
6. Recheck the deployed GitHub Pages build with `GITHUB_PAGES=true` so base-path navigation matches production.

## Suggested test additions

- `sidesForCard` always returns semantic YES then NO.
- Side labels retain the correct team when one side is empty.
- Profile grouping produces disjoint mapped and other-take collections.
- Active leaderboard excludes zero-call pundits without deleting them from the full roster.
- Book filtering composes sport, kind, mapping, and query conditions correctly.
- Production static params still include every event and pundit after the component split.

## Out of scope

- New sports, markets, pundits, calls, or prices.
- Changes to Scout, Grader, or Recap responsibilities.
- Authentication, personalization, saved filters, or a backend search index.
- A full visual rebrand.
- Live odds or automatic refresh.

## Definition of done

The work is complete when all four changesets meet their acceptance criteria, tests and static build pass, the browser matrix is clean, the live GitHub Pages site is spot-checked end to end, and no editorial data changed incidentally.
