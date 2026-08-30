# Take-Page Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the take page around a graded-receipt hero (quote + HIT/MISS stamp), labeled grade-sheet rows with the pundit's record and final score, a red verdict color, a mono data voice, and matching OG cards.

**Architecture:** Pure presentation + data-shape work on the existing static Next.js site: new CSS tokens/classes in `app/globals.css`, one new server component (`Receipt`), new pure helpers in `lib/` (TDD via vitest), optional sourced score fields on `Event`, and edits to the satori OG renderer. No new routes, no new dependencies except `@fontsource/ibm-plex-mono`.

**Tech Stack:** Next.js (static export), Tailwind-free hand CSS in globals.css, vitest, satori/resvg OG pipeline, next/font Google fonts.

**Spec:** `docs/superpowers/specs/2026-08-30-take-page-receipt-design.md`

## Global Constraints

- Palette additions limited to `--red: #ff4d4f`; existing tokens unchanged.
- Mono face is IBM Plex Mono, weights 400 and 600, exposed as `--font-mono`.
- Verdicts always pair color with a glyph/word: `✓ Hit`, `✗ Miss`, `Open`.
- Scores enter `data/events.json` ONLY from the authoritative URLs in `docs/runs/2026-08-29-grade.md`: unc-vs-tcu-2026 away UNC 15 / home TCU 10 (`https://goheels.com/game-center/26876`); ncsu-at-uva-2026 away NC State 8 / home Virginia 34 (`https://gopack.com/sports/football/stats/2026/virginia/boxscore/24537`). Never invent scores.
- Integrity (test-enforced): score fields may only exist on events whose `settledSide(event, calls)` is non-null and must agree with it.
- `pickStory` keeps producing `dek` + paragraphs for meta/JSON-LD; only the page body stops rendering paragraphs.
- Multi-agent tree: run `git fetch origin && git status -sb` before every commit; if behind, `git merge --ff-only origin/main` (or rebase) first. Do not touch the uncommitted `docs/social/*` edits — they belong to another session.
- Repo commit style: `feat:` / `fix:` / `docs:` one-liners, with the standard Claude trailer.

---

### Task 1: Verdict color system (red token + glyph helpers)

**Files:**
- Modify: `app/globals.css` (`:root`, `.result-chip.miss`, new `.verdict-*`)
- Modify: `lib/format.ts`, `lib/format.test.ts`
- Modify: `components/EventCard.tsx:40` (chip text)
- Modify: `app/picks/[slug]/[punditId]/page.tsx:100-102` (eyebrow)

**Interfaces:**
- Produces: `verdictClass(status: CallStatus): "hit" | "miss" | "open"` and `statusChipText(status: CallStatus): string` in `lib/format.ts`; CSS token `--red` and classes `.verdict-hit/.verdict-miss/.verdict-open`.

- [ ] **Step 1: Write failing tests** in `lib/format.test.ts`:

```ts
import { statusChipText, verdictClass } from "./format";

describe("verdicts", () => {
  it("pairs every verdict color with a glyph or word", () => {
    expect(statusChipText("hit")).toBe("✓ Hit");
    expect(statusChipText("miss")).toBe("✗ Miss");
    expect(statusChipText("pending")).toBe("Open");
  });
  it("maps status to a css verdict class", () => {
    expect(verdictClass("hit")).toBe("hit");
    expect(verdictClass("miss")).toBe("miss");
    expect(verdictClass("pending")).toBe("open");
  });
});
```

- [ ] **Step 2: Run** `npx vitest run lib/format.test.ts` — expect FAIL (not exported).
- [ ] **Step 3: Implement** in `lib/format.ts` next to `statusLabel`:

```ts
export function verdictClass(status: "pending" | "hit" | "miss"): "hit" | "miss" | "open" {
  return status === "pending" ? "open" : status;
}

/** Verdict chips pair a glyph with the word so color is never the only signal. */
export function statusChipText(status: "pending" | "hit" | "miss"): string {
  if (status === "hit") return "✓ Hit";
  if (status === "miss") return "✗ Miss";
  return "Open";
}
```

- [ ] **Step 4: Run test** — expect PASS.
- [ ] **Step 5: CSS** in `app/globals.css`: add `--red: #ff4d4f;` to `:root`; change `.result-chip.miss { color: var(--muted); }` to `color: var(--red);`; add:

```css
.verdict-hit { color: var(--green); }
.verdict-miss { color: var(--red); }
.verdict-open { color: var(--muted); }
```

- [ ] **Step 6: Use it.** EventCard chip: `{statusChipText(call.status)}` (import from `@/lib/format`). Take page eyebrow becomes:

```tsx
<div className="eyebrow type-broadcast">
  Take ·{" "}
  <span className={`verdict-${verdictClass(take.call.status)}`}>
    {statusChipText(take.call.status)}
  </span>
</div>
```

- [ ] **Step 7: Run** `npm test` (all suites) — expect PASS. Commit `feat: red verdict color with glyph chips`.

---

### Task 2: Mono data voice (IBM Plex Mono, web + OG)

**Files:**
- Modify: `app/layout.tsx:3,19-27` (font import + variable)
- Modify: `app/globals.css` (`.type-mono`, apply to data values)
- Modify: `package.json` (add `@fontsource/ibm-plex-mono`)

**Interfaces:**
- Produces: CSS var `--font-mono`, utility class `.type-mono`; `@fontsource/ibm-plex-mono` installed for Task 6's renderer.

- [ ] **Step 1:** `npm install @fontsource/ibm-plex-mono` (renderer reads woffs from it; web uses next/font).
- [ ] **Step 2:** `app/layout.tsx`:

```tsx
import { IBM_Plex_Mono, Inter, Oswald } from "next/font/google";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});
```

and add `plexMono.variable` wherever `oswald.variable`/`inter.variable` are applied to the root element.

- [ ] **Step 3:** `app/globals.css`:

```css
.type-mono {
  font-family: var(--font-mono), ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}
.px, .px-odds, .tape b, .freeze-bar b, .lb-v, .pct {
  font-family: var(--font-mono), ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}
```

(Prices drop the Oswald display face; sizes/colors unchanged.)

- [ ] **Step 4:** `npm test && npm run build` — expect PASS/success. Spot-check `out/picks/ncsu-at-uva-2026/patterson/index.html` renders (grep for `--font-mono` in built CSS). Commit `feat: IBM Plex Mono data voice for prices and records`.

---

### Task 3: Sourced final scores (data + helpers + Final band)

**Files:**
- Modify: `lib/types.ts:30-56` (Event fields)
- Modify: `data/events.json` (two events, values from Global Constraints)
- Modify: `lib/data.ts` (helpers, near `settledLabel`), `lib/events.test.ts`, `lib/data.test.ts`
- Modify: `components/EventCard.tsx:238-240` (Final band score)

**Interfaces:**
- Consumes: `settledSide(event, calls)` (`lib/data.ts:141`).
- Produces: `Event.awayScore?: number; homeScore?: number; resultUrl?: string`; `finalScoreParts(event: Event, calls: Call[]): { winner: string; loser: string; winnerScore: number; loserScore: number } | null`; `finalScoreLine(event: Event, calls: Call[]): string | null` (e.g. `"Virginia 34, NC State 8"`).

- [ ] **Step 1: Failing integrity test** in `lib/events.test.ts`:

```ts
it("scores settled games only, agreeing with the graded side", () => {
  const calls = loadCalls();
  const scored = loadEvents().filter((e) => e.awayScore != null || e.homeScore != null);
  expect(scored.length).toBeGreaterThanOrEqual(2);
  for (const e of scored) {
    expect(typeof e.awayScore, e.slug).toBe("number");
    expect(typeof e.homeScore, e.slug).toBe("number");
    expect(e.awayScore, e.slug).not.toBe(e.homeScore);
    expect(e.resultUrl, e.slug).toMatch(/^https:\/\//);
    const side = settledSide(e, calls);
    expect(side, e.slug).not.toBeNull();
    expect(side === "yes", e.slug).toBe(e.awayScore! > e.homeScore!);
  }
});
```

(add `loadCalls` and `settledSide` to the imports from `./data`).

- [ ] **Step 2: Failing helper test** in `lib/data.test.ts`:

```ts
it("formats the final score winner-first, and only once settled", () => {
  const calls = loadCalls();
  const uva = loadEvents().find((e) => e.slug === "ncsu-at-uva-2026")!;
  expect(finalScoreLine(uva, calls)).toBe("Virginia 34, NC State 8");
  expect(finalScoreParts(uva, calls)).toEqual({
    winner: "Virginia", loser: "NC State", winnerScore: 34, loserScore: 8,
  });
  const dublin = loadEvents().find((e) => e.slug === "unc-vs-tcu-2026")!;
  expect(finalScoreLine(dublin, calls)).toBe("North Carolina 15, TCU 10");
  const open = loadEvents().find((e) => e.slug === "clemson-at-lsu-2026")!;
  expect(finalScoreLine(open, calls)).toBeNull();
});
```

- [ ] **Step 3: Run** `npx vitest run lib/events.test.ts lib/data.test.ts` — expect FAIL.
- [ ] **Step 4: Types** in `lib/types.ts` `Event`:

```ts
/** Final score, sourced from the official box score linked in the grade run doc. */
awayScore?: number;
homeScore?: number;
/** Authoritative result URL (official box score) that grounds the score fields. */
resultUrl?: string;
```

- [ ] **Step 5: Data.** In `data/events.json`, add to `unc-vs-tcu-2026`: `"awayScore": 15, "homeScore": 10, "resultUrl": "https://goheels.com/game-center/26876"`; to `ncsu-at-uva-2026`: `"awayScore": 8, "homeScore": 34, "resultUrl": "https://gopack.com/sports/football/stats/2026/virginia/boxscore/24537"`.
- [ ] **Step 6: Helpers** in `lib/data.ts` below `settledLabel`:

```ts
/** Final score, winner first. Null until scores exist AND grading has settled the event. */
export function finalScoreParts(
  event: Event,
  calls: Call[]
): { winner: string; loser: string; winnerScore: number; loserScore: number } | null {
  if (event.awayScore == null || event.homeScore == null) return null;
  if (!event.awayTeam || !event.homeTeam) return null;
  if (settledSide(event, calls) == null) return null;
  const awayWon = event.awayScore > event.homeScore;
  return {
    winner: awayWon ? event.awayTeam : event.homeTeam,
    loser: awayWon ? event.homeTeam : event.awayTeam,
    winnerScore: Math.max(event.awayScore, event.homeScore),
    loserScore: Math.min(event.awayScore, event.homeScore),
  };
}

export function finalScoreLine(event: Event, calls: Call[]): string | null {
  const p = finalScoreParts(event, calls);
  return p ? `${p.winner} ${p.winnerScore}, ${p.loser} ${p.loserScore}` : null;
}
```

- [ ] **Step 7: Run both test files** — expect PASS.
- [ ] **Step 8: Final band.** In `EventCard`, compute `const score = finalScoreParts(event, calls);` and render:

```tsx
<div className="event-final type-broadcast">
  Final · {finalLabel}
  {score ? ` ${score.winnerScore}–${score.loserScore}` : ""}
</div>
```

- [ ] **Step 9:** `npm test` — expect PASS. Commit `feat: sourced final scores on settled events`.

---

### Task 4: The graded receipt (signature element)

**Files:**
- Create: `components/Receipt.tsx`
- Modify: `app/globals.css` (receipt classes), `app/picks/[slug]/[punditId]/page.tsx:117-152` (byline + replace `.take-quote`)

**Interfaces:**
- Consumes: `finalScoreLine(event, calls)` (Task 3), `verdictClass`/`statusLabel` (`lib/format.ts`), `MappedTake` (`lib/seo.ts`), `PunditAvatar`.
- Produces: `<Receipt take={MappedTake} calls={Call[]} />` server component.

- [ ] **Step 1: Component** `components/Receipt.tsx`:

```tsx
import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { finalScoreLine } from "@/lib/data";
import { formatAsOf, formatCents, formatShortDate, statusLabel, verdictClass } from "@/lib/format";
import type { MappedTake } from "@/lib/seo";
import type { Call } from "@/lib/types";

export function Receipt({ take, calls }: { take: MappedTake; calls: Call[] }) {
  const { pundit, event, call } = take;
  const graded = call.status === "hit" || call.status === "miss";
  const day = formatShortDate(call.sourceDate);
  const gradedDay = formatShortDate(call.gradedAt);
  const asOf = formatAsOf(event.sourcedAt);
  const score = finalScoreLine(event, calls);
  const game = Boolean(event.awayTeam && event.homeTeam);
  const froze = game
    ? `${event.awayTeam} ${formatCents(event.yesCents)} / ${event.homeTeam} ${formatCents(event.noCents)}`
    : `Yes ${formatCents(event.yesCents)} / No ${formatCents(event.noCents)}`;

  return (
    <article className="receipt">
      <div className="receipt-head">
        Receipt · {call.source}
        {day ? ` · ${day}` : ""}
      </div>
      {graded ? (
        <div className={`receipt-stamp verdict-${verdictClass(call.status)}`}>
          {statusLabel(call.status)}
        </div>
      ) : null}
      <blockquote className="receipt-quote">“{call.claim}”</blockquote>
      <Link href={`/pundits/${pundit.id}`} className="person person-hit">
        <PunditAvatar src={pundit.photo} alt={pundit.name} size="row" />
        <div>
          <div className="nm type-broadcast">{pundit.name}</div>
          <div className="src-meta">
            {pundit.outlet}
          </div>
        </div>
      </Link>
      {call.sourceUrl ? (
        <div className="src-meta">
          <a href={call.sourceUrl} target="_blank" rel="noreferrer">
            Open source →
          </a>
        </div>
      ) : null}
      <div className="receipt-tape">
        <div>
          Froze <b>{froze}</b>
          {asOf ? ` · ${asOf}` : ""}
        </div>
        {graded ? (
          <div>
            Final <b>{score ?? "—"}</b>
            {gradedDay ? ` · Graded ${gradedDay}` : ""}
          </div>
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: CSS** in `app/globals.css`:

```css
.receipt {
  position: relative;
  max-width: 720px;
  background: #101010;
  border: 1px solid #2a2a2a;
  padding: 14px 16px 0;
  margin: 0 0 26px;
}
.receipt-head {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}
.receipt-quote {
  margin: 0 0 16px;
  padding-right: clamp(84px, 16vw, 132px);
  font-size: clamp(19px, 3vw, 26px);
  line-height: 1.35;
  font-weight: 600;
  color: var(--ink);
}
.receipt .person { margin-bottom: 6px; }
.receipt > .src-meta { margin-bottom: 4px; }
.receipt-stamp {
  position: absolute;
  top: 40px;
  right: 18px;
  padding: 3px 12px 2px;
  border: 3px solid currentColor;
  transform: rotate(-6deg);
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(18px, 3vw, 24px);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  animation: stamp-in 0.32s cubic-bezier(0.2, 1, 0.4, 1) 0.15s both;
}
@keyframes stamp-in {
  from { transform: rotate(-6deg) scale(1.9); opacity: 0; }
  60% { transform: rotate(-6deg) scale(0.94); opacity: 1; }
  to { transform: rotate(-6deg) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .receipt-stamp { animation: none; }
}
.receipt-tape {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 14px -16px 0;
  padding: 10px 16px 12px;
  border-top: 1px dashed #3a3a3a;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.receipt-tape b { color: var(--ink); font-weight: 600; }
```

(`.verdict-hit`/`.verdict-miss` from Task 1 color the stamp via `currentColor`.)

- [ ] **Step 3: Wire in.** On the take page, replace the whole `<article className="take-quote">…</article>` block with `<Receipt take={take} calls={calls} />` placed directly after the byline; change the byline to:

```tsx
<p className="story-byline type-mono">
  {formatShortDate(take.call.sourceDate)
    ? `Source published ${formatShortDate(take.call.sourceDate)}`
    : "Verified source"}
  {formatShortDate(take.call.gradedAt)
    ? ` · Graded ${formatShortDate(take.call.gradedAt)}`
    : ""}
</p>
```

- [ ] **Step 4:** `npm test && npm run build`, then open `out/picks/ncsu-at-uva-2026/patterson/index.html` and confirm the receipt block markup (stamp div with `verdict-miss`, tape with `Virginia 34, NC State 8`). Commit `feat: graded receipt hero on take pages`.

---

### Task 5: Grade sheet rows replace the templated prose

**Files:**
- Modify: `lib/seo.ts` (new `gradeSheet` after `pickStory`), `lib/seo.test.ts`
- Modify: `app/picks/[slug]/[punditId]/page.tsx:123-127` (`.story` div → `<dl>`)
- Modify: `app/globals.css` (grade-sheet classes)

**Interfaces:**
- Consumes: private `gamePick`, `formatAsOf`, `americanOdds` (import into seo.ts from `./format`), `seasonFromCalls` (import from `./data`), `finalScoreParts` (Task 3).
- Produces: `type GradeRow = { label: string; value: string; href?: string; hrefLabel?: string }`; `gradeSheet(take: MappedTake, calls: Call[], pundits: Pundit[]): GradeRow[]`.

- [ ] **Step 1: Failing test** in `lib/seo.test.ts`:

```ts
it("lays out the graded take as labeled rows", () => {
  const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
    (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "patterson"
  )!;
  const rows = gradeSheet(take, loadCalls(), loadPundits());
  expect(rows.map((r) => r.label)).toEqual(["Result", "The call", "The price", "Record"]);
  expect(rows[0].value).toBe("Virginia won 34–8.");
  expect(rows[1].value).toBe("NC State over Virginia — called the upset.");
  expect(rows[2].value).toBe("34¢ at the freeze (≈ +194), as of Aug 28, 2026.");
  expect(rows[3].value).toContain("1–1");
  expect(rows[3]).toMatchObject({ href: "/pundits/patterson", hrefLabel: "Full record →" });
});

it("keeps open picks and futures on the sheet without a result row", () => {
  const open = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
    (t) => t.call.status === "pending"
  )!;
  const rows = gradeSheet(open, loadCalls(), loadPundits());
  expect(rows[0].label).not.toBe("Result");
  expect(rows.map((r) => r.label)).toContain("The price");
  expect(rows.map((r) => r.label)).toContain("Record");
});
```

- [ ] **Step 2: Run** `npx vitest run lib/seo.test.ts` — expect FAIL.
- [ ] **Step 3: Implement** in `lib/seo.ts` (imports: add `americanOdds` from `./format`, `finalScoreParts`, `seasonFromCalls` from `./data`):

```ts
export type GradeRow = { label: string; value: string; href?: string; hrefLabel?: string };

/** The take page's labeled facts — same primitives as pickStory, honest structure. */
export function gradeSheet(take: MappedTake, calls: Call[], pundits: Pundit[]): GradeRow[] {
  const { pundit, event, call } = take;
  const graded = call.status === "hit" || call.status === "miss";
  const game = gamePick(event, call);
  const rows: GradeRow[] = [];

  if (graded) {
    const score = finalScoreParts(event, calls);
    if (score) {
      rows.push({ label: "Result", value: `${score.winner} won ${score.winnerScore}–${score.loserScore}.` });
    } else if (game) {
      const winner = call.status === "hit" ? game.picked : game.other;
      rows.push({ label: "Result", value: `${winner} won.` });
    } else {
      rows.push({ label: "Result", value: `Graded a ${call.status}.` });
    }
  }

  if (game) {
    const upset =
      game.pickedCents != null && game.otherCents != null && game.pickedCents < game.otherCents;
    const posture = upset
      ? graded ? "called the upset" : "calling the upset"
      : graded ? "backed the market favorite" : "backing the market favorite";
    rows.push({ label: "The call", value: `${game.picked} over ${game.other} — ${posture}.` });
  } else if (call.side === "no") {
    rows.push({ label: "The call", value: `${negativeOutcome(pundit, event.title, graded)}.` });
  } else {
    rows.push({
      label: "The call",
      value: `${pundit.name} ${graded ? "took" : "is taking"} ${outcomePhrase(event.title)}.`,
    });
  }

  const cents = game ? game.pickedCents : call.side === "no" ? event.noCents : event.yesCents;
  if (cents != null) {
    const odds = americanOdds(cents);
    const asOf = formatAsOf(event.sourcedAt);
    rows.push({
      label: "The price",
      value: `${formatCents(cents)} at the freeze${odds ? ` (≈ ${odds})` : ""}${asOf ? `, ${asOf}` : ""}.`,
    });
  }

  const season = seasonFromCalls(pundit.id, calls);
  const recordValue =
    season.wins + season.losses > 0
      ? `${pundit.name} is ${season.wins}–${season.losses} on graded picks this season${
          season.pending ? `, with ${season.pending} open` : ""
        }.`
      : `${pundit.name} has no graded picks yet this season${
          season.pending ? ` — ${season.pending} open` : ""
        }.`;
  rows.push({
    label: "Record",
    value: recordValue,
    href: `/pundits/${pundit.id}`,
    hrefLabel: "Full record →",
  });

  return rows;
}
```

- [ ] **Step 4: Run** `npx vitest run lib/seo.test.ts` — expect PASS.
- [ ] **Step 5: Render.** On the take page replace the `.story` paragraphs `div` with:

```tsx
<dl className="grade-sheet">
  {gradeSheet(take, calls, pundits).map((row) => (
    <div key={row.label}>
      <dt className="type-broadcast">{row.label}</dt>
      <dd>
        {row.value}
        {row.href ? (
          <>
            {" "}
            <Link href={row.href}>{row.hrefLabel}</Link>
          </>
        ) : null}
      </dd>
    </div>
  ))}
</dl>
```

(`story.paragraphs` no longer renders; `pickStory` still feeds `dek`/JSON-LD.)

- [ ] **Step 6: CSS**:

```css
.grade-sheet {
  max-width: 720px;
  margin: 0 0 26px;
  border: 1px solid #2a2a2a;
  background: var(--card);
}
.grade-sheet > div {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 14px;
}
.grade-sheet > div + div { border-top: 1px solid #222; }
.grade-sheet dt {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--muted);
  padding-top: 3px;
}
.grade-sheet dd { margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink); }
.grade-sheet dd a { color: var(--green); font-weight: 700; white-space: nowrap; }
```

- [ ] **Step 7:** `npm test && npm run build`; confirm the built Patterson page contains "Virginia won 34–8." and the record link. Commit `feat: grade-sheet rows replace templated take prose`.

---

### Task 6: OG cards match the receipt

**Files:**
- Modify: `lib/og.ts` (TakeOgCard + takeOgCard), `lib/og.test.ts`
- Modify: `scripts/render-og.tsx` (`RED`, mono fonts, `TakeMarkup:296`, `TakeStoryMarkup:645`, `ScoreCell:405`)

**Interfaces:**
- Consumes: `finalScoreLine` (Task 3), `@fontsource/ibm-plex-mono` (Task 2).
- Produces: `TakeOgCard.status: CallStatus` and `TakeOgCard.result: string | null`.

- [ ] **Step 1: Failing test** in `lib/og.test.ts`, inside the existing Kanell take-card test:

```ts
expect(card.status).toBe("miss");
expect(card.result).toBe("Virginia 34, NC State 8");
```

- [ ] **Step 2: Run** `npx vitest run lib/og.test.ts` — expect FAIL.
- [ ] **Step 3: Implement.** In `lib/og.ts`: add `status: CallStatus; result: string | null;` to `TakeOgCard` (import `CallStatus` type and `finalScoreLine` from `./data`); in `takeOgCard` add `status: take.call.status, result: finalScoreLine(take.event, calls),`.
- [ ] **Step 4: Run test** — expect PASS.
- [ ] **Step 5: Renderer.** In `scripts/render-og.tsx`:
  - `const RED = "#ff4d4f";` next to `GREEN`.
  - Load mono woffs next to the oswald/inter reads and register them in every satori `fonts:` array as family `"IBM Plex Mono"` (400 and 600):

```ts
const plexMono = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff")
);
const plexMonoSemi = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff")
);
```

  - `Shell` root div gets `position: "relative"` so stamps can overlay.
  - In `TakeMarkup`, after `<Wordmark …/>` add the stamp + verdict color:

```tsx
const verdictColor = card.status === "hit" ? GREEN : RED;
{card.status !== "pending" ? (
  <div
    style={{
      position: "absolute",
      top: 88,
      right: 56,
      display: "flex",
      transform: "rotate(-6deg)",
      border: `5px solid ${verdictColor}`,
      color: verdictColor,
      fontFamily: "Oswald",
      fontSize: 44,
      letterSpacing: 10,
      padding: "6px 20px",
    }}
  >
    {card.status === "hit" ? "HIT" : "MISS"}
  </div>
) : null}
```

  - Between the ScoreCell row and `<Legal …/>` add the result strip:

```tsx
{card.result ? (
  <div
    style={{
      marginTop: 14,
      display: "flex",
      fontFamily: "IBM Plex Mono",
      fontSize: 20,
      letterSpacing: 3,
      color: INK,
    }}
  >
    {`FINAL: ${card.result.toUpperCase()}`}
  </div>
) : null}
```

  - `ScoreCell` gains an optional `accent` prop; `TakeMarkup` passes `accent={card.status === "miss" ? RED : GREEN}` and the cell uses `borderLeft: side.picked ? `6px solid ${accent ?? GREEN}` : "6px solid #141414"`. Cents inside `ScoreCell` switch `fontFamily` to `"IBM Plex Mono"`.
  - Apply the same stamp (scaled up ~1.6×) and result strip to `TakeStoryMarkup`.
- [ ] **Step 6: Render + eyeball.** `npm run og`; Read `public/og/takes/ncsu-at-uva-2026--patterson.png` and `public/og/takes/clemson-at-lsu-2026--klatt.png` (or any pending take) — miss card shows red MISS stamp + FINAL line; pending card shows neither.
- [ ] **Step 7:** `npm test` — expect PASS. Commit `feat: verdict stamp and final score on take OG cards`.

---

### Task 7: Full check, docs, push

- [ ] **Step 1:** `npm run check` (vitest + build + verify:static) — expect PASS. Fix anything it flags.
- [ ] **Step 2:** Read the built Patterson page once more end-to-end for copy/hierarchy sanity.
- [ ] **Step 3:** `git fetch origin && git status -sb`; if behind, ff-merge/rebase and re-run `npm test`. Push `origin main`.
- [ ] **Step 4:** Update memory (`pundits-v1-launch-state.md`): take-page depth shipped (receipt + grade sheet + scores + red/mono tokens).
