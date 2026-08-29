# Pundits V1 product handoff for Grok

> Status: Historical handoff. It remains useful design evidence, but current product decisions and agent rules live in `docs/product/` and `AGENTS.md`.

Date: 2026-08-27  
Audience: Grok Build / implementation agent  
Status: Historical; durable decisions were consolidated into `docs/product/`

## Assignment

Make the current Pundits app easier for college football and NFL fans to scan while preserving the market hook, honest empty states, shipped URLs, SEO story system, season identity, capture workflow, and static architecture.

This is a UI hierarchy and information-architecture pass. It is **not** a capture run, data cleanup, routing migration, logo-import job, backend project, or Grok Bot rewrite.

Before editing code:

1. Read this document and every item in Required reading.
2. Inspect the current working tree and preserve existing user changes.
3. Read the live `data/*.json` files and run the current tests/build; do not trust counts copied into an older brief.
4. Return the required seven-part plan below.
5. Wait for approval. Do not start implementation in the first response.

## Product in one sentence

Pundits shows which teams credible sports voices are picking, uses a frozen Kalshi price to make each take concrete, and lets curious fans inspect the quote, source, methodology, and eventual result.

## Non-negotiable product and architecture facts

- The app is a static Next.js export. JSON in this repo is the record. There is no backend.
- Kalshi is the ruler. The product models a hypothetical $100 at the frozen price; it does not claim the pundit placed a bet.
- Cents are part of the first-time hook and **stay visible on scan cards**. YES/NO jargon can be disclosed later; the frozen price cannot be buried behind `Market details`.
- On game events, `YES = away team wins` and `NO = home team wins`. This mapping must not change.
- Futures stay on futures slugs. Never stretch a future/title/playoff take onto a game.
- Empty sides are valid product truth. Fake, weak, ambiguous, or off-roster picks are not acceptable substitutes.
- The green/black broadcast identity stays. This is not a rebrand.
- Deployment is Cloudflare Pages via Wrangler to the existing project `pundits`. `GITHUB_PAGES` must remain unset on that host.

## Season and slug contract: do not redesign

Event slugs use `{stem}-{season}`. `season` means the year the regular season starts—not the kickoff calendar year and not the year printed in a Kalshi champion contract.

- The Super Bowl of the 2026 NFL season is `/picks/rams-sb-2026/`, even when Kalshi calls it `2027 NFL Champion`.
- Display that season span as `2026–27`.
- A January 2027 playoff, bowl, CFP, or Super Bowl event from the 2026 season remains on `-2026`.
- The next season's rematch is a new slug, such as `clemson-at-lsu-2027`.
- Bare pre-season URLs already 301 through `public/_redirects`.

Do not propose another slug scheme, remove the season suffix, repurpose a published slug, or churn the existing redirects.

## Shipped URL and SEO contract: protect it

Navigation labels and grouping may change, but these routes stay:

- `/stories/`
- `/picks/{eventSlug}/`
- `/picks/{eventSlug}/{punditId}/`
- `/ncaaf/`
- `/nfl/`
- `/book/`
- `/leaderboard/`
- `/pundits/{id}/`

Specific rules:

- A nav label may change from `Stories` to `Takes`, but `/stories/` remains the index URL.
- `/picks/{eventSlug}/{punditId}/` is the crawlable pick-story SEO object.
- `lib/seo.ts` `pickStory()` and the web templates mint those stories from verified mapped calls. Bots do not write articles.
- Takes Feed and The Book are two views of the same captured objects. The Book may be nested or explained as `The Book — every tracked take`, but `/book/` remains live.
- `/ncaaf/` and `/nfl/` remain valid sport URLs even if sport becomes a local filter in the UI.
- Do not perform a routing migration merely to rename or regroup navigation.

## Primary product principle: depth without overload

The application supports three levels of engagement.

### 1. Scan

The default home/card experience emphasizes:

- both teams and the matchup;
- kickoff context;
- the frozen market price;
- pundit faces and who picked each team;
- a compact empty state on an unfilled side.

A scan card must not collapse into consensus-only copy. This is the intended information shape:

> Clemson — 24¢ — No verified pundit pick yet  
> LSU — Market: 78¢ — Pate + Finebaum  
> See why →

The price stays at scan because `pundit pick + real market price` is the product hook. Both teams stay at scan because an empty side is meaningful and honest.

Do not lead scan cards with source URLs, freeze-source dates, hypothetical-return calculations, long quotes, or repeated YES/NO labels.

### 2. Understand

Opening a matchup reveals:

- each pundit's team/side;
- a short quote or clearly identified stance;
- disagreement or the explicit absence of an opposing verified pick;
- plain-language market context.

This layer should still feel like a sports product, not financial software.

### 3. Verify

Power users can reach:

- full verbatim quotes;
- source links and dates;
- the frozen YES/NO mapping and prices;
- price source and freeze timestamp;
- hypothetical $100 methodology;
- grading/result history.

Use progressive disclosure such as `Market details` and `Sources`, plus the advanced Ledger/The Book view. Do not hide the scan-card cents while moving this deeper evidence.

The fan-facing priority is:

**Matchup and both sides → pundit picks/empty state → frozen price → explanation → evidence**

## UI work and capture work are separate

The UI implementation must render the data honestly; it does not fill coverage gaps.

### UI/Grok Build owns

- navigation and local-filter hierarchy;
- scan-card and detail-page hierarchy;
- compact, truthful empty-side presentation;
- result-lifecycle presentation for existing `pending`, `hit`, and `miss` states;
- accessibility, responsive behavior, and preservation of routes/SEO.

### Capture workflow owns

- finding more Week 1 picks;
- filling empty YES or NO sides;
- deciding whether a game has enough verified coverage for home;
- refreshing event prices when a mapped face changes;
- grading evidence and promotion into JSON under the established bot workflow.

The roles remain strict:

- Scout finds and verifies candidates but does not edit `data/*.json`.
- Grader proposes settled hit/miss results but does not edit `data/*.json`.
- Recap reads the ledger but does not edit `data/*.json`.
- Promote is the only bot that writes `data/*.json`, runs the publish checks, and publishes promoted changes.
- The web app, not the bots, templates pick stories.

Coverage goals such as both sides filled or 4–6 recognizable games per league are Scout/Promote editorial goals, not UI implementation gates. Grok must not invent symmetry, restage booked rows, or flip off-home events onto home.

Current capture constraints that must survive:

- Do not restage Finebaum on `unc-vs-tcu-2026`.
- Do not restage the already-booked morning eight.
- `ncsu-at-uva-2026` and `wisconsin-vs-nd-2026` stay off home until a verified roster lean exists.
- If coverage is thin, ship the empty state. **Do not mint a pick.**

## Three independent implementation slices

Plan and estimate these as independently shippable slices, not one waterfall. Coverage is not a fourth Grok slice.

### Slice A — Navigation and sport as a local filter

Goal: make the object model clearer without changing shipped URLs.

- Center the visible navigation on durable objects such as Picks, Takes, and Pundits.
- Keep `/stories/` as the Takes index even if its visible label changes.
- Keep `/ncaaf/` and `/nfl/` as working URLs while presenting sport consistently as a local filter where appropriate.
- Clarify Feed/Takes versus Ledger/The Book without deleting `/book/`.
- Preserve `/leaderboard/` and `/pundits/{id}/`; propose how the Pundits destination exposes the leaderboard and roster without inventing a routing migration.

This slice can ship without team logos, coverage changes, or result grading.

### Slice B — Card and detail hierarchy

Goal: make the primary experience sports-first while preserving the cents hook and both sides.

- Show both teams on game scan cards.
- Keep a compact frozen price visible with the relevant team.
- Show captured pundit faces/names on their team and a compact `No verified pundit pick yet` state on an empty side.
- Avoid consensus-only summaries that erase an empty opponent.
- Reduce repeated YES/NO jargon on scan; disclose exact mapping, source, date, methodology, full quotes, and hypothetical-return mechanics in detail.
- Preserve the existing event and pick-story links.

This slice can ship without logos. Do not redesign cards around assets that have not passed the logo approval gate.

### Slice C — Result lifecycle UI

Goal: complete the visual loop from pending pick to settled accountability without changing bot ownership.

- Render pending, hit, and miss states clearly.
- Preserve and continue to display the original frozen price after settlement.
- Show the event result and grading/updated context when the established data model provides it; identify any minimal model gap in the plan rather than inventing fields during the first response.
- Keep resolved calls visible in pick stories, event details, pundit records, and leaderboard behavior as appropriate.
- Do not make this work wait for team logos. Dublin/Week 0 grading is imminent.

Grader still proposes the result and Promote still writes JSON. This slice is the UI support for that lifecycle.

## Team logos: separate approval gate

The desired visual grammar remains:

- **Team logo = subject of the pick**
- **Pundit face = person making the pick**

Logos are not step 3 in a required implementation stack. The navigation, card hierarchy, detail disclosure, and result lifecycle may ship without them.

Before importing any logo or redesigning a card around logos, Grok must propose and receive approval for:

1. a stable team-ID model that is not keyed from mutable display names;
2. an official/licensed asset source and its usage constraints;
3. a consistent local file/metadata strategy;
4. a non-fabricated fallback for missing assets;
5. accessibility treatment that keeps team names visible.

Do not scrape ESPN. Do not fabricate, trace, approximate, or generate team marks. Do not mix inconsistent scraped sources. When adjacent visible text names the team, a decorative logo should use `alt=""` to avoid duplicate announcements.

## Technical-health snapshot

Do not hard-code this document's historical event, call, pundit, route, or test counts into the plan. At the start of the implementation pass:

1. read current `data/events.json`, `data/calls.json`, and `data/pundits.json`;
2. inspect the current working tree;
3. run `npm test`;
4. run `npm run build`;
5. report the observed baseline before proposing edits.

Do not edit JSON merely because coverage is thin. Any data mutation belongs to the established Scout/Grader/Promote flow.

## Deployment contract

- Production is `https://pundits.pro/` on Cloudflare Pages.
- Deploy through Wrangler to the existing Cloudflare Pages project `pundits`.
- Keep `GITHUB_PAGES` unset on Cloudflare so the app does not introduce the `/Pundits` base path.
- Preserve `public/_redirects` in the static output.
- After approved implementation, verify canonical URLs, redirects, `/stories/`, an event page, a pick story, `/ncaaf/`, `/nfl/`, `/book/`, `/leaderboard/`, and a pundit profile against the production-style static build.

## Explicit non-goals

Do not add these to V1:

- accounts or authentication;
- saved picks or personalization;
- comments or social features;
- betting buttons;
- live odds or automatic price refresh;
- a backend or database;
- notifications;
- additional sports;
- a visual rebrand;
- a new slug scheme or route migration;
- speculative editorial modules;
- fabricated quotes, picks, assets, records, or market data.

## Acceptance criteria

### Fan comprehension

- A first-time visitor sees both teams, captured picks, honest empty sides, and a compact frozen market price without needing to understand YES/NO terminology.
- The first screen feels like a sports product, not a trading terminal.
- The market hook remains visible on the card.

### Progressive disclosure

- Scan cards stay compact but never hide the frozen price or the existence of an empty side.
- Exact YES/NO semantics, sources, dates, methodology, calculations, and full quotes remain reachable.
- Material provenance is moved deeper, not removed.

### Navigation and SEO

- Global navigation presents a coherent object model.
- Sport behaves consistently as a local filter while `/ncaaf/` and `/nfl/` remain live.
- Stories may be labeled Takes, but `/stories/` and every existing pick-story URL remain intact.
- `/book/`, `/leaderboard/`, `/pundits/{id}/`, event URLs, season slugs, and 301s remain intact.
- Mobile navigation works at 320 px and 390 px.

### Honest states and lifecycle

- Empty sides are clear and compact, not suppressed or filled with weak data.
- Pending, hit, and miss states are understandable.
- Settled presentation preserves the original frozen price.
- UI work does not restage calls, mint stories, or change home eligibility.

### Team-logo gate

- No team images are imported before approval of the team-ID, source, licensing, fallback, and accessibility plan.
- The three UI slices remain viable without logos.

### Quality and deployment

- Existing data-integrity and season-slug rules remain intact.
- No unrelated user changes are overwritten.
- Tests and static build pass after approved implementation.
- Production-style verification keeps `GITHUB_PAGES` unset and preserves Cloudflare redirects/canonical paths.

## Required reading

- `docs/grok-v1-product-handoff-2026-08-27.md`
- `docs/audits/2026-08-27-navigation-and-team-identity/audit.md`
- `docs/feedback.md` — Logan's cents-on-card decision is binding
- `docs/RUNBOOK.md` — capture ownership and season-slug rule
- `bots/README.md` — bot ownership and pick-story flow
- `lib/types.ts` — `Event.season` comment
- `public/_redirects` — shipped bare-URL 301s
- `components/NavLinks.tsx` — current routes and active-state behavior
- `lib/seo.ts` — `pickStory()`, `mappedTakes()`, and story/card semantics
- `app/stories/page.tsx` — `/stories/` index
- `data/events.json`
- `data/calls.json`
- `data/pundits.json`
- `next.config.ts` and `lib/site.ts` — `GITHUB_PAGES` behavior
- `README.md` — live host and deployment target

## Requested first response from Grok

Do not start with code. Return exactly these seven parts:

1. A brief restatement of the intended fan experience, including cents and honest empty sides at scan.
2. Proposed navigation labels/grouping while preserving every shipped URL and SEO object.
3. Proposed scan-card and detail-page hierarchy, including what stays visible and what is progressively disclosed.
4. A separate, approval-gated team-logo proposal: stable team IDs, official/licensed source, fallback, and accessibility. Confirm that other slices can ship without it.
5. A phased plan for the three independent slices, with affected files and no capture/coverage work mixed in.
6. Risks and unresolved decisions, including result-model gaps, working-tree conflicts, season slugs, redirects, Cloudflare deployment, and what can ship independently.
7. Verification plan covering baseline counts/tests, responsive UI, stories/SEO routes, season-qualified URLs, 301s, result states, and a production-style Cloudflare build with `GITHUB_PAGES` unset.

End the response by confirming:

> If coverage is thin, ship the empty state. Do not mint a pick.

Wait for approval before editing code, JSON, bots, tests, routes, redirects, or assets.
