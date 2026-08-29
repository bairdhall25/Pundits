# SEO plan — programmatic content roadmap

Status as of 2026-08-28. Done: sitemap + news-sitemap + RSS, canonical URLs,
JSON-LD (NewsArticle/Person/SportsEvent), legacy-slug 301s, noindex gating for
zero-call pundit profiles, outcome-aware titles after grading, and the
append-only permalink ledger (`docs/seo/permalinks.txt`, enforced by
`verify:static` — see RUNBOOK "URL permanence").

Remaining items, in priority order. Each is independent; pick up any of them.

## 1. Weekly archive pages (`/ncaaf/2026/week-1/`, `/nfl/2026/week-1/`)

"College football week 1 expert picks" is a large recurring query, and the
current slate pages answer it — then get overwritten the following week.
Archives give every week a permanent URL that keeps ranking after the fact
(post-grading they become "who called week 1"). ~30 pages per sport per season.

- Data: events already carry `kickoffDate` and `season`; add a `week` field or
  derive it from the date.
- Template: the existing slate layout, filtered to the week, with graded
  results shown once settled.
- Link each archive from the current slate ("Past weeks") and from the next
  week's page. Add to sitemap with `changeFrequency: weekly` until graded,
  then `yearly`.

## 2. Team pages (`/teams/{id}/`)

Teams are the axis fans search by ("who's picking LSU", "LSU expert
predictions") and the one page type we don't have. Team IDs already exist in
`data/teams.json` and on events.

- Template: team header, every event involving the team, every take on those
  events split into believers vs. faders, running record of pundits on/against
  the team.
- Natural home for the parked team-logo work (docs/audits 2026-08-27 has the
  logo system spec: logo = subject, face = speaker).
- Gate indexing the same way as pundit profiles: noindex until the team has at
  least one take.

## 3. Take-page depth modules

Take pages are headline + quote + price — legitimate but light, and they are
the majority of URLs. Cheap modules from data we already have, in value order:

1. "What happened" — result sentence once graded (headline already carries the
   verdict; the body should too, with the final price context).
2. "Others on this game" — the split, with links (partially exists in
   pickStory prose; make it a linked module).
3. "{Pundit}'s season so far" — record + settled net dollars from
   `lib/records`.

## 4. Methodology page (`/methodology/`)

One page: how picks are verified (clear first-person leans only, named
sources, dated quotes), what the frozen Kalshi price is and isn't, how grading
works, what the hypothetical $100 means. E-E-A-T for the whole domain; link it
from every take-page footer and About. Largely exists as scattered copy in
How-it-works, market details, and Terms — consolidate.

## 5. Indexing operations

- Verify domain in Google Search Console; submit both sitemaps. Same in Bing
  Webmaster Tools.
- Add an IndexNow ping to the deploy script (Bing/Yandex; cheap).
- Watch Search Console "Page indexing" for the noindexed-profile cohort — they
  should flip to indexed as picks land; if legit pages sit in "Discovered –
  not indexed" for weeks, revisit internal linking.
- After each grading run, the changed lastModified dates in the sitemap are
  the recrawl signal — make sure grading always redeploys (it does, via the
  capture-run cadence).

## 6. Title/CTR polish (after real impressions exist)

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
