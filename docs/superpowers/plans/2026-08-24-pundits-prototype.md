# Pundits Preseason Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public Next.js site that shows eight CFB pundits’ 2026 preseason books and estimated 2025 records, looking like a GameDay broadcast board.

**Architecture:** A JSON ledger is the source of truth. `data/pundits.json` holds identity + invented 2025 W-L. `data/calls.json` holds real extracted 2026 takes. The Next.js app only renders the ledger. 2026 W-L and pending counts are computed from calls at read time so they cannot drift. A later on-demand run is: edit JSON, redeploy.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Vitest (ledger helpers only), Vercel.

**Spec:** `docs/superpowers/specs/2026-08-24-pundits-prototype-design.md`

## Global Constraints

- College football only. Roster is exactly these eight ids: `herbstreit`, `mcafee`, `saban`, `finebaum`, `mcfarland`, `mcelroy`, `coughlin`, `thamel`. Do not add Rece Davis, Desmond Howard, or Corso.
- Background `#0A0A0A`. Accent `#39FF14` is the only loud color. White / light gray for reading. No third accent.
- GameDay-adjacent: big faces, big type, broadcast graphics. Not terminal, not a blog.
- Real press headshots at `public/photos/{id}.jpg` (or `.png`). Do not generate fake faces. Do not ship a pundit without a photo.
- 2026 calls must be real extracted takes from current preseason shows/columns. Not lorem ipsum, not a crafted fake slate.
- Capture hard and soft takes. Score only `kind: "hard"`. Soft takes display, never change W-L.
- First run: almost all calls `status: "pending"`. 2026 records start 0–0.
- 2025 W-L are plausible inventions on the pundit object. No 2025 call ledger. No disclaimer badge.
- Three pages only: `/` leaderboard, `/pundits/[id]` profile, `/feed` call feed. No auth, no comments, no X, no admin, no cron, no database.
- Site never invents records at request time. If it is not in JSON, it is not on the page.
- Pundit with zero calls: profile still works; book copy is `No calls yet.`
- Ambiguous take → `soft`. No `void` status.
- Spec visual bar is the UI done-check (no component test suite). Unit-test ledger helpers only.
- Do not commit unless the operator asks. Skip every Commit step if there is no git repo / no commit request.

## File map

| File | Responsibility |
|---|---|
| `package.json` | Next.js 15, Tailwind, Vitest scripts |
| `vitest.config.ts` | Node test runner for `lib/**/*.test.ts` |
| `lib/types.ts` | `Pundit`, `Call`, `PunditRecord` types |
| `lib/data.ts` | Load JSON, compute 2026 W-L / pending, sort leaderboard, get profile |
| `lib/data.test.ts` | Tests for those helpers |
| `data/pundits.json` | Eight pundits + 2025 estimates + photo paths |
| `data/calls.json` | Real 2026 book |
| `public/photos/{id}.jpg` | Headshots |
| `app/globals.css` | Tokens, broadcast chrome |
| `app/layout.tsx` | Fonts, header, footer |
| `app/page.tsx` | Leaderboard |
| `app/pundits/[id]/page.tsx` | Profile |
| `app/pundits/[id]/not-found.tsx` | Unknown id |
| `app/feed/page.tsx` | Call feed |
| `components/SiteHeader.tsx` | Wordmark + nav |
| `components/PunditAvatar.tsx` | Headshot crop |
| `components/Leaderboard.tsx` | Ranked rows |
| `components/CallCard.tsx` | One call |
| `components/CallBook.tsx` | List of calls + empty state |

2026 W-L is **not** stored on the pundit. `getPunditRecord(pundit, calls)` derives `{ wins, losses, pending }` from that pundit’s hard calls (`hit` / `miss` / `pending`). Soft calls never count.

---

### Task 1: Scaffold app and ledger helpers

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `vitest.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `lib/types.ts`, `lib/data.ts`, `lib/data.test.ts`, `data/pundits.json`, `data/calls.json`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export type CallKind = "hard" | "soft"`
  - `export type CallStatus = "pending" | "hit" | "miss"`
  - `export type Pundit = { id: string; name: string; outlet: string; photo: string; estimated2025: { wins: number; losses: number } }`
  - `export type Call = { id: string; punditId: string; claim: string; source: string; sourceUrl: string | null; sourceDate: string; kind: CallKind; subject: string; paysOn: string; status: CallStatus }`
  - `export type PunditRecord = Pundit & { accuracy2025: number; season2026: { wins: number; losses: number; pending: number } }`
  - `export function loadPundits(): Pundit[]`
  - `export function loadCalls(): Call[]`
  - `export function accuracyPct(wins: number, losses: number): number`
  - `export function seasonFromCalls(punditId: string, calls: Call[]): { wins: number; losses: number; pending: number }`
  - `export function getLeaderboard(pundits: Pundit[], calls: Call[]): PunditRecord[]`
  - `export function getPundit(id: string, pundits: Pundit[], calls: Call[]): PunditRecord | null`
  - `export function callsForPundit(id: string, calls: Call[]): Call[]`

JSON on disk uses camelCase matching these types (`punditId`, `paysOn`, `sourceUrl`, `sourceDate`, `estimated2025`).

- [ ] **Step 1: Scaffold Next.js**

From `C:\Users\baird\Documents\GitHub\Pundits`:

```bash
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --turbopack --yes
```

If the folder is not empty (docs already exist), create the app in place by writing `package.json` instead of wiping docs:

```json
{
  "name": "pundits",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  }
}
```

Install: `next@15`, `react@19`, `react-dom@19`, `typescript`, `tailwindcss@3`, `postcss`, `autoprefixer`, `vitest`.

`next.config.ts`:

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node" },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Keep `docs/` untouched.

- [ ] **Step 2: Write the failing ledger tests**

Create `lib/types.ts` with the types in **Produces** (tests import them). Create `lib/data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  accuracyPct,
  seasonFromCalls,
  getLeaderboard,
  getPundit,
  callsForPundit,
} from "./data";
import type { Call, Pundit } from "./types";

const pundits: Pundit[] = [
  {
    id: "saban",
    name: "Nick Saban",
    outlet: "ESPN / GameDay",
    photo: "/photos/saban.jpg",
    estimated2025: { wins: 31, losses: 18 },
  },
  {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "Finebaum / ESPN",
    photo: "/photos/finebaum.jpg",
    estimated2025: { wins: 21, losses: 24 },
  },
];

const calls: Call[] = [
  {
    id: "c1",
    punditId: "finebaum",
    claim: "Indiana is not winning the national championship this year.",
    source: "First Take",
    sourceUrl: null,
    sourceDate: "2026-08-18",
    kind: "hard",
    subject: "Indiana",
    paysOn: "2026 CFP national championship",
    status: "pending",
  },
  {
    id: "c2",
    punditId: "finebaum",
    claim: "Curt Cignetti is the best coach in college football.",
    source: "First Take",
    sourceUrl: null,
    sourceDate: "2026-08-18",
    kind: "soft",
    subject: "Curt Cignetti",
    paysOn: "2026 season",
    status: "pending",
  },
  {
    id: "c3",
    punditId: "saban",
    claim: "Georgia goes a long way in the playoff.",
    source: "The Pat McAfee Show",
    sourceUrl: null,
    sourceDate: "2026-08-21",
    kind: "hard",
    subject: "Georgia",
    paysOn: "2026 CFP",
    status: "hit",
  },
];

describe("accuracyPct", () => {
  it("returns 0 when there are no games", () => {
    expect(accuracyPct(0, 0)).toBe(0);
  });
  it("rounds to nearest integer percent", () => {
    expect(accuracyPct(31, 18)).toBe(63);
  });
});

describe("seasonFromCalls", () => {
  it("counts only hard hit/miss toward W-L and hard pending toward pending", () => {
    expect(seasonFromCalls("finebaum", calls)).toEqual({
      wins: 0,
      losses: 0,
      pending: 1,
    });
  });
  it("counts a hard hit as a win", () => {
    expect(seasonFromCalls("saban", calls)).toEqual({
      wins: 1,
      losses: 0,
      pending: 0,
    });
  });
});

describe("getLeaderboard", () => {
  it("sorts by 2025 accuracy descending", () => {
    const board = getLeaderboard(pundits, calls);
    expect(board.map((p) => p.id)).toEqual(["saban", "finebaum"]);
    expect(board[0].accuracy2025).toBe(63);
    expect(board[1].season2026.pending).toBe(1);
  });
});

describe("getPundit", () => {
  it("returns null for an unknown id", () => {
    expect(getPundit("corso", pundits, calls)).toBeNull();
  });
});

describe("callsForPundit", () => {
  it("returns that pundit’s calls newest sourceDate first", () => {
    const list = callsForPundit("finebaum", calls);
    expect(list.map((c) => c.id)).toEqual(["c1", "c2"]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/data.test.ts`

Expected: FAIL — `Cannot find module './data'` or functions not exported.

- [ ] **Step 4: Implement types and helpers**

`lib/types.ts` — exact types from **Produces**.

`lib/data.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Call, Pundit, PunditRecord } from "./types";

export function accuracyPct(wins: number, losses: number): number {
  const n = wins + losses;
  if (n === 0) return 0;
  return Math.round((wins / n) * 100);
}

export function seasonFromCalls(
  punditId: string,
  calls: Call[]
): { wins: number; losses: number; pending: number } {
  const hard = calls.filter((c) => c.punditId === punditId && c.kind === "hard");
  return {
    wins: hard.filter((c) => c.status === "hit").length,
    losses: hard.filter((c) => c.status === "miss").length,
    pending: hard.filter((c) => c.status === "pending").length,
  };
}

export function toRecord(pundit: Pundit, calls: Call[]): PunditRecord {
  return {
    ...pundit,
    accuracy2025: accuracyPct(
      pundit.estimated2025.wins,
      pundit.estimated2025.losses
    ),
    season2026: seasonFromCalls(pundit.id, calls),
  };
}

export function getLeaderboard(
  pundits: Pundit[],
  calls: Call[]
): PunditRecord[] {
  return pundits
    .map((p) => toRecord(p, calls))
    .sort((a, b) => b.accuracy2025 - a.accuracy2025);
}

export function getPundit(
  id: string,
  pundits: Pundit[],
  calls: Call[]
): PunditRecord | null {
  const p = pundits.find((x) => x.id === id);
  return p ? toRecord(p, calls) : null;
}

export function callsForPundit(id: string, calls: Call[]): Call[] {
  return calls
    .filter((c) => c.punditId === id)
    .sort((a, b) => (a.sourceDate < b.sourceDate ? 1 : -1));
}

function readJson<T>(rel: string): T {
  const file = path.join(process.cwd(), rel);
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

export function loadPundits(): Pundit[] {
  return readJson<Pundit[]>("data/pundits.json");
}

export function loadCalls(): Call[] {
  return readJson<Call[]>("data/calls.json");
}
```

Stub JSON so loaders don’t crash later:

`data/pundits.json` → `[]`
`data/calls.json` → `[]`

Placeholder `app/page.tsx`:

```tsx
export default function Home() {
  return <main>Pundits</main>;
}
```

`app/layout.tsx`: `<html lang="en"><body>{children}</body></html>`

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/data.test.ts`

Expected: PASS (5 describes, all green).

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts lib data app
git commit -m "feat: scaffold Pundits app and ledger helpers"
```

Skip if operator did not ask to commit.

---

### Task 2: Roster JSON and real headshots

**Files:**
- Modify: `data/pundits.json`
- Create: `public/photos/herbstreit.jpg`, `public/photos/mcafee.jpg`, `public/photos/saban.jpg`, `public/photos/finebaum.jpg`, `public/photos/mcfarland.jpg`, `public/photos/mcelroy.jpg`, `public/photos/coughlin.jpg`, `public/photos/thamel.jpg`
- Test: `lib/roster.test.ts`

**Interfaces:**
- Consumes: `Pundit` from `lib/types.ts`
- Produces: eight pundits on disk; `photo` values are `/photos/{id}.jpg`

- [ ] **Step 1: Write the failing roster test**

`lib/roster.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadPundits } from "./data";

const IDS = [
  "herbstreit",
  "mcafee",
  "saban",
  "finebaum",
  "mcfarland",
  "mcelroy",
  "coughlin",
  "thamel",
] as const;

describe("roster", () => {
  it("has exactly the eight spec ids", () => {
    const ids = loadPundits().map((p) => p.id).sort();
    expect(ids).toEqual([...IDS].sort());
  });

  it("has a photo file for every pundit", () => {
    for (const p of loadPundits()) {
      const rel = p.photo.replace(/^\//, "");
      expect(existsSync(path.join(process.cwd(), "public", rel.replace(/^photos\//, "photos/"))) || existsSync(path.join(process.cwd(), "public", rel))).toBe(true);
      expect(p.photo).toMatch(/^\/photos\/[a-z]+\.(jpg|png)$/);
    }
  });

  it("has invented 2025 W-L so accuracy is not zero", () => {
    for (const p of loadPundits()) {
      expect(p.estimated2025.wins + p.estimated2025.losses).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/roster.test.ts`

Expected: FAIL — empty array / missing photos.

- [ ] **Step 3: Write `data/pundits.json`**

Use these invented 2025 numbers (no citation):

```json
[
  {
    "id": "saban",
    "name": "Nick Saban",
    "outlet": "ESPN / GameDay",
    "photo": "/photos/saban.jpg",
    "estimated2025": { "wins": 31, "losses": 18 }
  },
  {
    "id": "mcelroy",
    "name": "Greg McElroy",
    "outlet": "ESPN",
    "photo": "/photos/mcelroy.jpg",
    "estimated2025": { "wins": 34, "losses": 22 }
  },
  {
    "id": "herbstreit",
    "name": "Kirk Herbstreit",
    "outlet": "College GameDay",
    "photo": "/photos/herbstreit.jpg",
    "estimated2025": { "wins": 29, "losses": 21 }
  },
  {
    "id": "coughlin",
    "name": "Stanford Steve Coughlin",
    "outlet": "College GameDay",
    "photo": "/photos/coughlin.jpg",
    "estimated2025": { "wins": 38, "losses": 28 }
  },
  {
    "id": "thamel",
    "name": "Pete Thamel",
    "outlet": "ESPN",
    "photo": "/photos/thamel.jpg",
    "estimated2025": { "wins": 22, "losses": 18 }
  },
  {
    "id": "mcfarland",
    "name": "Booger McFarland",
    "outlet": "ESPN studio desk",
    "photo": "/photos/mcfarland.jpg",
    "estimated2025": { "wins": 27, "losses": 23 }
  },
  {
    "id": "mcafee",
    "name": "Pat McAfee",
    "outlet": "GameDay / McAfee Show",
    "photo": "/photos/mcafee.jpg",
    "estimated2025": { "wins": 24, "losses": 23 }
  },
  {
    "id": "finebaum",
    "name": "Paul Finebaum",
    "outlet": "Finebaum / ESPN",
    "photo": "/photos/finebaum.jpg",
    "estimated2025": { "wins": 21, "losses": 24 }
  }
]
```

- [ ] **Step 4: Download real press headshots**

Save one recognizable face crop per id under `public/photos/{id}.jpg`. Prefer Wikimedia Commons / Wikipedia (CC or public press). ESPN press-room stills are acceptable. Do not generate faces.

Search Wikimedia for each name. If a file is `.png`, either convert to jpg or change the JSON `photo` path to `.png` and keep the test regex.

Verify each file is an actual photograph of that person (open it). If Stanford Steve has no usable Commons photo, use a GameDay still from ESPN press (the Aug 2026 GameDay cast photos).

Minimum size: 400px on the short side so the profile hero is not mushy.

- [ ] **Step 5: Run tests**

Run: `npx vitest run lib/roster.test.ts lib/data.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add data/pundits.json public/photos lib/roster.test.ts
git commit -m "feat: seed eight-pundit roster and headshots"
```

---

### Task 3: Real 2026 preseason book

**Files:**
- Modify: `data/calls.json`
- Test: `lib/calls.test.ts`

**Interfaces:**
- Consumes: `Call` type; roster ids from Task 2
- Produces: `loadCalls()` returns ≥3 calls per pundit, mixed hard/soft, almost all `pending`, real claims with sources

Every call below is from public preseason coverage (late July–Aug 24 2026). Keep `sourceUrl` when we have one.

- [ ] **Step 1: Write the failing calls test**

```ts
import { describe, expect, it } from "vitest";
import { loadCalls, loadPundits } from "./data";

describe("2026 book", () => {
  it("has at least three calls per roster pundit", () => {
    const ids = loadPundits().map((p) => p.id);
    const calls = loadCalls();
    for (const id of ids) {
      expect(calls.filter((c) => c.punditId === id).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("only uses roster pundit ids", () => {
    const ids = new Set(loadPundits().map((p) => p.id));
    for (const c of loadCalls()) {
      expect(ids.has(c.punditId)).toBe(true);
    }
  });

  it("has both hard and soft takes", () => {
    const calls = loadCalls();
    expect(calls.some((c) => c.kind === "hard")).toBe(true);
    expect(calls.some((c) => c.kind === "soft")).toBe(true);
  });

  it("is almost all pending for the preseason snapshot", () => {
    const calls = loadCalls();
    const pending = calls.filter((c) => c.status === "pending").length;
    expect(pending).toBe(calls.length);
  });

  it("does not use placeholder claim text", () => {
    for (const c of loadCalls()) {
      expect(c.claim.toLowerCase()).not.toMatch(/lorem|placeholder|todo|tbd/);
      expect(c.claim.length).toBeGreaterThan(20);
      expect(c.paysOn.length).toBeGreaterThan(3);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/calls.test.ts`

Expected: FAIL — empty calls.

- [ ] **Step 3: Write `data/calls.json`**

Seed with these real claims. Then pull **at least two more** for `mcafee` and `mcfarland` from recent McAfee Show / ESPN studio YouTube recaps if the list is thin — do not invent quotes.

```json
[
  {
    "id": "herbstreit-nd-title-lean",
    "punditId": "herbstreit",
    "claim": "I like Notre Dame — and Miami. I think Texas A&M could make a run with Marcel Reed this year.",
    "source": "The Pat McAfee Show",
    "sourceUrl": "https://www.si.com/fannation/college/cfb-hq/picks/college-football-kirk-herbstreit-national-championship-prediction-2026",
    "sourceDate": "2026-07-22",
    "kind": "hard",
    "subject": "Notre Dame",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "herbstreit-texas-cfp",
    "punditId": "herbstreit",
    "claim": "I think they’re going to be in the Playoff, right in the mix, could win the SEC. I just don’t know if they win it all.",
    "source": "The Pat McAfee Show",
    "sourceUrl": "https://www.on3.com/news/kirk-herbstreit-makes-prediction-on-success-of-arch-manning-texas-entering-2026-season/",
    "sourceDate": "2026-07-22",
    "kind": "hard",
    "subject": "Texas",
    "paysOn": "2026 CFP field",
    "status": "pending"
  },
  {
    "id": "herbstreit-tech-cfp",
    "punditId": "herbstreit",
    "claim": "I think Texas Tech’s going to be a playoff team this year.",
    "source": "Kirk Herbstreit underrated QBs",
    "sourceUrl": "https://www.pennlive.com/sports/2026/08/kirk-herbstreit-names-the-5-most-underrated-quarterbacks-in-college-football.html",
    "sourceDate": "2026-08-21",
    "kind": "hard",
    "subject": "Texas Tech",
    "paysOn": "2026 CFP field",
    "status": "pending"
  },
  {
    "id": "herbstreit-michigan-b1g",
    "punditId": "herbstreit",
    "claim": "If Bryce is healthy and goes off, you could put Michigan in that discussion. You can sit here right now and say they could win the Big Ten.",
    "source": "Nonstop podcast",
    "sourceUrl": "https://www.essentiallysports.com/ncaa-college-football-news-osu-legend-kirk-herbstreit-says-kyle-whittinghams-michigan-can-win-big-ten-title-under-only-one-condition/",
    "sourceDate": "2026-08-24",
    "kind": "hard",
    "subject": "Michigan",
    "paysOn": "2026 Big Ten championship",
    "status": "pending"
  },
  {
    "id": "herbstreit-chambliss-face",
    "punditId": "herbstreit",
    "claim": "Trinidad Chambliss, to me, is going to be the face of college football this year.",
    "source": "Andy Staples / On3",
    "sourceUrl": "https://www.on3.com/news/kirk-herbstreit-labels-trinidad-chambliss-the-face-of-college-football-entering-2026-season/",
    "sourceDate": "2026-08-14",
    "kind": "soft",
    "subject": "Trinidad Chambliss",
    "paysOn": "2026 season",
    "status": "pending"
  },
  {
    "id": "saban-uga-texas-cfp",
    "punditId": "saban",
    "claim": "I think Kirby and Sark both have really good teams. Georgia and Texas have a chance to go a long way in the College Football Playoff.",
    "source": "The Pat McAfee Show",
    "sourceUrl": "https://bleacherreport.com/articles/25481106-nick-saban-says-alabama-could-sneak-people-2026-hypes-georgia-texas-cfp-runs",
    "sourceDate": "2026-08-21",
    "kind": "hard",
    "subject": "Georgia / Texas",
    "paysOn": "2026 CFP",
    "status": "pending"
  },
  {
    "id": "saban-alabama-sleeper",
    "punditId": "saban",
    "claim": "I think Alabama could sneak up on some people this year.",
    "source": "The Pat McAfee Show",
    "sourceUrl": "https://bleacherreport.com/articles/25481106-nick-saban-says-alabama-could-sneak-people-2026-hypes-georgia-texas-cfp-runs",
    "sourceDate": "2026-08-21",
    "kind": "hard",
    "subject": "Alabama",
    "paysOn": "2026 CFP field",
    "status": "pending"
  },
  {
    "id": "saban-paper-best",
    "punditId": "saban",
    "claim": "I think Texas and Georgia on paper, at least right now, are the two best teams based on what they have coming back.",
    "source": "Get Up",
    "sourceUrl": "https://www.si.com/fannation/college/cfb-hq/news/nick-saban-identifies-two-historic-powerhouses-college-football-best-teams-georgia-texas",
    "sourceDate": "2026-07-23",
    "kind": "soft",
    "subject": "Georgia / Texas",
    "paysOn": "2026 preseason",
    "status": "pending"
  },
  {
    "id": "finebaum-indiana-no-repeat",
    "punditId": "finebaum",
    "claim": "Slow down a little bit. You had your day, you’ll have some fun, but you’re not winning the national championship this year.",
    "source": "First Take",
    "sourceUrl": "https://www.indystar.com/story/sports/college/indiana/2026/08/18/espn-analyst-paul-finebaum-indiana-football-schedule-rankings-national-championship-prediction/91357249007/",
    "sourceDate": "2026-08-18",
    "kind": "hard",
    "subject": "Indiana",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "finebaum-indiana-cfp",
    "punditId": "finebaum",
    "claim": "Indiana will be a playoff-caliber team going forward — last year is not a one-off.",
    "source": "First Take",
    "sourceUrl": "https://www.indystar.com/story/sports/college/indiana/2026/08/18/espn-analyst-paul-finebaum-indiana-football-schedule-rankings-national-championship-prediction/91357249007/",
    "sourceDate": "2026-08-18",
    "kind": "hard",
    "subject": "Indiana",
    "paysOn": "2026 CFP field",
    "status": "pending"
  },
  {
    "id": "finebaum-cignetti-best",
    "punditId": "finebaum",
    "claim": "Curt Cignetti is the best coach in college football.",
    "source": "First Take",
    "sourceUrl": "https://www.indystar.com/story/sports/college/indiana/2026/08/18/espn-analyst-paul-finebaum-indiana-football-schedule-rankings-national-championship-prediction/91357249007/",
    "sourceDate": "2026-08-18",
    "kind": "soft",
    "subject": "Curt Cignetti",
    "paysOn": "2026 season",
    "status": "pending"
  },
  {
    "id": "finebaum-texas-sec",
    "punditId": "finebaum",
    "claim": "Texas is the team to beat. They have the goods in every department. Georgia is very good, but I think Texas is better right now.",
    "source": "Get Up",
    "sourceUrl": "https://www.on3.com/news/paul-finebaum-declares-texas-the-team-to-beat-in-sec-entering-2026-season/",
    "sourceDate": "2026-07-21",
    "kind": "hard",
    "subject": "Texas",
    "paysOn": "2026 SEC championship",
    "status": "pending"
  },
  {
    "id": "finebaum-kiffin-no-title",
    "punditId": "finebaum",
    "claim": "I think Lane Kiffin will probably win a national championship. Not this year, but within two or three years at LSU.",
    "source": "SEC media days / WAAY 31",
    "sourceUrl": "https://www.si.com/fannation/college/cfb-hq/news/paul-finebaum-names-sec-powerhouse-with-no-chance-of-winning-a-national-championship-lsu-tigers",
    "sourceDate": "2026-07-27",
    "kind": "hard",
    "subject": "LSU",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "finebaum-sec-drought",
    "punditId": "finebaum",
    "claim": "I’m out. I do not like what I see. I’m taking the out on the SEC ending its championship drought.",
    "source": "SportsCenter Paul In or Paul Out",
    "sourceUrl": "https://www.si.com/fannation/college/cfb-hq/news/paul-finebaum-doubts-sec-can-end-championship-drought",
    "sourceDate": "2026-07-23",
    "kind": "hard",
    "subject": "SEC",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "finebaum-beamer-seat",
    "punditId": "finebaum",
    "claim": "Shane Beamer is on the hottest hot seat right now, and I don’t think it’s really close.",
    "source": "Awful Announcing interview",
    "sourceUrl": "https://awfulannouncing.com/espn/paul-finebaum-lane-kiffin-sec-title-drought-arch-manning.html",
    "sourceDate": "2026-07-19",
    "kind": "hard",
    "subject": "Shane Beamer",
    "paysOn": "2026 South Carolina coaching job",
    "status": "pending"
  },
  {
    "id": "thamel-indiana-repeat",
    "punditId": "thamel",
    "claim": "I’m taking Indiana. Until they prove otherwise, I’m taking Indiana. The dude is 27-2.",
    "source": "College GameDay Podcast",
    "sourceUrl": "https://www.on3.com/news/pete-thamel-makes-national-championship-pick-ahead-of-2026-college-football-season/",
    "sourceDate": "2026-07-28",
    "kind": "hard",
    "subject": "Indiana",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "thamel-usc-binary",
    "punditId": "thamel",
    "claim": "They could make the Playoff or Lincoln Riley could get fired, and I don’t see a whole lot in the middle there.",
    "source": "College GameDay Podcast",
    "sourceUrl": "https://www.on3.com/news/pete-thamel-usc-could-make-the-playoff-or-lincoln-riley-could-get-fired-in-2026/",
    "sourceDate": "2026-07-28",
    "kind": "hard",
    "subject": "Lincoln Riley / USC",
    "paysOn": "2026 CFP field or USC coaching job",
    "status": "pending"
  },
  {
    "id": "thamel-usc-oregon",
    "punditId": "thamel",
    "claim": "Week four, Oregon goes to USC — that game could shape the national conversation surrounding Riley.",
    "source": "College GameDay Podcast",
    "sourceUrl": "https://www.on3.com/news/pete-thamel-usc-could-make-the-playoff-or-lincoln-riley-could-get-fired-in-2026/",
    "sourceDate": "2026-07-28",
    "kind": "soft",
    "subject": "USC vs Oregon",
    "paysOn": "2026 Week 4 Oregon at USC",
    "status": "pending"
  },
  {
    "id": "mcelroy-nd-floor",
    "punditId": "mcelroy",
    "claim": "11 wins is the floor. That’s the expectation for the Fighting Irish for me this year. I have them second.",
    "source": "Always College Football",
    "sourceUrl": "https://www.on3.com/news/greg-mcelroy-reveals-preseason-top-25-rankings-entering-2026-college-football-season/",
    "sourceDate": "2026-08-13",
    "kind": "hard",
    "subject": "Notre Dame",
    "paysOn": "2026 Notre Dame win total",
    "status": "pending"
  },
  {
    "id": "mcelroy-oklahoma-title",
    "punditId": "mcelroy",
    "claim": "I think Oklahoma can win the national championship. I really believe that.",
    "source": "Always College Football",
    "sourceUrl": "https://www.on3.com/news/greg-mcelroy-reveals-preseason-top-25-rankings-entering-2026-college-football-season/",
    "sourceDate": "2026-08-13",
    "kind": "hard",
    "subject": "Oklahoma",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "mcelroy-georgia-floor",
    "punditId": "mcelroy",
    "claim": "The projections have Georgia around 10-2, so sixth is me saying that Georgia has the highest floor in college football.",
    "source": "Always College Football",
    "sourceUrl": "https://www.on3.com/news/greg-mcelroy-reveals-preseason-top-25-rankings-entering-2026-college-football-season/",
    "sourceDate": "2026-08-13",
    "kind": "hard",
    "subject": "Georgia",
    "paysOn": "2026 Georgia win total",
    "status": "pending"
  },
  {
    "id": "mcelroy-miami-acc",
    "punditId": "mcelroy",
    "claim": "Miami is the only national title contender in the ACC.",
    "source": "Always College Football ACC Tiers",
    "sourceUrl": "http://www.espn.com/espnradio/podcast/archive/_/id/37663855",
    "sourceDate": "2026-08-06",
    "kind": "hard",
    "subject": "Miami",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "coughlin-nd-champ",
    "punditId": "coughlin",
    "claim": "Stanford Steve picks Notre Dame to win the national championship.",
    "source": "VSiN College Football Betting Podcast",
    "sourceUrl": "https://www.youtube.com/watch?v=rj4wR5dtqE4",
    "sourceDate": "2026-08-18",
    "kind": "hard",
    "subject": "Notre Dame",
    "paysOn": "2026 CFP national championship",
    "status": "pending"
  },
  {
    "id": "coughlin-wvu-b12",
    "punditId": "coughlin",
    "claim": "I’m going to say West Virginia plays in the Big 12 title game. That’s my big surprise.",
    "source": "The Ryen Russillo Show",
    "sourceUrl": "https://www.si.com/college/westvirginia/football/woah-college-gameday-analyst-picks-wvu-to-pull-off-major-surprise-in-2026",
    "sourceDate": "2026-08-21",
    "kind": "hard",
    "subject": "West Virginia",
    "paysOn": "2026 Big 12 championship game",
    "status": "pending"
  },
  {
    "id": "coughlin-nd-allin",
    "punditId": "coughlin",
    "claim": "All in on Notre Dame heading into 2026.",
    "source": "The Ryen Russillo Show",
    "sourceUrl": "https://www.barstoolsports.com/podcast-episode/zOkubHfXvZPDb9F2lNlEdaMJ",
    "sourceDate": "2026-08-19",
    "kind": "soft",
    "subject": "Notre Dame",
    "paysOn": "2026 season",
    "status": "pending"
  },
  {
    "id": "mcfarland-riley-seat",
    "punditId": "mcfarland",
    "claim": "Lincoln Riley’s seat is super warm, if not hot, and I think Lincoln knows it.",
    "source": "Pardon My Take",
    "sourceUrl": "https://www.on3.com/news/booger-mcfarland-on-usc-lincoln-riley-i-think-this-is-the-most-talent-hes-had/",
    "sourceDate": "2026-08-17",
    "kind": "hard",
    "subject": "Lincoln Riley",
    "paysOn": "2026 USC coaching job",
    "status": "pending"
  },
  {
    "id": "mcfarland-usc-talent",
    "punditId": "mcfarland",
    "claim": "I think this is the most talent Lincoln Riley has had at USC.",
    "source": "Pardon My Take",
    "sourceUrl": "https://www.on3.com/news/booger-mcfarland-on-usc-lincoln-riley-i-think-this-is-the-most-talent-hes-had/",
    "sourceDate": "2026-08-17",
    "kind": "soft",
    "subject": "USC",
    "paysOn": "2026 season",
    "status": "pending"
  },
  {
    "id": "mcfarland-georgia-d",
    "punditId": "mcfarland",
    "claim": "I think this Georgia defense is going to be lights out. If that defense is what they used to be, then it’s gonna be tough for anybody to beat Georgia.",
    "source": "ESPN with Christine Williamson",
    "sourceUrl": "https://www.si.com/fannation/college/cfb-hq/news/why-booger-mcfarland-warning-sec-young-college-football-powerhouse-georgia-bulldogs",
    "sourceDate": "2026-08-05",
    "kind": "hard",
    "subject": "Georgia",
    "paysOn": "2026 CFP",
    "status": "pending"
  },
  {
    "id": "mcafee-osu-one",
    "punditId": "mcafee",
    "claim": "Congratulated Ryan Day as two-time preseason national champion after Ohio State landed No. 1 in the AP poll — treating the Buckeyes as the preseason title favorite.",
    "source": "The Pat McAfee Show",
    "sourceUrl": "https://www.dispatch.com/story/sports/college/football/2026/08/19/pat-mcafee-trolls-ryan-day-after-ohio-state-lands-no-1-ranking/91368150007/",
    "sourceDate": "2026-08-17",
    "kind": "soft",
    "subject": "Ohio State",
    "paysOn": "2026 preseason No. 1",
    "status": "pending"
  }
]
```

McAfee is short of three calls. Before finishing this task, open recent Pat McAfee Show CFB YouTube clips (search `Pat McAfee Show college football 2026`) and extract **two more** real McAfee claims (his words, not a guest’s). Prefer hard: a team he is on or against for CFP/title/Week 1. Add them with real `sourceUrl` and `sourceDate`.

If a quote in this list cannot be verified at the URL, drop it rather than keep a bad extraction.

- [ ] **Step 4: Run tests**

Run: `npx vitest run`

Expected: all PASS, including ≥3 calls per pundit.

- [ ] **Step 5: Commit**

```bash
git add data/calls.json lib/calls.test.ts
git commit -m "feat: seed real 2026 preseason call ledger"
```

---

### Task 4: Broadcast shell (theme, header, fonts)

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `components/SiteHeader.tsx`, `components/PunditAvatar.tsx`

**Interfaces:**
- Consumes: none
- Produces: `SiteHeader` with links `/`, `/feed`; `PunditAvatar({ src, alt, size: "row" | "hero" })`

- [ ] **Step 1: Tokens and fonts**

`app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0a;
  --card: #141414;
  --ink: #f5f5f5;
  --muted: #a3a3a3;
  --green: #39ff14;
}

html,
body {
  background: var(--bg);
  color: var(--ink);
}

body {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
}

h1, h2, .type-broadcast {
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

`app/layout.tsx` — `Oswald` as `--font-display`, `Inter` as `--font-body` via `next/font/google`. Metadata title: `PUNDITS`. Description: `The book on college football pundits.`

`components/SiteHeader.tsx`: left wordmark `PUNDITS` in electric green. Right nav: `Leaderboard` → `/`, `The Book` → `/feed`. Tight, like a lower-third, not a marketing nav.

`components/PunditAvatar.tsx`: circular or slight rounded-rect crop, object-cover, green 1px ring on hero size only.

- [ ] **Step 2: Smoke the shell**

Run: `npx next dev --turbopack`

Open `/`. Black page, green wordmark, two nav links. No white background.

- [ ] **Step 3: Commit**

```bash
git add app components
git commit -m "feat: add GameDay broadcast chrome"
```

---

### Task 5: Leaderboard home

**Files:**
- Create: `components/Leaderboard.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getLeaderboard(loadPundits(), loadCalls())`
- Produces: home page ranked 1–8

- [ ] **Step 1: Implement `Leaderboard` + home**

Each row is a link to `/pundits/{id}`:

- rank in `#39FF14`
- `PunditAvatar` size `row`
- name (broadcast type) + outlet (muted)
- `estimated 2025` accuracy as `63%`
- 2026 record as `0–0` (from `season2026.wins`–`season2026.losses`)
- pending count as `{n} pending`

Default order is already 2025 accuracy desc from `getLeaderboard`.

Eyebrow over the board: `2026 PRESEASON BOARD`. Subhead: `The book is open. Games haven’t started.`

`app/page.tsx` is a Server Component that loads JSON via `loadPundits` / `loadCalls`.

- [ ] **Step 2: Visual check**

Run: `npx next dev --turbopack`

Confirm: eight faces, eight names, 2025 percentages, everyone 0–0, pending counts > 0, rows clickable, looks like a graphic not a spreadsheet. Phone width: rows still readable (stack stats under the name if needed).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx components/Leaderboard.tsx
git commit -m "feat: render pundit leaderboard"
```

---

### Task 6: Pundit profile

**Files:**
- Create: `app/pundits/[id]/page.tsx`, `app/pundits/[id]/not-found.tsx`, `components/CallCard.tsx`, `components/CallBook.tsx`

**Interfaces:**
- Consumes: `getPundit`, `callsForPundit`, `Call`
- Produces: profile hero + book; `CallCard` used by profile and feed

- [ ] **Step 1: `CallCard`**

Show: claim, `HARD`/`SOFT` label (green outline for hard, muted for soft), `PENDING` (green pulse) / `HIT` / `MISS`, `paysOn`, source + date. Name+avatar optional via `showPundit?: boolean` for the feed.

- [ ] **Step 2: Profile page**

`getPundit(id, …)` null → `notFound()`.

Hero: large photo, name, outlet, 2025 `{pct}% · {w}–{l}`, 2026 `{w}–{l}`, `{pending} live calls`.

Then `CallBook`: heading `THE BOOK`. If zero calls, `No calls yet.` Else list `CallCard` newest first. Soft and hard both show.

- [ ] **Step 3: Visual check**

Open each of the eight profiles. Photo is the destination, not a byline thumbnail. Hard and soft both present on Finebaum and Herbstreit. Unknown id `/pundits/corso` 404s.

- [ ] **Step 4: Commit**

```bash
git add app/pundits components/CallCard.tsx components/CallBook.tsx
git commit -m "feat: add pundit profile and call cards"
```

---

### Task 7: Call feed

**Files:**
- Create: `app/feed/page.tsx`

**Interfaces:**
- Consumes: `loadPundits`, `loadCalls`, `CallCard` with `showPundit`
- Produces: `/feed` mixed across the roster

- [ ] **Step 1: Implement feed**

Sort all calls by `sourceDate` desc. Each card links the name to `/pundits/{id}`. Title: `LIVE CALLS`. Subhead: `Waiting on the season to keep score.`

- [ ] **Step 2: Visual check**

Feed is not one pundit. Finebaum’s Indiana line and Thamel’s Indiana repeat can sit near each other — that’s the product.

- [ ] **Step 3: Commit**

```bash
git add app/feed/page.tsx
git commit -m "feat: add mixed call feed"
```

---

### Task 8: Spec visual bar and build

**Files:**
- Modify: CSS/components only if the bar fails

- [ ] **Step 1: Production build**

Run: `npx next build`

Expected: succeed.

- [ ] **Step 2: Walk the spec checklist**

- Leaderboard: eight people, photos, estimated 2025 numbers, 0–0, pending counts
- Each profile: large photo, hard and soft with `paysOn`
- Feed: mixed claims
- Desktop and phone: broadcast board, not a broken article
- Electric green only accent; background black
- No pundit ships without a headshot

Fix layout/CSS until this is true. Do not add pages.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: broadcast layout against prototype visual bar"
```

---

### Task 9: Deploy to Vercel

**Files:** none required in-repo besides whatever `vercel` writes

- [ ] **Step 1: Deploy**

From the project root, production deploy to Vercel (CLI `npx vercel --prod` or the Vercel integration). Public URL. No auth.

- [ ] **Step 2: Click the live site like a fan**

Open the public URL. Leaderboard → one profile → back → feed. Confirm photos load on the live host (not only localhost).

---

## Self-review

1. **Spec coverage:** roster 8, three pages, colors, photos, real 2026 book, invented 2025, derived 2026 W-L, empty book copy, no X/auth/cron/DB, Vercel, visual bar, on-demand = edit JSON later. Covered.
2. **Placeholders:** McAfee needs two extra real pulls in Task 3 (explicit, with how). Photo URLs are “search Wikimedia / ESPN press” because Commons filenames move; Task 2 requires opening the image to verify the face.
3. **Types:** `punditId` / `paysOn` / `sourceUrl` / `sourceDate` / `estimated2025` consistent across JSON, types, tests, and UI.
