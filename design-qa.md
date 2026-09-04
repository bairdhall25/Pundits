# Responsive UI design QA

## Comparison target

- Source visual truth: production audit captures in `C:/Users/baird/.codex/visualizations/2026/09/04/01a06a04-0e98-7b91-9758-8936d94fceb4/pundits-ux-audit/` (`01`, `04`, `06`–`09`).
- Browser-rendered implementation: local Next.js preview captures in the same folder (`10`–`16`).
- Normalization: source and implementation were compared at equal CSS and pixel dimensions, device scale factor 1: mobile 390×844, iPad 768×1024, desktop 1200×800.
- States: initial home hero, collapsed and expanded hero roster, home College Football anchor, league top, and Week 0 archive top.

## Full-view comparison evidence

- `compare-mobile-home.png`
- `compare-ipad-home.png`
- `compare-desktop-home.png`

The mobile hero preserves the production type, color, image, card, and copy treatment while moving five LSU faces behind the visible `+5 more pundits` disclosure. The College Football board begins at y=1,230 instead of y=1,493. The iPad and desktop captures retain the complete roster and existing composition with no horizontal overflow.

## Focused region comparison evidence

- `compare-mobile-home-board.png`: the slate action now sits below the title/date block with a 44 px target.
- `compare-mobile-league.png`: event titles, pick links, full-card titles, and `See why` actions measure at least 44 px high.
- `compare-mobile-archive.png`: result rows retain the production density and 402 px section height while each receipt link measures 46 px high.

Focused comparisons were required because the disclosure control and touch-target changes are not legible enough in the full-page captures.

## Required fidelity surfaces

- Fonts and typography: unchanged families, weights, sizes, line heights, letter spacing, wrapping, and broadcast hierarchy.
- Spacing and layout rhythm: desktop and iPad are unchanged. Mobile changes are limited to the collapsed hero roster, stacked home slate action, and larger activation areas.
- Colors and visual tokens: existing green, ink, muted, border, and card tokens are unchanged.
- Image quality and asset fidelity: existing pundit and team assets are unchanged; lazy-loaded portraits were verified after entering the viewport.
- Copy and content: existing product copy is unchanged. The only new copy is the count-aware `+N more pundits` disclosure.

## Comparison history

1. Audit baseline found three P2 issues: excessive mobile hero depth, undersized event/result targets, and a cramped two-column home slate header.
2. First implementation fixed the hero, header, and event links, but applying 44 px to both inline archive links expanded the result panel from 402 px to 652 px and split each sentence awkwardly. Result: blocked.
3. Archive results were changed to one coherent receipt link per row. The section returned to 402 px, targets measure 46 px, and visual hierarchy matches production. Result: passed.

## Findings

No actionable P0, P1, or P2 differences remain.

## Interaction and accessibility verification

- The native hero disclosure starts closed and reveals the five remaining pundits when activated.
- Mobile slate and archive touch-target tests pass at 320 px and 390 px.
- All tested routes retain zero horizontal overflow.
- The existing visible skip-link and focus treatment remain intact.

## Implementation checklist

- [x] Collapse hero overflow only below 720 px.
- [x] Preserve the complete roster on iPad and desktop.
- [x] Stack the mobile home slate action.
- [x] Give event, pick, receipt, and `See why` actions at least 44 px targets.
- [x] Add responsive Playwright coverage.
- [x] Pass `npm test` and `npm run check`.

final result: passed
