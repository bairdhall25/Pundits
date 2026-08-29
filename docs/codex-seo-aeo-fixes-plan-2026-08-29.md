# Codex guide: SEO/AEO fixes from the 2026-08-29 audit

Status: Active plan. Recheck the implementation before each task and mark this historical when the listed work ships.

Source of truth: `docs/audits/2026-08-29-seo-aeo/audit.md`. This guide turns
its findings into ordered tasks. Task 0 is browser/dashboard work (Baird's
accounts, via the browser); Tasks 1–6 are code.

## Ground rules (non-negotiable)

- TDD for every lib change: failing test first, in the matching `lib/*.test.ts`.
- `npm run check` green before any commit (tests + build + verify:static).
- URL permanence: never remove or rename a shipped URL. `verify:static`
  enforces `docs/seo/permalinks.txt`; when it appends new URLs, commit the
  ledger with the change that created them.
- `scripts/verify-static.mjs` headline regexes accept `pick(s|ed)` — keep any
  new assertions tense-proof the same way; graded data flips tenses.
- Multiple agents share this tree. Commit finished work promptly (tonight a
  staged-but-uncommitted feature got swept into someone else's commit).
  Name your stashes if you must stash.
- Data files are append-only (`docs/RUNBOOK.md` → "URL permanence").

## Task 0 — dashboard work (do first; highest AEO leverage)

### 0a. Cloudflare: set the AI-crawler dial deliberately

CORRECTED 2026-08-29 after research — see
`docs/audits/2026-08-29-seo-aeo/aeo-deep-dive.md`. The managed block hits
only **training** crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended,
Applebot-Extended, Amazonbot, Bytespider, meta-externalagent). The
**retrieval agents that produce citations** — OAI-SearchBot, ChatGPT-User,
Claude-SearchBot, Claude-User, PerplexityBot — are ALREADY ALLOWED, and
AI Overviews use ordinary Googlebot. Citations work today. This task is a
deliberate posture choice, not an emergency.

In the Cloudflare dashboard → **pundits.pro** zone, find the AI crawler
controls (AI Crawl Control / Security → Bots / managed robots.txt Content
Signals, depending on dashboard version):

1. **Verify, don't assume**: confirm the retrieval agents above are not
   blocked anywhere (robots.txt, WAF/bot rules).
2. **Training posture — separate decision**: do not unblock CCBot, GPTBot,
   ClaudeBot, or Google-Extended merely to improve citations. Vendor
   documentation separates these from search/retrieval agents. Set
   `search=yes` and `ai-input=yes` for citation/grounding access; retaining
   `ai-train=no` is coherent. Any training-access change requires an explicit
   rights/distribution decision from Baird.
3. Verify afterwards: `curl -s https://pundits.pro/robots.txt` reflects the
   chosen state (Cloudflare may cache it briefly — recheck in a few
   minutes before concluding failure).

### 0b. Google Search Console

1. https://search.google.com/search-console → Add property → **Domain**
   property `pundits.pro`.
2. Verification is a DNS TXT record — add it in Cloudflare → pundits.pro →
   **DNS** (type TXT, name `@`, value as given by Google).
3. Once verified: Sitemaps → submit `https://pundits.pro/sitemap.xml` and
   `https://pundits.pro/news-sitemap.xml`.
4. Nothing else — do not request indexing page-by-page; the sitemaps do it.

### 0c. Bing Webmaster Tools

1. https://www.bing.com/webmasters → Add site → use **Import from Google
   Search Console** (fastest, reuses 0b) or DNS CNAME verification.
2. Confirm both sitemaps are listed after import.
3. Note the IndexNow section — Task 4's key will start showing submissions
   here once deployed.

Record what you changed (settings names + values) in a short note appended
to `docs/audits/2026-08-29-seo-aeo/audit.md` under "## Actions taken", so
the state is reconstructable.

## Task 1 — `gradedAt` freshness plumbing — completed in working tree 2026-08-29

Problem: grading rewrites titles/JSON-LD on ~50 pages with zero freshness
signal; sitemap `lastModified` and `dateModified` still read `sourceDate`.

1. `lib/types.ts`: add to `Call`:
   `/** ISO day the call was graded after leaving pending status. */ gradedAt?: string;`
2. `bots/grader.md`: instruct the grader to set `gradedAt` (ET date of
   grading) whenever it sets `status` to hit/miss. Backfill is not needed —
   nothing is graded yet as of this writing.
3. Thread it through freshness chains (TDD each):
   - `app/sitemap.ts` — takes: `lastModified: latestDay([sourceDate, gradedAt])`;
     picks and archives: include the `gradedAt` of their events' calls in the
     existing `latestDay(...)` arrays.
   - `lib/seo.ts` `articleJsonLd`: `dateModified: latestDay([sourceDate, event.sourcedAt, gradedAt])`.
     `datePublished` stays `sourceDate`.
   - Do NOT touch `lib/feeds.ts` news `publication_date` — re-dating items to
     re-enter the 48h Google News window is gaming and must not happen.
4. Tests: a graded call with `gradedAt` later than `sourceDate` moves
   `dateModified` and the sitemap entry; an ungraded call is unchanged.

## Task 2 — refresh `public/llms.txt` — completed 2026-08-29

Add under "## Site" / "## How to read it":
- `/teams/{id}/` — every take on a team, split with/against.
- `/{sport}/{season}/week-N/` — permanent weekly archives (CFB Week 0 = 0);
  ledes carry the experts' graded record once results land.
- Grading semantics: hard picks grade hit/miss after the event; pundit pages
  show a 2026 record and settled net dollars (hypothetical $100 at the
  frozen price of the picked side). Titles switch to past tense with the
  verdict once graded.
- `/leaderboard/` is "The table" — ranks open activity before results exist, then records after grading.
Keep the existing tone: terse, honest, URL-grammar oriented.

## Task 3 — archive h1 context

`components/WeekArchive.tsx`: h1 is bare "Week {week}". Answer engines lift
h1 + lede as the citation unit. Change h1 to `{SPORT_LABEL[sport]} Week {week}`
("College football Week 0"). Keep `<title>` and metadata as they are (they
already carry season). Check the long label wraps acceptably at 390px.

## Task 4 — IndexNow ping on deploy

1. Generate a key (32+ hex chars); commit it as `public/<key>.txt` containing
   the key (IndexNow's ownership proof).
2. `scripts/indexnow.mjs`: read `out/sitemap.xml` locs, POST to
   `https://api.indexnow.org/indexnow` with `{host, key, keyLocation, urlList}`
   (cap 10,000 — we're nowhere near). Non-fatal on failure: log and exit 0 so
   a Bing outage never blocks a deploy.
3. `package.json`: `"deploy": "npm run check && wrangler pages deploy out --project-name pundits && node scripts/indexnow.mjs"`.
4. Test the URL-extraction helper if you factor one out; the HTTP call itself
   can stay untested glue.

## Task 5 — methodology page

New `app/methodology/page.tsx` at `/methodology/`:
- Consolidate copy that already exists in the home "How it works", EventCard
  "Market details", and `/terms/`: what counts as a verified pick (clear
  first-person leans, named source, dated quote), what a frozen Kalshi price
  is and is not, how grading works (hit/miss after the event), what the
  hypothetical $100 and settled net dollars mean, roster rules (no pundit
  without a verified photo).
- FAQPage JSON-LD with 4–6 of those as Q/A pairs (add a `faqJsonLd` helper in
  `lib/seo.ts`, TDD).
- Link it: SiteFooter (next to About), the email-form consent line stays as
  is, and add a one-line "How grading works →" link near Market details on
  pick pages ONLY if you can do it without fighting concurrent edits to
  `EventCard.tsx` — otherwise footer link is enough for v1.
- Add to `app/sitemap.ts` core with `changeFrequency: "yearly", priority: 0.4`.
- It will join the permalink ledger automatically; commit the ledger.

## Task 6 — opportunistic (do last, skip if time-boxed)

- `components/PunditAvatar.tsx`: `loading="lazy"` + `decoding="async"` for
  `row`/`peek`/`feed` sizes; leave `hero` eager.
- `lib/seo.ts` `eventJsonLd`: add `eventStatus` —
  `https://schema.org/EventScheduled`, or `EventCompleted` when
  `settledSide(event, calls)` is non-null. TDD.

## Task 7 — ranked "who was right" list on graded archives (added from aeo-deep-dive)

Research: ~63% of LLM citations point to numbered-list pages, and lists near
the top of a document get extracted most. Once a week has graded results,
`components/WeekArchive.tsx` should render — between the lede and the game
cards — an ordered list (`<ol>`) of that week's graded takes, best first:

  1. Paul Finebaum — hit (TCU over North Carolina, 75¢)
  2. Chip Patterson — miss (North Carolina over TCU, 26¢)

- Data: takes on the week's games via existing helpers; sort hits before
  misses, then by pundit name. Names link to pundit pages, picks to take
  pages. Render nothing while the week has no graded takes.
- TDD a pure helper (e.g. `weekResults(games, calls, pundits)` in
  `lib/archive.ts`) returning the ordered rows; keep the JSX thin.
- Keep it a real `<ol>` in the HTML — the numbering is the point.

## Verify before handing back

```
npm run check          # tests + build + verify:static (ledger may grow — commit it)
npm run verify:live    # only after a deploy
```
Spot-check: `out/methodology/index.html` exists with FAQPage JSON-LD; a
synthetic graded call moves sitemap lastModified; llms.txt mentions /teams/.

Commit in task-sized commits with plain-language messages. Do not deploy
unless Baird asks — Saturday capture-run deploys are the normal ship path.
