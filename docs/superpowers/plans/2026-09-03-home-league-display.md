# Home and league display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/` a featured board with a two-game compact teaser, and make `/ncaaf/` and `/nfl/` live-week TV slates that mix full and compact cards by coverage without dropping verified picks.

**Architecture:** One coverage rule and one schedule sort in `lib/featured.ts`. Home applies slot caps. League and week archives apply no caps. Reuse `EventCard`, `CompactEventCard`, and `FinalRow`. Capture, `onHome`, and editorial JSON do not change.

**Tech Stack:** Next.js static export, TypeScript, vitest, existing scan cards.

**Spec:** `docs/superpowers/specs/2026-09-03-home-league-display-design.md`

## Global Constraints

- Display only. Do not edit `data/*.json`, bots, Scout/Audit/Promote/Grader, or `onHome` flips.
- Do not add event fields for card size or kickoff timestamps.
- Coverage: `full` if both sides are filled or there are ≥2 unique rostered faces with photos; else `compact`.
- Home caps: 1 hero, 3 full per sport, 2 leftover compact per sport, 2 latest Finals per sport.
- League is schedule order, not a density stack. Live weeks only. Previous weeks are tease + archive URL.
- Parse football kickoff: first `h:mm`; `12:xx` is noon; hours 1–11 are PM; missing/unparseable last on that date.
- Reuse `EventCard` / `CompactEventCard` / `FinalRow`. No third card.
- Leave `getSlateGames` and `gamesForWeek` as they are. Do not follow `docs/superpowers/plans/2026-09-03-display-tiers.md` (historical: uncapped compact, league unchanged).
- `npm test` after helper work. `npm run check` after route/UI/docs.
- Preserve unrelated dirty worktree files. Implement on an isolated branch/worktree.

## File structure

- Modify: `lib/featured.ts` — coverage, kickoff parse, schedule sort, home caps, league slate, week-archive list
- Modify: `lib/featured.test.ts` — TDD surface
- Modify: `app/page.tsx` — already consumes capped arrays; only copy if needed
- Modify: `components/SportSlate.tsx` — live-week blocks
- Modify: `components/WeekArchive.tsx` — coverage treatment
- Modify: `app/ncaaf/page.tsx` — metadata must not claim Week 0 games are listed
- Modify: `docs/product/featured-games.md`, `current-context.md`, `decision-log.md`, `README.md`, `docs/README.md`, `docs/capture-policy.md`
- Do not modify: `app/methodology/page.tsx`, `lib/data.ts` `getSlateGames`, `lib/archive.ts` `gamesForWeek`, `lib/bets.test.ts` onHome assertions

---

### Task 1: Coverage tier and kickoff parse

**Files:**
- Modify: `lib/featured.ts`
- Test: `lib/featured.test.ts`

**Interfaces:**
- Consumes: existing `coverage()` / `cardedCalls()` in `lib/featured.ts`; existing `game`/`pick` fixtures in `lib/featured.test.ts`
- Produces:
  - `coverageTier(event, calls, pundits): "full" | "compact"`
  - `parseKickoffMinutes(kickoff): number | null`

- [ ] **Step 1: Write the failing tests**

Add imports for `coverageTier` and `parseKickoffMinutes`. Append:

```ts
describe("coverageTier", () => {
  it("is full when both sides have a carded pick", () => {
    const event = game("fight", "ncaaf", "2026-09-05");
    expect(coverageTier(event, twoSided(event.slug), pundits)).toBe("full");
  });

  it("is full when two faces pick the same side", () => {
    const event = game("stack", "ncaaf", "2026-09-05");
    const calls = [
      pick(event.slug, "face-1", "no"),
      pick(event.slug, "face-2", "no"),
    ];
    expect(coverageTier(event, calls, pundits)).toBe("full");
  });

  it("is compact for one carded face", () => {
    const event = game("thin", "ncaaf", "2026-09-05");
    expect(coverageTier(event, [pick(event.slug, "face-1", "no")], pundits)).toBe(
      "compact"
    );
  });

  it("does not count a photo-less pundit as a face", () => {
    const event = game("no-photo", "ncaaf", "2026-09-05");
    const calls = [
      pick(event.slug, "face-1", "yes"),
      pick(event.slug, "face-2", "no"),
    ];
    const noPhoto = pundits.map((pundit) =>
      pundit.id === "face-2" ? { ...pundit, photo: "" } : pundit
    );
    expect(coverageTier(event, calls, noPhoto)).toBe("compact");
  });
});

describe("parseKickoffMinutes", () => {
  it("treats 12:00 as noon", () => {
    expect(parseKickoffMinutes("Sat 12:00 ET")).toBe(720);
    expect(parseKickoffMinutes("12:30 ET")).toBe(750);
  });

  it("treats hours 1 through 11 as PM", () => {
    expect(parseKickoffMinutes("Sun 1:00 ET")).toBe(780);
    expect(parseKickoffMinutes("Sat 3:30 ET")).toBe(930);
    expect(parseKickoffMinutes("Sat 7:30 ET")).toBe(1170);
    expect(parseKickoffMinutes("Fri 9:00 ET")).toBe(1260);
    expect(parseKickoffMinutes("Mon 10:30 ET")).toBe(1350);
  });

  it("ignores the day-of-week token", () => {
    expect(parseKickoffMinutes("Fri 9:00 ET")).toBe(
      parseKickoffMinutes("Sat 9:00 ET")
    );
  });

  it("returns null for missing and unparseable strings", () => {
    expect(parseKickoffMinutes(undefined)).toBeNull();
    expect(parseKickoffMinutes("")).toBeNull();
    expect(parseKickoffMinutes("TBD")).toBeNull();
    expect(parseKickoffMinutes("Sat Night ET")).toBeNull();
    expect(parseKickoffMinutes("13:00 ET")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/featured.test.ts`

Expected: FAIL — `coverageTier` / `parseKickoffMinutes` are not exported.

- [ ] **Step 3: Implement**

Export `coverageTier` as the existing `nonFeaturedTier` body (both sides or `faces >= 2`). Keep `nonFeaturedTier` as an alias or replace call sites with `coverageTier`.

```ts
export function parseKickoffMinutes(
  kickoff: string | null | undefined
): number | null {
  if (!kickoff) return null;
  const match = kickoff.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59) return null;
  if (hour === 12) return 12 * 60 + minute;
  if (hour >= 1 && hour <= 11) return (hour + 12) * 60 + minute;
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/featured.test.ts`

Expected: new tests PASS. Existing tests still green except none should break yet.

- [ ] **Step 5: Commit**

```bash
git add lib/featured.ts lib/featured.test.ts
git commit -m "feat(display): coverage tier and football kickoff parse"
```

---

### Task 2: Schedule sort

**Files:**
- Modify: `lib/featured.ts`
- Test: `lib/featured.test.ts`

**Interfaces:**
- Consumes: `parseKickoffMinutes`, existing `coverage()`, `dateValue()`
- Produces: `sortBySchedule(events, calls, pundits): Event[]`
- `sortFeaturedGames` filters complete open/grading cards, pins first, then `sortBySchedule`. No `localeCompare` on `kickoff`.

- [ ] **Step 1: Write the failing tests**

```ts
describe("sortBySchedule", () => {
  it("ranks same-date clocks 1:00 then 3:30 then 7:30 then 9:00 then 10:30", () => {
    const events = [
      game("night", "ncaaf", "2026-09-05", { kickoff: "Sat 10:30 ET" }),
      game("nine", "ncaaf", "2026-09-05", { kickoff: "Sat 9:00 ET" }),
      game("evening", "ncaaf", "2026-09-05", { kickoff: "Sat 7:30 ET" }),
      game("afternoon", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" }),
      game("early", "ncaaf", "2026-09-05", { kickoff: "Sat 1:00 ET" }),
    ];
    const calls = events.flatMap((event) => twoSided(event.slug));
    expect(sortBySchedule(events, calls, pundits).map((event) => event.slug)).toEqual([
      "early",
      "afternoon",
      "evening",
      "nine",
      "night",
    ]);
  });

  it("ranks 12:00 noon before 1:00 PM on the same date", () => {
    const noon = game("noon", "ncaaf", "2026-09-05", { kickoff: "Sat 12:00 ET" });
    const one = game("one", "ncaaf", "2026-09-05", { kickoff: "Sat 1:00 ET" });
    const calls = [...twoSided(noon.slug), ...twoSided(one.slug, 3)];
    expect(sortBySchedule([one, noon], calls, pundits).map((event) => event.slug)).toEqual([
      noon.slug,
      one.slug,
    ]);
  });

  it("puts missing or unparseable kickoff last on that date", () => {
    const timed = game("timed", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" });
    const missing = game("missing", "ncaaf", "2026-09-05", { kickoff: undefined });
    const tbd = game("tbd", "ncaaf", "2026-09-05", { kickoff: "TBD" });
    const calls = [timed, missing, tbd].flatMap((event) => twoSided(event.slug));
    expect(
      sortBySchedule([tbd, missing, timed], calls, pundits).map((event) => event.slug)
    ).toEqual([timed.slug, missing.slug, tbd.slug]);
  });

  it("lets kickoffDate beat clock", () => {
    const friday = game("friday", "ncaaf", "2026-09-04", { kickoff: "Fri 9:00 ET" });
    const saturday = game("saturday", "ncaaf", "2026-09-05", {
      kickoff: "Sat 3:30 ET",
    });
    const calls = [...twoSided(friday.slug), ...twoSided(saturday.slug, 3)];
    expect(
      sortBySchedule([saturday, friday], calls, pundits).map((event) => event.slug)
    ).toEqual([friday.slug, saturday.slug]);
  });

  it("keeps a Friday compact game above a Sunday full game", () => {
    const friday = game("friday-thin", "ncaaf", "2026-09-04", {
      kickoff: "Fri 9:00 ET",
    });
    const sunday = game("sunday-dense", "ncaaf", "2026-09-06", {
      kickoff: "Sun 7:30 ET",
    });
    const calls = [
      pick(friday.slug, "face-1", "no"),
      ...twoSided(sunday.slug, 2),
      pick(sunday.slug, "face-4", "no"),
    ];
    expect(
      sortBySchedule([sunday, friday], calls, pundits).map((event) => event.slug)
    ).toEqual([friday.slug, sunday.slug]);
  });
});
```

Keep `"sorts by date without penalizing a Melbourne kickoff"`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/featured.test.ts`

Expected: FAIL — `sortBySchedule` is not exported. Same-date `localeCompare` still ranks `10:30` before `9:00`.

- [ ] **Step 3: Implement `sortBySchedule` and switch `sortFeaturedGames`**

Comparator: `kickoffDate` asc (invalid last), parsed minutes asc (`null` last), then existing coverage (faces, both sides, disagreement), then slug.

`sortFeaturedGames`: filter `isCompleteFeaturedCard`, active pin first, remainder `sortBySchedule`. Delete the `kickoff` `localeCompare` branch.

Use the same parsed minutes (desc) in `sortFinalGames` instead of `localeCompare`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/featured.test.ts`

Expected: new sort tests PASS. Live snapshot compact order may now fail because Baylor (timed) should rank before untimed Saturday leftovers. Do not fix the live snapshot until Task 3 (caps change it anyway). If only that live snapshot fails, leave it for Task 3.

- [ ] **Step 5: Commit**

```bash
git add lib/featured.ts lib/featured.test.ts
git commit -m "feat(display): sort games by kickoff date and parsed time"
```

---

### Task 3: Home slot caps

**Files:**
- Modify: `lib/featured.ts` `getHomepageFeaturedGames`
- Test: `lib/featured.test.ts`

**Interfaces:**
- Consumes: `coverageTier`, `sortBySchedule`, existing `selectFeaturedGame`
- Produces: `getHomepageFeaturedGames(..., sectionLimit = 3, compactLimit = 2, finalLimit = 2)` with compact and final arrays capped.

- [ ] **Step 1: Write the failing tests**

```ts
it("caps leftover compact teasers at two per sport", () => {
  const events = Array.from({ length: 5 }, (_, index) =>
    game(`thin-${index}`, "ncaaf", `2026-09-0${index + 2}`)
  );
  const calls = events.map((event, index) =>
    pick(event.slug, `face-${index + 1}`, "no")
  );
  const featured = getHomepageFeaturedGames(
    events,
    calls,
    pundits,
    null,
    "2026-09-01"
  );
  expect(featured.ncaaf).toEqual([]);
  expect(featured.hero?.slug).toBe("thin-0");
  expect(featured.ncaafCompact.map((event) => event.slug)).toEqual([
    "thin-1",
    "thin-2",
  ]);
});

it("caps Finals at two latest per sport", () => {
  const finals = [
    game("old", "ncaaf", "2026-08-29", { awayScore: 1, homeScore: 2 }),
    game("mid", "ncaaf", "2026-08-30", { awayScore: 1, homeScore: 2 }),
    game("new", "ncaaf", "2026-08-31", { awayScore: 1, homeScore: 2 }),
  ];
  const calls = finals.map((event, index) =>
    pick(event.slug, `face-${index + 1}`, "yes", "hit")
  );
  const featured = getHomepageFeaturedGames(
    finals,
    calls,
    pundits,
    null,
    "2026-09-01"
  );
  expect(featured.ncaafFinal.map((event) => event.slug)).toEqual([
    "new",
    "mid",
  ]);
});

it("keeps leftover full-tier overflow in schedule order with compact-tier", () => {
  const friday = game("friday-thin", "ncaaf", "2026-09-04", {
    kickoff: "Fri 9:00 ET",
  });
  const saturdayFull = [
    game("full-a", "ncaaf", "2026-09-05", { kickoff: "Sat 12:00 ET" }),
    game("full-b", "ncaaf", "2026-09-05", { kickoff: "Sat 3:30 ET" }),
    game("full-c", "ncaaf", "2026-09-05", { kickoff: "Sat 7:30 ET" }),
    game("full-d", "ncaaf", "2026-09-05", { kickoff: "Sat 9:00 ET" }),
  ];
  const events = [friday, ...saturdayFull];
  const calls = [
    pick(friday.slug, "face-1", "no"),
    ...saturdayFull.flatMap((event, index) => twoSided(event.slug, index + 2)),
  ];
  const featured = getHomepageFeaturedGames(
    events,
    calls,
    pundits,
    null,
    "2026-09-01"
  );
  expect(featured.hero?.slug).toBe("full-a");
  expect(featured.ncaaf.map((event) => event.slug)).toEqual([
    "full-b",
    "full-c",
    "full-d",
  ]);
  expect(featured.ncaafCompact.map((event) => event.slug)).toEqual([
    friday.slug,
  ]);
});
```

Keep `"keeps full-card overflow on home by rendering it compactly"` (4 full-tier + pin → 3 full + 1 compact).

Rewrite `"matches this week's Clemson hero and lede from live data"` to assert:

- `featured.hero?.slug === "clemson-at-lsu-2026"`
- lede unchanged if still true
- `featured.ncaaf` length `<= 3`, `ncaafCompact` length `<= 2`, `nfl` length `<= 3`, `nflCompact` length `<= 2`
- hero slug not in `ncaaf` / `ncaafCompact` / `nfl` / `nflCompact`
- `ncaafFinal.length <= 2`
- Do not hardcode the spec’s worked-example leftover slugs.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/featured.test.ts`

Expected: FAIL — compact arrays still uncapped; Finals still list all three.

- [ ] **Step 3: Cap compact and final in `getHomepageFeaturedGames`**

After selecting full (`coverageTier === "full"`, slice `sectionLimit`), leftover candidates in that already-sorted schedule order `.slice(0, compactLimit)`. Finals `.slice(0, finalLimit)` per sport after latest-first sort.

Add `compactLimit = 2` and `finalLimit = 2` parameters with those defaults.

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/featured.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/featured.ts lib/featured.test.ts
git commit -m "feat(home): cap compact teasers and Final receipts"
```

---

### Task 4: League slate helper

**Files:**
- Modify: `lib/featured.ts`
- Test: `lib/featured.test.ts`

**Interfaces:**
- Consumes: `sortBySchedule`, `mappedHardCallsForEvent`, `eventKind`, `eventScanStatus`, `weekArchivePath` from `lib/archive.ts`
- Produces:

```ts
export type LeagueWeekBlock = {
  season: number;
  week: number;
  label: string;
  open: Event[];
  final: Event[];
};

export type LeagueSlate = {
  weeks: LeagueWeekBlock[];
  previous: {
    season: number;
    week: number;
    href: string;
    line: string;
  } | null;
  unscheduled: Event[];
};

export function getLeagueSlate(
  sport: Sport,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): LeagueSlate;

export function getWeekArchiveGames(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): Event[];
```

`getLeagueGames` becomes eligibility only (no `getSlateGames`).

Week label: `Week ${n} · ${range}` from min/max `kickoffDate`. Same month: `Sep 3–7`. Crossing months: `Sep 28–Oct 4`. Use `formatShortDate` / local month names; do not export `MONTHS` unless needed.

- [ ] **Step 1: Write the failing tests**

```ts
it("does not inherit onHome sort on the league slate", () => {
  const friday = game("friday-off", "ncaaf", "2026-09-04", {
    onHome: false,
    week: 1,
    season: 2026,
    kickoff: "Fri 9:00 ET",
  });
  const saturday = game("saturday-on", "ncaaf", "2026-09-05", {
    onHome: true,
    homeRank: 0,
    week: 1,
    season: 2026,
    kickoff: "Sat 7:30 ET",
  });
  const calls = [
    pick(friday.slug, "face-1", "no"),
    ...twoSided(saturday.slug, 2),
  ];
  const slate = getLeagueSlate("ncaaf", [saturday, friday], calls, pundits);
  expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
    friday.slug,
    saturday.slug,
  ]);
});

it("omits a settled previous week from live weeks and teases it", () => {
  const week0 = game("week0", "ncaaf", "2026-08-29", {
    week: 0,
    season: 2026,
    awayScore: 10,
    homeScore: 7,
  });
  const week1 = game("week1", "ncaaf", "2026-09-05", {
    week: 1,
    season: 2026,
  });
  const calls = [
    pick(week0.slug, "face-1", "yes", "hit"),
    pick(week1.slug, "face-2", "no"),
  ];
  const slate = getLeagueSlate("ncaaf", [week0, week1], calls, pundits);
  expect(slate.weeks.map((block) => block.week)).toEqual([1]);
  expect(slate.previous).toMatchObject({
    week: 0,
    season: 2026,
    href: "/ncaaf/2026/week-0/",
  });
  expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([week1.slug]);
});

it("shows a later week below the current week when it already has picks", () => {
  const week1 = game("w1", "ncaaf", "2026-09-05", { week: 1, season: 2026 });
  const week2 = game("w2", "ncaaf", "2026-09-12", { week: 2, season: 2026 });
  const calls = [
    pick(week1.slug, "face-1", "no"),
    pick(week2.slug, "face-2", "yes"),
  ];
  const slate = getLeagueSlate("ncaaf", [week2, week1], calls, pundits);
  expect(slate.weeks.map((block) => block.week)).toEqual([1, 2]);
});

it("keeps the most recently settled week when nothing is open", () => {
  const week0 = game("w0", "ncaaf", "2026-08-29", {
    week: 0,
    season: 2026,
    awayScore: 1,
    homeScore: 2,
  });
  const week1 = game("w1", "ncaaf", "2026-09-05", {
    week: 1,
    season: 2026,
    awayScore: 3,
    homeScore: 4,
  });
  const calls = [
    pick(week0.slug, "face-1", "yes", "hit"),
    pick(week1.slug, "face-2", "no", "miss"),
  ];
  const slate = getLeagueSlate("ncaaf", [week0, week1], calls, pundits);
  expect(slate.weeks.map((block) => block.week)).toEqual([1]);
  expect(slate.weeks[0].open).toEqual([]);
  expect(slate.weeks[0].final.map((event) => event.slug)).toEqual([week1.slug]);
  expect(slate.previous?.week).toBe(0);
});

it("keeps unpriced mapped games on the league slate", () => {
  const unpriced = game("unpriced", "ncaaf", "2026-09-04", {
    yesCents: null,
    noCents: null,
    sourceUrl: null,
    week: 1,
    season: 2026,
  });
  const calls = [pick(unpriced.slug, "face-1", "yes")];
  const slate = getLeagueSlate("ncaaf", [unpriced], calls, pundits);
  expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
    unpriced.slug,
  ]);
});

it("lists unscheduled mapped games separately", () => {
  const scheduled = game("scheduled", "ncaaf", "2026-09-05", {
    week: 1,
    season: 2026,
  });
  const stray = game("stray", "ncaaf", "2026-09-06", {
    week: undefined,
    season: undefined,
  });
  const calls = [
    pick(scheduled.slug, "face-1", "no"),
    pick(stray.slug, "face-2", "yes"),
  ];
  const slate = getLeagueSlate("ncaaf", [scheduled, stray], calls, pundits);
  expect(slate.weeks[0].open.map((event) => event.slug)).toEqual([
    scheduled.slug,
  ]);
  expect(slate.unscheduled.map((event) => event.slug)).toEqual([stray.slug]);
});
```

Also: `getWeekArchiveGames` drops zero-pick games and uses schedule order, not `homeRank`. Keep existing `getLeagueGames` eligibility tests; change its implementation so it no longer uses `getSlateGames`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/featured.test.ts`

Expected: FAIL — `getLeagueSlate` is not exported.

- [ ] **Step 3: Implement**

Live-week algorithm as spec. Open list = `open|grading` in `sortBySchedule` order (do not concat `partitionGames`). `getWeekArchiveGames` = eligible games for that sport/season/week, `sortBySchedule`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/featured.test.ts lib/bets.test.ts lib/archive.test.ts`

Expected: PASS. `lib/bets.test.ts` still sees `getSlateGames` as onHome-first.

- [ ] **Step 5: Commit**

```bash
git add lib/featured.ts lib/featured.test.ts
git commit -m "feat(display): live-week league slate helper"
```

---

### Task 5: Wire home, league, and week archives

**Files:**
- Modify: `app/page.tsx` only if copy needs it (arrays already capped)
- Modify: `components/SportSlate.tsx`
- Modify: `components/WeekArchive.tsx`
- Modify: `app/ncaaf/page.tsx` metadata/description

**Interfaces:**
- Consumes: `getLeagueSlate`, `coverageTier`, `getWeekArchiveGames`
- Produces: league page week blocks; archive coverage treatment

- [ ] **Step 1: SportSlate uses `getLeagueSlate`**

Replace `getLeagueGames` + `partitionGames` concat. For each `slate.weeks`:

1. Board titled with `week.label`
2. `week.open.map` → `coverageTier === "full" ? EventCard : CompactEventCard` in that order (mixed, no `.compact-slate` wrapper)
3. Uncapped `FinalRow` list for `week.final`

If `slate.previous`, a `.week-recap` link (`previous.line` / `previous.href`). Do not list those games.

If `slate.unscheduled.length`, a trailing mixed list with heading `Also on the slate`.

Keep futures, waiting futures, `TeamLinks`, `SportFilter`, `WeekArchivePathLinks`.

Derive `COPY.when` from live week labels rather than hardcoding `Week 0 is final`. Update `app/ncaaf/page.tsx` metadata so it does not say “plus Week 0 results.”

- [ ] **Step 2: WeekArchive uses `getWeekArchiveGames`**

```ts
const games = getWeekArchiveGames(sport, season, week, events, calls, pundits);
```

Map each game through `coverageTier` to `EventCard` or `CompactEventCard`. Keep “Who was right” and prev/next. Do not use `FinalRow`. Leave `gamesForWeek` for OG/sitemap/`weekRecord`.

- [ ] **Step 3: Home**

`Weekend` already renders full → compact → Final from helper arrays. No structural change required. Keep “More games with verified picks” and “Full slate →”.

- [ ] **Step 4: Run unit tests**

Run: `npx vitest run lib/featured.test.ts lib/archive.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/ncaaf/page.tsx components/SportSlate.tsx components/WeekArchive.tsx
git commit -m "feat(ui): featured home teaser and live-week league slates"
```

---

### Task 6: Product docs and verification

**Files:**
- Modify: `docs/product/featured-games.md`
- Modify: `docs/product/current-context.md`
- Modify: `docs/product/decision-log.md`
- Modify: `docs/product/README.md`
- Modify: `docs/README.md`
- Modify: `docs/capture-policy.md`

- [ ] **Step 1: Update featured-games.md** to the spec contract: home caps, parsed kickoff, live-week league, previous-week tease, pin as hero stability on static rebuilds, `lib/featured.ts` as implementation. Replace “uncapped compact so no complete game is dropped from `/`.”

- [ ] **Step 2: Update current-context, decision-log (amend 2026-09-01 row, dated 2026-09-03), README files, and one capture-policy line that display is this contract and Dispatch is unchanged.**

- [ ] **Step 3: Methodology impact check.** Confirm `app/methodology/page.tsx` does not claim every complete game lives on `/`. Do not edit it.

- [ ] **Step 4: Verify**

Run: `npm test`

Then: `npm run check`

Expected: both green.

- [ ] **Step 5: Commit**

```bash
git add docs/product/featured-games.md docs/product/current-context.md docs/product/decision-log.md docs/product/README.md docs/README.md docs/capture-policy.md docs/superpowers/specs/2026-09-03-home-league-display-design.md docs/superpowers/plans/2026-09-03-home-league-display.md
git commit -m "docs: home and league display contract"
```
