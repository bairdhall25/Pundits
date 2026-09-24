# Social renderer implementation QA

## Complete landscape rollout — passed

Source visual truth: `C:\Users\baird\Documents\GitHub\Pundits\.worktrees\social-card-system\docs\mockups\social-template-family-board-2026-09-02.png` and the previously approved Split/Quote renderer fixtures in `docs/mockups/social-renderer-qa.html`.

Implementation screenshots:

- `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\browser\team.png`
- `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\browser\week.png`
- `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\browser\collection.png`
- `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\browser\trust.png`

Viewport: 1280 × 720 browser capture containing the exact 1050 × 551 feed-size card; generated artifacts were also inspected at their native 1200 × 630 size and on 600 × 315 contact sheets.

Density: 1×.

State: real repository data covering populated, sparse, empty-side, open-week, graded-week, evergreen collection, methodology, privacy, and terms variants.

Full-page evidence: `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\pages-contact-sheet.png`, `teams-contact-sheet.png`, and `weeks-contact-sheet.png` cover all 10 registered SEO pages, 29 team archives, and three weekly archives.

Focused comparison evidence: `C:\Users\baird\AppData\Local\Temp\pundits-social-final-qa-20260902\editorial-reference-vs-renderer.png` places the approved team, week, and collection references beside the production renderer at the same 600 × 315 scale. The final row compares the approved Editorial language with the text-first methodology extension.

Fidelity surfaces checked: green/black broadcast identity, display-font hierarchy, 1.02 multiline leading, 64 px proof rail, full-bleed feature photography, 4 px green hero divider, circular supporting portraits with 2 px green rings, team colors, frozen-price hierarchy, empty-side truth, attribution, overflow, and feed-size legibility.

### Comparison history

#### Iteration 1 — blocked

- **P2: one real portrait disappeared in Satori.** The Darius Butler source file used PNG data behind a `.jpg` path and a large transparent canvas. CSS scaling made the circular region blank in the production renderer.

Fix:

- Normalized the existing source portrait into a true square JPEG crop at the same published `/photos/butler.jpg` path. The crop now matches the other head-and-shoulders portraits without renderer-specific scaling or editorial JSON changes.

#### Iteration 2 — passed

- **Reference match:** The production team/week/collection cards retain the approved density and hierarchy while replacing rough supporting squares with the approved circular treatment.
- **Route breadth:** Every core shareable page now resolves through an explicit registry entry and stable page-specific OG path; preview validation rejects any future sitemap route that falls back to `/og.png`.
- **Real-data resilience:** All 29 team cards, including honest zero-pick states, all three week cards, and all 10 core page cards rendered without clipping, broken imagery, or proof-rail collisions.
- **Portrait handling:** Featured images remain full-bleed rectangles with a consistent interior rule. Supporting people use circles with visible names and tuned focal points.
- **Product truth:** YES/NO semantics, frozen-price context, empty sides, source attribution, and no-bet disclosures are unchanged.

Methodology impact: none. The rollout changes visual rendering and metadata coverage only; it does not alter pick eligibility, evidence rules, side mapping, grading, results, record calculations, or frozen-market semantics.

final result: passed

## Circular supporting portraits — passed

User-selected refinement: replace hard rectangular supporting headshots with circular source-photo crops and a slim Pundits green border, while retaining full-bleed hero photography.

Comparison evidence: `C:\Users\baird\AppData\Local\Temp\pundits-circle-portrait-comparison-20260902.png` places the approved rectangular Clemson reference on the left and the final 2 px circular implementation on the right at 1200 × 630.

- Multi-person Split tiles now use 126 × 126 circular crops with a 2 px green ring.
- Featured lone-call, take, and pundit portraits remain full-bleed to preserve the approved density and hierarchy.
- Existing focal-point metadata remains active inside the circles; Pate, Finebaum, Staples, and McElroy remain recognizable and correctly attributed.
- Clemson 1-vs-4 and Notre Dame three-person/empty-side fixtures were checked at full resolution and in the fitted browser gallery.
- No clipping, failed images, proof-rail overlap, or semantic changes were introduced.

Source visual truth: the approved 1200 × 630 Split and Quote references in `social-archetype-examples`, plus the approved pundit identity card in `docs/mockups/social-template-family-board-2026-09-02.png`.

Implementation captures: the real generated Clemson event, George Wrighster take, and Paul Finebaum pundit cards, captured through `docs/mockups/social-renderer-qa.html` in the in-app browser at 1050 × 551 (the exact 0.875 feed-size scale of a 1200 × 630 card).

Combined comparison evidence: `C:\Users\baird\AppData\Local\Temp\pundits-social-renderer-comparison-20260902.png`. Each row places the approved reference on the left and the browser-captured renderer output on the right at the same normalized 1200 × 630 size.

States also checked at full 1200 × 630 resolution:

- Empty future market: Seahawks win the Super Bowl.
- Long future headline and three-person side: Notre Dame wins the national title.
- Long quote: Dan Orlovsky / Rams Super Bowl prediction.
- One-vs-four disagreement: Clemson at LSU.

## Renderer findings

### Iteration 1 — blocked

- **P1: long future headline clipped.** The Notre Dame title wrapped inside a one-line title slot and lost its first line.
- **P1: two- and three-person sides left a dead quadrant.** The initial fixed 2 × 2 tile layout created passive black space for incomplete groups.
- **P2: unsupported stacking declaration.** Satori warned that `z-index` was ignored.

Fixes:

- Reserved a 102 px title region, used 1.02 display leading, and reduced only long-headline type.
- Made two-person sides use two full-width rows and three-person sides use two half-width tiles plus one full-width row.
- Removed unsupported `z-index` declarations and relied on deterministic DOM order.

### Iteration 2 — passed

- **Fidelity:** Split, take, and pundit cards retain the approved composition, density, typography, green/black identity, structural portraits, and 64 px proof rail.
- **Portraits:** Source photos fill their assigned regions, the focal-point manifest keeps Pate/Finebaum/Staples/McElroy readable, and every shown face retains visible name attribution.
- **Typography:** Display headlines and multiline names use 1.02 leading without collisions or clipping. Long quote excerpts remain bounded and legible.
- **Content truth:** Empty sides remain explicit; future cards use team/the-field language; frozen prices stay secondary; no likeness or pick is invented.
- **Overflow:** Resolver-owned `+N` remains explicit for groups above the format limit; the renderer does not silently drop people.
- **Browser check:** No image failed to load, no proof rail overlap appeared, and the cards remain legible at the 1050 × 551 feed-size capture.

Methodology impact: none. This is a visual renderer refactor and does not change pick eligibility, event/side semantics, frozen-market meaning, grading, records, or public product claims.

# Prior social template spacing QA

Source visual truth: `6976c5a:docs/mockups/social-template-family-board-2026-09-02.png`, plus the user-reported requirements to restore visible headline leading and reduce dominant passive black regions.

Implementation screenshot: `docs/mockups/social-template-family-board-2026-09-02.png`

Comparison evidence: `C:\Users\baird\AppData\Local\Temp\pundits-social-space-audit-20260902\before-after-family.png`

Viewport and normalization:

- Each card was rendered from a 1200 × 630 CSS artboard.
- Browser capture measured 1050 × 551 at the prototype's 0.875 capture scale and was normalized back to 1200 × 630 at 1× density.
- The family board presents each card at 600 × 315 to verify feed-size hierarchy and density.

States checked: pundit identity, team archive, open week archive, and newest-takes collection.

## Findings and comparison history

### Iteration 1 — blocked

- **P1: compressed multiline display type.** Pundit, week, and collection headlines used 0.78–0.88 line-height. At feed size the lines read as collisions rather than a deliberate lockup.
- **P1: passive black regions dominated the composition.** The pundit quote, team split counts, week disagreement, and collection count did not occupy the available visual regions.
- **P2: collection feed could extend into the proof rail.** Intrinsic grid sizing allowed the last row to exceed the intended content boundary.

Fixes:

- Set multiline display leading to 1.02 and resized the type to preserve the same overall footprint.
- Expanded the pundit quote into a structural evidence panel.
- Rebuilt team counts as two full-height editorial rows.
- Rebuilt the week disagreement as two dense side modules with counts and frozen prices.
- Rebuilt the collection count as a large number lockup with event and pundit context.
- Added `minmax(0, 1fr)` and overflow containment to the collection feed.
- Increased proof-note type for feed-size readability.

### Iteration 2 — passed

- **Fonts and typography:** Oswald, Inter, and Plex roles remain intact. Multiline headlines now have visible leading, retain hierarchy, and do not collide.
- **Spacing and layout rhythm:** Major regions now carry information or imagery. Remaining black space separates groups instead of dominating a quadrant.
- **Colors and tokens:** The approved green, black, white, orange, and purple system is unchanged.
- **Image quality:** All five repository portraits decode, remain sharp, and keep intentional focal crops with visible attribution.
- **Copy and content:** Quote, counts, state, frozen-price context, and no-bet disclosure remain truthful and legible. No picks or likenesses were invented.

Focused-region evidence was not separated from the full board because the 600 × 315 cards already expose the exact feed-size typography, proof rail, portrait labels, and content density under review. Full-resolution 1200 × 630 captures were also inspected for clipping and broken assets.

Browser verification found no broken images. No content overlaps the 64 px proof rail after overflow containment.

Residual P3 polish: the exact amount of breathing room may vary by real headline length, so long-name and long-quote fixtures remain required during renderer implementation.

final result: passed
