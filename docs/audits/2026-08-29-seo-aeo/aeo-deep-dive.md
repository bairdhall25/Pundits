# AEO deep-dive (researched update)

Status: Evidence. Crawler-role distinctions are grounded in vendor documentation; numeric citation claims below come largely from secondary SEO studies and should be treated as hypotheses, not forecasts or product requirements.

Date: 2026-08-29. Supplements `audit.md` after researching current (mid-2026)
answer-engine practice. **This corrects one finding in the base audit.**

## Correction: the Cloudflare block is less severe than first reported

The 2026 crawler landscape splits agents into **training** crawlers (GPTBot,
ClaudeBot, CCBot, Google-Extended, Applebot-Extended, meta-externalagent) and
**retrieval/search** agents that actually produce citations (OAI-SearchBot,
ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot). Cloudflare's
managed robots.txt on pundits.pro blocks only the training group — every
retrieval agent is currently ALLOWED, and Google AI Overviews / AI Mode use
ordinary Googlebot, also unaffected.

So: **citations in ChatGPT Search, Perplexity, Claude, and AI Overviews are
possible today.** The base audit's "critical" rating overweighted this.

What the block may still affect is model-development or product use governed
by those vendor-specific training/extended tokens. Any claim that training
access will embed the brand in future model weights or create distribution is
speculative and not currently measurable.

Recommendation: keep search and user-retrieval agents open, and make a
deliberate, separate decision about training. `search=yes`, `ai-input=yes`,
and `ai-train=no` is a coherent posture when the goal is citation without
granting training use. Unblocking GPTBot, ClaudeBot, CCBot, or
Google-Extended should require an explicit rights/distribution decision, not
an AEO emergency.

## Secondary AEO hypotheses worth testing

1. **Answers must live in the first 30% of the page** (~44% of LLM citations
   are extracted there). ✓ Strong — ledes state the fact in sentence one on
   every page type.
2. **Statistics boost citation likelihood ~41%** (Princeton/GT GEO study —
   the single most effective technique tested). ✓ Strong — cents, odds,
   records, settled dollars are everywhere. Keep stating them in prose
   ("Experts went 4–2"), not just UI chips: extractors prefer sentences.
3. **Freshness: ~83% of citations come from pages updated in the last 12
   months, 60%+ within six.** ✓ by design — but this is exactly why the
   `gradedAt` fix (Codex Task 1) matters; it's the freshness signal.
4. **Ranked lists dominate citations** (~63% of LLM citations point to
   listicle-style pages, mostly numbered). ◐ Partial — the leaderboard is a
   ranked list; weekly archives could present a numbered "who was right"
   list post-grading. Cheap upgrade with real leverage.
5. **FAQ + Article schema combo correlates with 2.5–3× citation rates**
   (correlation, not trigger). ◐ Article ✓ live; FAQPage arrives with the
   methodology page (Codex Task 5).
6. **AI Overviews cite beyond top rankings** (~47% of citations from below
   position 5; top-10 share fell from 76% to ~38%). ✓ favorable — passage
   quality beats domain authority, which suits a young site.
7. **Brand mentions elsewhere are the strongest citation predictor** —
   branded web mentions correlate ~3× more strongly with AI visibility than
   backlinks (~0.66 vs ~0.22). ✗ **This is now the biggest true AEO gap.**
   Pundits has almost no off-site footprint: one X account, no Reddit
   presence, no coverage. Engines cite sources they've seen discussed.
   The Sep 4–5 share push IS AEO; graded-receipt screenshots that get
   pundits.pro named in r/CFB threads and quote-tweets do more for
   citations than any on-site markup now.
8. **llms.txt: keep expectations low.** Adoption ~10% of domains; multiple
   90-day crawler studies measured ~0.1% of AI bot traffic touching it, and
   Google has said it won't support it. Ours is good and costs nothing to
   maintain (Codex Task 2 stays, minutes of work) — but it is infrastructure
   for future agents, not a citation lever today. Do not over-invest.
9. **ChatGPT Search leans on Bing's index**, making Bing Webmaster + IndexNow
   (Codex Tasks 0c/4) unusually valuable relative to classic SEO instincts.

## Revised priority order

1. `gradedAt` freshness plumbing (Codex Task 1) — aligned with the strongest
   measured factor after structure.
2. Bing Webmaster + IndexNow (Tasks 0c/4) — ChatGPT Search eligibility.
3. Off-site brand mentions — the share push, treated as an AEO program:
   receipts with the domain visible, posted where CFB fans argue.
4. Methodology page with FAQPage schema (Task 5).
5. Numbered "who was right" list module on graded weekly archives.
6. Cloudflare training-crawler dial — deliberate decision, documented.
7. llms.txt refresh — cheap hygiene, low expectations.

## Primary crawler references

- https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/#content-signals

## Secondary research sources

- https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai
- https://www.stackmatix.com/blog/aeo-best-practices-2026
- https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026
- https://ai.aeo.press/the-state-of-llms-txt-in-2026
- https://www.honeyb.ai/blog/ai-crawler-user-agents-reference-2026
- https://www.cite.sh/blog/ai-crawler-guide/
- https://wellows.com/blog/google-ai-overviews-ranking-factors/
- https://www.averi.ai/blog/google-ai-overviews-optimization-how-to-get-featured-in-2026
- https://www.omnibound.ai/blog/generative-engine-optimization-statistics
- https://blog.arfadia.com/ai-citation-statistics-2026/
