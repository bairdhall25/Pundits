# Social archetype density-pass QA

## Comparison target

- State: three static 1200 × 630 Pundits social-card archetypes using the Clemson at LSU example.
- CSS viewport: 1200 × 630 artboard rendered at 0.875 scale in a 1050 × 551 browser capture.
- Density normalization: browser JPEG captures were cropped to 1050 × 551, then resized to 1200 × 630 and exported as PNG. Earlier concept references were cropped to 1200 × 630 for side-by-side density comparison.

## Source visual truth

- Event / broadcast split: `C:/Users/baird/.codex/generated_images/01a06033-67f3-7a40-bf3f-633802d8b78e/exec-f9f21b5b-0a8b-4dc7-9bf9-c397886bb7fe.png`
- Individual take / quote-first: `C:/Users/baird/.codex/generated_images/01a06033-67f3-7a40-bf3f-633802d8b78e/exec-7a3b2dc6-5d24-4612-9c77-8a6e92e7366a.png`
- Summary / asymmetric editorial: `C:/Users/baird/.codex/generated_images/01a06033-67f3-7a40-bf3f-633802d8b78e/exec-5fa99abe-7108-48ea-aba3-5f305b7eb2c9.png`

## Implementation screenshots

- Event: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/01-event-title-leading.png`
- Individual take: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/02-individual-take-dense.png`
- Summary: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/03-week-summary-cropfix3.png`

## Full-view comparison evidence

- Event: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-event-comparison.png`
- Individual take: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-take-comparison.png`
- Summary: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-summary-comparison.png`
- Portrait-crop event comparison: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-cropfix-event-comparison.png`
- Portrait-crop summary comparison: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-cropfix-summary-comparison.png`
- Event-title leading comparison: `C:/Users/baird/.codex/visualizations/2026/09/02/01a06033-67f3-7a40-bf3f-633802d8b78e/social-archetype-examples/qa-title-leading-comparison.png`

Focused-region comparison was not needed: all critical type, faces, names, prices, and disclosure copy are legible in the normalized full-view pairs.

## Findings

- No P0, P1, or P2 fidelity findings remain.
- Typography: Oswald preserves the compressed broadcast voice; headline scale now matches the assertiveness of the selected concepts. Inter and IBM Plex Mono remain legible at proof and attribution sizes.
- Spacing and rhythm: passive gutters and framed card padding were removed. Photography, type, and outcome structure now occupy nearly the full canvas while keeping a consistent 64 px proof rail.
- Color: the existing Pundits green, black, Clemson orange, LSU purple, and LSU gold are unchanged.
- Image quality: actual repository profile photos are used unchanged. Supporting photos now occupy near-square image regions with per-person focal points, preserving Pate's full head and upper body, Finebaum's head and shoulders, Staples' complete headshot, and McElroy's seated portrait.
- Copy: all four LSU pundits are present; the take quote, frozen-market language, prices, event context, and not-a-bet disclosure are preserved.
- Render state: all three query-param states loaded with one active artboard, complete document state, and no broken images.

## Comparison history

1. Initial photo pass: P1 density drift. Excess outer gutters, internal card padding, and restrained headline sizing weakened the social-feed impact.
2. First density revision: removed outer margins, expanded photography, enlarged headlines, and converted supporting portraits to edge-to-edge grids. Event and summary proof rails obscured the lower supporting names.
3. Final revision: reserved the 64 px proof rail outside content, widened the summary media region, forced the editorial headline into a three-line stack, and enlarged/rebalanced the quote-first card. All names and proof copy are now visible.
4. Portrait revision: the full-bleed 2:1 supporting-photo crops were still too aggressive. Rebuilt each supporting tile as a dense image-plus-name module and set focal points per source asset. The event grid and summary strip now show recognizable portraits without reopening passive gutters.
5. Event-title revision: increased the display-title line-height from 0.9 to 1.02 and reserved an additional 8 px before the matchup divider. The headline remains oversized while gaining a visible optical gap and safe leading for future wrapped titles.

## Follow-up polish

- P3: test 600 × 315 and messaging-app thumbnail reductions during production implementation to confirm the smallest mono labels remain useful rather than merely present.

## Final result

final result: passed

---

# Community tip intake QA

## Comparison target

- State: open Clemson–LSU event page, scrolled to the new community-tip prompt immediately after Market Details and before the existing early-access form.
- Source visual truth path: `C:/Users/baird/Documents/GitHub/Pundits/docs/audits/2026-09-03-community-tip-placement/05-proposed-placement.png`.
- Implementation screenshot path: `C:/Users/baird/Documents/GitHub/Pundits/docs/audits/2026-09-03-community-tip-placement/06-implementation-event.png`.
- Submit-page screenshot path: `C:/Users/baird/Documents/GitHub/Pundits/docs/audits/2026-09-03-community-tip-placement/07-submit-form.png`.
- Browser-rendered implementation URL: `http://localhost:8788/picks/clemson-at-lsu-2026/` and `http://localhost:8788/submit/`.
- Source pixels: 1680 × 941 at unknown capture density. Implementation pixels and CSS viewport: 1280 × 720 at device scale 1. Density normalization: source resized proportionally to 1280 × 717 and padded by 3 px to compare against the 1280 × 720 implementation.
- Full-view comparison evidence: `C:/Users/baird/Documents/GitHub/Pundits/docs/audits/2026-09-03-community-tip-placement/08-comparison.png`.
- Focused prompt/email comparison evidence: `C:/Users/baird/Documents/GitHub/Pundits/docs/audits/2026-09-03-community-tip-placement/09-focused-comparison.png`.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the implementation uses the existing Oswald broadcast face for the prompt and headings, with Inter for explanatory copy. Weight, uppercase treatment, and letter spacing preserve the mock’s hierarchy and remain legible.
- Spacing and layout rhythm: the prompt is bounded to 760 px, sits directly between Market Details and the 720 px email panel, and preserves the mock’s compact left-rail composition. Border width, square corners, section gap, and CTA alignment match the selected direction.
- Colors and tokens: the implementation reuses the site’s `--bg`, `--card`, `--ink`, `--muted`, and `--green` tokens. The green rail, link, and focus rings match the mock and retain strong contrast.
- Image quality and asset fidelity: this new surface introduces no image assets, logos, illustrations, or icons. Existing profile images above the compared region remain untouched. The directional arrow is the same text treatment used in the source and the existing product.
- Copy and content: dense events use “Know another public pick we missed?” while exactly one empty game side names the missing team. The destination explains that tips are leads, asks only for a public link and pundit hint, and keeps editorial classification out of the fan form.
- States and accessibility: browser tests covered the contextual event entry, footer entry, direct form, required-field errors, first-invalid-field focus, local-KV success, success-region focus, settled-event suppression, and empty-side team naming. Code review also confirmed the pending-state submit lock and request abort on unmount. Labels, 44–48 px controls, visible focus rings, live status text, and honeypot isolation are present. Browser console errors and framework overlays were checked; none appeared.

## Comparison history

1. Initial implementation: P2 width drift. The prompt stretched across the full 1080 px event shell while the source showed a compact prompt aligned with the email module.
2. Final revision: capped the prompt at 760 px and recaptured both the event state and the focused prompt/email region. The revised width, left rail, spacing, typography, and CTA alignment now preserve the mock’s composition.

## Follow-up polish

- P3 test gap: the selected in-app browser does not expose viewport resizing, so the source-matched desktop state is the browser-rendered comparison. The responsive CSS collapses the two optional fields to one column below 720 px; capture 320 px and 390 px screenshots when the chosen browser adds mobile emulation.

## Final result

final result: passed
