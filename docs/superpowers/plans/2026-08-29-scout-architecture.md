# Scout architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Scout from a one-shot empty-YES YouTube hunt into a density engine: a coordinator scores homepage games, then Shows / X / News hunters comb their medium for roster plus a short add-list.

**Architecture:** A pure Node library classifies each homepage game as `empty-side` / `thin` / `dense` / `off-home` from JSON. A CLI prints a `## Dispatch` table. Bot markdown is split so `bots/scout.md` only writes that table; `bots/scout-shows.md`, `bots/scout-x.md`, and `bots/scout-news.md` hunt against it. NCAAF and NFL lists live in the hunt maps. No app UI. No `data/` writes.

**Tech Stack:** Node ESM (`.mjs`), Vitest (already `npm test` → `vitest run`), existing Grok Bot markdown + Git mailbox (`docs/runs/`).

**Spec:** `docs/superpowers/specs/2026-08-29-scout-architecture-design.md`

## Global Constraints

- Scout, Audit, Grader, and Recap never write `data/calls.json`, `data/events.json`, or `data/pundits.json`.
- SU = they pick the **winner**. ATS, totals, “tough matchup,” title stretches are not SU.
- YES = away, NO = home on game events. Never stretch a title pick onto a game.
- Photo required to roster. Candidates stay Candidates. Promote does not auto-roster.
- Same pundit+event → skip. Same URL, different named speaker → two rows.
- Instagram, TikTok, Reddit, forums, live Kalshi API, auto-roster, and new-sport hunt maps are out of this plan.
- Do not mix dirty Codex SEO/archive WIP into these commits. Stage only the files named in each task.
- `npm test` stays green after every code task. Do not run `npm run deploy` for this work.
- Grok hunts. Codex publishes. This plan does not change Audit/Promote/Grader jobs.

## File map

| File | Responsibility |
|---|---|
| `scripts/scout-density-lib.mjs` | Pure scoring: game filter, mapped-hard counts, status, hunt hint, Dispatch markdown. |
| `scripts/scout-density.mjs` | CLI: read live JSON, print Dispatch. |
| `scripts/scout-density.test.mjs` | Fixture tests. No live `data/` snapshots. |
| `docs/bring-onto-home.json` | Slug array the CLI reads. V1: Lambeau. |
| `docs/add-list.md` | People we will photograph this week. |
| `docs/news-beats.md` | News hunter map, NCAAF + NFL sections. |
| `docs/pick-shows.md` | Shows hunter map; add NFL section. |
| `docs/runs/_TEMPLATE.md` | Dispatch + three pass sections. |
| `docs/board.md` | Do-not-touch only. Density comes from the script. |
| `docs/scout-plan.md` | Density goal; pointer at the spec. |
| `docs/product/decision-log.md` | One accepted row. |
| `bots/scout.md` | Coordinator only. |
| `bots/scout-shows.md` | YouTube / podcasts / TV clips. |
| `bots/scout-x.md` | X status URLs; official handles filled. |
| `bots/scout-news.md` | Bylined columns and expert-pick pages. |
| `bots/README.md` | Four Scout jobs + paste-ready prompts. House rule 2 updated. |

---

### Task 1: Density library (the scorecard)

**Files:**
- Create: `scripts/scout-density-lib.mjs`
- Test: `scripts/scout-density.test.mjs`

**Interfaces:**
- Consumes: plain event/call objects (same shapes as `data/events.json` items and `data/calls.json` items).
- Produces:
  - `isGameEvent(event) → boolean`
  - `mappedHardForEvent(calls, slug) → { yes: string[], no: string[] }`
  - `densityStatus(yes, no, { offHome?: boolean }) → "empty-side" \| "thin" \| "dense" \| "off-home"`
  - `huntHint(event, yes, no, status) → string`
  - `scoreEvent(event, calls, { offHome?: boolean }) → DensityRow`
  - `scoreSlate({ events, calls, bringOntoHome }) → DensityRow[]`
  - `formatDispatch(rows) → string`
  - `DensityRow`: `{ eventSlug, sport, yes, no, status, hunt }`

- [ ] **Step 1: Write the failing tests**

Create `scripts/scout-density.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import {
  densityStatus,
  formatDispatch,
  huntHint,
  isGameEvent,
  mappedHardForEvent,
  scoreSlate,
} from "./scout-density-lib.mjs";

const clemson = {
  slug: "clemson-at-lsu-2026",
  kind: "game",
  onHome: true,
  sport: "ncaaf",
  awayTeam: "Clemson",
  homeTeam: "LSU",
  kickoffDate: "2026-09-05",
};

const lambeau = {
  slug: "wisconsin-vs-nd-2026",
  kind: "game",
  onHome: false,
  sport: "ncaaf",
  awayTeam: "Wisconsin",
  homeTeam: "Notre Dame",
  kickoffDate: "2026-09-06",
};

const pats = {
  slug: "patriots-at-seahawks-2026",
  kind: "game",
  onHome: true,
  sport: "nfl",
  awayTeam: "Patriots",
  homeTeam: "Seahawks",
  kickoffDate: "2026-09-09",
};

const indianaTitle = {
  slug: "indiana-title-2026",
  kind: "future",
  onHome: true,
  sport: "ncaaf",
  teamId: "indiana",
};

const hard = (punditId, eventSlug, side) => ({
  id: `${punditId}-${eventSlug}-${side}`,
  punditId,
  kind: "hard",
  eventSlug,
  side,
});

describe("isGameEvent", () => {
  it("accepts kind=game", () => {
    expect(isGameEvent(clemson)).toBe(true);
  });

  it("rejects futures even when onHome", () => {
    expect(isGameEvent(indianaTitle)).toBe(false);
  });

  it("accepts a kickoff game with no kind field", () => {
    expect(
      isGameEvent({
        slug: "miami-at-stanford-2026",
        onHome: true,
        sport: "ncaaf",
        awayTeam: "Miami",
        homeTeam: "Stanford",
        kickoffDate: "2026-09-04",
      })
    ).toBe(true);
  });
});

describe("mappedHardForEvent", () => {
  it("ignores soft rows and unmapped hards", () => {
    const calls = [
      { punditId: "pate", kind: "soft", eventSlug: "clemson-at-lsu-2026", side: "no" },
      { punditId: "herbstreit", kind: "hard", eventSlug: "indiana-title-2026", side: "yes" },
      hard("pate", "clemson-at-lsu-2026", "no"),
    ];
    expect(mappedHardForEvent(calls, "clemson-at-lsu-2026")).toEqual({
      yes: [],
      no: ["pate"],
    });
  });
});

describe("densityStatus", () => {
  it("empty-side when either side is 0", () => {
    expect(densityStatus(["a"], [], {})).toBe("empty-side");
    expect(densityStatus([], ["a", "b"], {})).toBe("empty-side");
  });

  it("thin when both sides have at least one and total < 3", () => {
    expect(densityStatus(["a"], ["b"], {})).toBe("thin");
  });

  it("dense at 3+ with both sides filled", () => {
    expect(densityStatus(["a"], ["b", "c"], {})).toBe("dense");
  });

  it("off-home only when flagged and nobody is mapped", () => {
    expect(densityStatus([], [], { offHome: true })).toBe("off-home");
    expect(densityStatus(["a"], [], { offHome: true })).toBe("empty-side");
  });
});

describe("huntHint", () => {
  it("names the empty away side then a third voice for 0-2", () => {
    expect(huntHint(clemson, [], ["pate", "finebaum"], "empty-side")).toBe(
      "Clemson YES first, then a third voice"
    );
  });

  it("skips dense", () => {
    expect(huntHint(clemson, ["a"], ["b", "c"], "dense")).toBe("skip");
  });
});

describe("scoreSlate", () => {
  it("scores mixed NFL and NCAAF home games and ignores futures", () => {
    const rows = scoreSlate({
      events: [clemson, pats, indianaTitle, lambeau],
      calls: [
        hard("pate", "clemson-at-lsu-2026", "no"),
        hard("finebaum", "clemson-at-lsu-2026", "no"),
        hard("cowherd", "patriots-at-seahawks-2026", "no"),
      ],
      bringOntoHome: ["wisconsin-vs-nd-2026"],
    });
    expect(rows.map((r) => r.eventSlug)).toEqual([
      "clemson-at-lsu-2026",
      "patriots-at-seahawks-2026",
      "wisconsin-vs-nd-2026",
    ]);
    expect(rows[0].status).toBe("empty-side");
    expect(rows[1].sport).toBe("nfl");
    expect(rows[2].status).toBe("off-home");
  });

  it("does not treat an onHome slug as off-home even if listed", () => {
    const rows = scoreSlate({
      events: [{ ...lambeau, onHome: true }],
      calls: [],
      bringOntoHome: ["wisconsin-vs-nd-2026"],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("empty-side");
  });
});

describe("formatDispatch", () => {
  it("prints the coordinator table", () => {
    const md = formatDispatch([
      {
        eventSlug: "clemson-at-lsu-2026",
        sport: "ncaaf",
        yes: [],
        no: ["pate", "finebaum"],
        status: "empty-side",
        hunt: "Clemson YES first, then a third voice",
      },
    ]);
    expect(md).toContain("## Dispatch");
    expect(md).toContain("| clemson-at-lsu-2026 | ncaaf | (none) | pate, finebaum | empty-side | Clemson YES first, then a third voice |");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts/scout-density.test.mjs`

Expected: FAIL — `Cannot find module './scout-density-lib.mjs'` (or the named exports).

- [ ] **Step 3: Write the library**

Create `scripts/scout-density-lib.mjs`:

```js
const STATUS_ORDER = {
  "empty-side": 0,
  "off-home": 1,
  thin: 2,
  dense: 3,
};

export function isGameEvent(event) {
  if (!event || event.kind === "future") return false;
  if (event.kind === "game") return true;
  const kick = Boolean(event.kickoff || event.kickoffDate);
  const away = Boolean(event.awayTeam || event.awayTeamId);
  const home = Boolean(event.homeTeam || event.homeTeamId);
  return kick && away && home;
}

export function mappedHardForEvent(calls, slug) {
  const yes = [];
  const no = [];
  for (const call of calls ?? []) {
    if (call.kind !== "hard") continue;
    if (call.eventSlug !== slug) continue;
    if (call.side !== "yes" && call.side !== "no") continue;
    if (!call.punditId) continue;
    if (call.side === "yes") yes.push(call.punditId);
    else no.push(call.punditId);
  }
  return { yes, no };
}

export function densityStatus(yes, no, { offHome = false } = {}) {
  const y = yes.length;
  const n = no.length;
  if (offHome && y + n === 0) return "off-home";
  if (y === 0 || n === 0) return "empty-side";
  if (y + n < 3) return "thin";
  return "dense";
}

export function huntHint(event, yes, no, status) {
  if (status === "dense") return "skip";
  if (status === "off-home") return "one roster SU to propose onHome";
  if (status === "thin") return "keep hunting (stack OK)";
  const away = event.awayTeam ?? "away";
  const home = event.homeTeam ?? "home";
  if (yes.length === 0 && no.length === 0) return "both sides empty";
  const first =
    yes.length === 0 ? `${away} YES first` : `${home} NO first`;
  if (yes.length + no.length < 3) return `${first}, then a third voice`;
  return first;
}

export function scoreEvent(event, calls, { offHome = false } = {}) {
  const { yes, no } = mappedHardForEvent(calls, event.slug);
  const status = densityStatus(yes, no, { offHome });
  return {
    eventSlug: event.slug,
    sport: event.sport,
    yes,
    no,
    status,
    hunt: huntHint(event, yes, no, status),
  };
}

export function scoreSlate({ events, calls, bringOntoHome = [] }) {
  const offHomeSet = new Set(bringOntoHome);
  const seen = new Set();
  const rows = [];
  for (const event of events ?? []) {
    if (!isGameEvent(event)) continue;
    const listedOffHome = !event.onHome && offHomeSet.has(event.slug);
    if (!event.onHome && !listedOffHome) continue;
    if (seen.has(event.slug)) continue;
    seen.add(event.slug);
    rows.push(scoreEvent(event, calls, { offHome: listedOffHome }));
  }
  rows.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.eventSlug.localeCompare(b.eventSlug)
  );
  return rows;
}

function cell(ids) {
  return ids.length ? ids.join(", ") : "(none)";
}

export function formatDispatch(rows) {
  const lines = [
    "## Dispatch",
    "",
    "| eventSlug | sport | yes | no | status | hunt |",
    "|---|---|---|---|---|---|",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.eventSlug} | ${row.sport} | ${cell(row.yes)} | ${cell(row.no)} | ${row.status} | ${row.hunt} |`
    );
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run scripts/scout-density.test.mjs`

Expected: PASS, all describes green.

- [ ] **Step 5: Commit**

```bash
git add scripts/scout-density-lib.mjs scripts/scout-density.test.mjs
git commit -m "feat(scout): density scorecard library for homepage games"
```

---

### Task 2: Density CLI + bring-onto-home list

**Files:**
- Create: `docs/bring-onto-home.json`
- Create: `scripts/scout-density.mjs`
- Modify: `scripts/scout-density.test.mjs` (add `loadBringOntoHome` tests)
- Modify: `scripts/scout-density-lib.mjs` (add `loadBringOntoHome`)

**Interfaces:**
- Consumes: `scoreSlate`, `formatDispatch` from Task 1.
- Produces:
  - `loadBringOntoHome(raw) → string[]` — throws if not a JSON array of strings.
  - CLI `node scripts/scout-density.mjs` prints Dispatch from `data/events.json`, `data/calls.json`, `docs/bring-onto-home.json` relative to `process.cwd()`.

- [ ] **Step 1: Write the failing test for the JSON loader**

Append to `scripts/scout-density.test.mjs`:

```js
import { loadBringOntoHome } from "./scout-density-lib.mjs";

describe("loadBringOntoHome", () => {
  it("accepts a slug array", () => {
    expect(loadBringOntoHome(["wisconsin-vs-nd-2026"])).toEqual([
      "wisconsin-vs-nd-2026",
    ]);
  });

  it("rejects a non-array", () => {
    expect(() => loadBringOntoHome({ slug: "wisconsin-vs-nd-2026" })).toThrow(
      /array of slugs/
    );
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run scripts/scout-density.test.mjs`

Expected: FAIL — `loadBringOntoHome` is not exported.

- [ ] **Step 3: Implement loader, JSON file, and CLI**

Add to `scripts/scout-density-lib.mjs`:

```js
export function loadBringOntoHome(raw) {
  if (!Array.isArray(raw) || raw.some((s) => typeof s !== "string" || !s)) {
    throw new Error("docs/bring-onto-home.json must be a JSON array of slugs");
  }
  return raw;
}
```

Create `docs/bring-onto-home.json` (exactly):

```json
["wisconsin-vs-nd-2026"]
```

Create `scripts/scout-density.mjs`:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  formatDispatch,
  loadBringOntoHome,
  scoreSlate,
} from "./scout-density-lib.mjs";

const root = process.cwd();
const eventsFile = JSON.parse(
  await readFile(path.join(root, "data", "events.json"), "utf8")
);
const calls = JSON.parse(
  await readFile(path.join(root, "data", "calls.json"), "utf8")
);
const bringRaw = JSON.parse(
  await readFile(path.join(root, "docs", "bring-onto-home.json"), "utf8")
);
const events = Array.isArray(eventsFile) ? eventsFile : eventsFile.events;
const rows = scoreSlate({
  events,
  calls,
  bringOntoHome: loadBringOntoHome(bringRaw),
});
console.log(formatDispatch(rows));
```

- [ ] **Step 4: Run unit tests, then smoke the CLI against live JSON**

Run: `npx vitest run scripts/scout-density.test.mjs`

Expected: PASS.

Run: `node scripts/scout-density.mjs`

Expected: stdout starts with `## Dispatch` and includes `clemson-at-lsu-2026` as `empty-side` (Pate/Finebaum on NO, empty YES) and `wisconsin-vs-nd-2026` as `off-home`. Must **not** include `indiana-title-2026`.

- [ ] **Step 5: Commit**

```bash
git add scripts/scout-density-lib.mjs scripts/scout-density.mjs scripts/scout-density.test.mjs docs/bring-onto-home.json
git commit -m "feat(scout): print homepage Dispatch from live JSON"
```

---

### Task 3: Hunt maps and mailbox template

**Files:**
- Create: `docs/add-list.md`
- Create: `docs/news-beats.md`
- Modify: `docs/pick-shows.md` (add NFL section at the bottom; keep existing NCAAF tables)
- Modify: `docs/runs/_TEMPLATE.md` (replace with the template below)
- Modify: `docs/board.md` (replace P0 hunt tables with the “how to hunt now” block below; keep Do not touch)
- Modify: `docs/scout-plan.md` (replace “Goal this week” / pipeline with the density goal below; keep quality bar and what we will not do)
- Modify: `docs/product/decision-log.md` (one new accepted row)

**Interfaces:**
- Consumes: Dispatch statuses from Task 1 (`empty-side`, `thin`, `dense`, `off-home`).
- Produces: maps the three beat bots load in Tasks 4–7.

- [ ] **Step 1: Write `docs/add-list.md`**

```markdown
# Add-list

Status: Operational
Date: 2026-08-29

Named people Scout may stage as **Candidates** this week. Promote does not auto-roster. A real photo is required before they mint a page.

| proposedId | name | group | outlet | photo | X handle |
|---|---|---|---|---|---|
| fornelli | Tom Fornelli | other | CBS / Cover 3 | needed | TomFornelli |
| elliott | Bud Elliott | other | CBS / Cover 3 | needed | find official, not a parody |
| rico | Rico Bosco | barstool | Barstool Pick Em | needed | Return_Of_RB |

Do not add random beat writers here during a hunt. To grow the list, edit this file.
```

- [ ] **Step 2: Write `docs/news-beats.md`**

```markdown
# News beats (Scout hunt map)

Status: Operational
Date: 2026-08-29

News Scout owns **bylined articles and expert-pick pages**. Shows Scout owns YouTube / podcasts / TV clips. X Scout owns status URLs.

Open the page. Name the speaker. SU = they pick the winner of a Dispatch game. “No Pick” on a grid is Dropped with the URL. Unnamed “the desk likes Clemson” is Dropped. Paywall with no full article → drop.

Hunt only sports that appear on today’s `## Dispatch`. Skip `dense` rows unless a page already open names that game.

## NCAAF

| Outlet | Voices | Jump | Start |
|---|---|---|---|
| On3 PICKING recap | `staples`, `wasserman` | winner without a spread | YouTube/article titled `PICKING {away} {home}` — ATS cover only is Dropped |
| Josh Pate recaps | `pate` | end-of-show winners written up | Josh Pate’s College Football Show site / YouTube description only if it quotes him |
| FOX / Bear Bets column | `fallica` | bylined best bets | FOX Sports Fallica |
| ESPN CFB byline | roster names only | “who wins” | Only if a roster id is the byline |

## NFL

| Outlet | Voices | Jump | Start |
|---|---|---|---|
| ESPN NFL expert picks **page** | `stephena`, `kimes`, `orlovsky`, `spears` | that week’s grid | ESPN NFL picks. “No Pick” → Dropped |
| CBS expert picks page | roster names only | that week’s grid | CBS NFL picks |
| PFT / Florio column | `florio` | first-person winner | profootballtalk / NBC Sports Florio byline |
| FOX digital | `ruiz`, `fallica` | bylined winner | foxsports.com/personalities/steven-ruiz and Fallica NFL copy |
| Ringer NFL copy | `kapadia`, `sal`, `simmons` | named Week 1 winner | Ringer NFL. Win totals ≠ Week 1 SU |

Expert-pick **pages** are News. A video of someone filling out a card is Shows.
```

- [ ] **Step 3: Append an NFL section to `docs/pick-shows.md`**

Do not delete existing NCAAF tables. After the current “Do not” section, append:

```markdown
## NFL (Shows Scout)

Hunt only when Dispatch includes `sport=nfl` rows that are `empty-side`, `thin`, or `off-home`. Week-of the game, not August desk chatter.

| Show | Voices (roster id) | Drop | Jump | Notes |
|---|---|---|---|---|
| The Rich Eisen Show | `eisen`; guests are the guest | weekday | “who wins” / locks | AFC East lean ≠ Patriots–Seahawks |
| The Herd | `cowherd`; guests (Duck, etc.) | weekday | bold predictions | Guest ≠ Cowherd. Prefer a different NFL YES than Cowherd’s three home cards |
| Ringer NFL Show / gambling pods | `kapadia`, `sal`, `simmons` | weekly | named winner | Win totals ≠ Week 1 SU. `ruiz` is FOX now — do not hunt him here |
| McAfee Show | `mcafee` only if Pat picks | weekday | locks | Guests are the guest (`pft`, etc.), never `mcafee` |
| PFT video / PFT Live | `florio`, `simms` | weekday | “who wins” | Column version is News |

Brand faces — NFL pick window (also in the table above this file): `stephena`, `kimes`, `orlovsky`, `spears` on the ESPN **page** are News Scout. If they say it on TV and a clip URL exists, Shows may stage it.
```

Also change the H1/lede of `docs/pick-shows.md` from “Scout hunts shows” to “**Shows Scout** hunt map (YouTube / podcasts / TV clips). News is `docs/news-beats.md`. X is `bots/scout-x.md`.”

- [ ] **Step 4: Replace `docs/runs/_TEMPLATE.md` with**

```markdown
<!-- pundits-run date=YYYY-MM-DD hard=0 candidates=0 audit=pending promoted=false -->
## Dispatch

| eventSlug | sport | yes | no | status | hunt |
|---|---|---|---|---|---|
| | | | | | |

## Shows pass YYYY-MM-DD (Grok Bot)

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

### Dropped

-

### Freeze

none

### Stories this would mint

*(none)*

## X pass YYYY-MM-DD (Grok Bot)

X (Twitter) only. Shows Scout owns episodes. News Scout owns columns.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

### Dropped

-

### Freeze

none

### Stories this would mint

*(none)*

## News pass YYYY-MM-DD (Grok Bot)

Bylined columns and expert-pick pages only.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

### Dropped

-

### Freeze

none

### Home cards

-

### Stories this would mint

*(none)*
```

Home cards stays on the **last** pass (News in the template) so Audit sees one rolled-up picture. If News does not run, X or Shows may write Home cards.

- [ ] **Step 5: Trim `docs/board.md`**

Keep the title, status, “live JSON wins,” and the entire **Do not touch** list.

Delete the P0 / P1 / P2 / P3 hunt-order tables (those numbers now come from `node scripts/scout-density.mjs`).

Replace them with:

```markdown
## How to hunt now

1. Run `node scripts/scout-density.mjs` (or read `## Dispatch` in today’s run file).
2. Shows / X / News hunt `empty-side`, then `off-home`, then `thin`. Skip `dense`.
3. Add-list: `docs/add-list.md`. Bring onto home: `docs/bring-onto-home.json`.
4. Futures are not the hunt target.

If this file and `data/` disagree, **`data/` wins**.
```

Keep the idle-voices lists only if they still help humans; they are not the scorecard.

- [ ] **Step 6: Update `docs/scout-plan.md` goal**

Replace “Goal this week” with:

```markdown
## Goal

A fan opening pundits.pro should see **several named, sourced winner-picks on each homepage game**, NCAAF and NFL, preferably disagreement.

Success is density, not a single face on an empty side:

- `empty-side` (a homepage game with nobody on YES or nobody on NO) is urgent.
- `thin` (both sides have someone, total mapped hard SUs < 3) still counts — stacking the favorite is success.
- `dense` (≥3 mapped hard and both sides ≥1) is done for the week.

Architecture: `docs/superpowers/specs/2026-08-29-scout-architecture-design.md`.
```

Keep Tokens, Quality bar, What we will not do. Rewrite Pipeline to: Coordinator writes Dispatch → Shows / X / News append passes → Audit → Promote.

- [ ] **Step 7: Decision log row**

In `docs/product/decision-log.md` accepted table, append:

```
| Scout is a density engine: coordinator + Shows/X/News beats against homepage games. | Empty-YES Google against CFB YouTube factories produced dry mornings and ignored NFL/news. | Accepted 2026-08-29 |
```

- [ ] **Step 8: Commit**

```bash
git add docs/add-list.md docs/news-beats.md docs/pick-shows.md docs/runs/_TEMPLATE.md docs/board.md docs/scout-plan.md docs/product/decision-log.md
git commit -m "docs(scout): density maps, add-list, news beat, Dispatch template"
```

---

### Task 4: Coordinator bot (`bots/scout.md`)

**Files:**
- Modify: `bots/scout.md` (rewrite the whole file)

**Interfaces:**
- Consumes: `node scripts/scout-density.mjs` output; `docs/runs/_TEMPLATE.md`.
- Produces: `## Dispatch` at the top of `docs/runs/YYYY-MM-DD.md`. Does not hunt. Does not write `data/`.

- [ ] **Step 1: Replace `bots/scout.md` with**

```markdown
# Scout (coordinator)

You write today’s **hit list**. You do not open YouTube, X, or articles. Shows, X, and News hunters comb those media against this list.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `docs/scout-plan.md`
- `docs/board.md` — do-not-touch only. If `data/` disagrees, **`data/` wins**.
- `docs/add-list.md`
- `docs/bring-onto-home.json`
- `data/events.json`, `data/calls.json`, `data/pundits.json`
- Today’s run file if it exists: `docs/runs/YYYY-MM-DD.md`

## Do

1. In the repo (or a scheduled worktree on `origin/main`), run `node scripts/scout-density.mjs`.
2. If you cannot run Node, score the same way the script does: homepage `kind=game` (or kickoff+teams) with `onHome`, plus slugs in `bring-onto-home.json`. Count mapped **hard** calls only. Ignore futures, even if `onHome`. Status:
   - `empty-side` — YES or NO has 0 mapped hard
   - `thin` — both sides ≥1, total < 3
   - `dense` — ≥3 mapped hard and both sides ≥1
   - `off-home` — bring-onto-home slug, not `onHome`, zero mapped hard
3. Create or update `docs/runs/YYYY-MM-DD.md` from `docs/runs/_TEMPLATE.md`.
4. Write the script’s markdown into `## Dispatch`. Do not invent rows.
5. Leave Shows / X / News pass tables empty unless they already have content from an earlier hunter. Do not delete an existing pass.
6. First-line comment: keep `hard` / `candidates` as they are if passes already exist; otherwise `hard=0 candidates=0 audit=pending promoted=false`.

## Do not

- Open sources or stage Intake/Candidates.
- Edit `data/`.
- Hunt P0 Google queries. The table is the hunt order.
- Restage anyone on the do-not-touch list.

## Stop

Commit `docs/runs/YYYY-MM-DD.md` on `main` (or PR `scout/YYYY-MM-DD`). Chat is not the handoff. Then: `dispatch ready — Shows, X, News may hunt`.
```

- [ ] **Step 2: Sanity-check**

Confirm the file contains `node scripts/scout-density.mjs` and does **not** contain “Jump the locks.” Confirm `bots/scout-shows.md` does not exist yet (Task 5).

- [ ] **Step 3: Commit**

```bash
git add bots/scout.md
git commit -m "feat(scout): coordinator writes Dispatch, does not hunt"
```

---

### Task 5: Shows bot

**Files:**
- Create: `bots/scout-shows.md`

**Interfaces:**
- Consumes: `## Dispatch` from Task 4; `docs/pick-shows.md`; `docs/add-list.md`.
- Produces: `## Shows pass YYYY-MM-DD (Grok Bot)` appended to the same run file.

- [ ] **Step 1: Create `bots/scout-shows.md`**

Use this file in full:

```markdown
# Shows Scout

You hunt **YouTube / podcasts / TV clips** with durable URLs. X Scout owns tweets. News Scout owns columns and expert-pick pages.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- Today’s `docs/runs/YYYY-MM-DD.md` — hunt `## Dispatch`. If Dispatch is missing, run `node scripts/scout-density.mjs`, write `## Dispatch` from the template, then hunt.
- `docs/pick-shows.md` — NCAAF and NFL show lists. Only open sections for sports that appear on Dispatch.
- `docs/add-list.md` — Candidates only.
- `docs/board.md` — do-not-touch.
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- Live https://pundits.pro/stories/ — do not restage a pair that already has a page.

## Hunt

For each Dispatch row with status `empty-side`, then `off-home`, then `thin`:

1. Open locks shows in `docs/pick-shows.md` for that row’s `sport` that dropped in the last ~3 days. Jump locks / moneyline / “I’ll take.” Captions count.
2. Then idle roster voices if their pick window in that file is open.
3. Named add-list speakers on those same shows → Candidates (`photoUrl=needed` unless a real photo is already known).
4. Skip `dense` rows unless a source you already opened names that game.

PMT is comedy + guests, not a locks show. Stanford Steve on PMT is `coughlin`. Big Cat’s card is Pick Em / Picks Central / Barstool CFB Show, not PMT. GameDay / Big Noon only in their Saturday window (first 2026 GameDay is Baton Rouge Sep 5).

Do not sweep `from:{handle}`. If you land on a tweet while opening a show, you may stage it and say X Scout owns the systematic pass.

**Tokens are not scarce.** After the listed factories and two reasonable named searches per under-dense game, record the miss in Dropped (what you opened) and move on. Do not invent a pick.

When a hard pick has real supporting rationale, keep the decisive verbatim quote to the shortest one or two sentences that prove the SU (normally ≤60 words). Then a separate 25–60 word `reasoning` capsule in your own words, paraphrasing at most two concrete factors that speaker gave nearby in the same source. If they only named a winner, leave `reasoning` blank.

## Bar (do not loosen)

- **SU** = they pick the **winner**. Spread, total, “tough game,” “I like them this year” are not.
- **URL** = you opened it; that speaker; that quote; this season’s `eventSlug`.
- **Photo** = required to roster. Candidates may use `photoUrl=needed`.
- YES = away. Wrong year → drop. Title/SB stays on futures slugs. Never stretch onto a game.
- **Intake** = existing `punditId` only. **Candidates** = add-list or other named off-roster SU on these shows. Never write `data/`. Never mint an id. Unnamed show take → Dropped.

Skip same pundit+event. Same URL, different named speaker → new row.

Freeze only events that gained a **new mapped roster face** this pass (or an onHome flip). Prefer the kalshi.com event page plus ticker.

## Output

Append `## Shows pass YYYY-MM-DD (Grok Bot)` to `docs/runs/YYYY-MM-DD.md`. Do not delete Dispatch or other passes.

If the file does not exist, create it from `docs/runs/_TEMPLATE.md`, write Dispatch (fallback), then the Shows pass.

Update the first-line `hard=` / `candidates=` counts (sum of new rows across passes). If you added hard, `audit=pending`. Never set `promoted=true`. If the file was `promoted=true` and you added hard, set `promoted=false`.

Tables: **Intake** · **Candidates** · **Dropped** (per under-dense game: what you opened) · **Freeze** · **Stories this would mint**.

Write **Home cards** only if you are the last pass of the day (no News/X still scheduled). Otherwise leave it for the later pass.

## Stop

Do not edit `data/`. Do not run tests. Do not deploy. After the file is on GitHub: `ready to audit N hard rows` (`M candidates` if any).
```

- [ ] **Step 2: Commit**

```bash
git add bots/scout-shows.md
git commit -m "feat(scout): Shows beat hunts YouTube and podcasts from Dispatch"
```

---

### Task 6: Retarget X Scout

**Files:**
- Modify: `bots/scout-x.md`

**Interfaces:**
- Consumes: `## Dispatch`; roster + add-list handles.
- Produces: `## X pass` as today, but targeting Dispatch statuses instead of a hardcoded P0 list.

- [ ] **Step 1: Change the hunt section**

Replace “For **each** P0 event on `docs/board.md`, then P1 Lambeau” and the hardcoded “P0 right now…” paragraph with:

```
For each Dispatch row with status `empty-side`, then `off-home`, then `thin` (skip `dense`):

1. Roster handles below (and add-list handles in `docs/add-list.md`). Query **both** teams, last **48 hours**, this season only.
2. Open the **status URL**. The quote must be on that post (or a quoted post by the same speaker). Paraphrase → drop.
3. Per under-dense game, say in Dropped which handles you actually opened.

If `## Dispatch` is missing, run `node scripts/scout-density.mjs`, write it, then hunt.
```

- [ ] **Step 2: Fill official handles**

In the roster table, replace every `find official` cell:

| id | handle |
|---|---|
| florio | MikeFlorioPFT (skip parody / quote accounts; show account `ProFootballTalk` only if the post is Florio) |
| clark | look up current official; skip if the account is gone after the 2026 ESPN layoff — say so in Dropped |
| klatt | joelklatt |
| fallica | chrisfallica |
| saban | NickSaban |
| stephena | stephenasmith |
| kimes | MinaKimes |
| sharpe | ShannonSharpe |

If a lookup disagrees, prefer the verified account with the person’s outlet in the bio. Never hunt `*quotes` / `Not Kirk`.

Add add-list handles to the Candidates table: `TomFornelli`, `Return_Of_RB`, Bud Elliott only after an official handle is confirmed.

- [ ] **Step 3: Load list**

In “Load first”, put today’s run file / Dispatch **before** `docs/board.md`. Board is do-not-touch, not P0.

- [ ] **Step 4: Commit**

```bash
git add bots/scout-x.md
git commit -m "feat(scout): X beat hunts Dispatch holes with official handles"
```

---

### Task 7: News bot

**Files:**
- Create: `bots/scout-news.md`

**Interfaces:**
- Consumes: `## Dispatch`; `docs/news-beats.md`; `docs/add-list.md`.
- Produces: `## News pass YYYY-MM-DD (Grok Bot)` plus rolled-up **Home cards**.

- [ ] **Step 1: Create `bots/scout-news.md`**

```markdown
# News Scout

You hunt **bylined columns and expert-pick pages**. Shows Scout owns YouTube / podcasts / TV clips. X Scout owns tweets.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- Today’s `docs/runs/YYYY-MM-DD.md` — hunt `## Dispatch`. If missing, run `node scripts/scout-density.mjs`, write Dispatch, then hunt.
- `docs/news-beats.md` — only the sports on Dispatch.
- `docs/add-list.md`
- `docs/board.md` — do-not-touch.
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- Live https://pundits.pro/stories/

Do not open podcasts or YouTube locks segments. If the only hit is a clip, leave it for Shows Scout.

## Hunt

For each Dispatch row with status `empty-side`, then `off-home`, then `thin`:

1. Open the outlets in `docs/news-beats.md` for that sport that published in the last ~7 days.
2. Expert grids: read each roster name’s cell. “No Pick” → Dropped with the URL. A named winner → Intake.
3. Bylines must be a person on the roster or add-list. “Staff picks” with no name → Dropped.
4. Paywall / URL does not load → Dropped. Do not paraphrase a snippet.
5. Skip `dense` unless a page already open names that game.

Same SU / URL / YES=away / no-data / no-mint bar as Shows Scout. Reasoning capsule rules identical.

Freeze only if this pass adds a new mapped roster face (or proposes Lambeau `onHome`). Kalshi page or reprint. Else `none`.

## Output

Append `## News pass YYYY-MM-DD (Grok Bot)`. Do not delete Dispatch or other passes.

Update `hard=` / `candidates=` as a running sum. If you added hard, `audit=pending`. Never `promoted=true` on new hard (flip to `false` if it was true).

Tables: Intake · Candidates · Dropped (per under-dense game: which URLs you opened) · Freeze · **Home cards** (every `onHome` game: YES faces, NO faces, empty sides) · Stories this would mint.

You are usually the last pass — write Home cards.

## Stop

Do not edit `data/`. After GitHub: `ready to audit N hard rows`.
```

- [ ] **Step 2: Commit**

```bash
git add bots/scout-news.md
git commit -m "feat(scout): News beat hunts columns and expert-pick pages"
```

---

### Task 8: Standing prompts and house rule 2

**Files:**
- Modify: `bots/README.md`

**Interfaces:**
- Consumes: bot files from Tasks 4–7.
- Produces: operator paste-ready prompts for four Grok jobs.

- [ ] **Step 1: Replace the bots table rows for Scout**

```
| Coordinator | `bots/scout.md` | Score homepage density. Write `## Dispatch`. Never hunt. Never `data/`. |
| Shows Scout | `bots/scout-shows.md` | Hunt YouTube / podcasts / TV clips against Dispatch. Never `data/`. |
| X Scout | `bots/scout-x.md` | Hunt X status URLs against Dispatch. Never `data/`. |
| News Scout | `bots/scout-news.md` | Hunt bylined columns and expert-pick pages against Dispatch. Never `data/`. |
```

Keep Promote / Grader / Recap / Audit rows.

- [ ] **Step 2: Replace paste-ready Scout and X prompts; add Shows and News**

**Coordinator** (paste as-is):

```
You are the Pundits Scout coordinator. You do not hunt. You write today’s hit list.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/scout-plan.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout.md
Repo: https://github.com/bairdhall25/Pundits

Run `node scripts/scout-density.mjs` (or score the same way). Write ## Dispatch into docs/runs/YYYY-MM-DD.md from the template. Do not open YouTube, X, or articles. Never touch data/. Commit the run file. Chat is not the handoff. Then: dispatch ready.
```

**Shows Scout:**

```
You are the Pundits Shows Scout. You hunt YouTube, podcasts, and TV clips. X and News are different jobs.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout-shows.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/pick-shows.md
Repo: https://github.com/bairdhall25/Pundits

Hunt ## Dispatch: empty-side, then off-home, then thin. Skip dense. Jump locks / I'll take / moneyline. Named add-list speakers as Candidates. Never mint ids. Never touch data/. Append ## Shows pass to docs/runs/YYYY-MM-DD.md. Chat is not the handoff.
```

**X Scout:**

```
You are the Pundits X Scout. You hunt X (Twitter) only.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout-x.md
Repo: https://github.com/bairdhall25/Pundits

Hunt ## Dispatch: empty-side, then off-home, then thin. from:{handle} {away} and from:{handle} {home}, last 48 hours. Open the status URL. Same Intake/Candidates/Dropped bar. Never mint ids. Never touch data/. Never tweet. Append ## X pass to docs/runs/YYYY-MM-DD.md. Chat is not the handoff.
```

**News Scout:**

```
You are the Pundits News Scout. You hunt bylined columns and expert-pick pages.

At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/scout-news.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/news-beats.md
Repo: https://github.com/bairdhall25/Pundits

Hunt ## Dispatch: empty-side, then off-home, then thin. Open the page. Name the speaker. "No Pick" and unnamed staff lists are Dropped. Never mint ids. Never touch data/. Append ## News pass to docs/runs/YYYY-MM-DD.md and write Home cards. Chat is not the handoff.
```

- [ ] **Step 3: House rule 2**

Replace the hunt-order sentence in house rule 2 with:

```
Hunt order is today’s `## Dispatch` (from `node scripts/scout-density.mjs`). Shows Scout hunts `docs/pick-shows.md`. News Scout hunts `docs/news-beats.md`. X Scout hunts status URLs (`from:{handle}`, last 48 hours). Add-list is `docs/add-list.md`. Named off-roster speakers as Candidates. Never “the show.”
```

- [ ] **Step 4: Cadence blurb**

Replace “Scout Wed–Sat morning” with:

```
Coordinator daily (Dispatch). Shows NCAAF Thu–Sat (+ GameDay window). Shows NFL Tue–Sat of that NFL week. X twice daily. News NCAAF Thu–Sat. News NFL Tue–Sat of that NFL week. Audit when `hard>0` and `audit=pending`. Promote when `audit=ok` and `hard>0`.
```

- [ ] **Step 5: Full test + commit**

Run: `npx vitest run`

Expected: PASS, including `scripts/scout-density.test.mjs`.

```bash
git add bots/README.md
git commit -m "docs(scout): four Scout jobs and paste-ready standing prompts"
```

---

### Task 9: Operator cutover (no code)

**Files:** none in-repo beyond what Tasks 4–8 already committed.

**Interfaces:**
- Consumes: paste-ready prompts in `bots/README.md`.
- Produces: Grok Bot standing instructions updated; a News scheduled job added. Codex still Audit / Promote / Grader / deploy.

- [ ] **Step 1: Point Grok Bots**

Existing Scout job → Coordinator prompt. Existing X Scout → new X prompt. Add Shows Scout and News Scout jobs with the README pastes.

- [ ] **Step 2: First live Dispatch**

On a clean `origin/main` worktree: `node scripts/scout-density.mjs`. Coordinator commit of today’s run file. Then one Shows or News pass if a factory has actually dropped. Empty Dropped is valid.

- [ ] **Step 3: Do not ship UI**

No `npm run deploy` required unless a later hunt actually promotes JSON.

---

## Self-review (author)

**Spec coverage**

| Spec requirement | Task |
|---|---|
| Density statuses + 3-and-both-sides | 1 |
| Futures excluded; onHome games + bring-onto-home | 1, 2 |
| CLI prints Dispatch | 2 |
| Add-list Fornelli/Elliott/Rico | 3 |
| News map NCAAF+NFL; Shows NFL section | 3 |
| Template with three passes | 3 |
| board.md no longer P0 tables | 3 |
| scout-plan + decision-log | 3 |
| Coordinator does not hunt | 4 |
| Shows / X / News beats | 5–7 |
| Official X handles | 6 |
| README four jobs + house rule 2 | 8 |
| Point Grok Bots | 9 |
| SU bar, no data/, no auto-roster, no IG/TikTok | Global constraints + each bot Bar section |
| NFL first-class, later sport = new list | 3 maps + lib reads `event.sport` |

**Placeholders:** none intended. Ryan Clark’s handle is “look up / skip if gone” because of the 2026 ESPN layoff — that is an explicit Dropped rule, not a TBD.

**Types:** `DensityRow`, `densityStatus`, `scoreSlate`, `formatDispatch`, `loadBringOntoHome` used consistently in Tasks 1–2 and named in coordinator instructions.
