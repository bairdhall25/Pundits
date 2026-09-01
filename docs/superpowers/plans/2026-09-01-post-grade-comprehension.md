# Post-grade comprehension implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After Week 0 graded, a first-time fan can read records, Book rows, and neutral-site games in sports language, and the public “open” count is the same on a take page and a pundit profile.

**Architecture:** Keep internal YES = away / NO = home. Fix the public layer: one helper for fan-facing side lines, one sort for the table, one title-based rule for `vs` games. Do not add tabs, sports, or scoring systems. Empty sides stay empty. Editorial JSON is a separate trailing task.

**Tech Stack:** Next.js static export, existing `feed-tabs` / `wait-row` / Vitest, `npm test` after helper changes, `npm run check` after UI/route changes.

**Spec:** `docs/product/experience-principles.md` §§2, 5, 6, 10, 11; `docs/product/decision-log.md` (records are not skill; hypothetical $100 is secondary); 2026-08-31 live QA pass in the parent session.

## Locked decisions

These are the QA recommendations, not open questions. Do not re-litigate them in implementation.

1. **The table is a ledger, not a predictor.** Default sort is results-first: more graded picks, then hits, then fewer misses, then open. Provide an `Open picks` tab for the old volume sort. Copy must say sample sizes are small. Do not title anyone best, most accurate, or #1 in the sense of skill.
2. **Home “Most on record” uses that same results-first board.** Show a 2026 W–L on a peek only when *that* pundit has a graded pick. Keep the kicker `Most on record` (verify-static asserts it).
3. **Public rows never print YES/NO or “at risk.”** Book, pundit CallCards, and future receipts use `publicSideLabel`. Stake copy is `hypothetical $100`. Methodology may still explain YES = away.
4. **`vs` in the event title means neutral-site public copy.** Use `event.title` as the matchup sentence. Do not say “Wisconsin at Notre Dame.” Hide Away/Home chips on `vs` games; keep the mapping in Market details.
5. **`open` means mapped hard pending.** Unmapped hard takes are Other takes, not open picks. Take-page Record rows must match `mappedPending` on the profile. Wins and losses on the 2026 column also count mapped hard takes only — methodology already keeps unmapped takes out of the record.
6. **Futures without a face are a waiting list, not a full peek.** Home disagreements require at least one mapped pick and still prefer fights. Do not invent picks to fill a side.
7. **Do not unduplicate the Clemson hero.** One open CFB game must stay on the College board so the section is not only Week 0 receipts.
8. **Do not edit `data/*.json` in Tasks 1–7.** Quote/ASR/cover-mapping is Task 8, Promote-owned, its own commit.

## Global Constraints

- Public words stay `Open`, `Pending`, `Final`, `Final · Grading`, `Hit`, `Miss`. Never ship `Live picks`, `In play`, `Completed`, or `Finished`.
- Internal game mapping stays YES = away, NO = home. Do not change data, URLs, or grading.
- Empty sides stay empty. Do not fill Clemson, NFL YES, or empty Super Bowl sides.
- Hypothetical $100 stays as scoring bookkeeping. It must not read as a bet they placed.
- Records show sample size and must not imply predictive skill.
- `/book/`, `/stories/`, `/leaderboard/` stay. No new published routes except `app/not-found.tsx` (not a content URL).
- Keep green/black broadcast identity. No new type system.
- Methodology impact: none unless a task changes eligibility, mapping, or what a record counts. Tasks 1–7 do not. Skip `app/methodology/page.tsx`.
- Leave unrelated dirty files (`docs/competitive/*`, `docs/analysis/*`, `docs/ROADMAP.md` until Task 7) as specified per task.
- `npm test` after helper/CSS-adjacent logic. `npm run check` after UI, route, or copy tasks.

## Already done — do not redo

- Scan cards already show team names + American odds, not YES/NO.
- Nav is Picks / Takes / Pundits. Book is a Takes view.
- Take pages already use Receipt + grade sheet + compact matchup link.
- Empty *games* on the NCAAF slate already use a compact waiting list.
- Email form is already below home content.
- Status language is already `Open` / `Hit` / `Miss`.

## File map

- Modify: `lib/data.ts` — `seasonFromCalls` pending, `sortActivityBoard`, `getActivityBoard`, futures peek filter
- Modify: `lib/data.test.ts`, `lib/bets.test.ts`, `lib/seo.test.ts`
- Modify: `lib/public-side.ts` — `mappedStakeLine`, `isVsGame`, `matchupSentence`
- Modify: `lib/public-side.test.ts`, `lib/format.ts` (`sportChip`)
- Modify: `components/CallCard.tsx`, `components/Receipt.tsx`, `components/EventCard.tsx`
- Modify: `components/LeaderboardClient.tsx`, `components/LeaderboardBoard.tsx`, `components/PeekRow.tsx`
- Modify: `components/SportSlate.tsx`, `components/ShareButton.tsx`, `components/StoryBoard.tsx` (CSS only if class names)
- Modify: `app/leaderboard/page.tsx`, `app/page.tsx`, `app/pundits/[id]/page.tsx`
- Modify: `app/picks/[slug]/[punditId]/page.tsx`, `app/picks/[slug]/page.tsx`
- Modify: `app/teams/[id]/page.tsx`, `app/globals.css`
- Create: `app/not-found.tsx`
- Modify: `scripts/verify-static.mjs`
- Modify: `docs/ROADMAP.md` (Task 7 only)
- Modify: `data/calls.json` (Task 8 only, Promote)

---

### Task 1: Open means mapped pending

**Files:**
- Modify: `lib/data.ts` (`seasonFromCalls`)
- Test: `lib/data.test.ts`
- Test: `lib/seo.test.ts` (McElroy Record row, if the live corpus is used)

**Interfaces:**
- Consumes: `isMapped(call)` already in `lib/data.ts`
- Produces: `seasonFromCalls(punditId, calls)` counts **mapped** hard takes only: `pending` / `wins` / `losses`. Soft and unmapped hard calls increment none of the three. `mappedPending` on the activity record stays mapped pending of any kind, so the take-page “open” figure matches the profile.

- [ ] **Step 1: Write the failing test**

In `lib/data.test.ts`, extend the Finebaum fixture with an unmapped hard pending call and assert it does not count as open:

```ts
  {
    id: "c4",
    punditId: "finebaum",
    claim: "11 wins is the floor for the Irish.",
    source: "Always College Football",
    sourceUrl: null,
    sourceDate: "2026-08-13",
    kind: "hard",
    subject: "Notre Dame",
    paysOn: "2026 Notre Dame win total",
    status: "pending",
  },
```

The existing test `counts a hard hit as a win` uses Saban’s unmapped `c3`. Change it to expect `{ wins: 0, losses: 0, pending: 0 }`, or give `c3` an `eventSlug` + `side` in a *separate* mapped-hit case. Do not leave a test that treats unmapped hard hits as 2026 wins.

Update the existing Finebaum expectation and add:

```ts
it("counts only mapped hard hit/miss/pending toward the 2026 record", () => {
  expect(seasonFromCalls("finebaum", calls)).toEqual({
    wins: 0,
    losses: 0,
    pending: 1, // c1 mapped; c4 unmapped hard pending is ignored
  });
  expect(seasonFromCalls("saban", calls)).toEqual({
    wins: 0, // c3 is an unmapped hard hit — not a public record
    losses: 0,
    pending: 0,
  });
});

it("does not treat unmapped hard takes as open picks", () => {
  expect(seasonFromCalls("finebaum", calls).pending).toBe(
    calls.filter(
      (c) =>
        c.punditId === "finebaum" &&
        c.kind === "hard" &&
        c.status === "pending" &&
        Boolean(c.eventSlug && c.side)
    ).length
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/data.test.ts`

Expected: FAIL — current `seasonFromCalls` counts all hard pending, so Finebaum pending is 2.

- [ ] **Step 3: Write minimal implementation**

In `lib/data.ts`, change `seasonFromCalls`:

```ts
export function seasonFromCalls(
  punditId: string,
  calls: Call[]
): { wins: number; losses: number; pending: number } {
  const hard = calls.filter((c) => c.punditId === punditId && c.kind === "hard");
  const mappedHard = hard.filter(isMapped);
  return {
    wins: mappedHard.filter((c) => c.status === "hit").length,
    losses: mappedHard.filter((c) => c.status === "miss").length,
    pending: mappedHard.filter((c) => c.status === "pending").length,
  };
}
```

`isMapped` is already defined in this file. If the current file order puts `seasonFromCalls` above `isMapped`, either move `isMapped` up or inline `Boolean(c.eventSlug && c.side)` in the pending filter. Do not create a second mapper.

- [ ] **Step 4: Align the live McElroy Record row**

In `lib/seo.test.ts` add:

```ts
it("reports the same open count as the pundit profile", () => {
  const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
    (t) => t.pundit.id === "mcelroy" && t.event.slug === "unc-vs-tcu-2026"
  )!;
  const rows = gradeSheet(take, loadCalls(), loadPundits());
  const record = rows.find((r) => r.label === "Record")!;
  const board = getActivityBoard(loadPundits(), loadCalls());
  const mcelroy = board.find((p) => p.id === "mcelroy")!;
  expect(mcelroy.mappedPending).toBe(0);
  expect(record.value).toContain("1–0");
  expect(record.value).not.toMatch(/with 1 open|— 1 open/);
});
```

Import `getActivityBoard` from `./data` if needed. Run `npx vitest run lib/seo.test.ts lib/data.test.ts`. Expected: PASS after Step 3 because `gradeSheet` already uses `seasonFromCalls`.

- [ ] **Step 5: Commit**

```bash
git add lib/data.ts lib/data.test.ts lib/seo.test.ts
git commit -m "fix: count only mapped hard takes as open picks"
```

---

### Task 2: Results-first table

**Files:**
- Modify: `lib/data.ts` (`sortActivityBoard`, `getActivityBoard`)
- Test: `lib/data.test.ts`
- Modify: `app/leaderboard/page.tsx`
- Modify: `components/LeaderboardClient.tsx`
- Modify: `components/LeaderboardBoard.tsx`
- Modify: `components/PeekRow.tsx` (`TablePeek`)
- Modify: `app/page.tsx` only if the home table needs a local filter (prefer using `getActivityBoard` as-is)
- Modify: `scripts/verify-static.mjs`

**Interfaces:**
- Consumes: `ActivityRecord`, `hasGradedRecords`
- Produces:

```ts
export type BoardSort = "results" | "open";

export function sortActivityBoard(
  board: ActivityRecord[],
  sort: BoardSort
): ActivityRecord[];
```

`getActivityBoard` returns `sortActivityBoard(board, hasGradedRecords(board) ? "results" : "open")`.

Results sort, in order:
1. `wins + losses` descending (sample size first)
2. `wins` descending
3. `losses` ascending
4. `mappedPending` descending
5. `name` localeCompare

Open sort stays today’s order: `mappedPending`, `totalCalls`, `name`.

- [ ] **Step 1: Write the failing sort tests**

In `lib/data.test.ts`, keep the existing open-rank test but point it at `sortActivityBoard(..., "open")`. Add:

```ts
describe("sortActivityBoard", () => {
  it("ranks by mapped pending when sort is open", () => {
    const board = getActivityBoard(pundits, calls);
    expect(sortActivityBoard(board, "open").map((p) => p.id)).toEqual([
      "finebaum",
      "saban",
    ]);
  });

  it("puts sample size before hits when sort is results", () => {
    const mappedHit: Call = {
      ...calls.find((c) => c.id === "c3")!,
      id: "c3-mapped",
      eventSlug: "georgia-cfp",
      side: "yes",
    };
    const board = getActivityBoard(pundits, [...calls, mappedHit]);
    // saban now has a mapped hard hit; finebaum has none
    expect(sortActivityBoard(board, "results").map((p) => p.id)).toEqual([
      "saban",
      "finebaum",
    ]);
  });
});
```

Using live data, add:

```ts
it("on the live board, Patterson (1–1) outranks McElroy (1–0) by sample size", () => {
  const board = getActivityBoard(loadPundits(), loadCalls());
  const ids = sortActivityBoard(board, "results").map((p) => p.id);
  expect(ids.indexOf("patterson")).toBeLessThan(ids.indexOf("mcelroy"));
  expect(ids.indexOf("mcelroy")).toBeLessThan(ids.indexOf("herbstreit"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/data.test.ts`

Expected: FAIL — `sortActivityBoard` is not exported; live board still leads with Herbstreit on open volume.

- [ ] **Step 3: Implement sort**

In `lib/data.ts`:

```ts
export type BoardSort = "results" | "open";

function gradedSample(p: ActivityRecord): number {
  return p.season2026.wins + p.season2026.losses;
}

export function sortActivityBoard(
  board: ActivityRecord[],
  sort: BoardSort
): ActivityRecord[] {
  const copy = [...board];
  if (sort === "open") {
    return copy.sort(
      (a, b) =>
        b.mappedPending - a.mappedPending ||
        b.totalCalls - a.totalCalls ||
        a.name.localeCompare(b.name)
    );
  }
  return copy.sort(
    (a, b) =>
      gradedSample(b) - gradedSample(a) ||
      b.season2026.wins - a.season2026.wins ||
      a.season2026.losses - b.season2026.losses ||
      b.mappedPending - a.mappedPending ||
      a.name.localeCompare(b.name)
  );
}

export function getActivityBoard(pundits: Pundit[], calls: Call[]): ActivityRecord[] {
  const board = pundits.map((p) => toActivityRecord(p, calls));
  return sortActivityBoard(
    board,
    hasGradedRecords(board) ? "results" : "open"
  );
}
```

Update the old `getActivityBoard` test name to say it defaults to results-first once anyone has a graded pick. In the fixture, Saban has a hit, so default order becomes `["saban", "finebaum"]`.

- [ ] **Step 4: Leaderboard UI**

`app/leaderboard/page.tsx` lede becomes:

```tsx
<p className="lede">
  People with a 2026 result first, by how many picks have graded, then
  hits. Sample sizes are small — this is a ledger, not a claim they can
  predict. Switch to open picks to see volume.
</p>
```

`LeaderboardClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { hasGradedRecords } from "@/lib/records";
import { sortActivityBoard, type BoardSort } from "@/lib/data";
import type { ActivityRecord } from "@/lib/types";

export function LeaderboardClient({ board }: { board: ActivityRecord[] }) {
  const graded = hasGradedRecords(board);
  const [sort, setSort] = useState<BoardSort>(graded ? "results" : "open");
  const [showAll, setShowAll] = useState(false);
  const rows = sortActivityBoard(board, sort);
  return (
    <>
      {graded ? (
        <div className="feed-tabs" role="tablist" aria-label="Table order">
          <button
            type="button"
            role="tab"
            aria-selected={sort === "results"}
            className={sort === "results" ? "on" : undefined}
            onClick={() => setSort("results")}
          >
            2026 results
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sort === "open"}
            className={sort === "open" ? "on" : undefined}
            onClick={() => setSort("open")}
          >
            Open picks
          </button>
        </div>
      ) : null}
      <LeaderboardBoard board={rows} showAll={showAll} onShowAll={setShowAll} />
    </>
  );
}
```

`sortActivityBoard` and `BoardSort` must be safe to import from a client component. They already have no Node `fs` usage. Do **not** import `getActivityBoard` into the client file.

If `lib/data.ts` still imports `readFileSync` at module scope (it does, via `loadPundits`), a client import of `sortActivityBoard` from `lib/data.ts` will pull fs into the client bundle and fail the build.

**Required split:** move `sortActivityBoard`, `BoardSort`, `toActivityRecord`, `seasonFromCalls`, and `isMapped` into `lib/records.ts` (already client-safe besides types) **or** a new `lib/board.ts` that imports only types. Prefer `lib/records.ts` if the file stays small; otherwise create `lib/board.ts`. Re-export from `lib/data.ts` for server callers so existing imports keep working.

Minimum `lib/board.ts`:

```ts
import type { ActivityRecord } from "./types";
import { hasGradedRecords } from "./records";

export type BoardSort = "results" | "open";

export function sortActivityBoard(
  board: ActivityRecord[],
  sort: BoardSort
): ActivityRecord[] {
  /* same as above */
}

export function defaultBoardSort(board: ActivityRecord[]): BoardSort {
  return hasGradedRecords(board) ? "results" : "open";
}
```

Client imports from `@/lib/board`. Server `getActivityBoard` uses `defaultBoardSort` + `sortActivityBoard`.

- [ ] **Step 5: Home peeks do not stamp 0–0 on volume leaders**

In `components/PeekRow.tsx`, change `TablePeek`:

```tsx
export function TablePeek({ p }: { p: ActivityRecord }) {
  const sample = p.season2026.wins + p.season2026.losses;
  return (
    <Link href={`/pundits/${p.id}`} className="peek table-card">
      <PunditAvatar src={p.photo} alt={p.name} size="row" />
      <div className="nm type-broadcast">{p.name.split(" ").slice(-1)[0]}</div>
      {sample > 0 ? (
        <>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            2026
          </div>
          <div className="pct type-broadcast">
            {p.season2026.wins}–{p.season2026.losses}
          </div>
          <div className="wl">{p.mappedPending} open</div>
        </>
      ) : (
        <>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Open
          </div>
          <div className="pct type-broadcast">{p.mappedPending}</div>
        </>
      )}
    </Link>
  );
}
```

In `app/page.tsx`, drop the `graded={hasGradedRecords(table)}` prop. Home already slices `getActivityBoard(...).slice(0, 10)`, which is now results-first, so Patterson/McElroy lead rather than Herbstreit.

- [ ] **Step 6: Verify**

Run: `npx vitest run lib/data.test.ts lib/records.test.ts`

Then `npm run check`.

In `scripts/verify-static.mjs` keep `Most on record`. Add:

```js
assert.match(home, /Chip Patterson|Greg McElroy/);
const table = await readFile(path.join(out, "leaderboard/index.html"), "utf8");
assert.match(table, /Sample sizes are small/);
assert.match(table, /2026 results/);
assert.match(table, /Open picks/);
```

- [ ] **Step 7: Commit**

```bash
git add lib/board.ts lib/data.ts lib/data.test.ts lib/records.ts app/leaderboard/page.tsx components/LeaderboardClient.tsx components/LeaderboardBoard.tsx components/PeekRow.tsx app/page.tsx scripts/verify-static.mjs
git commit -m "fix: rank the table by graded sample, not open volume"
```

---

### Task 3: Book and pundit rows speak football

**Files:**
- Modify: `lib/public-side.ts`
- Test: `lib/public-side.test.ts`
- Modify: `components/CallCard.tsx`
- Modify: `components/Receipt.tsx`
- Modify: `app/pundits/[id]/page.tsx`
- Modify: `scripts/verify-static.mjs`

**Interfaces:**
- Consumes: `publicSideLabel(event, side)`, `formatCents`
- Produces:

```ts
export function mappedStakeLine(
  event: Event,
  side: Side,
  cents: number | null
): { label: string; line: string };
```

`line` format: `${event.title} · ${label} @ ${formatCents(cents)} · hypothetical $100`

Never include `YES`, `NO`, or `at risk`.

- [ ] **Step 1: Write the failing helper tests**

In `lib/public-side.test.ts`:

```ts
import { mappedStakeLine, publicSideLabel } from "./public-side";

it("prints the team, not YES/NO, on a game stake line", () => {
  const event = {
    kind: "game",
    title: "Clemson at LSU",
    awayTeam: "Clemson",
    homeTeam: "LSU",
  } as Event;
  const row = mappedStakeLine(event, "no", 78);
  expect(row.label).toBe("LSU");
  expect(row.line).toBe("Clemson at LSU · LSU @ 78¢ · hypothetical $100");
  expect(row.line).not.toMatch(/\bYES\b|\bNO\b|at risk/i);
});

it("prints Takes it / Against on a future stake line", () => {
  const event = {
    kind: "future",
    title: "Indiana wins the national title",
  } as Event;
  expect(mappedStakeLine(event, "no", 91).line).toBe(
    "Indiana wins the national title · Against @ 91¢ · hypothetical $100"
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/public-side.test.ts`

Expected: FAIL — `mappedStakeLine` is not exported.

- [ ] **Step 3: Implement helper and wire CallCard**

`lib/public-side.ts`:

```ts
import { formatCents } from "./format";
import type { Event, Side } from "./types";

export function publicSideLabel(event: Event, side: Side): string {
  if (event.kind !== "game") {
    return side === "yes" ? "Takes it" : "Against";
  }
  if (side === "yes") return event.awayTeam ?? "Away";
  return event.homeTeam ?? "Home";
}

export function mappedStakeLine(
  event: Event,
  side: Side,
  cents: number | null
): { label: string; line: string } {
  const label = publicSideLabel(event, side);
  return {
    label,
    line: `${event.title} · ${label} @ ${formatCents(cents)} · hypothetical $100`,
  };
}
```

`components/CallCard.tsx` — replace the YES/NO block:

```tsx
{event && call.side ? (
  <div className="mt-2.5 border-l-[3px] border-[var(--green)] bg-[#111] px-3.5 py-3 text-[13px]">
    <Link href={takePath(event.slug, call.punditId)}>
      {mappedStakeLine(event, call.side, cents).line}
    </Link>
  </div>
) : null}
```

Do not wrap the side in `<b>` as `NO`. If you want emphasis, bold `label` only:

```tsx
const row = mappedStakeLine(event, call.side, cents);
<Link href={takePath(event.slug, call.punditId)}>
  {event.title} · <b className="text-[var(--green)]">{row.label}</b>
  {" @ "}
  {formatCents(cents)} · hypothetical $100
</Link>
```

- [ ] **Step 4: Receipt futures and pundit stats**

In `components/Receipt.tsx`, stop printing Yes/No on futures:

```ts
const froze = game
  ? `${event.awayTeam} ${formatCents(event.yesCents)} / ${event.homeTeam} ${formatCents(event.noCents)}`
  : `${publicSideLabel(event, "yes")} ${formatCents(event.yesCents)} / ${publicSideLabel(event, "no")} ${formatCents(event.noCents)}`;
```

In `app/pundits/[id]/page.tsx`:

- Stat label `Hypothetical $100` stays.
- Change `Open at risk` to `Open · hypothetical $100`.
- Keep the existing disclaimer paragraph.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/public-side.test.ts`

`npm run check`.

In `scripts/verify-static.mjs`:

```js
const book = await readFile(path.join(out, "book/index.html"), "utf8");
assert.doesNotMatch(book, /\$100 at risk/);
assert.doesNotMatch(book, /· <b[^>]*>YES<\/b>|· <b[^>]*>NO<\/b>/);
assert.match(book, /hypothetical \$100/);

const finebaum = await readFile(path.join(out, "pundits/finebaum/index.html"), "utf8");
assert.doesNotMatch(finebaum, /Open at risk/);
assert.match(finebaum, /Open · hypothetical \$100/);
```

- [ ] **Step 6: Commit**

```bash
git add lib/public-side.ts lib/public-side.test.ts components/CallCard.tsx components/Receipt.tsx app/pundits/[id]/page.tsx scripts/verify-static.mjs
git commit -m "fix: drop YES/NO and at-risk copy from Book and profiles"
```

---

### Task 4: Neutral-site matchup copy

**Files:**
- Modify: `lib/public-side.ts` (`isVsGame`, `matchupSentence`)
- Test: `lib/public-side.test.ts`
- Modify: `app/picks/[slug]/[punditId]/page.tsx`
- Modify: `components/EventCard.tsx`
- Modify: `scripts/verify-static.mjs`

**Interfaces:**
- Consumes: `Event.title`, `Event.kind`, `Event.awayTeam`, `Event.homeTeam`, `Event.network`
- Produces:

```ts
export function isVsGame(event: Pick<Event, "kind" | "title">): boolean;
export function matchupSentence(event: Event): string;
```

Rule: a game whose title contains ` vs ` (spaces required) is a `vs` game. Public matchup sentence is `event.title` plus a period. Never interpolate `awayTeam at homeTeam` for those games.

- [ ] **Step 1: Write the failing tests**

```ts
it("treats vs titles as neutral-site copy", () => {
  const lambeau = {
    kind: "game",
    title: "Wisconsin vs Notre Dame",
    awayTeam: "Wisconsin",
    homeTeam: "Notre Dame",
    network: "NBC · Lambeau",
  } as Event;
  expect(isVsGame(lambeau)).toBe(true);
  expect(matchupSentence(lambeau)).toBe("Wisconsin vs Notre Dame.");
  expect(matchupSentence(lambeau)).not.toMatch(/at Notre Dame/);
});

it("keeps at titles as at", () => {
  const lsu = {
    kind: "game",
    title: "Clemson at LSU",
    awayTeam: "Clemson",
    homeTeam: "LSU",
  } as Event;
  expect(isVsGame(lsu)).toBe(false);
  expect(matchupSentence(lsu)).toBe("Clemson at LSU.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/public-side.test.ts`

Expected: FAIL — helpers missing.

- [ ] **Step 3: Implement helpers**

```ts
export function isVsGame(event: Pick<Event, "kind" | "title">): boolean {
  return event.kind === "game" && / vs /i.test(event.title);
}

export function matchupSentence(event: Event): string {
  return `${event.title}.`;
}
```

Always use `event.title`. Do not rebuild “at” from team fields even for true home games — titles are already `Clemson at LSU` / `Patriots at Seahawks`.

- [ ] **Step 4: Take page and EventCard**

In `app/picks/[slug]/[punditId]/page.tsx` replace:

```tsx
{event.awayTeam && event.homeTeam
  ? `${event.awayTeam} at ${event.homeTeam}.`
  : event.title}
```

with:

```tsx
{matchupSentence(event)}{" "}
<Link href={`/picks/${event.slug}`}>Full game card →</Link>
```

In `components/EventCard.tsx` `SideCol`, only show Away/Home when it is a true `at` game:

```tsx
{detail && game && !isVsGame({ kind: "game", title: /* need the event */ }) ? (
  <div className="lab">
    {side.side === "yes" ? "Away" : "Home"}
  </div>
) : null}
```

`SideCol` does not currently receive the event. Pass `vsGame: boolean` (or the event) into `SideCol` from `EventCard`. Do not guess from `side.label`.

Market details paragraph for games:

```tsx
{game
  ? isVsGame(event)
    ? `${event.title}${event.network ? ` · ${event.network}` : ""}. ${yes.label} is the away contract; ${no.label} is the home contract.`
    : `The away side is ${yes.label}; the home side is ${no.label}.`
  : "Takes it and Against are the two market sides."}
```

Do not put the word Kalshi in that first sentence. The existing freeze sentence still follows.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/public-side.test.ts`

`npm run check`.

`scripts/verify-static.mjs`:

```js
const ndTake = await readFile(
  path.join(out, "picks/wisconsin-vs-nd-2026/staples/index.html"),
  "utf8"
);
assert.match(ndTake, /Wisconsin vs Notre Dame\./);
assert.doesNotMatch(ndTake, /Wisconsin at Notre Dame/);

const dublinTake = await readFile(
  path.join(out, "picks/unc-vs-tcu-2026/mcelroy/index.html"),
  "utf8"
);
assert.match(dublinTake, /North Carolina vs TCU\./);
assert.doesNotMatch(dublinTake, /North Carolina at TCU/);
```

- [ ] **Step 6: Commit**

```bash
git add lib/public-side.ts lib/public-side.test.ts app/picks/[slug]/[punditId]/page.tsx components/EventCard.tsx scripts/verify-static.mjs
git commit -m "fix: use event titles for vs games instead of at-home copy"
```

---

### Task 5: Empty futures become a waiting list

**Files:**
- Modify: `lib/data.ts` (`getFuturesPeek` and a `partitionFutures` helper)
- Test: `lib/bets.test.ts` or `lib/data.test.ts`
- Modify: `components/SportSlate.tsx`

**Interfaces:**
- Consumes: `getBoard`, `mappedCalls`, `eventHasFight`
- Produces:

```ts
export function partitionFutures(
  sport: Sport,
  events: Event[],
  calls: Call[]
): { withPicks: Event[]; waiting: Event[] };

export function getFuturesPeek(
  sport: Sport,
  events: Event[],
  calls: Call[],
  limit?: number
): Event[];
```

`getFuturesPeek` returns only events with at least one mapped pick, fights first, then `homeRank`. It must not return a market with two empty sides.

- [ ] **Step 1: Write the failing tests**

In `lib/bets.test.ts`, keep the NCAAF peek length assertion if it still holds. Add:

```ts
it("never peeks a future with no mapped pick", () => {
  const nfl = getFuturesPeek("nfl", loadEvents(), loadCalls(), 10);
  const calls = loadCalls();
  expect(nfl.length).toBeGreaterThan(0);
  for (const event of nfl) {
    expect(mappedCalls(calls).some((c) => c.eventSlug === event.slug)).toBe(true);
  }
  expect(nfl.some((e) => e.slug === "seahawks-sb-2026")).toBe(false);
});

it("splits NFL futures into faced cards and a waiting list", () => {
  const { withPicks, waiting } = partitionFutures("nfl", loadEvents(), loadCalls());
  expect(withPicks.some((e) => e.slug === "rams-sb-2026")).toBe(true);
  expect(waiting.some((e) => e.slug === "seahawks-sb-2026")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/bets.test.ts`

Expected: FAIL — `getFuturesPeek("nfl", …, 10)` currently includes empty Super Bowl cards; `partitionFutures` missing.

- [ ] **Step 3: Implement**

```ts
export function partitionFutures(
  sport: Sport,
  events: Event[],
  calls: Call[]
): { withPicks: Event[]; waiting: Event[] } {
  const board = getBoard(sport, events, calls);
  const withPicks: Event[] = [];
  const waiting: Event[] = [];
  for (const event of board) {
    if (mappedCalls(calls).some((c) => c.eventSlug === event.slug)) {
      withPicks.push(event);
    } else {
      waiting.push(event);
    }
  }
  return { withPicks, waiting };
}

export function getFuturesPeek(
  sport: Sport,
  events: Event[],
  calls: Call[],
  limit = 5
): Event[] {
  return partitionFutures(sport, events, calls).withPicks.slice(0, limit);
}
```

`getBoard` already sorts fights first. `withPicks` preserves that order, so Indiana title still leads NCAAF.

- [ ] **Step 4: Sport slate markup**

In `components/SportSlate.tsx` replace `const futures = getBoard(...)` with `partitionFutures`. Render `withPicks` as `FuturePeek`. Under the same Futures heading, if `waiting.length`, reuse the game waiting list:

```tsx
{waiting.length ? (
  <>
    <h3 className="wait-head type-broadcast">Waiting for a verified pick</h3>
    <ul className="wait-list">
      {waiting.map((event) => (
        <li key={event.slug}>
          <Link href={`/picks/${event.slug}`} className="wait-row">
            <span className="wait-title type-broadcast">{event.title}</span>
            <span className="wait-when">{seasonLabel(event.season)}</span>
            <span className="wait-cta">No pick yet →</span>
          </Link>
        </li>
      ))}
    </ul>
  </>
) : null}
```

Home already uses `getFuturesPeek`, so Bills Super Bowl (one-sided) may still appear; Seahawks Super Bowl must not.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/bets.test.ts`

`npm run check`.

- [ ] **Step 6: Commit**

```bash
git add lib/data.ts lib/bets.test.ts components/SportSlate.tsx
git commit -m "fix: compact empty futures instead of full vacant peeks"
```

---

### Task 6: Language polish and 404

**Files:**
- Modify: `app/picks/[slug]/[punditId]/page.tsx` (breadcrumb `Stories` → `Takes`)
- Modify: `app/pundits/[id]/page.tsx` (breadcrumb `Picks` → `Pundits` linking `/leaderboard/`; sport chip)
- Modify: `lib/format.ts` (`sportChip`)
- Test: `lib/format.test.ts`
- Modify: `components/ShareButton.tsx`
- Create: `app/not-found.tsx`
- Modify: `app/globals.css` (`.feed-more`, `.feed-tools` sticky offset)
- Modify: `app/picks/[slug]/page.tsx` (skip email when `!eventHasTakes`)
- Modify: `app/teams/[id]/page.tsx` (event title next to With/Against names)
- Modify: `scripts/verify-static.mjs`

**Interfaces:**
- Consumes: `eventHasTakes`, `takesOnTeam`
- Produces: `sportChip(sport: Sport): "NFL" | "College football"`

- [ ] **Step 1: sportChip test**

```ts
import { sportChip } from "./format";

it("prints a fan-facing sport chip", () => {
  expect(sportChip("nfl")).toBe("NFL");
  expect(sportChip("ncaaf")).toBe("College football");
});
```

Implement:

```ts
export function sportChip(sport: Sport): "NFL" | "College football" {
  return sport === "nfl" ? "NFL" : "College football";
}
```

Use it on the pundit profile chip instead of `{p.sport}`.

- [ ] **Step 2: Breadcrumbs**

Take JSON-LD + visible crumbs: `{ name: "Takes", path: "/stories" }` / `href: "/stories"`.

Pundit crumbs: `{ name: "Pundits", href: "/leaderboard" }, { name: p.name }`. Same for JSON-LD.

- [ ] **Step 3: Share sheet labels**

In `components/ShareButton.tsx`, the menu’s first item currently says `Share`, same as the toggle. Rename:

- Toggle stays `Share`
- Native share menuitem: `Share via device`
- Copy stays `Copy link`
- X stays `Post to X`
- Image/story stay `Save image` / `Save story`

- [ ] **Step 4: 404**

Create `app/not-found.tsx`. Layout already provides header/footer.

```tsx
export default function NotFound() {
  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">404</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        No page here.
      </h1>
      <p className="lede">
        That URL is not a Pundits receipt. Try picks, takes, or the table.
      </p>
      <p className="flex flex-wrap gap-4">
        <a className="see" href="/">Picks →</a>
        <a className="see" href="/stories/">Takes →</a>
        <a className="see" href="/leaderboard/">Pundits →</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Filter sticky + width**

In `app/globals.css` replace `.feed-more { flex: 0 0 100%; }` with:

```css
.feed-tools { top: 96px; }
.feed-more { flex: 1 1 auto; }
@media (max-width: 719px) {
  .feed-more { flex: 0 0 100%; }
}
@media (min-width: 720px) {
  .feed-tools { top: 72px; }
}
```

Keep the existing `@media (min-width: 720px)` block; merge `top: 72px` there instead of duplicating the breakpoint if it already exists.

- [ ] **Step 6: Skip email on empty event pages**

In `app/picks/[slug]/page.tsx`:

```tsx
{eventHasTakes(event.slug, calls) ? (
  <EmailInterestForm
    placement="pick_detail"
    scope="event"
    scopeId={event.slug}
    subjectName={event.title}
  />
) : null}
```

- [ ] **Step 7: Team With/Against lists name the market**

Do not unique-collapse pundits before render. Map each call:

```tsx
{takes.for.map((c) => {
  const p = pundits.find((x) => x.id === c.punditId);
  const event = events.find((e) => e.slug === c.eventSlug);
  if (!p) return null;
  return (
    <li key={c.id}>
      <Link href={`/pundits/${p.id}`}>{p.name}</Link>
      {event ? <span className="wait-when"> · {event.title}</span> : null}
    </li>
  );
})}
```

Same for `takes.against`. Finebaum can appear in both columns with different event titles.

- [ ] **Step 8: Verify**

Run: `npx vitest run lib/format.test.ts`

`npm run check`.

`scripts/verify-static.mjs`:

```js
assert.match(
  await readFile(path.join(out, "picks/clemson-at-lsu-2026/pate/index.html"), "utf8"),
  />Takes</
);
assert.doesNotMatch(
  await readFile(path.join(out, "pundits/finebaum/index.html"), "utf8"),
  />ncaaf</
);
assert.match(
  await readFile(path.join(out, "pundits/finebaum/index.html"), "utf8"),
  /College football/
);
assert.match(
  await readFile(path.join(out, "404.html"), "utf8"),
  /No page here/
);
assert.doesNotMatch(
  await readFile(path.join(out, "picks/miami-at-stanford-2026/index.html"), "utf8"),
  /Join the early list/
);
```

Confirm `out/404.html` is where Next static export writes the 404. If the file is `out/404/index.html`, assert against that path instead.

- [ ] **Step 9: Commit**

```bash
git add app/not-found.tsx app/picks/[slug]/[punditId]/page.tsx app/pundits/[id]/page.tsx app/picks/[slug]/page.tsx app/teams/[id]/page.tsx app/globals.css components/ShareButton.tsx lib/format.ts lib/format.test.ts scripts/verify-static.mjs
git commit -m "fix: Takes crumbs, 404 recovery, and empty-page email"
```

---

### Task 7: Roadmap note

**Files:**
- Modify: `docs/ROADMAP.md` Phase 2

- [ ] **Step 1: Mark Phase 2 follow-through**

Under Phase 2, add a dated line (do not rewrite the whole phase):

```md
Post-grade comprehension (2026-09-01): results-first table, no public YES/NO on Book/profiles, `vs` matchup copy, compact empty futures. Plan: `docs/superpowers/plans/2026-09-01-post-grade-comprehension.md`.
```

Do not touch Phase 0–1 checkboxes. Do not reopen Bets, logos, or extra homepage games.

- [ ] **Step 2: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "docs: record post-grade comprehension follow-through"
```

---

### Task 8: Editorial reopen (Promote only, separate commit)

**Files:**
- Modify: `data/calls.json` only after source re-open
- Do not mix with Tasks 1–7

**Not a UI task.** Scout does not edit JSON. Audit reopens. Promote is the only role that writes `data/*.json`.

In scope:

| Call | Issue | Allowed fix |
|---|---|---|
| `wasserman` / Wisconsin vs ND | ASR garbage: “I'm taking Notre Dame to I'm laying 20 and a half points.” | Re-listen to https://www.youtube.com/watch?v=haQLZXbYO3c. Replace `claim` with the verbatim sentence. Do not paraphrase. |
| `kanell` / NC State at Virginia | “I'll go. Uh, give me the Wolfpack.” | **Leave it.** Methodology requires verbatim quotes. Filler is not an ASR error. |
| `staples` LSU “cover” and ND “cover as well” | Spread language mapped as SU | Do **not** unmap in this plan. File an Audit note in `docs/runs/` that these may be ATS, not winner. Density on Clemson/LSU and Lambeau stays until Audit says otherwise. |

- [ ] **Step 1: Re-open the Wasserman source and write the exact line**

If the source is unavailable, do not guess. Leave the claim and add the Audit note instead.

- [ ] **Step 2: `npm test`**

Story tests include claims. If a test snapshots the old Wasserman sentence, update that one assertion to the corrected verbatim line.

- [ ] **Step 3: Commit**

```bash
git add data/calls.json docs/runs/<today>-audit.md
git commit -m "fix: correct Wasserman Lambeau quote from source"
```

---

## Out of scope

- Unduplicating the Clemson hero card
- Team logos
- American-odds tooltips beyond the ≈ line already on scan cards
- Unmapping Staples cover takes
- Polishing Kanell filler
- New sports, Bets pages, accounts, live odds
- Methodology page (no eligibility/record-definition change)
- Portrait crops / WebP (Phase 3)

## Self-review

| QA finding | Task |
|---|---|
| Table ranks volume after grading | Task 2 |
| Home 0–0 on Herbstreit “Most on record” | Task 2 |
| Book/profile YES/NO and $100 at risk | Task 3 |
| Receipt Yes/No on futures | Task 3 |
| Wisconsin at Notre Dame / UNC at TCU | Task 4 |
| McElroy 1 open vs 0 open | Task 1 |
| Empty NFL Super Bowl peeks | Task 5 |
| Breadcrumb Stories / raw ncaaf / Share/Share / 404 / filters / email on empty / team With+Against | Task 6 |
| Wasserman ASR / Staples cover | Task 8 |
| Duplicate Clemson card | Out of scope (locked) |

No TBD steps. Client/server split for board sort is explicit in Task 2 so `lib/data.ts` fs imports do not leak into `LeaderboardClient`.
