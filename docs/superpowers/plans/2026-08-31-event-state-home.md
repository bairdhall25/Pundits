# Event State on Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Open, Final · Grading, and Final scan as three different event states, and keep the homepage hero and this-week boards looking forward.

**Architecture:** Pure helpers in `lib/data.ts` derive scan status from existing score fields and `settledSide`. `EventCard` renders the status. Home and sport slates partition `onHome` games into full cards vs compact receipt rows. No new event-result object, no JSON score edits, no rebrand.

**Tech Stack:** Next.js static export, vitest, hand CSS in `app/globals.css`.

**Spec:** `docs/superpowers/specs/2026-08-31-event-state-home-design.md`

## Global Constraints

- Public words are `Open`, `Final`, `Final · Grading`, `Hit`, `Miss`. Never ship `Completed`, `Finished`, `Live`, or `In play` for this work.
- Do not infer complete from `kickoffDate`. Complete means both `awayScore` and `homeScore` exist on a `kind === "game"` event.
- Do not flip `onHome` in `data/events.json`. Do not add or change scores.
- Keep the green/black broadcast identity. No new palette, type, or layout system.
- `settledSide` remains the grading inference. Scores may exist before every mapped call is graded; when both exist they must agree.
- `npm test` after data/logic tasks. `npm run check` after route/UI tasks. Browser-verify home, `/ncaaf/`, `/nfl/`, and one Final event page before claiming done.
- Repo commit style: `feat:` / `fix:` / `docs:` one-liners.

## File map

- Modify: `lib/data.ts` — `gameComplete`, `picksFinished`, `eventScanStatus`, `eventStatusLine`, `marqueeGame`, `partitionGames`; `finalScoreParts` drops the `settledSide` gate
- Modify: `lib/data.test.ts`, `lib/events.test.ts`, `lib/bets.test.ts`
- Modify: `components/EventCard.tsx`, `app/globals.css`
- Create: `components/FinalRow.tsx`
- Modify: `app/page.tsx`, `components/SportSlate.tsx`
- Modify: `docs/product/experience-principles.md`, `docs/product/decision-log.md`, `docs/product/product-system.md`, `bots/promote.md`

---

### Task 1: Scan-status helpers

**Files:**
- Modify: `lib/data.ts`
- Test: `lib/data.test.ts`

**Interfaces:**
- Consumes: existing `Event`, `Call`, `settledSide`, `eventKind`, `sidesForCard`
- Produces:
  - `export type EventScanStatus = "open" | "grading" | "final"`
  - `gameComplete(event: Event): boolean`
  - `picksFinished(event: Event, calls: Call[]): boolean`
  - `eventScanStatus(event: Event, calls: Call[]): EventScanStatus`
  - `eventStatusLine(event: Event, calls: Call[]): string`

- [ ] **Step 1: Write the failing tests** in `lib/data.test.ts`. Import the new names. Add this describe (keep the existing `settledSide` and `finalScoreLine` describes):

```ts
describe("event scan status", () => {
  const clemson: Event = {
    slug: "clemson-at-lsu-2026",
    kind: "game",
    title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline",
    awayTeam: "Clemson",
    homeTeam: "LSU",
    yesCents: 24,
    noCents: 78,
    sourceUrl: "https://example.com",
    sourcedAt: "2026-08-25",
    onHome: true,
    sport: "ncaaf",
    homeRank: 2,
  };
  const pending: Call = {
    id: "n1",
    punditId: "finebaum",
    claim: "LSU",
    source: "t",
    sourceUrl: "https://example.com/a",
    sourceDate: "2026-09-04",
    kind: "hard",
    subject: "LSU",
    paysOn: "Clemson at LSU",
    status: "pending",
    eventSlug: "clemson-at-lsu-2026",
    side: "no",
  };
  const scored = { ...clemson, awayScore: 17, homeScore: 24 };

  it("treats an unscored game as open even with pending picks", () => {
    expect(gameComplete(clemson)).toBe(false);
    expect(picksFinished(clemson, [pending])).toBe(false);
    expect(eventScanStatus(clemson, [pending])).toBe("open");
    expect(eventStatusLine(clemson, [pending])).toBe("Open");
  });

  it("treats a scored game with pending picks as grading", () => {
    expect(gameComplete(scored)).toBe(true);
    expect(picksFinished(scored, [pending])).toBe(false);
    expect(eventScanStatus(scored, [pending])).toBe("grading");
    expect(eventStatusLine(scored, [pending])).toBe("Final · Grading · LSU 24–17");
  });

  it("treats a scored, fully graded game as final", () => {
    const hit = { ...pending, status: "hit" as const };
    expect(eventScanStatus(scored, [hit])).toBe("final");
    expect(eventStatusLine(scored, [hit])).toBe("Final · LSU 24–17");
  });

  it("does not use grading for futures", () => {
    const future: Event = { ...clemson, kind: "future", slug: "lsu-title-2026" };
    expect(eventScanStatus(future, [pending])).toBe("open");
    expect(eventScanStatus(future, [{ ...pending, status: "hit" }])).toBe("final");
  });

  it("classifies live Week 0 as final and Clemson as open", () => {
    const events = loadEvents();
    const calls = loadCalls();
    const tcu = events.find((e) => e.slug === "unc-vs-tcu-2026")!;
    const clem = events.find((e) => e.slug === "clemson-at-lsu-2026")!;
    expect(eventScanStatus(tcu, calls)).toBe("final");
    expect(eventScanStatus(clem, calls)).toBe("open");
    expect(eventStatusLine(tcu, calls)).toBe("Final · North Carolina 15–10");
  });
});
```

- [ ] **Step 2: Run** `npx vitest run lib/data.test.ts` — expect FAIL (exports missing).

- [ ] **Step 3: Implement** in `lib/data.ts` after `finalScoreLine` / `eventKind` so `eventStatusLine` can call both. If `eventKind` currently sits below `finalScoreParts`, move it above the new helpers first. Do not leave a use-before-define.

```ts
export type EventScanStatus = "open" | "grading" | "final";

export function gameComplete(event: Event): boolean {
  return (
    eventKind(event) === "game" &&
    event.awayScore != null &&
    event.homeScore != null
  );
}

export function picksFinished(event: Event, calls: Call[]): boolean {
  return settledSide(event, calls) != null;
}

export function eventScanStatus(event: Event, calls: Call[]): EventScanStatus {
  if (eventKind(event) === "game") {
    if (gameComplete(event) && !picksFinished(event, calls)) return "grading";
    if (gameComplete(event) || picksFinished(event, calls)) return "final";
    return "open";
  }
  return picksFinished(event, calls) ? "final" : "open";
}

export function eventStatusLine(event: Event, calls: Call[]): string {
  const status = eventScanStatus(event, calls);
  const score = finalScoreParts(event, calls);
  const scoreBit = score ? `${score.winner} ${score.winnerScore}–${score.loserScore}` : null;
  if (status === "open") return "Open";
  if (status === "grading") {
    return scoreBit ? `Final · Grading · ${scoreBit}` : "Final · Grading";
  }
  if (scoreBit) return `Final · ${scoreBit}`;
  const winner = settledLabel(event, calls);
  return winner ? `Final · ${winner}` : "Final";
}
```

- [ ] **Step 4: Also change `finalScoreParts`** so scores do not wait on grading. Replace the function (keep the `calls` argument so callers do not churn):

```ts
/** Final score, winner first. Null until both scores exist. Grading is a separate fact. */
export function finalScoreParts(
  event: Event,
  _calls?: Call[]
): { winner: string; loser: string; winnerScore: number; loserScore: number } | null {
  if (event.awayScore == null || event.homeScore == null) return null;
  if (!event.awayTeam || !event.homeTeam) return null;
  const awayWon = event.awayScore > event.homeScore;
  return {
    winner: awayWon ? event.awayTeam : event.homeTeam,
    loser: awayWon ? event.homeTeam : event.awayTeam,
    winnerScore: Math.max(event.awayScore, event.homeScore),
    loserScore: Math.min(event.awayScore, event.homeScore),
  };
}
```

Add a fixture assertion in the existing `finalScoreLine` describe (or the new one): a scored event with only pending calls still returns the score line.

- [ ] **Step 5: Run** `npx vitest run lib/data.test.ts` — expect PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/data.ts lib/data.test.ts
git commit -m "feat: split game-complete from picks-finished scan status"
```

---

### Task 2: Allow scores before every pick is graded

**Files:**
- Modify: `lib/events.test.ts` (the `"scores settled games only"` test)

**Interfaces:**
- Consumes: `settledSide`, score fields
- Produces: integrity rule “scores may exist while picks are pending; when `settledSide` is set it must agree with the score”

- [ ] **Step 1: Rewrite the integrity test** in `lib/events.test.ts` from “scores settled games only, agreeing with the graded side” to:

```ts
it("lets scores exist before grading, and agrees once picks are finished", () => {
  const calls = loadCalls();
  const scored = loadEvents().filter((e) => e.awayScore != null || e.homeScore != null);
  expect(scored.length).toBeGreaterThanOrEqual(2);
  for (const e of scored) {
    expect(typeof e.awayScore, e.slug).toBe("number");
    expect(typeof e.homeScore, e.slug).toBe("number");
    expect(e.awayScore, e.slug).not.toBe(e.homeScore);
    expect(e.resultUrl, e.slug).toMatch(/^https:\/\//);
    const side = settledSide(e, calls);
    if (side == null) continue;
    expect(side === "yes", e.slug).toBe(e.awayScore! > e.homeScore!);
  }
});
```

- [ ] **Step 2: Run** `npx vitest run lib/events.test.ts` — expect PASS (live Week 0 rows are still finished).

- [ ] **Step 3: Commit**

```bash
git add lib/events.test.ts
git commit -m "test: allow box scores before every mapped pick is graded"
```

---

### Task 3: EventCard scan states

**Files:**
- Modify: `components/EventCard.tsx`
- Modify: `app/globals.css` (`.event-settled`, `.event-grading`, `.event-final`)

**Interfaces:**
- Consumes: `eventScanStatus`, `eventStatusLine`, `finalScoreParts`
- Produces: card class `event-open` | `event-grading` | `event-settled`; Open chip; Final / Final · Grading band from `eventStatusLine`

- [ ] **Step 1: Update `EventCard`.** Import `eventScanStatus` and `eventStatusLine`. Replace `finalLabel` / settled class / Final band:

```tsx
const status = eventScanStatus(event, calls);
const statusLine = eventStatusLine(event, calls);
const score = finalScoreParts(event, calls);
```

On the `<article>` className, drop `finalLabel ? "event-settled" : ""` and use:

```tsx
status === "final" ? "event-settled" : status === "grading" ? "event-grading" : "event-open"
```

In `.meta`, keep `KickoffTag` only when `status === "open"`. Render an Open chip the same way as Today/Tomorrow:

```tsx
{game && status === "open" ? (
  <span className="kick-tag type-broadcast">Open</span>
) : null}
{game && status === "open" ? <KickoffTag date={event.kickoffDate} /> : null}
```

Replace the Final band so it uses `statusLine` whenever status is not `open`:

```tsx
{status !== "open" ? (
  <div className="event-final type-broadcast">{statusLine}</div>
) : null}
```

Pass `settled={status === "final"}` into both `SideCol`s (hide American odds on finished games; keep them on open and grading).

- [ ] **Step 2: CSS.** There is currently no `.event-settled` rule. Add after `.event.fight`:

```css
.event-settled {
  border-color: #1e1e1e;
  opacity: 0.92;
}
.event-settled.fight {
  border-color: #1e1e1e;
}
.event-grading {
  border-color: var(--green);
}
.event-grading .event-final {
  letter-spacing: 0.14em;
}
```

Do not add new colors. Do not restyle `.kick-tag`.

- [ ] **Step 3: Run** `npx vitest run` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add components/EventCard.tsx app/globals.css
git commit -m "feat: show Open, Final Grading, and Final on event cards"
```

---

### Task 4: Home looks forward

**Files:**
- Modify: `lib/data.ts`
- Modify: `lib/bets.test.ts` (weekend home describe)
- Modify: `app/page.tsx`
- Create: `components/FinalRow.tsx`

**Interfaces:**
- Consumes: `getWeekend`, `eventScanStatus`, `eventStatusLine`, `callsForEvent`
- Produces:
  - `marqueeGame(ncaaf: Event[], nfl: Event[], calls: Call[]): Event | undefined`
  - `partitionGames(games: Event[], calls: Call[]): { open: Event[]; grading: Event[]; final: Event[] }`
  - `FinalRow({ event, calls }: { event: Event; calls: Call[] })`

- [ ] **Step 1: Write failing tests** in `lib/bets.test.ts`. Import `marqueeGame`, `partitionGames`, `eventScanStatus`. Add inside `describe("weekend home"`):

```ts
it("features the next open game, not a finished Week 0 card", () => {
  const events = loadEvents();
  const calls = loadCalls();
  const ncaaf = getWeekend("ncaaf", events);
  const nfl = getWeekend("nfl", events);
  const marquee = marqueeGame(ncaaf, nfl, calls);
  expect(marquee?.slug).toBe("clemson-at-lsu-2026");
  const { open, grading, final } = partitionGames(ncaaf, calls);
  expect(open.map((e) => e.slug)).toEqual(["clemson-at-lsu-2026"]);
  expect(grading).toEqual([]);
  expect(final.map((e) => e.slug)).toEqual([
    "unc-vs-tcu-2026",
    "ncsu-at-uva-2026",
  ]);
});

it("does not fall back to a final game when nothing is open", () => {
  const events = loadEvents();
  const calls = loadCalls();
  const ncaaf = getWeekend("ncaaf", events).filter(
    (e) => eventScanStatus(e, calls) === "final"
  );
  expect(marqueeGame(ncaaf, [], calls)).toBeUndefined();
});
```

Keep the existing `getWeekend` tests that still list TCU on the raw weekend array. `getWeekend` does not change.

- [ ] **Step 2: Run** `npx vitest run lib/bets.test.ts` — expect FAIL (`marqueeGame` missing).

- [ ] **Step 3: Implement** in `lib/data.ts` next to `getWeekend`:

```ts
export function partitionGames(
  games: Event[],
  calls: Call[]
): { open: Event[]; grading: Event[]; final: Event[] } {
  const open: Event[] = [];
  const grading: Event[] = [];
  const final: Event[] = [];
  for (const event of games) {
    const status = eventScanStatus(event, calls);
    if (status === "open") open.push(event);
    else if (status === "grading") grading.push(event);
    else final.push(event);
  }
  return { open, grading, final };
}

export function marqueeGame(
  ncaaf: Event[],
  nfl: Event[],
  calls: Call[]
): Event | undefined {
  const withPicks = (games: Event[]) =>
    games.filter((e) => calls.some((c) => c.eventSlug === e.slug));
  const first = (games: Event[], status: EventScanStatus) =>
    withPicks(games).find((e) => eventScanStatus(e, calls) === status);
  return (
    first(ncaaf, "open") ??
    first(nfl, "open") ??
    first(ncaaf, "grading") ??
    first(nfl, "grading")
  );
}
```

- [ ] **Step 4: Create `components/FinalRow.tsx`:**

```tsx
import Link from "next/link";
import { eventStatusLine } from "@/lib/data";
import type { Call, Event } from "@/lib/types";

export function FinalRow({ event, calls }: { event: Event; calls: Call[] }) {
  return (
    <Link href={`/picks/${event.slug}`} className="wait-row final-row">
      <span className="wait-title type-broadcast">{event.title}</span>
      <span className="wait-when">{eventStatusLine(event, calls)}</span>
      <span className="wait-cta">Receipt →</span>
    </Link>
  );
}
```

Optional CSS after `.wait-cta`:

```css
.final-row .wait-when { color: var(--green); }
```

- [ ] **Step 5: Rewire `app/page.tsx`.** Replace the current marquee block:

```ts
const withPicks = ncaaf.filter((e) =>
  calls.some((c) => c.eventSlug === e.slug)
);
const marquee =
  withPicks.find((e) => !settledSide(e, calls)) ?? withPicks[0] ?? ncaaf[0];
const ncaafRest = marquee ? ncaaf.filter((e) => e !== marquee) : ncaaf;
```

with:

```ts
const ncaafParts = partitionGames(ncaaf, calls);
const nflParts = partitionGames(nfl, calls);
const marquee = marqueeGame(ncaaf, nfl, calls);
const ncaafCards = [...ncaafParts.open, ...ncaafParts.grading].filter(
  (e) => e !== marquee
);
const nflCards = [...nflParts.open, ...nflParts.grading].filter(
  (e) => e !== marquee
);
```

Drop the unused `settledSide` import. Add `marqueeGame`, `partitionGames`, `FinalRow`.

Hero kicker: `Marquee · {marquee.sport === "nfl" ? "NFL" : "College football"}`.

Pass `ncaafCards` into the college `Weekend`. After that `Weekend`, if `ncaafParts.final.length`, render a compact list:

```tsx
{ncaafParts.final.length ? (
  <div className="board" style={{ marginTop: "-24px" }}>
    <h3 className="wait-head type-broadcast">Final</h3>
    <ul className="wait-list">
      {ncaafParts.final.map((event) => (
        <li key={event.slug}>
          <FinalRow event={event} calls={calls} />
        </li>
      ))}
    </ul>
  </div>
) : null}
```

Do not use an inline style if a class already exists; prefer a small `.final-board` rule with `margin-top: -24px` only if the board gap looks wrong. NFL `Weekend` uses `nflCards`. If `nflParts.final.length`, same compact list under the NFL weekend.

- [ ] **Step 6: Run** `npx vitest run lib/bets.test.ts lib/data.test.ts` — expect PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/data.ts lib/bets.test.ts app/page.tsx components/FinalRow.tsx app/globals.css
git commit -m "feat: keep the home marquee on the next open game"
```

---

### Task 5: Sport slate matches home

**Files:**
- Modify: `components/SportSlate.tsx`

**Interfaces:**
- Consumes: `partitionGames`, `FinalRow`, existing `getSlateGames`
- Produces: `/ncaaf/` and `/nfl/` lists open/grading as EventCards, final as receipt rows, waiting list unchanged

- [ ] **Step 1: In `SportSlate`**, after `const games = getSlateGames(...)`, partition the games that have picks:

```tsx
import { FinalRow } from "@/components/FinalRow";
import { partitionGames, getBoard, getSlateGames, loadCalls, loadEvents, loadPundits, formatGameWhen } from "@/lib/data";

const withPicks = games.filter((e) => calls.some((c) => c.eventSlug === e.slug));
const waiting = games.filter((e) => !calls.some((c) => c.eventSlug === e.slug));
const { open, grading, final } = partitionGames(withPicks, calls);
```

Replace the single `active.map(EventCard)` with open then grading EventCards, then a **Final** `wait-head` plus `FinalRow`s when `final.length`. Leave the waiting list as-is.

Week archives are a different route; do not compact them.

- [ ] **Step 2: Run** `npx vitest run` — expect PASS.

- [ ] **Step 3: Commit**

```bash
git add components/SportSlate.tsx
git commit -m "feat: keep sport slates looking forward of finished games"
```

---

### Task 6: Canonical copy and verification

**Files:**
- Modify: `docs/product/experience-principles.md` §6
- Modify: `docs/product/decision-log.md`
- Modify: `docs/product/product-system.md` (Derived record behavior)
- Modify: `bots/promote.md` (one sentence: scores may be written when the box score exists even if a later grade pass still has pending mapped calls on that slug)
- Modify: `docs/superpowers/specs/2026-08-31-event-state-home-design.md` and this plan — leave Status as Active plan until the operator marks them historical after ship

**Interfaces:**
- Consumes: shipped helpers and UI
- Produces: product words that match the UI

- [ ] **Step 1: Experience principles §6.** Replace the Final bullet so it matches the spec:

```
- `Pending` or `Open`: the outcome has not settled. On a game card, `Open` means there is not yet a box score.
- `Tonight`: the event is expected to resolve within roughly 24 hours.
- `Live now` or `In play`: the underlying event is actually underway. Do not infer this from a pending pick or a past kickoff date.
- `Final`: the game has a box score. If mapped picks are still pending, label it `Final · Grading`. If every mapped pick is graded, keep `Final` and show Hit/Miss on the faces.
- `Hit` or `Miss`: the individual mapped pick has been graded.
```

Add one sentence to §9: homepage hero and this-week boards prefer open games; finished games are compact receipts, not the lead.

- [ ] **Step 2: Decision log.** Add two accepted rows dated 2026-08-31:

```
| Homepage hero and this-week boards look forward. | A finished game is a receipt. Do not feature it while an open (or grading) onHome game with picks exists. | Accepted 2026-08-31 |
| Box scores may land before every mapped pick is graded. | Game complete and picks finished are different facts. `Final · Grading` is the public label for that window. | Accepted 2026-08-31 |
```

- [ ] **Step 3: Product system.** In Derived record behavior, state that `awayScore`/`homeScore` mean the game is complete and `settledSide` means mapped picks are finished. Winner display on a scored game comes from the scores. Do not invent a new result object in this change.

- [ ] **Step 4: Promote bot.** In `bots/promote.md`, after the existing “Do not grade” line, add: scores (`awayScore`, `homeScore`, `resultUrl`) may be written as soon as the authoritative box score exists, even if some mapped calls on that slug are still pending. Do not invent scores.

- [ ] **Step 5: Run** `npm test`. Then `npm run check` (tests + production build + static verify).

- [ ] **Step 6: Browser-verify** against the local production-style output or `npm run dev`:

  1. Home desktop and ~390px: hero is Clemson–LSU with an **Open** chip; TCU and UVA are compact Final rows, not full cards above Clemson.
  2. `/ncaaf/`: same hierarchy. Waiting list (Lambeau / faceless) still works.
  3. `/nfl/`: Week 1 games still full Open cards.
  4. `/picks/unc-vs-tcu-2026/`: full EventCard still shows **Final · North Carolina 15–10** and Hit/Miss chips.
  5. `/ncaaf/2026/week-0/`: archives still use full EventCards for the Final games.

  If the Final rows collide with the college weekend heading, fix spacing in CSS, then re-check home mobile.

- [ ] **Step 7: Commit**

```bash
git add docs/product/experience-principles.md docs/product/decision-log.md docs/product/product-system.md bots/promote.md
git commit -m "docs: record open vs final vs grading as distinct event states"
```

---

## Spec coverage

| Spec rule | Task |
|---|---|
| Two facts: complete vs finished | 1 |
| Public words Open / Final · Grading / Final | 1, 3, 6 |
| Scores may precede grades; must agree when both exist | 1, 2 |
| `finalScoreParts` keys off scores only | 1 |
| EventCard Open chip and Final band | 3 |
| `.event-settled` actually quiets finished cards | 3 |
| Hero never falls back to a final game | 4 |
| This-week board compact Final rows | 4, 5 |
| Do not flip `onHome` / do not write scores | global; no task edits JSON |
| No Live / In play / rebrand | global |
| Canonical docs | 6 |
| Browser check home, slates, event page, week archive | 6 |
