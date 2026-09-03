# Phase 2 comprehension implementation plan

Status: Active plan

Date: 2026-08-31

> **For Codex:** paste the prompt at the bottom. This is UI/IA only. Do not hunt picks, edit JSON, or reopen Bets/fantasy.

**Goal:** A first-time fan can tell Picks, Takes, and Pundits apart, treat The Book as a Takes view, filter without eating the first mobile screen, and read a take page without hearing the same quote twice.

**Architecture:** Keep `/book/` as an append-only URL. Remove it from global nav. Collapse secondary filters behind `Filter & sort`. On take pages, stop embedding a full detail `EventCard` that repeats quotes; keep Receipt, grade sheet, source, and a compact link to the matchup. `Live`/`In play` language is already supposed to be gone — verify, do not re-implement.

**Tech Stack:** Next.js static export, existing `feed-tabs` / `details` CSS patterns, Vitest, `npm run check`.

**Spec:** `docs/ROADMAP.md` Phase 2, `docs/product/experience-principles.md` §§1–2 and §8, `docs/audits/2026-08-27-navigation-and-team-identity/audit.md` (IA only; ignore team logos).

## Global Constraints

- Public words stay `Open`, `Pending`, `Final`, `Final · Grading`, `Hit`, `Miss`. Never ship `Live picks`, `In play`, `Completed`, or `Finished`.
- `/book/` stays. Add a 301 only if you rename a published path — you will not rename it.
- Takes views already exist: `components/TakesViews.tsx` (`Quote feed` / `Compact ledger`).
- Keep green/black broadcast identity. No new type system.
- Do not edit `data/*.json`. Do not fill empty sides. Do not add Bets, fantasy, accounts, or extra homepage games.
- Methodology impact: none unless you change eligibility/grading claims. You will not. Skip `app/methodology/page.tsx`.
- Leave unrelated dirty files (`app/about/page.tsx`, `app/methodology/page.tsx`, `docs/competitive/*`, `docs/analysis/*`) untouched.
- `npm test` after helper/CSS-adjacent logic. `npm run check` after UI tasks.

## Already done — do not redo

- Pending call label is `Open` (`docs/superpowers/plans/2026-08-29-open-pick-language.md`, Status: Implemented).
- Homepage kicker `Most on record` (`app/page.tsx`); `scripts/verify-static.mjs` asserts it.
- Take page already has Receipt + grade sheet + `Also on this market` + Record row (`app/picks/[slug]/[punditId]/page.tsx`, `lib/seo.ts` `gradeSheet`).
- `TakesViews` already switches Stories ↔ Book.

Remaining Phase 2 work is nav, mobile filters, and take-page repetition.

## File map

- Modify: `components/NavLinks.tsx`
- Modify: `app/globals.css` (nav-more may become unused; filter disclosure)
- Modify: `components/StoryBoard.tsx`
- Modify: `components/BookLedger.tsx`
- Modify: `app/picks/[slug]/[punditId]/page.tsx`
- Modify: `app/book/page.tsx` (eyebrow copy only if it still says The Book as a top-level product)
- Modify: `scripts/verify-static.mjs` if home/nav assertions mention The Book in the header
- Test: `lib/seo.test.ts` only if take-page visible modules move into helpers
- Do not modify: `data/*`, methodology, About

---

### Task 1: The Book leaves global nav

**Files:**
- Modify: `components/NavLinks.tsx`
- Modify: `app/globals.css` only if `.nav-more` / `.nav-rest` become dead
- Modify: `app/book/page.tsx` eyebrow so it reads as a Takes view, not a fourth primary object
- Modify: `scripts/verify-static.mjs` if it asserts header Book (today it does not)

**Interfaces:**
- PRIMARY stays `Picks`, `Takes`, `Pundits`
- Takes `match` already includes `/book` and take paths — keep that so Book highlights Takes
- MORE currently is only The Book. After removal, MORE is empty — delete `MORE`, the `.nav-rest` desktop clone, and the `.nav-more` details menu

- [ ] **Step 1:** Change `NavLinks.tsx` to render only `PRIMARY`. No Book link, no More menu.

```tsx
export function NavLinks() {
  const path = usePathname() || "/";
  return (
    <nav className="site-nav" aria-label="Site">
      {PRIMARY.map((l) => (
        <NavLink
          key={l.href}
          href={l.href}
          label={l.label}
          ariaLabel={l.ariaLabel}
          on={l.match(path)}
        />
      ))}
    </nav>
  );
}
```

Keep the Takes matcher:

```ts
match: (p: string) =>
  p.startsWith("/stories") ||
  p.startsWith("/book") ||
  /\/picks\/[^/]+\/[^/]+/.test(p),
```

- [ ] **Step 2:** Book page eyebrow. Keep the h1. Change the eyebrow from `The Book — every tracked take` to `Takes · Compact ledger` so it matches `TakesViews`. Leave `<title>` containing The Book if you want search continuity; or keep metadata as-is. Do not delete `/book/`.

Homepage peek `Open The Book →` (`app/page.tsx`) may stay. That is a content link, not global nav.

- [ ] **Step 3:** Grep `components/` and `app/` for `The Book` in nav. Footer stays About / Methodology / Privacy. `npm test`.
- [ ] **Step 4: Commit** `fix: remove The Book from global nav`

---

### Task 2: Filter & sort on Takes (StoryBoard)

**Files:**
- Modify: `components/StoryBoard.tsx`
- Modify: `app/globals.css`

**Current:** three tablists (League, Kind, Order) plus search. Audit: secondary controls eat the first mobile screen. League stays visible. Kind (`All takes` / `Games` / `Futures`) and Order (`Latest` / `By game`) go behind `Filter & sort`.

- [ ] **Step 1:** Markup. Keep the league `feed-tabs` and the search field visible. Wrap kind + order in a `details` named Filter & sort:

```tsx
<div className="feed-tools">
  <div className="feed-tabs" role="tablist" aria-label="League">
    {/* existing All / NCAAF / NFL */}
  </div>
  <details className="feed-more">
    <summary>Filter & sort</summary>
    <div className="feed-more-panel">
      <div className="feed-tabs" role="tablist" aria-label="Kind">
        {/* existing All takes / Games / Futures */}
      </div>
      <div className="feed-tabs" role="tablist" aria-label="Order">
        {/* existing Latest / By game */}
      </div>
    </div>
  </details>
  <label className="feed-search">{/* unchanged */}</label>
</div>
```

When kind or group is not the default, set `summary` class `on` so the disclosure looks active. Do not put League inside the disclosure.

- [ ] **Step 2:** CSS. Reuse sticky `.feed-tools`. Panel should be a bordered block under the summary, full width on wrap, min 44px targets. At `min-width: 860px` you may leave kind/order visible without forcing the extra click — optional. Default: same disclosure at all breakpoints so behavior is one code path. Do not introduce a new color.

Example:

```css
.feed-more {
  position: relative;
}
.feed-more summary {
  list-style: none;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #2a2a2a;
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.feed-more summary::-webkit-details-marker { display: none; }
.feed-more summary.on,
.feed-more[open] summary {
  border-color: var(--green);
  color: var(--green);
}
.feed-more-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}
```

If `details` as a flex child collapses badly, wrap summary+panel so the panel can `flex-basis: 100%`.

- [ ] **Step 3:** Filtering logic in `useMemo` stays. Empty state copy stays. `npm test`.
- [ ] **Step 4: Commit** `fix: collapse Takes secondary filters`

---

### Task 3: Filter & sort on The Book (BookLedger)

**Files:**
- Modify: `components/BookLedger.tsx`
- Modify: `app/globals.css` if `.book-filters` needs the same disclosure

**Current:** Search + Sport + Kind + Mapping selects in a wrap row.

- [ ] **Step 1:** Keep Search visible. Put Sport / Kind / Mapping (and Reset) inside `details.feed-more` / `Filter & sort`. Reuse the same class names as StoryBoard if they fit; otherwise `book-more` next to `.book-filters`.

- [ ] **Step 2:** `filterBook` behavior unchanged (`lib/book-filter.ts`). Do not fire search-as-filter in this task.
- [ ] **Step 3: Commit** `fix: collapse Book secondary filters`

---

### Task 4: Take page — stop repeating the quote

**Files:**
- Modify: `app/picks/[slug]/[punditId]/page.tsx`
- Modify: `scripts/verify-static.mjs` (Finebaum take page assertions)
- Optionally: a small helper if you extract the compact matchup module

**Current take page (keep):**
- Headline from `pickStory`
- Share
- Source/graded byline
- `Receipt` (quote, stamp, Open source, freeze tape)
- `gradeSheet` (Result, The call, The price, Record)
- `EventCard` with `permalink={false} detail` under “The market” — **this repeats quotes on every face**
- `Also on this market`
- prev/next

JSON-LD / `pickStory.paragraphs` stay for SEO. Do not remove source evidence.

- [ ] **Step 1:** Replace the “The market” `EventCard` block with a compact matchup module that does **not** re-render face quotes:

```tsx
<section className="mt-8">
  <h2 className="type-broadcast mb-3 text-[22px] tracking-widest">
    The matchup
  </h2>
  <p className="lede" style={{ maxWidth: 720 }}>
    {event.awayTeam && event.homeTeam
      ? `${event.awayTeam} at ${event.homeTeam}.`
      : event.title}
    {" "}
    <Link href={`/picks/${event.slug}`}>Full game card →</Link>
  </p>
</section>
```

Keep `Also on this market`. Keep Receipt and grade sheet. Do not delete `Open source →`.

If you prefer a scan-only EventCard, pass `detail={false}` `permalink={true}` so titles link to the game and FaceRow skips quotes. Either approach is acceptable; do not keep `detail` quotes on this page.

- [ ] **Step 2:** Update `scripts/verify-static.mjs` Finebaum take assertions. Today it requires `receipt-stamp`, `grade-sheet`, `Full record →`, final score tape. It must still require those. If it starts requiring EventCard quote duplication, drop that, not the receipt.

Do not strip JSON-LD `NewsArticle` or canonical URL asserts.

- [ ] **Step 3:** `npx vitest run lib/seo.test.ts` — pickStory paragraphs still include the quote for articleBody. Visible page can be quieter.
- [ ] **Step 4:** `npm run check`.
- [ ] **Step 5: Commit** `fix: stop repeating take-page quotes`

---

### Task 5: Live-language smoke and Phase 2 closeout

- [ ] Grep `app/` `components/` `lib/` (exclude tests that use `noLive` as a fixture name, OG internal vars, `aria-live`, “not live odds”) for user-facing `Live picks`, `live expert`, `In play`.
- [ ] Confirm homepage still has `Most on record`.
- [ ] Confirm `/book/` still 200 in `scripts/required-routes.mjs`.
- [ ] `npm run check`.
- [ ] Browser if available: desktop + ~390px. Click Picks / Takes / Pundits. Open Takes → Filter & sort. Open Book via Compact ledger, not the header. Open a graded take (Finebaum TCU) and confirm one quote (Receipt) and a link to the game.

If you cannot run a browser, say so and rely on `npm run check`.

## Out of scope

- Team logos
- Measurement events (separate plan: `docs/superpowers/plans/2026-08-31-engagement-events.md`)
- Scout, Promote, JSON
- New page types
- Changing Takes view labels to “Stories” / “The Book” in the header

## Codex prompt

```
You are implementing docs/superpowers/plans/2026-08-31-phase-2-comprehension.md on the Pundits.Pro repo.

Read first: docs/ROADMAP.md Phase 2, docs/product/experience-principles.md, components/NavLinks.tsx, components/TakesViews.tsx, components/StoryBoard.tsx, components/BookLedger.tsx, app/picks/[slug]/[punditId]/page.tsx, AGENTS.md.

Do the tasks in order. Keep /book/ published. Remove The Book only from global nav. Collapse Kind/Order (Takes) and Sport/Kind/Mapping (Book) behind "Filter & sort"; keep league tabs and search visible. On take pages, do not repeat the quote in a detail EventCard; keep Receipt, source, grade sheet, JSON-LD.

Do not edit data/*.json, methodology, About, or the other plan. Do not ship Live/In play for pending picks.

Run npm test after Tasks 1–3. Run npm run check after Tasks 4–5.

Commit after each task with fix: one-liners. Leave unrelated dirty files untouched.
```
