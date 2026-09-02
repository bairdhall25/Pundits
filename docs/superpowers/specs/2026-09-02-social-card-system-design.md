# Social card system — design and integration contract

Status: Active plan

Date: 2026-09-02

Implementation update: the approved Phase 1 semantic model, portrait focal-point manifest, route resolvers, and edge-case tests now live under `lib/social-card/`. They are additive and are not yet connected to the production renderer, generated images, metadata, or `public/social/cards.json`.

## Goal

Make every Pundits.Pro URL and native share artifact recognizable, bold, and useful at feed size without changing the existing green/black broadcast identity or weakening product truth.

The system must combine two visual behaviors:

- sports-media urgency: oversized headlines, faces, rivalry, and decisive hierarchy;
- prediction-market proof: clear sides, frozen cents, state, and evidence language.

It must not turn a link preview into a screenshot of the page. Each card tells one story.

## Selected visual system

All share cards resolve to one of three archetypes. Routes do not get bespoke layouts by default.

### 1. Split

Use when two outcomes, sides, or groups are the story.

Primary use: event pages.

- Matchup or outcome is the largest text.
- Side counts are visible immediately.
- A featured dissenting or leading face may dominate one side.
- Supporting pundits use dense portrait-plus-name modules, not wide background crops.
- Frozen prices live in the proof rail; they are supporting evidence, not the hero.
- Empty sides remain visibly empty and say so plainly.

### 2. Quote

Use when one named person and one public prediction are the story.

Primary use: individual take pages and graded receipts.

- One real portrait and one faithful quote fragment own the canvas.
- The pundit's name and outlet remain visible.
- Pending, hit, and miss are states of the same template, not separate designs.
- Matchup, frozen price, final score, and disclosure sit below the hook.
- The result treatment must not obscure the quote or imply a wager.

### 3. Editorial

Use when a collection, archive, record, team, week, or product concept is the story.

Primary use: week pages, team pages, sport landings, collection pages, and route-specific fallbacks.

- One oversized editorial statement or number supplies the hook.
- A compact evidence block explains why it matters.
- Faces appear only when they strengthen the collection story.
- The canvas is asymmetric and dense; it must not become a centered title floating in empty space.

## Universal layout rules

1. One hook, one dominant subject, one proof rail, one state, one Pundits signature.
2. Photos replace space. Do not add a separate card around a photo when the photo can be structural.
3. Supporting portraits use near-square image regions paired with useful attribution.
4. Never force square or portrait assets into 2:1 background slots.
5. Landscape headline line-height defaults to `1.02`; wrapped titles must retain visible leading.
6. The landscape proof rail reserves 64 px and never overlays names, faces, or result text.
7. Do not silently truncate people. Show the supported set and an explicit `+N` overflow.
8. Market cents remain secondary proof. A card should still make sense if the viewer does not know Kalshi.
9. Keep disclosures readable at actual feed size: frozen snapshot, not live odds, and not a bet the pundit placed.
10. Preserve honest empty states. Never invent a pick, face, quote, logo, or result to balance a composition.
11. Use real repository profile photos unchanged. Never generate or alter a real person's likeness.
12. Team marks remain the existing text chips until a rights-approved logo system exists.

## Portrait contract

There are two portrait roles:

- `featured`: one person may use a large full-bleed or half-canvas crop;
- `supporting`: a near-square portrait is paired with name and optional outlet.

Every portrait may declare a focal point. The renderer applies a safe center default when none exists.

```ts
type PortraitFocus = {
  x: number; // 0..1, left to right
  y: number; // 0..1, top to bottom
};

type PortraitPresentation = {
  punditId: string;
  focus?: PortraitFocus;
  featuredScale?: number;
};
```

Presentation metadata must not be added to `data/calls.json`, `data/events.json`, or other editorial ledgers merely for layout. Keep it in a renderer-owned module or a dedicated non-editorial asset manifest.

The initial visual fixture must include Josh Pate, Paul Finebaum, Andy Staples, Greg McElroy, and George Wrighster because their source photos exercise materially different crops.

## Route and artifact matrix

| Surface | Landscape archetype | Story/vertical archetype | Required story | Key state |
|---|---|---|---|---|
| `/picks/[slug]/` game | Split | Split stack | Yes | both sides, one side, empty, settled |
| `/picks/[slug]/` future | Split variant | Split stack variant | Yes | named outcome vs field; never away/home |
| `/picks/[slug]/[punditId]/` | Quote | Quote | Yes | pending, hit, miss |
| `/pundits/[id]/` | Quote/identity | Quote/identity | Yes | open picks, graded record, no graded sample |
| `/teams/[id]/` | Editorial | Later | No, until native story sharing exists | with, against, one-sided, no takes |
| `/ncaaf/[season]/[week]/` | Editorial | Later | No, until native story sharing exists | open slate, partial grade, final recap |
| `/nfl/[season]/[week]/` | Editorial | Later | No, until native story sharing exists | open slate, partial grade, final recap |
| `/ncaaf/`, `/nfl/` | Editorial | Not required | No | current slate and strongest disagreement |
| `/stories/` | Editorial | Not required | No | newest verified take feed |
| `/book/` | Editorial | Not required | No | compact ledger and newest evidence |
| `/leaderboard/` | Editorial | Not required | No | sample-aware record leader |
| `/` | Editorial | Not required | No | marquee disagreement or evergreen product promise |
| `/about/`, `/methodology/` | Editorial trust variant | Not required | No | evidence, frozen context, grading loop |
| `/privacy/`, `/terms/` | Editorial utility variant | Not required | No | route-specific title; minimal claims |
| unknown future content | Resolve by story shape | Resolve only if native sharing requires it | Contract decision | split, quote, or editorial |

Every indexable page gets a route-specific landscape image. The generic `/og.png` remains only an emergency fallback, not the normal image for collection or trust pages.

The route-driven visual matrix lives in
[`docs/mockups/social-template-matrix-2026-09-02.html`](../../mockups/social-template-matrix-2026-09-02.html).
Its verified family board is
[`docs/mockups/social-template-family-board-2026-09-02.png`](../../mockups/social-template-family-board-2026-09-02.png).
The matrix exercises the Quote/identity and Editorial team, week, and collection variants with live repository portraits.

## Archetype resolver

New content types choose a semantic story shape before they choose layout.

```ts
type SocialArchetype = "split" | "quote" | "editorial";
type SocialState = "pending" | "hit" | "miss" | "partial" | "final" | "evergreen";
type SocialFormat = "landscape" | "story";

type SocialCardModel = {
  archetype: SocialArchetype;
  format: SocialFormat;
  state: SocialState;
  kicker: string;
  headline: string;
  subject?: {
    name: string;
    portrait?: string;
    portraitFocus?: PortraitFocus;
    outlet?: string;
    quote?: string;
  };
  sides?: Array<{
    label: string;
    cents: number | null;
    people: Array<{ name: string; portrait?: string; portraitFocus?: PortraitFocus }>;
    total: number;
    empty: boolean;
  }>;
  proof: string[];
  disclosure: string;
};
```

The renderer consumes this model. Routes, social bots, and app cards should not assemble visual markup independently.

## Template behavior by edge case

### Event split

- `1 vs 1`: two featured portrait modules.
- `1 vs 2–4`: one featured portrait; supporting side uses a 2×2 portrait-plus-name grid.
- `2–4 vs 2–4`: symmetric supporting grids; counts carry hierarchy.
- `>4` on a side: render the highest-priority supported portraits and show `+N`; never use `.slice()` without overflow copy.
- one side empty: the populated side expands, while the empty side remains a deliberate statement rather than dead canvas.
- both sides empty: route may exist for operations, but it should not present a fabricated social consensus. Use an editorial event-information fallback and preserve noindex behavior where applicable.
- settled: add result/final state without changing who originally picked each side.

### Quote and receipt

- Quote fragments are faithful excerpts, not rewritten slogans.
- Very long quotes use a deterministic excerpt boundary and preserve the full quote on the linked page.
- `pending`: hook is the call.
- `hit` / `miss`: hook remains the call; result treatment supplies the closure.
- missing photo: use a restrained text-first identity block, not a generated face or decorative placeholder portrait.
- long names and outlets must wrap without shrinking below the minimum readable size.

### Editorial collections

- Week open: slate size and strongest disagreement.
- Week partial: graded/open counts, without calling the week final.
- Week final: record and one strongest receipt.
- Team: `with` and `against` counts plus representative faces; empty groups stay honest.
- Leaderboard: graded sample size travels with the record.
- Generic product/trust route: one product promise and one evidence line, never internal YES/NO vocabulary.

## Current data stress cases

Observed from live JSON on 2026-09-02:

- 31 events: 9 games and 22 futures;
- 43 mapped calls across 50 pundits;
- 25 events currently have at least one empty side;
- the largest current side has four pundits;
- mapped quotes range up to 370 characters;
- pundit names range up to 24 characters;
- the longest current event titles are 34 characters.

The test suite must use these real extremes plus synthetic overflow fixtures. Do not optimize only for Clemson–LSU.

## Rendering architecture

Keep stable public paths and metadata behavior:

- `/og/events/{slug}.png`
- `/og/takes/{slug}--{pundit}.png`
- `/og/pundits/{id}.png`
- `/og/teams/{id}.png`
- `/og/weeks/{sport}-{season}-week-{week}.png`
- existing story paths

Add route-specific collection images without changing published page URLs, for example `/og/pages/{route-key}.png`.

Recommended code boundary:

```text
lib/social-card/
  model.ts          semantic card model and states
  resolver.ts       product object -> archetype model
  portraits.ts      renderer-owned focal points
  paths.ts          stable output paths

scripts/social-card/
  tokens.tsx        colors, typography, spacing, proof rail
  primitives.tsx    wordmark, chip, portrait, attribution, disclosure
  split.tsx
  quote.tsx
  editorial.tsx
  story.tsx
  render.ts
```

`lib/og.ts` keeps its public helpers during migration and becomes a compatibility layer. `scripts/render-og.tsx` becomes orchestration rather than the only template file. This minimizes route churn and makes future app-card borrowing possible.

## Build and release safety

### Worktree ownership

- This design/renderer effort lives on `codex/social-card-system` in `.worktrees/social-card-system`.
- Grok social-engine work may continue in `docs/social/`, bot prompts, and social operations.
- Grok must not edit `lib/og.ts`, `scripts/render-og.tsx`, or the new `lib/social-card/` and `scripts/social-card/` modules while this branch owns the renderer migration.
- This branch avoids unrelated application-card components.
- Generated `public/og/**` files are build output, not a merge surface.

### Stable bot contract

Grok bots currently consume `public/social/cards.json` and its `events`, `takes`, and `pundits` arrays. Preserve every existing field and URL. New fields or arrays must be additive.

Safe additions may include:

- `schemaVersion`;
- `archetype` and `state` on existing rows;
- `teams`, `weeks`, or `pages` arrays when those assets become bot-addressable.

Do not rename `ogCard`, `storyCard`, `pageUrl`, status values, or side semantics.

### Atomic generation

The current renderer deletes output directories before it renders replacements. The migration should instead:

1. render every expected asset into a worktree-local temporary directory on the same volume;
2. verify count, dimensions, alpha, decode, and required file paths;
3. publish the complete set only after all renders pass;
4. leave the previous complete output intact on failure;
5. prevent two renderer processes from writing the same worktree simultaneously.

Worktrees are the primary concurrency boundary. Do not run Grok and Codex builds from the same checkout.

### Merge and deploy order

1. Merge independent Grok documentation/bot changes first when they do not touch renderer-owned files.
2. Rebase `codex/social-card-system` on the resulting `main`.
3. Run the renderer fixtures, `npm test`, and `npm run check` with `GITHUB_PAGES` unset.
4. Create a Cloudflare branch preview for visual inspection if production code changed.
5. Merge only a green, visually approved renderer.
6. Deploy once from a clean, synchronized `main` using `npm run deploy`.

No agent other than the release owner deploys production from a feature worktree.

## Verification fixtures

At minimum, render and inspect:

1. Clemson–LSU, 1 vs 4, with all five current portraits.
2. Game with one populated and one empty side.
3. Future with a named outcome vs the field.
4. Pending take with the 370-character Orlovsky source quote.
5. Hit and miss versions of the same take.
6. Pundit with the 24-character Fallica name.
7. Pundit with no graded record.
8. Synthetic side with six pundits to prove `+2` overflow.
9. Clemson team archive at 0 with / 3 against.
10. Week open, partial, and final states.
11. Route-specific home, stories, leaderboard, methodology, and terms images.
12. Missing-photo fallback.

Every accepted landscape fixture is reviewed at 1200×630 and at a 600×315 thumbnail. Story assets are reviewed at 1080×1920 and at common messaging-app reductions.

## Relationship to application cards

This social system should inspire later app-card improvements, but it must not silently redesign the application now.

Shareable media and application cards may share:

- semantic card model;
- state labels;
- palette and typography tokens;
- portrait focal points;
- attribution and overflow rules.

They should not share Satori markup or identical layouts. App cards must still support links, source evidence, scanning, responsive behavior, and accessibility. After the social system ships and earns approval, run a separate application-card audit and selectively borrow its hierarchy, crop handling, and density.

## Implementation sequence

1. Approve this contract and renderer ownership boundary.
2. Add semantic model, portrait focal points, and resolver tests without changing public images.
3. Migrate landscape event, take, and pundit cards to Split and Quote.
4. Migrate team, week, sport, collection, and trust routes to Editorial.
5. Migrate event, take, and pundit story assets.
6. Add a deterministic visual fixture gallery and production preview checklist.
7. Revisit application cards in a separate branch after social-card results are stable.

## Non-goals for this pass

- Rebrand Pundits.Pro.
- Change side semantics or frozen-price meaning.
- Add live odds, betting controls, comments, accounts, or a backend.
- Generate real people or team marks.
- Rewrite editorial JSON to improve a layout.
- Redesign application cards before the social templates are implemented and verified.
