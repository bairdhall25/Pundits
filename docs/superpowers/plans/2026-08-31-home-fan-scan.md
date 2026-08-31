# Home Fan-Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage scan like a sports show: next game first, Kalshi off the card kicker, a one-line Week 0 recap, and disagreements labeled as long range.

**Architecture:** Reuse existing helpers (`eventShare` internals, `weekRecord` / `weekResults`, `formatGameWhen`). Home copy and EventCard scan markup change. No JSON edits, no new routes, no capture.

**Tech Stack:** Next.js static export, vitest, hand CSS in `app/globals.css`.

**Spec:** `docs/superpowers/specs/2026-08-31-home-fan-scan-design.md`

## Global Constraints

- Public words stay `Open`, `Final`, `Final · Grading`, `Hit`, `Miss`. Never ship `Completed`, `Finished`, `Live`, or `In play`.
- Keep the green/black broadcast identity. No new palette, type, or layout system.
- Do not flip `onHome` or change scores/calls JSON.
- Do not hunt new picks. Empty Clemson YES and empty NFL dogs stay honest.
- Keep the marquee game on its sport board as well as in the hero.
- Land on `feat/event-state-home`. Commit style: `feat:` / `fix:` / `docs:` one-liners.
- `npm test` after helper tasks. `npm run check` and a localhost look after UI tasks.

## File map

- Modify: `lib/share.ts` — export `homeHeroLede`
- Modify: `lib/share.test.ts`
- Modify: `lib/archive.ts` — `latestGradedWeekRecap`
- Modify: `lib/archive.test.ts`
- Modify: `app/page.tsx`, `app/globals.css`
- Modify: `components/EventCard.tsx`
- Modify: `docs/product/experience-principles.md`, `docs/product/decision-log.md`

---

### Task 1: Hero lede helper

**Files:**
- Modify: `lib/share.ts`
- Test: `lib/share.test.ts`

**Interfaces:**
- Consumes: existing private `namesOn`, `picksLine`, `sidesForCard`
- Produces: `homeHeroLede(event: Event, calls: Call[], pundits: Pundit[]): string`

- [ ] **Step 1: Write the failing test** in `lib/share.test.ts`:

```ts
import { homeHeroLede } from "./share";
import { loadCalls, loadEvents, loadPundits } from "./data";

it("names the marquee sides without cents or as-of", () => {
  const event = loadEvents().find((e) => e.slug === "clemson-at-lsu-2026")!;
  const line = homeHeroLede(event, loadCalls(), loadPundits());
  expect(line).toBe(
    "Josh Pate and Paul Finebaum pick LSU. Nobody on Clemson yet."
  );
  expect(line).not.toMatch(/¢|as of/i);
});
```

If live name order follows call order (Finebaum before Pate), assert that order instead and keep the same two sentences. Do not invent a third sentence.

- [ ] **Step 2: Run** `npx vitest run lib/share.test.ts` — expect FAIL (`homeHeroLede` not exported).

- [ ] **Step 3: Implement** in `lib/share.ts` using the existing `namesOn` / `picksLine` helpers (export only `homeHeroLede`):

```ts
export function homeHeroLede(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): string {
  const [yes, no] = sidesForCard(event, calls);
  const yesNames = namesOn(yes.calls, pundits);
  const noNames = namesOn(no.calls, pundits);
  if (!event.awayTeam || !event.homeTeam) {
    return "No verified pick yet.";
  }
  const bits = [
    picksLine(noNames, event.homeTeam),
    picksLine(yesNames, event.awayTeam),
    yesNames.length ? null : `Nobody on ${event.awayTeam} yet`,
    noNames.length || !yesNames.length ? null : `Nobody on ${event.homeTeam} yet`,
  ].filter(Boolean);
  if (!bits.length) return `No verified pick on ${event.title} yet.`;
  return `${bits.join(". ")}.`;
}
```

- [ ] **Step 4: Run** `npx vitest run lib/share.test.ts` — expect PASS.

- [ ] **Step 5: Commit** `feat: add a sports lede for the home marquee`

---

### Task 2: Hero is the next game

**Files:**
- Modify: `app/page.tsx` (hero copy)
- Modify: `app/globals.css` (`.hero` order and type size)

**Interfaces:**
- Consumes: `homeHeroLede`, `formatGameWhen` / `kickoffClock` from `lib/format.ts`, marquee event
- Produces: mobile-first hero card; eyebrow from kickoff/network; lede from `homeHeroLede`

- [ ] **Step 1: Hero markup** in `app/page.tsx`. Replace the eyebrow `Active picks · Week 1` and the long lede.

When `marquee` exists:

```tsx
import { homeHeroLede } from "@/lib/share";
import { kickoffClock } from "@/lib/format";

const heroWhen = marquee
  ? [kickoffClock(marquee.kickoff), marquee.network].filter(Boolean).join(" · ")
  : "Week 1";
const heroLede = marquee
  ? homeHeroLede(marquee, calls, pundits)
  : "College football and NFL picks from named analysts and commentators.";
```

Eyebrow: `{heroWhen}` (example: `7:30 ET · ABC`). Keep the h1 “Who’s picking what.” Swap the `<p className="lede">` body for `{heroLede}`. Trust bar unchanged.

- [ ] **Step 2: CSS** in `app/globals.css`:

```css
.hero-card { order: -1; }
.hero h1 {
  font-size: clamp(28px, 7vw, 44px);
}
@media (min-width: 1024px) {
  .hero-card { order: 0; }
  .hero h1 {
    font-size: 72px;
  }
}
```

Remove the existing `lg:text-[72px]` / huge clamp from the h1 className in `page.tsx` so the CSS scale wins. Do not add new colors.

- [ ] **Step 3: Run** `npx vitest run` — expect PASS.

- [ ] **Step 4: Commit** `feat: lead the home hero with the next game`

---

### Task 3: Kalshi off the scan kicker

**Files:**
- Modify: `components/EventCard.tsx` (the Kalshi kicker block around the `event-head`)

**Interfaces:**
- Consumes: existing `detail` flag
- Produces: scan cards with no Kalshi kicker; detail cards still show the linked/plain Kalshi tag

- [ ] **Step 1: Gate the kicker on `detail`.** The scan branch currently renders `<div className="kalshi-tag">Kalshi</div>` even when `detail` is false. Render that whole Kalshi block only when `detail` is true. Keep title + Open/Final meta on scan cards.

Do not remove cents from sides. Do not change OG renderers.

- [ ] **Step 2: Run** `npx vitest run` — expect PASS.

- [ ] **Step 3: Commit** `fix: stop leading scan cards with Kalshi`

---

### Task 4: Week recap line + long-range label

**Files:**
- Modify: `lib/archive.ts`
- Test: `lib/archive.test.ts`
- Modify: `app/page.tsx` (Weekend recap + disagreements kicker)
- Modify: `components/WeekArchive.tsx` only if you need to import `weekArchivePath` from a shared module — prefer exporting path from `lib/archive.ts` as `weekArchivePath(sport, season, week)` duplicating the existing `/${sport}/${season}/week-${week}/` string rather than coupling `app/page.tsx` to a component. If you add it to `lib/archive.ts`, leave `components/WeekArchive.tsx` exporting a wrapper or switch that file to re-export from lib. Do not create a third path helper.

**Interfaces:**
- Consumes: `weekRecord`, `weekResults`, `gamesForWeek`, `eventKind`, `gameComplete` from `lib/data.ts`
- Produces:
  - `weekArchivePath(sport: Sport, season: number, week: number): string` in `lib/archive.ts` returning `/${sport}/${season}/week-${week}/`
  - `latestGradedWeekRecap(events, calls, pundits): { sport, season, week, href, line } | null`

- [ ] **Step 1: Failing tests** in `lib/archive.test.ts`:

```ts
import { latestGradedWeekRecap, weekArchivePath } from "./archive";
import { loadCalls, loadEvents, loadPundits } from "./data";

it("builds the week archive path with a trailing slash", () => {
  expect(weekArchivePath("ncaaf", 2026, 0)).toBe("/ncaaf/2026/week-0/");
});

it("recaps the latest graded week in sports copy", () => {
  const recap = latestGradedWeekRecap(
    loadEvents(),
    loadCalls(),
    loadPundits()
  );
  expect(recap).not.toBeNull();
  expect(recap!.href).toBe("/ncaaf/2026/week-0/");
  expect(recap!.line).toBe(
    "Week 0: experts went 2–4. Chip Patterson and Greg McElroy hit on North Carolina."
  );
});
```

- [ ] **Step 2: Run** `npx vitest run lib/archive.test.ts` — expect FAIL.

- [ ] **Step 3: Implement** in `lib/archive.ts`:

```ts
import { eventKind, gameComplete } from "./data";

export function weekArchivePath(
  sport: Sport,
  season: number,
  week: number
): string {
  return `/${sport}/${season}/week-${week}/`;
}

export function latestGradedWeekRecap(
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): { sport: Sport; season: number; week: number; href: string; line: string } | null {
  const games = events.filter(
    (e) => eventKind(e) === "game" && e.season != null && e.week != null && gameComplete(e)
  );
  if (!games.length) return null;
  const newest = [...games].sort((a, b) =>
    (b.kickoffDate ?? "").localeCompare(a.kickoffDate ?? "")
  )[0];
  const weekGames = gamesForWeek(newest.sport, newest.season!, newest.week!, events);
  const record = weekRecord(weekGames, calls);
  if (record.hits + record.misses === 0) return null;
  const hitNames = [
    ...new Set(
      weekResults(weekGames, calls, pundits)
        .filter((r) => r.status === "hit")
        .map((r) => r.pundit.name)
    ),
  ];
  const hitTeam = weekResults(weekGames, calls, pundits).find((r) => r.status === "hit")
    ?.pickLabel.split(" over ")[0];
  const who =
    hitNames.length && hitTeam
      ? ` ${listNames(hitNames)} hit on ${hitTeam}.`
      : "";
  const line = `Week ${newest.week}: experts went ${record.hits}–${record.misses}.${who}`;
  return {
    sport: newest.sport,
    season: newest.season!,
    week: newest.week!,
    href: weekArchivePath(newest.sport, newest.season!, newest.week!),
    line,
  };
}

function listNames(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
```

Point `components/WeekArchive.tsx` `weekArchivePath` at the lib export so there is one path function.

- [ ] **Step 4: Run** `npx vitest run lib/archive.test.ts` — expect PASS. If the hit names are in weekResults order (hits first, then name), that is Chip Patterson then Greg McElroy.

- [ ] **Step 5: Home Weekend.** Compute recap once in `HomePage`. Pass it into the NCAAF `Weekend` when `recap?.sport === "ncaaf"`. Render above the Final list:

```tsx
{recap ? (
  <p className="when">
    <a href={recap.href}>{recap.line}</a>
  </p>
) : null}
```

- [ ] **Step 6: Disagreements copy** in `app/page.tsx`: kicker `Season`; add a `when` line `Titles and Super Bowls · not this week` under the title (same `.when` class as Weekend).

- [ ] **Step 7: Run** `npx vitest run` — expect PASS.

- [ ] **Step 8: Commit** `feat: recap the last graded week on home`

---

### Task 5: Canonical docs and a localhost look

**Files:**
- Modify: `docs/product/experience-principles.md`
- Modify: `docs/product/decision-log.md`

- [ ] **Step 1: Principles.** §1: the homepage hero is the next matchup, not a product slogan. §5: frozen cents stay on the sides; the word Kalshi is not the scan kicker.

- [ ] **Step 2: Decision log.** Two accepted rows dated 2026-08-31:

```
| Homepage hero leads with the next game. | A fan should see matchup, time, and who is on it before the product pitch. | Accepted 2026-08-31 |
| Scan cards do not lead with Kalshi. | Market source belongs on the detail card; scan is game, state, faces, price. | Accepted 2026-08-31 |
```

- [ ] **Step 3: Run** `npm test` then `npm run check`.

- [ ] **Step 4: Localhost.** Serve `out/` and confirm: mobile-width hero shows Clemson before the giant headline; eyebrow is kickoff/network; lede names Pate/Finebaum and empty Clemson; scan cards do not start with Kalshi; college section still has the Clemson card plus `Week 0: experts went 2–4…` linking to the archive; disagreements say Season / not this week.

- [ ] **Step 5: Commit** `docs: record home fan-scan decisions`

---

## Spec coverage

| Spec rule | Task |
|---|---|
| Hero card first on small screens; smaller display type | 2 |
| Eyebrow is sports time | 2 |
| Lede is faces + empty side, no cents | 1, 2 |
| Duplicate marquee stays | global (already shipped) |
| Kalshi kicker only on detail | 3 |
| Week recap line + archive link | 4 |
| Disagreements labeled long range | 4 |
| Canonical docs | 5 |
| Capture / table rank / takes sort parked | no task |
