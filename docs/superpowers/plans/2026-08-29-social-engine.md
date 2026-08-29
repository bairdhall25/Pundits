# The Social Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the repo-hosted playbook, bot instruction files, and card-index build step that let the Grok Post Poster and Reply Guy run Pundits' X account (@Pundits_) on autopilot with on-brand images.

**Architecture:** Two Grok bots fetch their instructions from raw GitHub at job start (the proven Scout pattern) and fetch `https://pundits.pro/social/cards.json` for everything postable right now. The card index is a pure function in `lib/social.ts` (unit-tested with fixtures) plus a thin I/O script `scripts/build-social-index.ts` wired into the build before `next build`, so `public/social/cards.json` is copied into `out/` and deployed. The playbook lives in `docs/social/` and is the single source the bot files point into.

**Tech Stack:** TypeScript via tsx (matches `scripts/render-og.tsx`), vitest, Next.js static export, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-29-social-engine-design.md` (binding). Evidence base: `docs/social/research-2026-08-29.md`. Executors read both.

## Global Constraints

- Both bots are **read-only**: never touch `data/`, never write `docs/runs/`, never grade, never edit the site.
- Guardrails from the spec are copied **verbatim** into the docs where indicated — do not paraphrase them:
  1. Never repost third-party video or images. Own cards, own data, attributed screenshots of public statements only.
  2. Critique the pick, never the person. No dunking on ordinary users, no quote-posting individuals for mockery, no dogpile framing, professionals' takes only.
  3. Never "lock," "can't lose," "free money," "guaranteed" — even as a joke. Never urge anyone to bet. Prices are accountability evidence, not tips. Never imply a pundit placed a wager.
  4. Irreverence budget: takes, hubris, bad predictions. Never identity, appearance, personal life, tragedy, or injuries.
  5. No manufactured feuds, no rage-bait, no politics or culture war. The controversy is the data.
  6. No fake authenticity: the bot never claims to have watched a game or have money down. Its stake is the ledger.
  7. Every number in a post must be verifiable on pundits.pro at post time.
- Image hard rule (verbatim wherever images are discussed): **never AI-generate a real person's face or likeness; never fabricate a screenshot or stat graphic. When in doubt: real card or no image.**
- Links: the post body never carries a link. Receipt in image/text; "full ledger →" link in the first reply; site URL in bio.
- Brand constants: ground `#0a0a0a`, card `#141414`, ink `#f5f5f5`, muted `#a3a3a3`, accent `#39ff14`, Oswald condensed display + Inter body (see `scripts/render-og.tsx:36-50`).
- Time words have strict meanings (`docs/product/experience-principles.md` §6): the index ships raw `kickoff`/`kickoffDate` and settled state; **bots compute "tonight"/"live" at post time** — the build must not bake in time-relative labels that go stale.
- Site origin in generated URLs: `https://pundits.pro`, no trailing-slash variations on card paths.
- Commit after every task; run `npm test` before every commit that touches code.

---

### Task 1: `lib/social.ts` — the pure card-index builder

**Files:**
- Create: `lib/social.ts`
- Test: `lib/social.test.ts`

**Interfaces:**
- Consumes (existing): `mappedTakes(calls, events, pundits): MappedTake[]` and `sideChip(event, side): string` from `lib/seo.ts`; `sidesForCard`, `settledSide`, `toActivityRecord`, `eventKind` from `lib/data.ts`; `ogEventPath`, `ogPunditPath`, `ogTakePath`, `ogStoryEventPath`, `ogStoryPunditPath`, `ogStoryTakePath` from `lib/og.ts`; types from `lib/types.ts`.
- Produces: `socialIndex(calls: Call[], events: Event[], pundits: Pundit[], generatedAt?: string): SocialIndex` plus the exported row types below. Task 2's script and Task 6's bot docs rely on these exact field names.

- [ ] **Step 1: Write the failing test**

```ts
// lib/social.test.ts
import { describe, expect, it } from "vitest";
import { socialIndex } from "./social";
import type { Call, Event, Pundit } from "./types";

const pundits: Pundit[] = [
  { id: "fin", name: "Paul Finebaum", outlet: "ESPN", photo: "/pundits/fin.jpg", sport: "ncaaf" },
  { id: "pat", name: "Chip Patterson", outlet: "CBS", photo: "/pundits/pat.jpg", sport: "ncaaf" },
];

const events: Event[] = [
  {
    slug: "unc-vs-tcu-2026",
    title: "North Carolina vs TCU",
    contractName: "UNC to win",
    yesCents: 41,
    noCents: 61,
    sourceUrl: "https://kalshi.com/markets/x",
    sourcedAt: "2026-08-25",
    onHome: true,
    sport: "ncaaf",
    homeRank: 1,
    kind: "game",
    awayTeam: "North Carolina",
    homeTeam: "TCU",
    kickoff: "2026-08-29T19:00:00-04:00",
    kickoffDate: "2026-08-29",
    season: 2026,
    week: 0,
  },
];

const calls: Call[] = [
  {
    id: "c1",
    punditId: "fin",
    claim: "TCU wins this game.",
    source: "The Paul Finebaum Show",
    sourceUrl: "https://example.com/a",
    sourceDate: "2026-08-25",
    kind: "hard",
    subject: "UNC at TCU",
    paysOn: "TCU win",
    status: "hit",
    gradedAt: "2026-08-30",
    eventSlug: "unc-vs-tcu-2026",
    side: "no",
  },
  {
    id: "c2",
    punditId: "pat",
    claim: "Give me the Heels.",
    source: "Cover 3",
    sourceUrl: "https://example.com/b",
    sourceDate: "2026-08-26",
    kind: "hard",
    subject: "UNC at TCU",
    paysOn: "UNC win",
    status: "pending",
    eventSlug: "unc-vs-tcu-2026",
    side: "yes",
  },
];

describe("socialIndex", () => {
  const index = socialIndex(calls, events, pundits, "2026-08-29T12:00:00.000Z");

  it("passes generatedAt and site through", () => {
    expect(index.generatedAt).toBe("2026-08-29T12:00:00.000Z");
    expect(index.site).toBe("https://pundits.pro");
  });

  it("lists every event with absolute page and card urls plus settled state", () => {
    expect(index.events).toHaveLength(1);
    const e = index.events[0];
    expect(e.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/");
    expect(e.ogCard).toBe("https://pundits.pro/og/events/unc-vs-tcu-2026.png");
    expect(e.storyCard).toBe("https://pundits.pro/og/stories/events/unc-vs-tcu-2026.png");
    expect(e.settled).toBe(true); // a graded call on the event settles it
    expect(e.kickoffDate).toBe("2026-08-29");
    expect(e.yesPundits).toEqual(["Chip Patterson"]);
    expect(e.noPundits).toEqual(["Paul Finebaum"]);
  });

  it("lists one take per mapped hard call with status, side label, and frozen cents", () => {
    expect(index.takes).toHaveLength(2);
    const hit = index.takes.find((t) => t.punditId === "fin")!;
    expect(hit.status).toBe("hit");
    expect(hit.side).toBe("no");
    expect(hit.cents).toBe(61);
    expect(hit.claim).toBe("TCU wins this game.");
    expect(hit.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/fin/");
    expect(hit.ogCard).toBe("https://pundits.pro/og/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.storyCard).toBe("https://pundits.pro/og/stories/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.sideLabel.length).toBeGreaterThan(0);
  });

  it("lists every pundit with live record and card urls", () => {
    expect(index.pundits).toHaveLength(2);
    const fin = index.pundits.find((p) => p.id === "fin")!;
    expect(fin).toMatchObject({ name: "Paul Finebaum", outlet: "ESPN", wins: 1, losses: 0, pending: 0 });
    expect(fin.pageUrl).toBe("https://pundits.pro/pundits/fin/");
    expect(fin.ogCard).toBe("https://pundits.pro/og/pundits/fin.png");
    const pat = index.pundits.find((p) => p.id === "pat")!;
    expect(pat.pending).toBe(1);
  });
});
```

Note for the implementer: `Event.noCents` of 61 is deliberate (fixture doesn't need to sum to ~100; that invariant is a data test, not a `socialIndex` concern). If `sidesForCard` or `mappedTakes` behave differently than assumed (e.g., `mappedTakes` filters more strictly), read `lib/seo.ts:22-48` and `lib/data.ts:115-160` and adjust the FIXTURE (not the assertions' intent: absolute URLs, settled derivation, record math).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/social.test.ts`
Expected: FAIL — `Cannot find module './social'` (or equivalent).

- [ ] **Step 3: Write the implementation**

```ts
// lib/social.ts
import {
  eventKind,
  settledSide,
  sidesForCard,
  toActivityRecord,
} from "./data";
import {
  ogEventPath,
  ogPunditPath,
  ogStoryEventPath,
  ogStoryPunditPath,
  ogStoryTakePath,
  ogTakePath,
} from "./og";
import { mappedTakes, sideChip } from "./seo";
import type { Call, Event, Pundit, Side, Sport } from "./types";

const SITE = "https://pundits.pro";

export type SocialEventRow = {
  slug: string;
  title: string;
  sport: Sport;
  kind: "game" | "future";
  week?: number;
  kickoff?: string;
  kickoffDate?: string;
  yesCents: number | null;
  noCents: number | null;
  awayTeam?: string;
  homeTeam?: string;
  settled: boolean;
  yesPundits: string[];
  noPundits: string[];
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialTakeRow = {
  eventSlug: string;
  punditId: string;
  punditName: string;
  status: "pending" | "hit" | "miss";
  side: Side;
  sideLabel: string;
  cents: number | null;
  claim: string;
  sourceDate: string;
  gradedAt?: string;
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialPunditRow = {
  id: string;
  name: string;
  outlet: string;
  wins: number;
  losses: number;
  pending: number;
  pageUrl: string;
  ogCard: string;
  storyCard: string;
};

export type SocialIndex = {
  generatedAt: string;
  site: string;
  events: SocialEventRow[];
  takes: SocialTakeRow[];
  pundits: SocialPunditRow[];
};

function names(punditIds: string[], pundits: Pundit[]): string[] {
  const byId = new Map(pundits.map((p) => [p.id, p.name]));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of punditIds) {
    const name = byId.get(id);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

export function socialIndex(
  calls: Call[],
  events: Event[],
  pundits: Pundit[],
  generatedAt: string = new Date().toISOString()
): SocialIndex {
  const eventRows: SocialEventRow[] = events.map((event) => {
    const [yes, no] = sidesForCard(event, calls);
    return {
      slug: event.slug,
      title: event.title,
      sport: event.sport,
      kind: eventKind(event),
      week: event.week,
      kickoff: event.kickoff,
      kickoffDate: event.kickoffDate,
      yesCents: event.yesCents,
      noCents: event.noCents,
      awayTeam: event.awayTeam,
      homeTeam: event.homeTeam,
      settled: settledSide(event, calls) !== null,
      yesPundits: names(yes.calls.map((c) => c.punditId), pundits),
      noPundits: names(no.calls.map((c) => c.punditId), pundits),
      pageUrl: `${SITE}/picks/${event.slug}/`,
      ogCard: `${SITE}${ogEventPath(event.slug)}`,
      storyCard: `${SITE}${ogStoryEventPath(event.slug)}`,
    };
  });

  const takeRows: SocialTakeRow[] = mappedTakes(calls, events, pundits).map(
    ({ call, event, pundit }) => {
      const side = call.side ?? "no";
      return {
        eventSlug: event.slug,
        punditId: pundit.id,
        punditName: pundit.name,
        status: call.status,
        side,
        sideLabel: sideChip(event, side),
        cents: side === "yes" ? event.yesCents : event.noCents,
        claim: call.claim,
        sourceDate: call.sourceDate,
        gradedAt: call.gradedAt,
        pageUrl: `${SITE}/picks/${event.slug}/${pundit.id}/`,
        ogCard: `${SITE}${ogTakePath(event.slug, pundit.id)}`,
        storyCard: `${SITE}${ogStoryTakePath(event.slug, pundit.id)}`,
      };
    }
  );

  const punditRows: SocialPunditRow[] = pundits.map((pundit) => {
    const record = toActivityRecord(pundit, calls);
    return {
      id: pundit.id,
      name: pundit.name,
      outlet: pundit.outlet,
      wins: record.season2026.wins,
      losses: record.season2026.losses,
      pending: record.season2026.pending,
      pageUrl: `${SITE}/pundits/${pundit.id}/`,
      ogCard: `${SITE}${ogPunditPath(pundit.id)}`,
      storyCard: `${SITE}${ogStoryPunditPath(pundit.id)}`,
    };
  });

  return { generatedAt, site: SITE, events: eventRows, takes: takeRows, pundits: punditRows };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/social.test.ts`
Expected: PASS (4 tests). If `sideChip`/`mappedTakes` import paths or behaviors differ, fix per the Step 1 note.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS. (Data-driven tests in `lib/` can break mid-session from concurrent capture-run edits to `data/*.json` — check `git status` before blaming this change.)

- [ ] **Step 6: Commit**

```bash
git add lib/social.ts lib/social.test.ts
git commit -m "feat(social): pure card-index builder for the social engine"
```

---

### Task 2: Build wiring — `scripts/build-social-index.ts`, gitignore, verifier

**Files:**
- Create: `scripts/build-social-index.ts`
- Modify: `package.json:6-8` (scripts `og`→ keep, `predev`, `build`, add `social:index`)
- Modify: `.gitignore` (add generated dir)
- Modify: `scripts/required-routes.mjs:20-35` (`STATIC_ONLY_FILES`)
- Modify: `scripts/verify-static.mjs` (JSON content assertions, appended at end of file)

**Interfaces:**
- Consumes: `socialIndex` from Task 1; `loadCalls`, `loadEvents`, `loadPundits` from `lib/data.ts`.
- Produces: `public/social/cards.json` at build time → deployed at `https://pundits.pro/social/cards.json`. Bot docs (Tasks 3–6) reference that URL and the row fields from Task 1.

- [ ] **Step 1: Write the script**

```ts
// scripts/build-social-index.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadCalls, loadEvents, loadPundits } from "../lib/data";
import { socialIndex } from "../lib/social";

const dir = path.join(process.cwd(), "public", "social");
await mkdir(dir, { recursive: true });
const index = socialIndex(loadCalls(), loadEvents(), loadPundits());
await writeFile(path.join(dir, "cards.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(
  `social index: ${index.events.length} events, ${index.takes.length} takes, ${index.pundits.length} pundits`
);
```

- [ ] **Step 2: Run it and eyeball the output**

Run: `npx tsx scripts/build-social-index.ts`
Expected: the count line; `public/social/cards.json` exists, starts with `{ "generatedAt"`, and every `ogCard` URL begins `https://pundits.pro/og/`.

- [ ] **Step 3: Wire the build and ignore the generated dir**

In `package.json`, change the two script lines and add one:

```json
"predev": "tsx scripts/render-og.tsx && tsx scripts/build-social-index.ts",
"build": "tsx scripts/render-og.tsx && tsx scripts/build-social-index.ts && next build",
"social:index": "tsx scripts/build-social-index.ts",
```

Append to `.gitignore` (below the `public/og/...` lines):

```
public/social/
```

- [ ] **Step 4: Add the verifier checks**

In `scripts/required-routes.mjs`, append to `STATIC_ONLY_FILES`:

```js
  "social/cards.json",
```

At the end of `scripts/verify-static.mjs`, append:

```js
const socialCards = JSON.parse(
  await readFile(path.join(out, "social/cards.json"), "utf8")
);
assert(socialCards.site === "https://pundits.pro", "social index must carry the site origin");
assert(Array.isArray(socialCards.takes) && socialCards.takes.length > 0, "social index must list takes");
assert(Array.isArray(socialCards.events) && socialCards.events.length > 0, "social index must list events");
for (const take of socialCards.takes) {
  const rel = take.ogCard.replace("https://pundits.pro/", "");
  const info = await stat(path.join(out, rel));
  assert(info.size > 0, `social index points at missing card ${rel}`);
}
```

(`readFile`, `stat`, `path`, `out`, and `assert` are already in scope at the top of the file.)

- [ ] **Step 5: Verify end to end**

Run: `npm run check`
Expected: tests pass, build succeeds, `verify:static` passes including the new social assertions.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-social-index.ts package.json .gitignore scripts/required-routes.mjs scripts/verify-static.mjs
git commit -m "feat(social): build cards.json index and verify it in static checks"
```

---

### Task 3: `docs/social/README.md` + `docs/social/voice.md`

**Files:**
- Create: `docs/social/README.md`
- Create: `docs/social/voice.md`

**Interfaces:**
- Consumes: spec (`docs/superpowers/specs/2026-08-29-social-engine-design.md`), research (`docs/social/research-2026-08-29.md`).
- Produces: the two docs `bots/poster.md` and `bots/reply.md` (Task 6) point at. Section names below are referenced by later tasks — keep them.

- [ ] **Step 1: Write `docs/social/README.md`**

Sections and content (expand bullets into short prose; keep rules verbatim):

- `# Social engine` — one paragraph: two Grok bots run @Pundits_ (Poster posts, Reply Guy replies); this directory is their playbook; the bots fetch instructions from raw GitHub at job start and `https://pundits.pro/social/cards.json` for what is postable. Bots are read-only (Global Constraints wording).
- `## The one-line voice` — blockquote: *A dry, obsessive scorekeeper who talks like a fan at the bar — Ringer sentences, Barstool tempo, Opta discipline.*
- `## Map` — table: `voice.md` (how we sound), `images.md` (the image tiers — the fix for off-brand images), `post-patterns.md` (the nine archetypes), `reply-guide.md` (Reply Guy targeting and caps), `schedule.md` (the weekly rhythm), `research-2026-08-29.md` (why — sourced evidence).
- `## The card index` — field reference for `cards.json` documenting exactly the Task 1 row types: `events[]` (slug, title, sport, kind, week, kickoff, kickoffDate, yesCents, noCents, awayTeam, homeTeam, settled, yesPundits, noPundits, pageUrl, ogCard, storyCard), `takes[]` (eventSlug, punditId, punditName, status pending|hit|miss, side, sideLabel, cents, claim, sourceDate, gradedAt, pageUrl, ogCard, storyCard), `pundits[]` (id, name, outlet, wins, losses, pending, pageUrl, ogCard, storyCard). Note: **bots compute time proximity ("tonight", "live") from `kickoff` at post time; the file bakes in no time-relative labels.** YES = away team wins on games.
- `## Hard guardrails` — the seven numbered guardrails from Global Constraints, verbatim, plus the image hard rule and the link rule.

- [ ] **Step 2: Write `docs/social/voice.md`**

Sections and content:

- `# Voice — The Receipts Guy` — the one-line voice blockquote, then a paragraph: personality creates attention, evidence earns trust (echo `docs/product/experience-principles.md` §3); the account's authentic stake is the ledger — it never pretends to watch games or have money down.
- `## Three inheritances` — three short subsections crediting the blend (link research doc): **Ringer sentences** (assert a specific, checkable claim instead of asking "thoughts?"; name the pundit in every post; scene-setting concrete detail first; self-aware about being a receipts machine); **Barstool tempo** (ride live moments fast — the graded receipt lands within the hour of settling; fan-at-the-bar rhythm; short declarative overstatements about takes and records that invite correction; self-deprecate when house leans miss); **Opta discipline** (number first; one comparison that creates stakes — a first, a streak, a worst-since, a rank; zero hedging; personality confined to a fixed dry closer).
- `## Two registers` — **Essay register** (analysis posts, 2–3 sentences, concrete detail first) vs **Live register** (games underway: fragments, caps allowed, one line). Never mix registers in one post.
- `## The closer` — the signature slot: at most one dry word or clause at the end ("Noted." / "The book remembers." / "Loyalty."). This is the ONLY place for flourish; if the joke wants to be longer, cut it.
- `## Sounds like us / not us` — table of at least six pairs. Use these (write them exactly, they are calibrated to real data shapes):
  - Us: "Finebaum took TCU at 61¢ Tuesday. Final: TCU 27, UNC 20. Hit. The book remembers." / Not us: "WOW Finebaum CALLED IT 🔥🔥 Who's the GOAT insider??"
  - Us: "Patterson says Heels. Finebaum says Frogs. Kalshi froze it 41–61. Somebody's going in the book." / Not us: "Who ya got?? UNC or TCU! Drop your picks below 👇"
  - Us: "4 — Herbstreit has taken the road team four straight weeks. Streak." / Not us: "Herbstreit is INSANE for this pick lmaooo"
  - Us: "Our Week 0 leans went 1-2. The receipt cuts both ways." / Not us: (deleting the loss, posting only wins)
  - Us: "He said it on the record at 18¢. That's a bold call, priced." / Not us: "LOCK OF THE CENTURY 🔒 hammer it"
  - Us: "The claim was 'TCU wins outright.' It did not." / Not us: "This clown has no idea what he's talking about"
- `## Never` — restate guardrails 2, 3, 4, 6 verbatim (the voice-relevant ones) and the pundit-wager rule.

- [ ] **Step 3: Commit**

```bash
git add docs/social/README.md docs/social/voice.md
git commit -m "docs(social): playbook overview and Receipts Guy voice guide"
```

---

### Task 4: `docs/social/images.md` + `docs/social/post-patterns.md`

**Files:**
- Create: `docs/social/images.md`
- Create: `docs/social/post-patterns.md`

**Interfaces:**
- Consumes: card URL shapes from Task 1 rows; voice sections from Task 3 (`## Two registers`, `## The closer`).
- Produces: tier names `Tier 1 — Receipts`, `Tier 2 — Editorial`, `Tier 3 — Text` and archetype names used verbatim by `schedule.md` (Task 5) and the bot files (Task 6).

- [ ] **Step 1: Write `docs/social/images.md`**

Sections and content:

- `# Images` — opening paragraph: the site pre-renders a branded card for every event, take, and pundit (1200×630 OG + 1080×1920 story); `cards.json` carries the exact URL for each. Generated imagery is allowed only inside the brand spec below. Then the image hard rule from Global Constraints, verbatim, bolded.
- `## Tier 1 — Receipts (mandatory)` — any post about a specific pundit, pick, event, or result attaches the pre-rendered card from `cards.json` (`ogCard` for feed posts, `storyCard` for vertical formats). Post the image natively; the `pageUrl` goes in the first self-reply, never the post body. If attaching fails, fall back to a link post (X renders the OG card) and note the failure in the run summary.
- `## Tier 2 — Editorial (fenced creativity)` — allowed only for posts about no specific pundit/pick/result (week hype, discussion starters, polls). Brand spec, stated as hard requirements: ground `#0a0a0a`, accent `#39ff14`, off-white text `#f5f5f5`, condensed bold uppercase headline type (Oswald-like), dark and text-light, generous margins; **no human faces or likenesses, no team logos, no numbers of any kind, no screenshot look-alikes, no betting slips.** Then two ready prompt templates with slots, e.g.:
  - *"Minimal dark sports graphic, matte near-black background (#0a0a0a), a single bold condensed uppercase headline in off-white reading '{SHORT LINE, MAX 6 WORDS}', one thin neon-green (#39ff14) underline accent, subtle film grain, no people, no logos, no numbers, no small text."*
  - *"Dark editorial poster, near-black (#0a0a0a), abstract geometric goal-line/field texture in charcoal (#141414), condensed uppercase headline '{SHORT LINE}' in off-white, one neon-green (#39ff14) chevron accent, no people, no logos, no numbers."*
- `## Tier 3 — Text` — default for replies and conversational posts; attach a Tier-1 card only when it directly answers the thread.
- `## Decision rule` — three lines: About a real pick/pundit/event/result → Tier 1. About the vibe of the week → Tier 2 or no image. A reply → Tier 3.

- [ ] **Step 2: Write `docs/social/post-patterns.md`**

`# Post patterns` intro: nine archetypes; each names its image tier and register; examples are calibration, not scripts — compose freshly every time, per `voice.md`. Then one `##` section per archetype, each with **When** / **Shape** / **Image** / **Example** (write the examples exactly as below; mark them "calibration example — never repost verbatim"):

1. `## The Receipt` — When: a mapped take grades (status flips to hit/miss in `cards.json`). Shape: what they said → frozen cents → final score → one-word verdict + closer. Evenly for hits AND misses (FCT rule: the ledger, not a vendetta). Image: Tier 1 take card. Example: *"Finebaum took TCU at 61¢ on Tuesday. Final: TCU 27, UNC 20. Hit. The book remembers."*
2. `## The Freeze` — When: a new hard pick lands (new take row, status pending). Shape: quote-lede (the most arguable short phrase of `claim` in quotes) → pundit named → event + frozen cents. Image: Tier 1 take card. Example: *"'Give me the Heels.' Chip Patterson is on North Carolina at 41¢. It's in the book."*
3. `## The Number` — When: the ledger yields a stat with stakes (streak, first, worst-since, rank) — computed only from `cards.json` records, never invented. Shape: Opta anatomy — "N — fact with stakes. Closer." Image: Tier 1 pundit card, or none. Example: *"3 — Finebaum is 3-0 on ranked road teams this season. Best lane in the book."*
4. `## The Disagreement` — When: an event has named pundits on both sides (`yesPundits` and `noPundits` both non-empty). Shape: X says away, Y says home, frozen price, the stake ("somebody's going in the book"). Image: Tier 1 event card. Example: *"Patterson says Heels. Finebaum says Frogs. Kalshi froze it 41–61. Somebody's going in the book."*
5. `## The Slate` — When: morning of a game day (compute from `kickoff` at post time). Shape: how many tracked picks resolve today + the marquee disagreement. Image: Tier 1 event card of the marquee game. Example: *"9 tracked picks settle today. The loudest: Patterson and Finebaum on opposite sides of UNC–TCU at 41–61."*
6. `## The Ledger Move` — When: after a graded slate reshuffles records. Shape: the number is the headline (who leads, who slid). Image: Tier 1 pundit card of the mover. Example: *"New leader in the book: Patterson, 5-1 on the season. Finebaum drops to 3-3. Standings don't argue."*
7. `## Live register` — When: games underway (from `kickoff`; only while genuinely in-window). Shape: fragments; the pending pick + the score situation, no outcome claims before settle. Image: none or Tier 1. Example: *"Finebaum's TCU lean, 61¢ frozen. 21–20, 4th quarter. The book is watching."*
8. `## The Self-Grade` — When: the site's own week-leans grade (see `docs/week1-leans.md` lineage). Shape: our record first, dry. Image: Tier 1 or none. Example: *"Our Week 0 leans went 1-2. The receipt cuts both ways."*
9. `## The Harvest` — When: 1–2× weekly, off game windows. Shape: prompt-shaped observation about takes culture (never a bare question); feature the best replies later by quoting them with credit. Image: Tier 2 or none. Example: *"Every fanbase has one pundit they refuse to forgive. The book just writes down why."*

Close with `## Selection rule` — pick the archetype the moment calls for; if two fit, prefer the one with a Tier-1 card; never post the same archetype twice in a row; never exceed the day's budget in `schedule.md`.

- [ ] **Step 3: Commit**

```bash
git add docs/social/images.md docs/social/post-patterns.md
git commit -m "docs(social): image tier system and the nine post archetypes"
```

---

### Task 5: `docs/social/reply-guide.md` + `docs/social/schedule.md`

**Files:**
- Create: `docs/social/reply-guide.md`
- Create: `docs/social/schedule.md`

**Interfaces:**
- Consumes: archetype and tier names from Task 4 (verbatim); voice registers from Task 3.
- Produces: the cadence and cap numbers the bot files (Task 6) restate.

- [ ] **Step 1: Write `docs/social/reply-guide.md`**

Sections and content:

- `# Reply guide` — mission: Reply Guy exists to add receipts to live sports debates, not to promote. Every reply must add a fact from pundits.pro (a record, a graded pick, a frozen price). If there is no receipt to add, do not reply.
- `## Targets, in order` — 1) posts BY tracked pundits about their own picks (confirm the pick is in `cards.json` before engaging); 2) high-traction debate threads about games we track; 3) "who actually called it / who should I trust" questions. Skip: gambling-loss complaints, beefs between individuals, politics-adjacent threads, anything about a person rather than a take.
- `## The shape of a reply` — text-first (Tier 3); lead with the fact; ≤2 sentences; attach a Tier-1 card only when it directly answers the thread; the site link only if someone asks where the data lives. Never open with "Actually".
- `## Hard caps` — max 15 replies/day off game days, 25 on game days; max 1 reply per thread (one exchange — if they respond, one follow-up maximum, then disengage); never reply twice to the same account in a day; no replies between 1am–7am ET.
- `## Disengage immediately when` — the thread turns hostile or personal; the counterparty is an ordinary fan arguing in good faith and just disagrees; anyone asks the account to stop; the topic drifts off sports. Silence is always an acceptable outcome.
- `## Never` — guardrails 1, 2, 3, 5 from Global Constraints, verbatim.
- `## Calibration examples` — Good: *"For the record: Finebaum's on TCU at 61¢, on the record since Tuesday. It's in the book either way."* Good: *"He's 4-1 on SEC unders this season — the one lane where he's actually sharp. Receipts on the profile."* Bad: *"Wrong. Check pundits.pro."* Bad: *"This aged badly lol"* (dunking, no data).

- [ ] **Step 2: Write `docs/social/schedule.md`**

Sections and content:

- `# Weekly schedule` — intro: keyed to the CFB/NFL calendar; Poster computes "today" from `kickoff` fields in `cards.json` at run time; all times ET. Cards refresh on deploy — the RUNBOOK already requires at least daily deploys on game days; if `generatedAt` in `cards.json` is older than 24h on a game day, prefer archetypes that don't depend on freshness (The Number, The Harvest) and avoid The Slate.
- `## The week` — table with columns Day / Poster slots / Reply Guy. Content:
  - Tue: 1–2 posts — The Freeze as picks land; The Number. Reply sweep (15 cap).
  - Wed: 2 posts — The Disagreement (best both-sides event); The Freeze. Reply sweep.
  - Thu: 2–3 posts — The Slate (if CFB tonight), Live register in window, The Receipt same night. Game-day sweep (25 cap).
  - Fri: 2 posts — weekend Slate preview, The Freeze / Bold-call Number (long-cents pending takes). Reply sweep.
  - Sat: 3–5 posts — The Slate (morning), Live register, The Receipt as games settle, night Ledger Move. Heavy sweep (25 cap).
  - Sun: 3–5 posts — NFL mirror of Saturday. Heavy sweep.
  - Mon: 2–3 posts — The Ledger Move, The Self-Grade, MNF Slate + same-night Receipt. Recap sweep.
- `## Budgets` — Poster: never more than 6 posts/day, never two identical archetypes in a row, every post body link-free (link in first self-reply). Reply Guy caps live in `reply-guide.md`.
- `## Dead air rule` — if `cards.json` offers nothing new (no pending takes resolving, no new freezes), post nothing. Silence beats filler; empty is better than false (`docs/product/experience-principles.md` §4).

- [ ] **Step 3: Commit**

```bash
git add docs/social/reply-guide.md docs/social/schedule.md
git commit -m "docs(social): reply guide with hard caps and the weekly schedule"
```

---

### Task 6: Bot instruction files + `bots/README.md` wiring

**Files:**
- Create: `bots/poster.md`
- Create: `bots/reply.md`
- Modify: `bots/README.md` (bot table ~line 5-13, standing instructions section ~line 50-110, house rules ~line 114-128)

**Interfaces:**
- Consumes: everything in `docs/social/` (Tasks 3–5) by relative reference; `cards.json` fields (Task 1).
- Produces: the paste-into-Grok standing instructions (verbatim blocks below).

- [ ] **Step 1: Write `bots/poster.md`**

Structure (mirror the register of `bots/scout.md`/`bots/grader.md` — imperative, short):

- `# Poster` — job in one line: run @Pundits_ new posts from the playbook; you write posts, nothing else.
- `## Every job, in order` — 1) fetch `docs/social/schedule.md` → today's slots; 2) fetch `https://pundits.pro/social/cards.json` → what's postable (compute time proximity from `kickoff` yourself — the file bakes in no "tonight"); 3) pick archetypes per `docs/social/post-patterns.md`; 4) compose per `docs/social/voice.md`; 5) images per `docs/social/images.md` — attach `ogCard`/`storyCard` URLs, Tier 2 only inside the brand prompts; 6) post; put each post's `pageUrl` in its first self-reply.
- `## Hard rules` — read-only (never `data/`, never `docs/`); every number and quote must exist in `cards.json` or on the page it links; the seven guardrails + image hard rule + link rule from the spec, verbatim; dead-air rule (nothing new → no post); daily budget from `schedule.md`.
- `## Report` — end each run by listing (in the job's own chat/output, NOT the repo): posts made (archetype, event/pundit, card used), skips and why, any attach failures.

- [ ] **Step 2: Write `bots/reply.md`**

Same structure: job line (reply on X only; never start posts); every-job order (fetch `docs/social/reply-guide.md`, then `docs/social/voice.md`, then `cards.json`; hunt targets in the guide's priority order; every reply adds a fact; text-first per Tier 3); hard rules (read-only; caps 15/25 and one-exchange verbatim; disengage list; guardrails 1, 2, 3, 5 verbatim; never tweet original posts — that is Poster's job, mirroring the Scout/X-Scout separation); report format (replies made with thread links, targets skipped and why).

- [ ] **Step 3: Wire `bots/README.md`**

Three edits:

1. Add rows to the bot table:
```
| Poster | `bots/poster.md` | Run @Pundits_ new posts from `docs/social/`. Read-only. Never `data/`, never `docs/`. |
| Reply Guy | `bots/reply.md` | Add receipts to live X debates. Replies only. Read-only. |
```
2. Add standing instructions after the Audit block, verbatim:

````
**Poster**

```
You are the Pundits Poster. You run the @Pundits_ account's new posts.
At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/poster.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/social/schedule.md
Then fetch https://pundits.pro/social/cards.json for what is postable right now.
Never invent a quote, stat, or price. Never generate an image of a real person. Attach the pre-rendered cards from cards.json. The link goes in the first self-reply, never the post body. Never touch data/ or docs/. Nothing new in cards.json means no post.
```

**Reply Guy**

```
You are the Pundits Reply Guy. You reply on X only. You never start new posts.
At the start of every job, fetch and follow in order:
https://raw.githubusercontent.com/bairdhall25/Pundits/main/bots/reply.md
https://raw.githubusercontent.com/bairdhall25/Pundits/main/docs/social/voice.md
Then fetch https://pundits.pro/social/cards.json for receipts.
Every reply adds a fact from pundits.pro. Critique the pick, never the person. Text first; attach a card only when it answers the thread. One exchange per thread, then disengage. Never touch data/ or docs/.
```
````

3. Append house rule 11 to the numbered list:
```
11. **Poster and Reply Guy never write to the repo.** Not `data/`, not `docs/`. They read the playbook (`docs/social/`) and `https://pundits.pro/social/cards.json`, and act on X only. Every number they post must be on pundits.pro at post time. They never repost third-party media and never AI-generate a real person's likeness.
```

Also update the separation sentence at `bots/README.md:14` to append: "Poster does not reply. Reply Guy does not post."

- [ ] **Step 4: Commit**

```bash
git add bots/poster.md bots/reply.md bots/README.md
git commit -m "docs(bots): Poster and Reply Guy instruction files and standing blurbs"
```

---

### Task 7: Final verification + index pointer

**Files:**
- Modify: `docs/README.md` (add a `docs/social/` line to whatever index structure exists there)

- [ ] **Step 1: Add the pointer**

Read `docs/README.md`; add one line in its directory listing style: `docs/social/` — the X marketing playbook the Grok Poster and Reply Guy fetch; see `docs/social/README.md`.

- [ ] **Step 2: Full check**

Run: `npm run check`
Expected: tests + build + verify:static all pass (this re-proves Tasks 1–2 against the docs landing alongside them).

- [ ] **Step 3: Verify the docs cross-reference cleanly**

Run: `grep -rn "docs/social/" bots/ docs/social/ | grep -v research`
Expected: every referenced filename exists (`README.md`, `voice.md`, `images.md`, `post-patterns.md`, `reply-guide.md`, `schedule.md`); no dangling references.

- [ ] **Step 4: Commit**

```bash
git add docs/README.md
git commit -m "docs: index the social playbook"
```

---

## Deployment note (manual, after merge to main)

The bots read raw.githubusercontent.com/**main** — the system is live only once these commits are on `origin/main` AND a deploy has published `social/cards.json` (`npm run deploy`). Then paste the two standing instructions from `bots/README.md` into the Grok bots. Ops item for Baird (outside repo): put @Pundits_ on X Premium (see research: free-account reach collapse).
