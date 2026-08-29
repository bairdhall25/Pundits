# Pundits v1 Public Launch Implementation Plan

> Status: Historical. The plan's GitHub Pages, earlier route, and launch-count guidance are obsolete. Production now uses Cloudflare Pages; consult `docs/product/`, `docs/ROADMAP.md`, and `docs/RUNBOOK.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the existing Pundits prototype into a publicly shareable, fully accurate opening-weekend site (CFB Week 1 + NFL Week 1), shared Friday/Saturday Sep 4–5 2026 once marquee cards carry real captured picks.

**Architecture:** The app already exists and deploys (Next.js 15 static export → GitHub Pages). This plan changes the ledger model (kill invented 2025 records → activity leaderboard), enforces per-price Kalshi sourcing, expands the roster to ~40 with verified photos, fixes the responsive card layout, and installs a repeatable capture run that fills the game cards Wed–Sat with verified quotes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind, Vitest, GitHub Pages static export.

**Spec:** `docs/superpowers/specs/2026-08-25-pundits-v1-launch-design.md` (main repo). Companion data: `docs/roster-20.md`, `docs/week1-leans.md` (main repo).

## Global Constraints

- **Workspace:** all code/data work happens in `C:\Users\baird\Documents\GitHub\Pundits\.worktrees\pundits-prototype` (branch `pundits-prototype`). Paths below are relative to that root unless prefixed `main-repo:`.
- Capture integrity rules (spec, enforce verbatim): clear first-person leans only; weasels stay `soft` unmapped; never stretch a futures pick onto a game; never attribute McAfee Show guest picks to Pat McAfee — name the speaker; empty sides OK, fake faces never; cents from Kalshi freeze only, each with its own `sourceUrl` + `sourcedAt`; quotes verified at their URL or dropped; no pundit ships without a verified real photo.
- Colors: background `#0A0A0A`, accent `#39FF14` only, white/gray reading. GameDay-adjacent broadcast look.
- Permalink route is `/picks/[slug]`. No `/bets/` anywhere.
- No backend, no database, no cron, no live Kalshi API, no accounts, no bet buttons.
- Footer honesty line on every page: `Hypothetical $100. Kalshi snapshot, not live. Not affiliated with Kalshi or these pundits. They did not place these picks.`
- The yellow MOCK banner stays until Task 8 removes it (its removal is a ship gate, not a cleanup).
- Run `npx vitest run` and `npx next build` before every commit that touches `lib/`, `data/`, or `app/`.
- Commit after each task (worktree branch). Do not force-push.

## File map

| File | Responsibility |
|---|---|
| `lib/types.ts` | `Pundit` (sport-tagged, no invented records), `Event` (+ per-event source), `Call`, `ActivityRecord`, `CardSide` |
| `lib/data.ts` | Loaders + `getActivityBoard`, `sidesForCard`; delete `accuracyPct`/`toRecord`/`getLeaderboard`/`PunditRecord` usages |
| `lib/data.test.ts` | Helper tests (activity board, card sides) |
| `lib/roster.test.ts` | Roster shape: sport tag, no `estimated2025`, photo file exists |
| `lib/events.test.ts` | Freeze integrity: home events fully priced + sourced, sane cents |
| `lib/ledger.test.ts` | Cross-file integrity: mappings point at real events, only hard mapped, no placeholder text |
| `data/pundits.json` | ~40 sport-tagged pundits |
| `data/events.json` | Frozen events, per-event `sourceUrl`/`sourcedAt`, Week 0 staged |
| `data/calls.json` | Verified calls; grows during capture runs |
| `public/photos/{id}.jpg` | ~29 new verified headshots |
| `app/leaderboard/page.tsx`, `app/pundits/[id]/page.tsx`, `app/page.tsx` | Activity board, profile, home reworks |
| `components/EventCard.tsx`, `PeekRow.tsx`, `PunditAvatar.tsx`, `SiteHeader.tsx` | Card ordering, grid-at-desktop, bigger faces, nav affordance |
| `docs/RUNBOOK.md` (worktree) | The capture run checklist + intake schema |

---

### Task 1: Activity leaderboard end-to-end (kill invented 2025 records)

**Files:**
- Modify: `lib/types.ts`, `lib/data.ts`, `lib/data.test.ts`, `lib/roster.test.ts`, `data/pundits.json`
- Modify: `app/leaderboard/page.tsx`, `app/pundits/[id]/page.tsx`, `app/page.tsx` (Table peek), any component compiling against `PunditRecord`/`accuracy2025`

**Interfaces:**
- Consumes: existing `seasonFromCalls`, `isMapped`, loaders.
- Produces (later tasks rely on these exact names):
  - `export type PunditSport = "ncaaf" | "nfl" | "both"`
  - `export type Pundit = { id: string; name: string; outlet: string; photo: string; sport: PunditSport }` (no `estimated2025`)
  - `export type ActivityRecord = Pundit & { season2026: { wins: number; losses: number; pending: number }; mappedPending: number; totalCalls: number }`
  - `export function getActivityBoard(pundits: Pundit[], calls: Call[]): ActivityRecord[]`
  - `export function getPundit(id: string, pundits: Pundit[], calls: Call[]): ActivityRecord | null`
- Removed (fix all compile errors): `PunditRecord`, `accuracyPct`, `toRecord`, `getLeaderboard`, `accuracy2025`.

- [ ] **Step 1: Write the failing tests**

Replace the leaderboard-related describes in `lib/data.test.ts` (keep unrelated describes like `seasonFromCalls`, event helpers; delete `accuracyPct` and `getLeaderboard` describes) and update its fixtures to the new `Pundit` shape:

```ts
const pundits: Pundit[] = [
  { id: "saban", name: "Nick Saban", outlet: "ESPN / GameDay", photo: "/photos/saban.jpg", sport: "ncaaf" },
  { id: "finebaum", name: "Paul Finebaum", outlet: "Finebaum / ESPN", photo: "/photos/finebaum.jpg", sport: "ncaaf" },
];

describe("getActivityBoard", () => {
  it("ranks by mapped pending picks, then total calls, then name", () => {
    // fixture calls: finebaum has 1 mapped pending hard call, saban has 0 mapped
    const board = getActivityBoard(pundits, calls);
    expect(board.map((p) => p.id)).toEqual(["finebaum", "saban"]);
    expect(board[0].mappedPending).toBe(1);
    expect(board[0].totalCalls).toBeGreaterThan(0);
  });
  it("exposes season2026 derived from hard calls only", () => {
    const board = getActivityBoard(pundits, calls);
    const saban = board.find((p) => p.id === "saban")!;
    expect(saban.season2026).toEqual({ wins: 1, losses: 0, pending: 0 });
  });
});

describe("getPundit", () => {
  it("returns an ActivityRecord for a known id", () => {
    const p = getPundit("finebaum", pundits, calls)!;
    expect(p.mappedPending).toBe(1);
  });
  it("returns null for an unknown id", () => {
    expect(getPundit("corso", pundits, calls)).toBeNull();
  });
});
```

Give the fixture `calls` a mapped entry (`eventSlug: "indiana-title", side: "no"`) on finebaum's hard pending call so `mappedPending` is exercised.

Replace `lib/roster.test.ts` entirely:

```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadPundits } from "./data";

const SPORTS = new Set(["ncaaf", "nfl", "both"]);

describe("roster", () => {
  it("tags every pundit with a sport and carries no invented records", () => {
    for (const p of loadPundits()) {
      expect(SPORTS.has(p.sport), p.id).toBe(true);
      expect((p as Record<string, unknown>).estimated2025, p.id).toBeUndefined();
    }
  });

  it("has a real photo file for every pundit", () => {
    for (const p of loadPundits()) {
      expect(p.photo, p.id).toMatch(/^\/photos\/[a-z0-9-]+\.(jpg|png)$/);
      const rel = p.photo.replace(/^\//, "");
      expect(existsSync(path.join(process.cwd(), "public", rel)), p.id).toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = loadPundits().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/data.test.ts lib/roster.test.ts`
Expected: FAIL — `getActivityBoard` not exported; `Pundit` type mismatch (`sport` missing, `estimated2025` present).

- [ ] **Step 3: Update types and helpers**

`lib/types.ts` — replace `Pundit` and `PunditRecord`:

```ts
export type PunditSport = "ncaaf" | "nfl" | "both";

export type Pundit = {
  id: string;
  name: string;
  outlet: string;
  photo: string;
  sport: PunditSport;
};

export type ActivityRecord = Pundit & {
  season2026: { wins: number; losses: number; pending: number };
  mappedPending: number;
  totalCalls: number;
};
```

`lib/data.ts` — delete `accuracyPct`, `toRecord`, `getLeaderboard`; replace `getPundit`; add:

```ts
export function toActivityRecord(pundit: Pundit, calls: Call[]): ActivityRecord {
  const mine = calls.filter((c) => c.punditId === pundit.id);
  return {
    ...pundit,
    season2026: seasonFromCalls(pundit.id, calls),
    mappedPending: mine.filter((c) => isMapped(c) && c.status === "pending").length,
    totalCalls: mine.length,
  };
}

export function getActivityBoard(pundits: Pundit[], calls: Call[]): ActivityRecord[] {
  return pundits
    .map((p) => toActivityRecord(p, calls))
    .sort(
      (a, b) =>
        b.mappedPending - a.mappedPending ||
        b.totalCalls - a.totalCalls ||
        a.name.localeCompare(b.name)
    );
}

export function getPundit(id: string, pundits: Pundit[], calls: Call[]): ActivityRecord | null {
  const p = pundits.find((x) => x.id === id);
  return p ? toActivityRecord(p, calls) : null;
}
```

- [ ] **Step 4: Migrate `data/pundits.json`**

Replace the file with the existing 11 pundits in the new shape (roster expansion is Task 4):

```json
[
  { "id": "herbstreit", "name": "Kirk Herbstreit", "outlet": "College GameDay", "photo": "/photos/herbstreit.jpg", "sport": "ncaaf" },
  { "id": "mcafee", "name": "Pat McAfee", "outlet": "GameDay / McAfee Show", "photo": "/photos/mcafee.jpg", "sport": "both" },
  { "id": "saban", "name": "Nick Saban", "outlet": "ESPN / GameDay", "photo": "/photos/saban.jpg", "sport": "ncaaf" },
  { "id": "finebaum", "name": "Paul Finebaum", "outlet": "Finebaum / ESPN", "photo": "/photos/finebaum.jpg", "sport": "ncaaf" },
  { "id": "mcelroy", "name": "Greg McElroy", "outlet": "ESPN / Always College Football", "photo": "/photos/mcelroy.jpg", "sport": "ncaaf" },
  { "id": "coughlin", "name": "Stanford Steve Coughlin", "outlet": "College GameDay", "photo": "/photos/coughlin.jpg", "sport": "ncaaf" },
  { "id": "thamel", "name": "Pete Thamel", "outlet": "ESPN", "photo": "/photos/thamel.jpg", "sport": "ncaaf" },
  { "id": "mcfarland", "name": "Booger McFarland", "outlet": "ESPN studio desk", "photo": "/photos/mcfarland.jpg", "sport": "ncaaf" },
  { "id": "skip", "name": "Skip Bayless", "outlet": "The Skip Bayless Show", "photo": "/photos/skip.jpg", "sport": "nfl" },
  { "id": "hawk", "name": "A.J. Hawk", "outlet": "The Pat McAfee Show", "photo": "/photos/hawk.jpg", "sport": "nfl" },
  { "id": "butler", "name": "Darius Butler", "outlet": "The Pat McAfee Show", "photo": "/photos/butler.jpg", "sport": "nfl" }
]
```

- [ ] **Step 5: Rework the three UI surfaces**

Read each file first; keep existing styling idioms. Required behavior:

- `app/leaderboard/page.tsx`: rows from `getActivityBoard(loadPundits(), loadCalls())`. Row shows rank, avatar, name, outlet, big green stat = `mappedPending` with label `LIVE PICKS`, then `2026 {w}–{l}` and `{totalCalls} calls`. No percentage, no 2025 column. Eyebrow: `THE TABLE`. Subhead: `Everyone starts 0–0. The board ranks who's actually on record this week.`
- `app/pundits/[id]/page.tsx`: hero shows name, outlet, sport tag, `2026 {w}–{l}`, `{mappedPending} live picks`, `${impliedOpenDollars(id, calls)} at risk`. Remove every `estimated2025` / `accuracy2025` reference.
- `app/page.tsx` Table peek (and `components/PeekRow.tsx` if the peek renders there): pundit tiles show `mappedPending` as the big green number with `LIVE` label and `2026 0–0` underneath — not a percentage.

- [ ] **Step 6: Run tests and build**

Run: `npx vitest run` then `npx next build`
Expected: all tests PASS; build succeeds with zero references to `estimated2025` (`grep -r estimated2025 app components lib data` returns nothing).

- [ ] **Step 7: Commit**

```bash
git add lib data app components
git commit -m "feat: activity leaderboard replaces invented 2025 records"
```

---

### Task 2: Events freeze integrity (per-price sources, sane cents)

**Files:**
- Modify: `lib/types.ts` (Event), `data/events.json`
- Create: `lib/events.test.ts`

**Interfaces:**
- Consumes: `loadEvents`, `loadEventsFile`.
- Produces: `Event` gains `sourceUrl: string | null; sourcedAt: string | null`. Tests enforce: every `onHome` event fully priced and sourced.

- [ ] **Step 1: Write the failing test**

`lib/events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { loadEvents } from "./data";

describe("kalshi freeze", () => {
  it("prices and sources every home event", () => {
    for (const e of loadEvents().filter((e) => e.onHome)) {
      expect(e.yesCents, e.slug).not.toBeNull();
      expect(e.noCents, e.slug).not.toBeNull();
      expect(e.sourceUrl, e.slug).toMatch(/^https?:\/\//);
      expect(e.sourcedAt, e.slug).toMatch(/^2026-\d{2}-\d{2}/);
    }
  });

  it("has sane cents on every priced event", () => {
    for (const e of loadEvents()) {
      if (e.yesCents == null || e.noCents == null) continue;
      expect(e.yesCents, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.yesCents, e.slug).toBeLessThanOrEqual(99);
      expect(e.noCents, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.noCents, e.slug).toBeLessThanOrEqual(99);
      const sum = e.yesCents + e.noCents;
      expect(sum, e.slug).toBeGreaterThanOrEqual(95);
      expect(sum, e.slug).toBeLessThanOrEqual(105);
    }
  });

  it("has unique slugs", () => {
    const slugs = loadEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/events.test.ts`
Expected: FAIL — `sourceUrl` undefined on every event; null cents on `miami-at-stanford`, `baylor-vs-auburn`, `bills-at-texans`, and the CFP-qualifier futures.

- [ ] **Step 3: Extend the Event type**

In `lib/types.ts`, add to `Event`:

```ts
  sourceUrl: string | null;
  sourcedAt: string | null;
```

- [ ] **Step 4: Re-freeze — a research agent with web access fills the data**

For **every event in `data/events.json`**, find the current Kalshi price (Kalshi market page, or a dated Kalshi reprint from CBS/SI/OddsShopper/Blue Chip). Record per event: `yesCents`, `noCents`, `sourceUrl` (the page the number was read from), `sourcedAt` (ISO date, today). Rules:

- The Rams Super Bowl entry (`rams-sb`, currently 16/86) is presumed corrupt — re-freeze it from a source and correct it.
- If no Kalshi price can be found for an event: leave cents null, set `sourceUrl`/`sourcedAt` null, and set `onHome: false` (spec ship gate 2 — no null-cent event on home). List each demotion in the commit message.
- Do not convert sportsbook moneylines without a Kalshi reprint.
- Add the two Week 0 events, staged off-home (flipped in Task 7 only if a roster lean lands):

```json
{ "slug": "unc-vs-tcu", "kind": "game", "title": "North Carolina vs TCU", "contractName": "UNC vs TCU — moneyline", "awayTeam": "North Carolina", "homeTeam": "TCU", "kickoff": "Sat 11:30 ET", "network": "ESPN · Dublin", "yesCents": null, "noCents": null, "sourceUrl": null, "sourcedAt": null, "onHome": false, "sport": "ncaaf", "homeRank": 99 },
{ "slug": "ncsu-at-uva", "kind": "game", "title": "NC State at Virginia", "contractName": "NCSU vs UVA — moneyline", "awayTeam": "NC State", "homeTeam": "Virginia", "kickoff": "Sat 12:00 ET", "network": "TBD", "yesCents": null, "noCents": null, "sourceUrl": null, "sourcedAt": null, "onHome": false, "sport": "ncaaf", "homeRank": 98 }
```

(Verify Week 0 kickoff time/network while sourcing; correct these fields to what the source says.)

Update the file-level `freezeDate` to today and shrink the file-level `source` blob to one line: `"Per-event sourceUrl/sourcedAt are authoritative."`

- [ ] **Step 5: Run tests**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib data
git commit -m "feat: per-price Kalshi sourcing; re-freeze cents; stage week 0"
```

---

### Task 3: Ledger integrity tests + purge illustrative surfaces

**Files:**
- Create: `lib/ledger.test.ts`
- Move: `public/mockups/` → `docs/mockups/` (worktree) — the mockup with illustrative quotes must stop deploying to the public site
- Delete: `app/bets/[slug]/page.tsx` (legacy route; `/picks/[slug]` is canonical)

**Interfaces:**
- Consumes: `loadCalls`, `loadEvents`, `loadPundits`, `isMapped`.
- Produces: cross-file invariants every later capture run must keep green.

- [ ] **Step 1: Write the failing-or-passing integrity test** (it should pass today — it exists to catch bad future captures; verify it runs)

`lib/ledger.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits, isMapped } from "./data";

describe("ledger integrity", () => {
  const calls = loadCalls();
  const events = loadEvents();
  const pundits = loadPundits();
  const slugs = new Set(events.map((e) => e.slug));
  const punditIds = new Set(pundits.map((p) => p.id));

  it("every call belongs to a roster pundit", () => {
    for (const c of calls) expect(punditIds.has(c.punditId), c.id).toBe(true);
  });

  it("mapped calls point at real events with a valid side", () => {
    for (const c of calls.filter(isMapped)) {
      expect(slugs.has(c.eventSlug!), c.id).toBe(true);
      expect(["yes", "no"]).toContain(c.side);
    }
  });

  it("only hard calls are mapped", () => {
    for (const c of calls.filter(isMapped)) expect(c.kind, c.id).toBe("hard");
  });

  it("every call is sourced and real", () => {
    for (const c of calls) {
      expect(c.claim.toLowerCase(), c.id).not.toMatch(/lorem|placeholder|todo|tbd|illustrative/);
      expect(c.claim.length, c.id).toBeGreaterThan(20);
      expect(c.sourceDate, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("mapped calls always carry a source url", () => {
    for (const c of calls.filter(isMapped)) {
      expect(c.sourceUrl, c.id).toMatch(/^https?:\/\//);
    }
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run lib/ledger.test.ts`
Expected: PASS (calls.json is already real). If any assertion fails, fix the data, not the test — a failure here is a real ledger defect.

- [ ] **Step 3: Move the mockup out of the deployed site**

```powershell
git mv public/mockups docs/mockups
Remove-Item -Recurse -Force app/bets
```

Then grep for stragglers: `grep -rn "bets/" app components lib` must return nothing.

- [ ] **Step 4: Build**

Run: `npx next build`
Expected: succeeds; `out/` contains no `mockups/` and no `bets/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ledger integrity tests; unpublish mockups; drop legacy bets route"
```

---

### Task 4: Roster expansion to ~40 with verified photos

**Files:**
- Modify: `data/pundits.json`
- Create: `public/photos/{id}.jpg` for each new pundit

**Interfaces:**
- Consumes: `Pundit` shape from Task 1; photo URLs from `main-repo:docs/roster-20.md` (verified 2026-08-25).
- Produces: ~40 roster entries; every `id` below is the exact id later capture runs must use.

- [ ] **Step 1: Add the 29 new entries to `data/pundits.json`**

Exact ids, names, outlets, sports (photo path is always `/photos/{id}.jpg`):

NCAAF adds: `davis` Rece Davis (College GameDay) · `howard` Desmond Howard (College GameDay) · `tebow` Tim Tebow (SEC Nation) · `klatt` Joel Klatt (FOX / The Joel Klatt Show) · `meyer` Urban Meyer (Big Noon Kickoff) · `leinart` Matt Leinart (Big Noon Kickoff) · `quinn` Brady Quinn (Big Noon Kickoff) · `ingram` Mark Ingram II (Big Noon Kickoff) · `fallica` Chris "The Bear" Fallica (FOX / Bear Bets) · `pate` Josh Pate (Josh Pate's College Football Show) · `staples` Andy Staples (On3) · `wasserman` Ari Wasserman (On3) · `kanell` Danny Kanell (CBS / Cover 3) · `feldman` Bruce Feldman (FOX / The Athletic) — all `"sport": "ncaaf"`.

NFL adds: `stephena` Stephen A. Smith (First Take) · `orlovsky` Dan Orlovsky (NFL Live / First Take) · `kimes` Mina Kimes (NFL Live) · `spears` Marcus Spears (NFL Live) · `clark` Ryan Clark (The Pivot) · `cowherd` Colin Cowherd (The Herd) · `sharpe` Shannon Sharpe (Nightcap) · `adams` Kay Adams (Up & Adams) · `brandt` Kyle Brandt (Good Morning Football) · `eisen` Rich Eisen (The Rich Eisen Show) · `florio` Mike Florio (ProFootballTalk) · `simms` Chris Simms (NBC / Unbuttoned) · `burleson` Nate Burleson (CBS The NFL Today) · `simmons` Bill Simmons (The Ringer) · `newton` Cam Newton (4th&1) — all `"sport": "nfl"`.

**Benched (do NOT add — no verified photo as of 2026-08-25):** Peter Schrager, Nick Wright, Matthew Berry. Add any of them only if a real press photo is found and verified during this task.

- [ ] **Step 2: Download the photos**

Photo source URLs are in `main-repo:docs/roster-20.md` (already verified live). Download each to `public/photos/{id}.jpg` (convert PNG→JPG or keep `.png` and match the JSON path). Then **open every image and verify it is that person** — a group-shot crop (Simmons) must be cropped to the face; a wrong face or logo (Pate's YouTube avatar) must be re-cropped or replaced. Minimum 400px on the short side. Old-vintage photos (Saban 2010, Cowherd 2011, Eisen 2011, Sharpe 2012, Tebow 2012, Clark 2014, Florio 2014, Finebaum 2018) are acceptable for v1 but list them in the commit message for later replacement. If a photo fails verification and no substitute is found, bench that pundit (remove the JSON entry) rather than shipping a bad face.

- [ ] **Step 3: Run tests**

Run: `npx vitest run lib/roster.test.ts lib/ledger.test.ts`
Expected: PASS — every entry has a photo file on disk, unique ids, valid sport.

- [ ] **Step 4: Spot-check profiles**

Run: `npx next dev`, open `/pundits/pate`, `/pundits/stephena`, `/pundits/klatt`. Each renders with photo and `No calls yet.` book (zero-call profiles must work — spec Errors section).

- [ ] **Step 5: Commit**

```bash
git add data/pundits.json public/photos
git commit -m "feat: expand roster to ~40 verified voices with photos"
```

---

### Task 5: Card and layout fixes (screenshot critique 2026-08-25)

**Files:**
- Modify: `lib/types.ts`, `lib/data.ts`, `lib/data.test.ts` (new `sidesForCard` helper)
- Modify: `components/EventCard.tsx`, `components/PeekRow.tsx`, `components/PunditAvatar.tsx`, `components/SiteHeader.tsx`, `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `callsForEvent`, `Event`, `Call`, `Side`.
- Produces:
  - `export type CardSide = { side: Side; label: string; cents: number | null; calls: Call[] }`
  - `export function sidesForCard(event: Event, calls: Call[]): [CardSide, CardSide]` — populated side first; tie (both populated or both empty) keeps YES/away first.

- [ ] **Step 1: Write the failing test** (add to `lib/data.test.ts`)

```ts
describe("sidesForCard", () => {
  const event: Event = {
    slug: "clemson-at-lsu", kind: "game", title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline", awayTeam: "Clemson", homeTeam: "LSU",
    yesCents: 24, noCents: 78, sourceUrl: "https://example.com", sourcedAt: "2026-08-25",
    onHome: true, sport: "ncaaf", homeRank: 1,
  };
  const lsuCall: Call = {
    id: "x1", punditId: "finebaum", claim: "Night game in Baton Rouge means the Tigers win this one.",
    source: "t", sourceUrl: "https://example.com/a", sourceDate: "2026-09-04",
    kind: "hard", subject: "LSU", paysOn: "Clemson at LSU", status: "pending",
    eventSlug: "clemson-at-lsu", side: "no",
  };

  it("puts the populated side first", () => {
    const [first, second] = sidesForCard(event, [lsuCall]);
    expect(first.side).toBe("no");
    expect(first.label).toBe("LSU");
    expect(second.calls).toHaveLength(0);
  });

  it("keeps yes/away first on a tie", () => {
    const [first] = sidesForCard(event, []);
    expect(first.side).toBe("yes");
    expect(first.label).toBe("Clemson");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/data.test.ts`
Expected: FAIL — `sidesForCard` not exported.

- [ ] **Step 3: Implement**

`lib/data.ts`:

```ts
export function sidesForCard(event: Event, calls: Call[]): [CardSide, CardSide] {
  const yes: CardSide = {
    side: "yes",
    label: event.awayTeam ?? "YES",
    cents: event.yesCents,
    calls: callsForEvent(event.slug, calls, "yes"),
  };
  const no: CardSide = {
    side: "no",
    label: event.homeTeam ?? "NO",
    cents: event.noCents,
    calls: callsForEvent(event.slug, calls, "no"),
  };
  return no.calls.length > yes.calls.length ? [no, yes] : [yes, no];
}
```

(`CardSide` type goes in `lib/types.ts`.)

- [ ] **Step 4: Apply the UI fixes** (read each component first; keep its idiom)

1. `EventCard.tsx`: render sides from `sidesForCard` order. An empty side renders as one thin row (`{label} · {cents}¢ · nobody on this side yet`), not a full column block, when the other side has calls.
2. `PunditAvatar.tsx`: row size ≥48px, card size ≥56px on game cards.
3. `PeekRow.tsx`: at `lg:` breakpoint render a 4-up grid (no horizontal scroll, no clipped card); the swipe hint is mobile-only.
4. Kalshi cents on cards: move from dim gray to the white ink tier (`var(--ink)`), keep size.
5. `SiteHeader.tsx` nav: add a right-edge fade mask at small widths (CSS `mask-image: linear-gradient(90deg, #000 85%, transparent)` on the scrolling nav) so the cut-off reads as scrollable.
6. `app/page.tsx` hero at `lg:`: type scales up (e.g. `lg:text-8xl` on the h1) or the first marquee card sits beside the hero in a 2-col grid — pick whichever the current markup makes cheaper; the requirement is no dead right half at 1440.

- [ ] **Step 5: Run tests + visual bar**

Run: `npx vitest run` then `npx next build`, then screenshot the built home at 390 and 1440 (headless Edge):

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npx next dev # or serve out/
& $edge --headless=new --hide-scrollbars --window-size=390,5000 --screenshot="shot-390.png" http://localhost:3000
& $edge --headless=new --hide-scrollbars --window-size=1440,4200 --screenshot="shot-1440.png" http://localhost:3000
```

Check: populated sides first · faces ≥48px · no clipped peek card at 1440 · hero fills desktop · cents readable · nav fade present.

- [ ] **Step 6: Commit**

```bash
git add lib components app
git commit -m "feat: populated-side-first cards, bigger faces, desktop grid and hero"
```

---

### Task 6: Capture runbook + intake schema

**Files:**
- Create: `docs/RUNBOOK.md` (worktree)

**Interfaces:**
- Consumes: nothing.
- Produces: the checklist Task 7 executes; the intake table schema all future capture docs use.

- [ ] **Step 1: Write `docs/RUNBOOK.md`**

Content (verbatim skeleton; keep it one page):

```markdown
# Capture run

A run is on-demand. Target cadence launch week: Wed, Thu, Fri, Sat morning.

## Steps
1. CAPTURE — mine shows/columns/podcasts for roster voices' picks on the
   opening-weekend slate. Search: GameDay/First Take/Big Noon clips, The
   Herd, Klatt/Pate/Cowherd YouTube, staff-picks columns (CBS/ESPN/FOX/
   Athletic), McAfee Show (name the speaker!).
2. VERIFY — open every source URL; confirm the quote and the speaker.
   Unverifiable → drop.
3. CLASSIFY + MAP — clear first-person lean on a listed event → hard +
   eventSlug + side (yes=away). Weasel or season-long take → soft, no
   mapping. Futures picks map to futures slugs only — never onto a game.
4. FREEZE — refresh Kalshi cents for events whose picks changed; every
   price gets sourceUrl + sourcedAt.
5. PUBLISH — `npx vitest run` && `npx next build` green, commit, push,
   verify live site.

## Intake table schema (staging docs, e.g. docs/week1-leans.md)
| pundit | eventSlug | side | verbatim quote | source | sourceUrl | sourceDate | hard/soft |

Promotion: only verified hard rows become calls.json entries. The row's
pundit must exist in data/pundits.json; the eventSlug in data/events.json.

## Week 0 gate (Thursday 2026-08-27)
If a roster voice has a verified lean on unc-vs-tcu or ncsu-at-uva:
freeze those cents, set onHome true, map the calls. Otherwise Week 0
stays off home.

## After every run, report
- new hard mapped calls (count, by event)
- which home cards still have an empty side
- any demoted/benched data (no source, no photo)
```

- [ ] **Step 2: Commit**

```bash
git add docs/RUNBOOK.md
git commit -m "docs: capture runbook and intake schema"
```

---

### Task 7: Capture runs (Wed 8/26 → Sat 8/29, then Thu 9/3 → Sat 9/5)

This task repeats. Each run follows `docs/RUNBOOK.md` exactly. It is research + data entry, not code; the tests from Tasks 2–3 are the safety net.

**Files:**
- Modify: `data/calls.json`, `data/events.json`, `main-repo:docs/week1-leans.md` (staging)

**Interfaces:**
- Consumes: runbook; roster ids from Task 4; event slugs from Task 2.
- Produces: mapped hard calls that fill the home cards.

- [ ] **Step 1: Seed from already-verified leans** (first run only)

From `main-repo:docs/week1-leans.md`: Josh Pate's LSU lean (verified 2026-05-12, Yahoo/Late Kick) maps to `clemson-at-lsu` side `no` once `pate` exists (Task 4). Enter it as a `hard` call with its real quote, URL, and date. Older CBS score picks (Crawford) are NOT roster voices — leave them in staging.

- [ ] **Step 2: Run the capture loop each day**

Dispatch research agents per the runbook's search list. For each verified find, append a `calls.json` entry:

```json
{
  "id": "{punditId}-{event-or-subject}-{yyyymmdd}",
  "punditId": "…", "claim": "…verbatim…", "source": "…show/column…",
  "sourceUrl": "https://…", "sourceDate": "2026-09-…",
  "kind": "hard", "subject": "…", "paysOn": "…game or market…",
  "status": "pending", "eventSlug": "…", "side": "yes|no"
}
```

Soft takes: same entry, `kind: "soft"`, no `eventSlug`/`side`.

- [ ] **Step 3: Thursday — decide Week 0** per the runbook gate.

- [ ] **Step 4: After every run**

Run: `npx vitest run` && `npx next build`. Commit as `data: capture run YYYY-MM-DD (N new mapped calls)` with the run report in the body. Push and verify the live deploy.

- [ ] **Step 5: Saturday 9/5 morning — the GameDay run**

College GameDay (Baton Rouge) picks air; capture crew picks with the exact on-air wording from clips/recaps. This is the run that fills Herbstreit/Saban/McAfee/Coughlin faces on `clemson-at-lsu`.

---

### Task 8: Ship gates and public share

**Files:**
- Modify: whatever the gates flag; the MOCK banner component (find with `grep -rn "MOCK" app components`)

- [ ] **Step 1: Walk the spec ship gates** (spec section "Ship gates" — all eight)

For each gate, verify and record evidence:
1. Zero illustrative quotes: `npx vitest run lib/ledger.test.ts` green AND `grep -rn "illustrative" app components data` empty (except the banner about to be removed).
2. `npx vitest run lib/events.test.ts` green (all home events priced + sourced).
3. Re-check kickoff times against sources in `main-repo:docs/week1-leans.md` slate section.
4. `npx vitest run lib/roster.test.ts` green; spot-open 6 random photos.
5. Footer honesty line renders on `/`, `/picks/clemson-at-lsu`, `/leaderboard`, `/book`, one profile.
6. Marquee cards (`clemson-at-lsu`, `wisconsin-vs-nd`, `patriots-at-seahawks`) each have ≥1 real face; report which sides are still empty — empty sides are OK, empty cards on home are not (demote a faceless card's `homeRank` below faced cards).
7. Screenshot 390 + 1440, walk the Task 5 checklist again.
8. `npx vitest run` and `npx next build` fully green.

- [ ] **Step 2: Remove the MOCK banner**

Delete the banner element. Rebuild. The footer honesty line remains permanently.

- [ ] **Step 3: Deploy and click it like a fan**

Push; confirm the GitHub Pages workflow succeeds; open the live URL on desktop and a phone: home → marquee card → permalink → profile → book → leaderboard. Photos load on the live host. Share links resolve (`/picks/clemson-at-lsu`).

- [ ] **Step 4: Commit + hand the URL to the operator**

```bash
git add -A
git commit -m "feat: v1 public launch — banner off, gates green"
```

Report to the operator: live URL, mapped-call counts per marquee card, remaining empty sides, and the next scheduled capture run.

---

## Self-review

1. **Spec coverage:** launch decisions 1–4 → Tasks 7/4/2+7/1. Product rules → runbook (Task 6) + ledger tests (Task 3). IA `/picks` consolidation → Task 3. Data model → Tasks 1–2. Capture run → Tasks 6–7. Front-end delta (all seven bullets) → Task 5 + Task 1 (leaderboard rework). Honesty → global constraint + gate 5. Ship gates → Task 8. Errors section → zero-call profiles checked in Task 4 Step 4; benching rules in Tasks 2/4. Non-goals: no task adds a backend, cron, or accounts. Covered.
2. **Placeholders:** none — every code step has real code; research steps state exactly what to find and what to do when it can't be found.
3. **Type consistency:** `PunditSport`/`sport`, `ActivityRecord`/`mappedPending`/`totalCalls`, `CardSide`/`sidesForCard`, `Event.sourceUrl`/`sourcedAt` used identically in Tasks 1, 2, 3, 5; roster ids in Task 4 match the id format the Task 7 seed uses (`pate`).
