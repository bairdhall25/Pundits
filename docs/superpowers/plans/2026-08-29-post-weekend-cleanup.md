# Post-weekend cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four small cleanups after Week 0 grades: one side-label helper everywhere fans see a market, faster OG deploys, one route list for the two verifiers, and a thinner EventCard.

**Architecture:** No new product surface. Wire `lib/public-side.ts` (already written, currently unused) into `sidesForCard`, `sideChip`, PeekRow, and EventCard so YES/NO cannot leak. Point `npm run build` at the existing incremental OG skip. Share core URL/file pairs between `verify-static` and `verify-live`. Split FaceRow/SideCol out of EventCard last so it does not collide with the label pass.

**Tech Stack:** Next 16 static export, Vitest, existing `scripts/render-og.tsx --force` flag.

**Spec:** This plan. Product rules stay: YES = away internally; fan copy is teams or Takes it / Against; Kalshi freeze is a receipt; no live odds; no backend.

## Global Constraints

- Start **after Grader** for Dublin and Charlottesville, not during Saturday games.
- Do not rewrite `seo.ts`, `og.ts`, or `data.ts` as a project. Touch them only at the call sites below.
- Do not merge bots markdown. House-rule duplication is intentional.
- Do not split `globals.css`.
- Do not treat week-archive / team pages as part of this cleanup.
- `npm test` and `npm run verify:static` stay green after every task. Deploy only when a task changes rendered HTML or OG output.
- Internal `side: "yes" | "no"` stays on `Call` and `CardSide`. Only **labels** change.

## Order

1. Side labels (fan copy, highest leak risk)
2. Incremental OG (deploy time)
3. Shared verify routes (stop list drift)
4. Split EventCard (file size; after 1 so SideCol is stable)

Each task is its own commit.

---

### Task 1: One public side label

**Files:**
- Track if needed: `lib/public-side.ts`, `lib/public-side.test.ts` (already on disk, may be untracked)
- Modify: `lib/data.ts` (`sidesForCard`)
- Modify: `lib/data.test.ts`
- Modify: `lib/seo.ts` (`sideChip`)
- Modify: `components/PeekRow.tsx` (`FuturePeek` tape)
- Modify: `components/EventCard.tsx` (detail `lab` line; market-details copy already uses `yes.label`)
- Test: `lib/public-side.test.ts`, `lib/data.test.ts`, `npx vitest run`, then `npm run verify:static`

**Interfaces:**
- Consumes: `publicSideLabel(event: Event, side: Side): string` in `lib/public-side.ts`
- Produces: `sidesForCard` labels come from `publicSideLabel`; `sideChip` is `publicSideLabel`; PeekRow tape uses the same strings; EventCard lab is Away/Home **or** drop lab if `side.label` already names the team (prefer **keep Away/Home as orientation**, not as the team name)

- [ ] **Step 1: Confirm the helper is tracked**

If `git ls-files lib/public-side.ts` is empty, add it. Do not rewrite the helper.

Current contract (keep):

```ts
export function publicSideLabel(event: Event, side: Side): string {
  if (event.kind !== "game") {
    return side === "yes" ? "Takes it" : "Against";
  }
  if (side === "yes") return event.awayTeam ?? "Away";
  return event.homeTeam ?? "Home";
}
```

- [ ] **Step 2: Failing test — futures must not say YES**

Add to `lib/data.test.ts` inside `describe("sidesForCard")` after the empty-side test:

```ts
  it("uses fan-facing labels for a future", () => {
    const future: Event = {
      ...event,
      slug: "indiana-title-2026",
      kind: "future",
      awayTeam: undefined,
      homeTeam: undefined,
    };
    const [yes, no] = sidesForCard(future, []);
    expect(yes.label).toBe("Takes it");
    expect(no.label).toBe("Against");
  });
```

Run: `npx vitest run lib/data.test.ts`

Expected: FAIL `expected 'YES' to be 'Takes it'` (today `sidesForCard` uses `event.awayTeam ?? "YES"`).

- [ ] **Step 3: Wire `sidesForCard`**

In `lib/data.ts`:

```ts
import { publicSideLabel } from "./public-side";

export function sidesForCard(event: Event, calls: Call[]): [CardSide, CardSide] {
  const yes: CardSide = {
    side: "yes",
    label: publicSideLabel(event, "yes"),
    cents: event.yesCents,
    calls: callsForEvent(event.slug, calls, "yes"),
    teamId: event.awayTeamId,
  };
  const no: CardSide = {
    side: "no",
    label: publicSideLabel(event, "no"),
    cents: event.noCents,
    calls: callsForEvent(event.slug, calls, "no"),
    teamId: event.homeTeamId,
  };
  return [yes, no];
}
```

- [ ] **Step 4: Dedup `sideChip` and PeekRow**

`lib/seo.ts` `sideChip` becomes:

```ts
import { publicSideLabel } from "./public-side";

export function sideChip(event: Event, side: "yes" | "no"): string {
  return publicSideLabel(event, side);
}
```

`components/PeekRow.tsx` `FuturePeek` tape: replace the hardcoded `<span>Takes it</span>` / `<span>Against</span>` with `publicSideLabel(event, "yes")` and `publicSideLabel(event, "no")`.

Leave EventCard `lab` as Away/Home on **detail + game** only (orientation, not the team chip). Do not print YES/NO anywhere in JSX.

- [ ] **Step 5: Tests + static**

```
npx vitest run
npm run verify:static
```

Expected: all green. `verify-static` already forbids `class="scan-name...">Yes<` on home.

- [ ] **Step 6: Commit**

```
git add lib/public-side.ts lib/public-side.test.ts lib/data.ts lib/data.test.ts lib/seo.ts components/PeekRow.tsx
git commit -m "Use one fan-facing side label everywhere.

Wire publicSideLabel into sidesForCard, story chips, and futures tape so YES/NO cannot leak onto cards."
```

---

### Task 2: Incremental OG on deploy

**Files:**
- Modify: `package.json` `build` script
- Modify: `docs/RUNBOOK.md` (one sentence under deploy)
- Do not change `shouldSkip` / `renderAllOg` unless a bug shows up

**Interfaces:**
- Consumes: `renderAllOg(force: boolean)` already skips when PNG count matches and outputs are newer than `data/*.json`, `lib/og.ts`, `scripts/render-og.tsx`
- Produces: `npm run build` is incremental; `npm run og` stays `--force`

Today `package.json` is:

```json
"og": "tsx scripts/render-og.tsx --force",
"predev": "tsx scripts/render-og.tsx",
"build": "tsx scripts/render-og.tsx --force && next build",
```

- [ ] **Step 1: Point build at the skip path**

```json
"build": "tsx scripts/render-og.tsx && next build",
```

Keep `"og": "tsx scripts/render-og.tsx --force"` for when cards actually change shape.

- [ ] **Step 2: RUNBOOK sentence**

Replace any leftover “OG always --force” implication. Add under deploy:

```
`npm run build` skips OG PNGs when data and `lib/og.ts` are unchanged. Use `npm run og` to force a full card rebuild after OG layout changes.
```

- [ ] **Step 3: Prove skip vs force locally**

```
npx tsx scripts/render-og.tsx
```

Expected: log `OG cards: N takes, …` in well under a minute (skip). Then:

```
npx tsx scripts/render-og.tsx --force
```

Expected: full rewrite, slower.

- [ ] **Step 4: Commit**

```
git add package.json docs/RUNBOOK.md
git commit -m "Skip unchanged OG cards on production builds.

Keep npm run og as the force path after card-layout changes."
```

No production deploy required unless you want a faster next Promote. Behavior of live PNGs is unchanged.

---

### Task 3: One route list for both verifiers

**Files:**
- Create: `scripts/required-routes.mjs`
- Modify: `scripts/verify-static.mjs`
- Modify: `scripts/verify-live.mjs`

**Interfaces:**
- Consumes: current `requiredFiles` in verify-static and `routes` seed in verify-live
- Produces: `CORE_PAGES: { url: string, file: string }[]` plus OG files that only static checks

- [ ] **Step 1: Add the shared module**

`scripts/required-routes.mjs`:

```js
/** Core pages both verifiers must see. url is live path; file is under out/. */
export const CORE_PAGES = [
  { url: "/", file: "index.html" },
  { url: "/stories/", file: "stories/index.html" },
  { url: "/book/", file: "book/index.html" },
  { url: "/leaderboard/", file: "leaderboard/index.html" },
  { url: "/ncaaf/", file: "ncaaf/index.html" },
  { url: "/nfl/", file: "nfl/index.html" },
  { url: "/picks/unc-vs-tcu-2026/", file: "picks/unc-vs-tcu-2026/index.html" },
  { url: "/picks/unc-vs-tcu-2026/finebaum/", file: "picks/unc-vs-tcu-2026/finebaum/index.html" },
  { url: "/picks/ncsu-at-uva-2026/kanell/", file: "picks/ncsu-at-uva-2026/kanell/index.html" },
  { url: "/picks/unc-vs-tcu-2026/patterson/", file: "picks/unc-vs-tcu-2026/patterson/index.html" },
  { url: "/pundits/herbstreit/", file: "pundits/herbstreit/index.html" },
  { url: "/privacy/", file: "privacy/index.html" },
  { url: "/about/", file: "about/index.html" },
  { url: "/terms/", file: "terms/index.html" },
  { url: "/sitemap.xml", file: "sitemap.xml" },
];

export const STATIC_ONLY_FILES = [
  "og/takes/unc-vs-tcu-2026--finebaum.png",
  "og/takes/ncsu-at-uva-2026--kanell.png",
  "og/takes/unc-vs-tcu-2026--patterson.png",
  "og/events/unc-vs-tcu-2026.png",
  "og/events/ncsu-at-uva-2026.png",
  "og/pundits/finebaum.png",
  "og/stories/takes/unc-vs-tcu-2026--finebaum.png",
  "og/stories/events/unc-vs-tcu-2026.png",
  "og/stories/pundits/finebaum.png",
  "robots.txt",
  "news-sitemap.xml",
  "feed.xml",
  "_redirects",
];
```

- [ ] **Step 2: Point both scripts at it**

`verify-static.mjs`: `requiredFiles = [...CORE_PAGES.map((p) => p.file), ...STATIC_ONLY_FILES]`.

`verify-live.mjs`: seed `routes` from `CORE_PAGES.map((p) => p.url)` plus existing mapped-hard-call expansion and `/og/takes/ncsu-at-uva-2026--kanell.png` if not already covered by the expansion.

Keep page-body asserts (Indie Labs, Open on Kalshi, data-kickoff, Hypothetical $100, Most on record, no event-hit) in verify-static. Do not move those into the shared module.

- [ ] **Step 3: Run both**

```
npm run verify:static
npm run verify:live
```

Expected: same pass as today. If live 404s a new CORE url, that URL was already missing — fix the list, do not invent pages.

- [ ] **Step 4: Commit**

```
git add scripts/required-routes.mjs scripts/verify-static.mjs scripts/verify-live.mjs
git commit -m "Share core routes between static and live verifiers.

Stop the two launch checklists from drifting on Dublin, Kanell, and OG paths."
```

---

### Task 4: Split EventCard

**Files:**
- Create: `components/EventFaceRow.tsx` (current `FaceRow`)
- Create: `components/EventSideCol.tsx` (current `SideCol`)
- Modify: `components/EventCard.tsx` (composer only)
- No CSS class rename. No behavior change.

**Interfaces:**
- Consumes: Task 1 labels already on `side.label`
- Produces: `EventCard` imports `EventFaceRow` / `EventSideCol`; same props `SideCol` has today (`side`, `pundits`, `teams`, `detail`, `game`, `eventSlug`, `settled`, `eventHref`)

- [ ] **Step 1: Move the two functions out verbatim**

Copy `FaceRow` and `SideCol` from `components/EventCard.tsx` into the new files. Export them. Import in EventCard. Delete the locals.

Do not restyle. Do not change tap-target links (`event-title-link`, `event-price-link`, `person-hit`, `see-why`).

- [ ] **Step 2: Static check**

```
npx vitest run
npm run verify:static
```

Expected: home still has `event-title-link` and no `event-hit`; NCSU/Dublin still have Open on Kalshi.

- [ ] **Step 3: Commit**

```
git add components/EventFaceRow.tsx components/EventSideCol.tsx components/EventCard.tsx
git commit -m "Split EventCard face and side columns into their own files.

No behavior change; the card file was doing permalinks, Kalshi, kickoff, and faces."
```

Deploy this task only if you want production to match git. HTML should be identical.

---

## Out of scope (explicit)

- Rewriting `seo.ts` / `og.ts` / `data.ts` internals
- Merging `bots/*.md`
- Splitting `globals.css`
- Week-archive / team-page polish
- Live Kalshi API
- Changing YES = away in JSON

## Done when

- Futures cards never show the strings YES or NO as team labels
- `npm run build` does not rebuild OG when JSON and `lib/og.ts` are untouched
- Adding a launch URL means editing **one** list
- `EventCard.tsx` is a composer, not three components in one file
