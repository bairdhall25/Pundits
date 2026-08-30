# Take-Page Receipt Design (spec)

Date: 2026-08-30. Scope: the per-pundit take page (`/picks/{slug}/{punditId}/`), its
OG cards, and the small sitewide tokens they need. Follows the take-page evaluation
in this session; this is the "take-page depth" item from the SEO plan.

## Thesis

The take page's job is: **did this pundit's call hit or miss, and here is the
receipt.** Today the verdict exists only as words (headline text, a green eyebrow
that says "Miss") and the receipt — the pundit's verbatim quote — is the smallest
text on the page, below four templated faux-article paragraphs. Invert that.

## Design decisions (binding)

1. **Red joins the palette.** `--red: #ff4d4f` (holds ≥4.5:1 on `#0a0a0a`).
   Hit = green, miss = red, open = muted — everywhere a verdict renders
   (eyebrow, result chips, receipt stamp, OG cards). Verdicts always pair
   color with a glyph or word (✓ Hit / ✗ Miss), never color alone.
2. **A mono data voice.** IBM Plex Mono (400/600) as `--font-mono`, used for
   market numbers and timestamps: `.px`, `.px-odds`, tape/freeze values,
   leaderboard values, receipt meta. Oswald stays for display, Inter for prose.
   OG renderer loads the same face via `@fontsource/ibm-plex-mono`.
3. **The signature element: the graded receipt.** The quote becomes the hero,
   set large (Inter 600, clamp 19–26px) on a bordered receipt card:
   - header strip in mono: `RECEIPT · {source} · {date}`
   - HIT/MISS stamp: display face, 3px border in verdict color, rotated −6°,
     top-right, overlapping the quote area; one stamp-in animation on load
     (scale-settle, ~320ms), disabled under `prefers-reduced-motion`. No other
     motion on the page.
   - person row (avatar, name, outlet, Open source →)
   - dashed perforation rule, then mono tape lines: the frozen prices
     (`FROZE {away} 34¢ / {home} 66¢ · AS OF {date}`) and, when graded,
     `FINAL {score line} · GRADED {date}`.
4. **Templated prose becomes a grade sheet.** The `pickStory` paragraphs stop
   rendering as faux-article text. The page renders a `<dl>` of labeled rows —
   RESULT / THE CALL / THE PRICE / RECORD — same facts, honest structure, still
   indexable text. `pickStory` itself survives untouched for meta descriptions
   and JSON-LD. The RECORD row carries the pundit's graded season record
   (`seasonFromCalls`) and links to the full record on the pundit page.
   "By PUNDITS Staff" byline goes; the line becomes mono source/graded dates.
5. **Final scores enter the data, sourced.** Optional `awayScore` / `homeScore` /
   `resultUrl` on Event, backfilled only from the authoritative box-score URLs
   already recorded in `docs/runs/2026-08-29-grade.md` (UNC 15–10 Dublin;
   Virginia 34–8 Charlottesville). Integrity is test-enforced: scores may only
   appear on events whose `settledSide` is non-null and must agree with it.
   The EventCard "Final" band and the receipt tape show the score; graded OG
   take cards carry a `FINAL: …` line.
6. **OG cards match the page.** TakeOgCard gains `status` and `result`; the
   1200×630 and 1080×1920 take templates get the stamp (red/green), mono
   numerals, and the final-score line. A missed pick's picked-side accent
   turns red.

## Non-goals

Rebrand (palette stays black/green, plus red), event/pundit page redesign,
weekly-recap work (parked), retention CTA (email band already exists sitewide).
