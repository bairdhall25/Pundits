# Pundits — The Weekly Recap (templated data journalism)

Date: 2026-08-29
Status: Approved design. No implementation yet.
Related: `docs/ROADMAP.md` Phase 1 ("Publish a recap within 24 hours of settlement"), `docs/product/decision-log.md` open question on retention, `docs/social/voice.md`.

## Problem

Pundits collects something nobody else publishes: a graded ledger of named pundits' picks against the frozen market price they were made at. That data currently terminates in browsable surfaces — the board, the leaderboard, The Book — and never becomes an *article*: a dated, linkable, shareable page that says what happened this week and who was wrong about it.

The roadmap already promises a recap and never defines a surface for one. The decision log lists "email recap" and "habit around weekly archives" as candidate retention mechanisms with no owner. Meanwhile the social engine's Poster has event cards, take cards, and pundit cards to post, but nothing to post the morning after a slate settles.

The constraint that shapes everything below: **Pundits is a one-person operation running on AI assistance for the foreseeable future.** Any content type that requires weekly writing will not survive the season. The recap must be a build artifact, not a writing assignment.

## Approved decisions (2026-08-29)

1. **Templated and automatic.** Every recap renders from `data/calls.json` and `data/events.json` at build time. No LLM-written prose, no weekly authoring step. The operator's only action remains what it already is: grade, `npm run check`, deploy.
2. **One post per sport per week.** NFL and college football get separate pages, because "NFL Week 1 expert picks results" and the CFB equivalent are separate search intents and separate audiences.
3. **Live pages that fill in as grading proceeds.** A week's recap publishes with its first graded take and updates on each rebuild, showing an explicit "N of M settled" state. It does not wait for stragglers.
4. **Results + records + callouts.** Graded takes at their frozen prices, cumulative records, and derived callouts (biggest miss, best hit, consensus outcome). Everything derivable from data already in the repo.
5. **No new routes.** The week pages already exist and are already indexed — this upgrades them rather than launching a parallel surface.

## What already exists

This is an upgrade, not a new subsystem. Before writing anything, note what is already shipped:

| Already built | Where |
|---|---|
| `/nfl/{season}/week-{n}/` and `/ncaaf/{season}/week-{n}/` routes | `app/nfl/[season]/[week]/page.tsx`, `app/ncaaf/[season]/[week]/page.tsx` |
| Shared week page component with graded lede, "Who was right" list, event board, prev/next nav | `components/WeekArchive.tsx` |
| Week enumeration, per-week game lookup, hit/miss/pending tally, graded result list | `lib/archive.ts` (`archiveWeeks`, `gamesForWeek`, `weekRecord`, `weekResults`) |
| Week pages in the sitemap with `lastModified` already derived from `gradedAt` | `app/sitemap.ts` |
| Graded-record page metadata and descriptions | `generateMetadata` in both week pages |

What is missing is everything that makes those pages read like a recap and travel like one: the derived callouts, the cumulative records, prose in the house voice, article structured data, and distribution through RSS, the news sitemap, and the social card index.

## Data layer — `lib/archive.ts` additions

Two pure functions over existing data. No schema changes to `calls.json` or `events.json`.

### `weekCallouts(games, calls, pundits): WeekCallouts`

```ts
export type CalloutTake = {
  pundit: Pundit;
  event: Event;
  pickLabel: string;   // reuses the WeekResult "X over Y" construction
  cents: number;
  status: "hit" | "miss";
};

export type ConsensusNote = {
  event: Event;
  pickLabel: string;
  count: number;              // pundits on that side
  outcome: "swept" | "sunk";
};

export type WeekCallouts = {
  biggestMiss: CalloutTake | null;
  bestHit: CalloutTake | null;
  consensus: ConsensusNote | null;
};
```

Rules, all deterministic:

- **`biggestMiss`** — among the week's graded misses with a non-null price, the one at the highest frozen cents. The pundit who was most confidently wrong by the market's reckoning. Ties break on pundit name ascending.
- **`bestHit`** — among the week's graded hits with a non-null price, the one at the lowest frozen cents. The best call nobody else believed. Ties break on pundit name ascending.
- **`consensus`** — across the week's graded takes, group by event and side; take the group with the most distinct pundits, requiring at least three. Because every take in a group shares one side of one settled event, the group is uniformly hit or uniformly miss: `swept` when those takes hit, `sunk` when they missed. Ties break on event slug ascending, then `yes` before `no`. Null when no group reaches three pundits.
- **Suppression rule:** when the week has fewer than two graded takes, all three fields are null. A single graded take must not be announced as both the best hit and the biggest miss of the week.
- Any field whose supporting data is missing is null, and the template omits its clause entirely rather than rendering a hedge.

### `seasonRecordsAfterWeek(sport, season, week, events, calls, pundits): SeasonRecordRow[]`

```ts
export type SeasonRecordRow = {
  pundit: Pundit;
  wins: number;        // cumulative, this sport, weeks 0..week
  losses: number;
  weekWins: number;    // this week only
  weekLosses: number;
};
```

- Counts graded takes on **games** of the given sport and season with `week <= week`. Futures carry no week and are excluded; the leaderboard remains the home of the all-events record.
- **Sport-scoped by design.** A pundit who covers both leagues carries a separate NFL and CFB record here. The page is an NFL page; showing a blended record on it would be dishonest about what the reader is looking at, and it would make the two weekly posts near-duplicates.
- Includes only pundits with at least one graded take in the window. Sorted by wins descending, then losses ascending, then name ascending.

CFB Week 0 is a real week (`week: 0` exists in the data today) and must be handled everywhere — `parseWeekParam` already supports it.

## Templated prose — `lib/recap.ts` (new)

A pure module that turns a record plus callouts into two or three sentences in the register defined by `docs/social/voice.md`: number first, pundits named, zero hedging, at most one dry closer, and never a number that is not already in the data.

```ts
export type WeekTally = { hits: number; misses: number; pending: number };

export type RecapInput = {
  sport: Sport;
  season: number;
  week: number;
  gameCount: number;
  tally: WeekTally;
  callouts: WeekCallouts;
};

export type RecapState = "pending" | "partial" | "complete";

export function recapState(tally: WeekTally): RecapState;
export function weekRecapHeadline(input: RecapInput): string;
export function weekRecapLede(input: RecapInput): string;
```

`WeekTally` is the existing return shape of `archive.weekRecord`, given a name so both modules can refer to it; `weekRecord`'s signature is updated to return `WeekTally` with no behavior change.

- **`pending`** (no graded takes) renders today's existing lede unchanged — game count and live pick count. This state is already correct and is not being redesigned.
- **`partial`** (some graded, some pending) leads with the running record and names the settled count: the reader must never mistake a running tally for a final one.
- **`complete`** (nothing pending) leads with the final record and carries the callout clauses.

**Clause builders.** Each callout has one clause builder that renders only when its data is present:

- *best hit* — names the pundit, the pick, and the frozen price, framed as a call the market disagreed with.
- *biggest miss* — names the pundit, the pick, and the frozen price, framed as confidence that did not survive. Critiques the pick, never the person (guardrail 2).
- *consensus* — names the count, the pick, and the outcome.

**Deterministic pattern selection.** A small bank of sentence patterns per state, chosen by `hash(sport + season + week) % patterns.length` using a documented FNV-1a-style hash implemented in the module. This keeps adjacent weeks from reading identically while making every rebuild byte-stable for the same input — a requirement, since the static export is diffed and redeployed routinely.

**Closers** come from a fixed rotation drawn from the voice guide's signature slot ("The book remembers." / "Noted." / "Priced."), selected by the same hash, at most one per lede, and only in the `complete` state.

**Hard constraints, enforced by test rather than by care:**

- Every numeral in the rendered lede must appear in the input record or callouts. The test asserts this by extracting numerals from the output and checking membership.
- The banned-vocabulary list from guardrail 3 ("lock", "can't lose", "free money", "guaranteed") must not appear in any rendered output for any fixture.
- No output may imply a pundit placed a wager or had money down (guardrail 6).

## Page — `components/WeekArchive.tsx`

Both sport routes already share this component, so it is upgraded once. Section order:

1. Eyebrow, H1, breadcrumbs — unchanged.
2. **Recap lede** — replaces the current inline lede with `weekRecapLede`.
3. **Settled status** — a visible "N of M settled" indicator, rendered only in the `partial` state.
4. **Callout block** — Biggest miss / Best hit / consensus line, rendered only when `weekCallouts` returns something. Each callout links to the take page, so the claim and source are one click away.
5. **"Who was right"** — the existing graded result list, unchanged.
6. **Season records after Week N** — new section from `seasonRecordsAfterWeek`, labeled with the sport ("NFL record after Week 1"), linking each pundit to their profile.
7. **Event board** and **week nav** — unchanged.

**Structured data.** In addition to the existing `BreadcrumbList`, graded weeks emit `NewsArticle` JSON-LD via a new `weekRecapJsonLd` in `lib/seo.ts` — `datePublished` from the earliest `gradedAt` in the week, `dateModified` from the latest. This is what makes Google treat the page as a dated article rather than a static archive listing. Ungraded weeks emit no article markup, because nothing has been reported yet.

## Distribution

The recap is worth building only if it travels. Four wiring changes, all mechanical:

**RSS — `lib/feeds.ts`.** `rssFeed` currently emits take items only. Add one item per archive week with at least one graded take: title from `weekRecapHeadline`, link to the week path, `pubDate` from the week's latest `gradedAt`, description from the lede's first sentence. Merge with take items, sort by date descending, keep the existing cap of 50.

**News sitemap — `lib/feeds.ts`.** `recentNewsTakes` selects takes inside a two-day window off the newest source date. Apply the same window to recap URLs by latest `gradedAt`, so a freshly graded week is eligible for Google News alongside the takes.

**Social card index — `lib/social.ts`.** Add a fourth top-level array to `cards.json`:

```ts
export type SocialWeekRow = {
  sport: Sport;
  season: number;
  week: number;
  state: RecapState;
  hits: number;
  misses: number;
  pending: number;
  headline: string;
  lede: string;
  biggestMiss: { punditName: string; pickLabel: string; cents: number } | null;
  bestHit: { punditName: string; pickLabel: string; cents: number } | null;
  pageUrl: string;
  ogCard: string;
};
```

Only weeks with at least one graded take appear. The Poster reads this to post the recap link the morning after a slate settles, with the numbers pre-computed so it never has to derive one itself.

**Playbook — `docs/social/`.** Add a tenth post archetype, **The Week**, to `post-patterns.md`: the settled-week recap, Tier 1 image, essay register, links the week page. Update the archetype count in `docs/social/README.md` (currently "The nine archetypes") and document the new `weeks[]` array in that file's card-index section. Add the recap slot to `schedule.md` — Sunday night for CFB, Monday morning for NFL, following the existing cadence.

**OG card (stretch — first item to cut).** A `weekOgCard` variant in `lib/og.ts` and `scripts/render-og.tsx` at `/og/weeks/{sport}-{season}-week-{n}.png` showing the sport, week, and record. Without it the recap link shares with the site default card, which is acceptable but weaker. If scope needs trimming, this goes and everything else ships.

## Testing

Repo convention holds: assert behavior against fixtures, never snapshot live data.

- **`lib/archive.test.ts`** (extend) — `weekCallouts` across an ungraded week, a single-graded-take week (all callouts null), all-hits, all-misses, a price tie, a three-pundit consensus that swept, one that sank, and a week with no consensus. `seasonRecordsAfterWeek` for cumulative math across weeks, sport scoping, futures exclusion, and pundits with no graded takes.
- **`lib/recap.test.ts`** (new) — state transitions; determinism (same input rendered twice is identical, and two adjacent weeks differ); clause omission when callouts are null; the numeral-provenance assertion; the banned-vocabulary assertion.
- **`lib/feeds.test.ts`** (extend) — a recap item appears once a week has a graded take and is absent while the week is fully pending.
- **`lib/social.test.ts`** (extend) — `weeks[]` shape and the graded-only filter.
- **`npm run check`** must stay green end to end, including the existing route, canonical, and sitemap verification.

## Out of scope (YAGNI)

- A `/recaps` index or any top-level recap route — the sport hubs already list weeks.
- Per-day posts (separate Saturday and Sunday pages).
- LLM- or human-written prose in the recap body.
- Email recap delivery. The KV early-access list exists; wiring a send is a separate decision with its own compliance surface.
- Leaderboard movement deltas — that is the leaderboard's job, and duplicating it invites the two surfaces to disagree.
- Spread/ATS data, which the ledger does not carry.
- Recaps for futures. Futures have no week and settle on their own clock.

## Success criteria

1. Grading a slate and running the normal deploy produces a recap page per sport per week with zero words written by hand.
2. Every number rendered on a recap page traces to `calls.json` or `events.json`, enforced by test rather than by review.
3. `cards.json` carries `weeks[]`, and the Poster has a documented archetype for posting it.
4. A graded week appears in the RSS feed and the news sitemap within the same build.
5. The operator's weekly routine gains no new steps.

## Near-term reality check

As of this date every call in `data/calls.json` is `pending` and no event is settled. The first recap therefore renders in the `pending` state — which is today's existing page, unchanged — and becomes a real post only after the first CFB Week 0/1 and NFL Week 1 grading pass. The implementation must be verified against fixtures rather than against live data, and the first live recap should be reviewed by eye before the Poster is pointed at it.
