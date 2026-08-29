# SEO plan — programmatic content roadmap

Status: Operational. The latest dated SEO/AEO audit and approved fix plan may supersede individual priorities.

Status as of 2026-08-29. Done: sitemap + news-sitemap + RSS, canonical URLs,
JSON-LD (NewsArticle/Person/SportsEvent), legacy-slug 301s, noindex gating for
zero-call pundit profiles, outcome-aware titles after grading, and the
append-only permalink ledger (`docs/seo/permalinks.txt`, enforced by
`verify:static` — see RUNBOOK "URL permanence"). Weekly archive pages and
team pages are also shipped, with earned-indexing gates.

Remaining items, in priority order. Each is independent; pick up any of them.

## Completed 2026-08-29 — grading freshness

The working tree now carries `gradedAt` through call types, grader output,
structured-data freshness, sitemap freshness, and tests. Keep this contract
when the first grade is promoted and verify the deployed sitemap changes.

## 1. Take-page depth modules

Take pages are headline + quote + price — legitimate but light, and they are
the majority of URLs. Cheap modules from data we already have, in value order:

1. "What happened" — result sentence once graded (headline already carries the
   verdict; the body should too, with the final price context).
2. "Others on this game" — the split, with links (partially exists in
   pickStory prose; make it a linked module).
3. "{Pundit}'s season so far" — record + settled net dollars from
   `lib/records`.

## 2. Methodology page (`/methodology/`)

One page: how picks are verified (clear first-person leans only, named
sources, dated quotes), what the frozen Kalshi price is and isn't, how grading
works, what the hypothetical $100 means. E-E-A-T for the whole domain; link it
from every take-page footer and About. Largely exists as scattered copy in
How-it-works, market details, and Terms — consolidate.

## 3. Indexing operations

- Verify domain in Google Search Console; submit both sitemaps. Same in Bing
  Webmaster Tools.
- Add an IndexNow ping to the deploy script (Bing/Yandex; cheap).
- Watch Search Console "Page indexing" for the noindexed-profile cohort — they
  should flip to indexed as picks land; if legit pages sit in "Discovered –
  not indexed" for weeks, revisit internal linking.
- After `gradedAt` ships, each grading run should update sitemap
  `lastModified` and redeploy so the result becomes a recrawl signal.

## 4. Title/CTR polish (after real impressions exist)

Once Search Console has a few weeks of query data: check that take-page titles
match the vocabulary people actually use ("prediction" vs "pick" vs "vs"),
and A/B the outcome-title format ("— and hit" vs "✓ hit"). Don't guess ahead
of data.

## Principles (apply to everything above)

- Every page type earns indexing with real content; empty shells are
  noindexed until they fill (pundit-profile pattern).
- URLs are forever — the permalink ledger enforces it.
- Graded > pending: after results land, lead with the answer everywhere
  (titles, deks, OG cards).
- One new page type at a time; watch Search Console before adding the next.
