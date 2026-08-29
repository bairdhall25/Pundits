# SEO + AEO audit

Status: Evidence

Date: 2026-08-29 (pre–Week 0 kickoff)
Method: live-site inspection (robots.txt, headers, rendered HTML, sitemap) plus
code review of the metadata, structured-data, and feed layers. Follows the
2026-08-28 fan/gambler UX audit and the work in docs/seo-plan.md.

## Verdict

The classic-SEO layer is in unusually good shape for a two-week-old site —
permanence is enforced, indexing is earned, titles carry answers, and the
whole site is static HTML that machines can read without JavaScript. The
highest-confidence gap is that grading changes the answer on many pages
without a freshness signal. Crawler access is a policy-verification task,
not a confirmed AEO emergency.

## Corrected — separate search access from model-training consent

The zone's managed robots.txt (prepended by Cloudflare, above our own rules)
currently serves:

- `Disallow: /` for **GPTBot, ClaudeBot, CCBot, Google-Extended,
  Applebot-Extended, Amazonbot, Bytespider, meta-externalagent**
- `Content-Signal: search=yes, ai-train=no, use=reference`

Those user agents are not interchangeable:

- OpenAI identifies `OAI-SearchBot` as the crawler relevant to ChatGPT search
  discovery and `GPTBot` as the control for potential model training.
- Anthropic identifies `Claude-SearchBot` and `Claude-User` as search/user
  retrieval agents and `ClaudeBot` as model-development/training collection.
- Google says Google Search generative features use the Search index and that
  `Google-Extended` does not control inclusion in Google Search.
- Cloudflare exposes separate `search`, `ai-input`, and `ai-train` content
  signals precisely so these choices can differ.

Therefore blocking GPTBot, ClaudeBot, CCBot, or Google-Extended is not by
itself evidence that ChatGPT Search, Claude search, or Google AI Overviews
cannot cite the site. The correct action is to verify that search and
user-retrieval agents are allowed, set `search=yes` and `ai-input=yes` when
the goal is citation/grounding, and make `ai-train` a separate rights and
distribution decision. Do not promise that allowing training crawlers will
create traffic or brand awareness; that benefit is speculative.

Primary references:

- https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/#content-signals

## High — grading freshness (addressed in working tree)

> **Working-tree update 2026-08-29:** `gradedAt` has now been threaded through
> call types, grader output, structured data, sitemaps, and tests. The risk is
> closed in code once validation passes and the change deploys; verify it on
> the first promoted grade.

`Call` has no graded-at date. When the grader flips a pick to hit/miss, the
page's title, headline, JSON-LD, and OG card all change — but:

- sitemap `lastModified` for the take still reads the original `sourceDate`
- `articleJsonLd.dateModified` still derives from sourceDate/sourcedAt

So exactly when a page becomes most valuable ("— and hit"), nothing tells
crawlers to come re-read it. Fix: add `gradedAt` (ISO date) to Call, set by
the grader alongside `status`, and feed it into sitemap lastModified,
NewsArticle dateModified, and the pick/archive page lastModified chains.
Keep the news-sitemap keyed on sourceDate (re-dating items to re-enter the
48h news window would be gaming it).

## Medium

1. **llms.txt is stale.** It's genuinely good (clear model of the site,
   URL grammar, honest caveats) but predates tonight's shipping: no
   `/teams/{id}`, no `/{sport}/{season}/week-N/` archives, and it doesn't
   explain grading (hit/miss, settled dollars) — the site's most
   distinctive machine-readable fact. Update it whenever a page type ships.
2. **Methodology page still missing** (seo-plan item 4). For AEO it's the
   canonical answer to "how does pundits.pro verify picks," and every take
   page should footer-link it. Consolidate the copy that already exists in
   How-it-works, Market details, and Terms.
3. **Archive h1 is bare "Week 0."** The `<title>` carries full context but
   answer engines lift h1 + lede as the unit. "College football Week 0"
   in the h1 (season stays in the eyebrow) reads better in citations.
4. **Operational indexing still not started:** Search Console + Bing
   Webmaster verification, sitemap submission, IndexNow ping on deploy
   (seo-plan item 5). The content is compounding daily now; the sooner
   verified, the sooner query data exists.

## Low

5. Image hints: pundit avatars render as plain `<img>` with no
   `loading="lazy"` (below-fold rows) or `fetchpriority="high"` (marquee
   faces). Static site is fast anyway; worth a pass, not urgent.
6. SportsEvent JSON-LD could add `competitor` and `eventStatus`
   (Scheduled → Completed on grading) — pairs naturally with the gradedAt
   work.
7. FAQPage schema on the future methodology page (definitions of frozen
   price, hit/miss, hypothetical $100) is a cheap rich-result and AEO win.

## What is already right (keep doing exactly this)

- **Full content in static HTML** — no JS required to read anything.
  This is the single biggest AEO advantage and it's structural.
- **Answers in the first sentence.** Ledes state the fact ("Josh Pate and
  Paul Finebaum pick LSU. Nobody on Clemson yet.") before context —
  exactly the extractable unit engines quote.
- **Outcome-aware titles** — post-grading pages answer the post-game query.
- **Earned indexing** everywhere (pundits, teams), enforced URL permanence,
  clean canonicals with trailing-slash consistency, legacy 301s.
- **Structured-data suite**: NewsArticle with citation → source URL,
  Person, SportsEvent, BreadcrumbList, Organization/WebSite; 1200×630 OG
  images per page.
- **News sitemap correctly windowed** (48h, capped), RSS feed, llms.txt
  existing at all (most sites have none).
- **Entity discipline**: one name per pundit/team everywhere, stable IDs.

## Priority order

1. Cloudflare AI-crawler dial (dashboard; only Baird can) — everything AEO
   waits on this.
2. `gradedAt` freshness plumbing — ideally before this weekend's grades
   are a week old.
3. llms.txt refresh (10 minutes) and archive h1 (5 minutes).
4. Search Console / Bing / IndexNow.
5. Methodology page with FAQPage schema.
6. Image hints + SportsEvent eventStatus, opportunistically.

## Actions taken

- **Cloudflare dashboard (Aug 29, 2026):** AI Crawl Control managed `robots.txt` remains enabled. Retrieval/citation agents (including OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, and Googlebot) were verified as allowed. Training crawlers remain blocked, the future mixed-purpose-crawler preference is set to blocked, and the live composed policy now advertises `search=yes`, `ai-input=yes`, `ai-train=no`, and `use=reference`.
- **Google Search Console:** the verified `sc-domain:pundits.pro` property already had `sitemap.xml` in Success. `news-sitemap.xml` was submitted on Aug 29 and immediately reported Success with two discovered pages. No page-by-page indexing requests were made.
- **Bing Webmaster Tools:** the existing `pundits.pro` site already had `sitemap.xml` in Success. `news-sitemap.xml` was submitted on Aug 29 and accepted for processing. The deployed IndexNow key is `d86c0857c9c0449b9a7868f3e8ee1a7e`; the release submission was accepted for 118 URLs. An immediate duplicate retry returned HTTP 403 and was intentionally non-fatal.
- **Production release:** commits `8fae79e`, `b053a0a`, `4d0354b`, `93f17b4`, and deploy-hardening commit `0690cd1` were pushed to `main`. Cloudflare production deployment `fd9ddde4` was published at `pundits.pro`. The clean release gate passed 18 test files / 142 tests, TypeScript, 161 statically generated pages, and 29 required static checks. Post-deploy verification passed 100 routes, 34 mapped hard stories, one redirect, the methodology FAQPage, both sitemaps, the IndexNow proof file, and the final composed `robots.txt`.
- **Google Event report correction (Aug 29, 2026):** Search Console identified a future-market page as an Event and required physical-event fields that do not truthfully apply. Commit `03cb852` replaced pick-page `Event` / `SportsEvent` markup with `WebPage`, `SportsTeam`, and `Thing` entities while retaining `NewsArticle` and the rest of the structured-data suite. Cloudflare deployment `54946853` passed 19 test files / 145 tests, 161 static pages, generated-output checks, and live verification. Production checks found no Event-family JSON-LD on game, story, or future pages. Search Console validation was started for both critical issues (`location` and `startDate`).
