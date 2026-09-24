# Grok test: college football Week 1 Underdog Report

Status: Historical

Superseded September 10, 2026: Baird clarified that Codex writes the article and analyzes the data; Grok is for tweeting only. The Grok article assignment below is retained as historical context and must not be dispatched. The resulting Codex draft is [Week 1 Underdog Report](../content/2026-week-1-underdog-report.md). Article publication and any subsequent Grok tweet assignment remain separate from drafting.

Date: 2026-09-10. One-off editorial experiment requested by Baird. This is a draft-content assignment, not a recurring automation or publication instruction.

## Copyable Grok prompt

You are testing a new Pundits.Pro editorial format: The Underdog Report. College football Week 1 of the 2026 season is over. Find the most interesting defensible story about how our tracked pundits picked favorites and underdogs, then produce one article draft and three data-led X drafts for review.

The reader is a college football fan or bettor curious about who identifies upsets and what expert records really mean. The story must synthesize the slate. Individual games are supporting evidence; we already post individual game receipts after results. Use clear, curious, concrete prose. Do not turn a small sample into a betting system.

### 1. Verify the actual current ledger

Read:

- https://pundits.pro/ncaaf/2026/week-1/
- https://pundits.pro/social/cards.json
- https://pundits.pro/methodology/
- The event and individual receipt pages needed to substantiate the analysis.

If repository access is available, read current main's AGENTS.md, docs/product/growth-and-content-loop.md, docs/product/editorial-and-corrections.md, docs/social/voice.md, and docs/social/tagging.md. Use current main's data/events.json, data/calls.json, and data/pundits.json to reproduce the calculations. A stale local checkout is not the current ledger. Record retrieval time, social-index generatedAt, and repository revision when available. Report any disagreement between current repository data and publication; do not silently combine versions.

Use only mapped hard game picks for NCAAF, season 2026, week 1. Exclude Week 0, NFL, futures, soft takes, and unmapped calls. Separate pending picks from graded denominators. Count each pundit/event once; flag duplicate or conflicting rows rather than choosing silently. Grade only the published straight-up winner proposition; do not infer spread results from a quote.

Classify the picked side using its dated frozen market price: below 50 cents = underdog; above 50 = favorite; exactly 50 = even-price, separately reported. Exclude missing prices from price-based analysis and disclose the count. These are our dated snapshots, not closing odds, live odds, or necessarily prices at the original statement time. Do not reconstruct missing historical prices or normalize the two side prices into an invented probability.

### 2. Produce a compact evidence table first

Show total eligible picks, distinct pundits, covered games, hits/misses/pending, and exclusions. Show favorite and underdog pick records alongside distinct games represented. Repeated pundit selections on the same game are not independent outcomes. If reporting game-level favorite results, calculate once per eligible covered game using the final result; do not derive them by counting pundit picks. Explain the scope of each denominator.

For each underdog represented, list the team, opponent, pundits, dated frozen price, result, and permanent evidence links. Include a reproducible calculation description or small script if tools permit. Keep calculations in the deliverable, not a new maintained scorebook.

A September 10 review observed 39 graded picks from 17 pundits across 11 games: 28-11 overall, 27-0 favorite selections, and 1-11 underdog selections across seven distinct underdogs. Patterson's Tulsa selection was the sole underdog hit. These are hypotheses to recheck, not targets to reproduce. Correct them if current verified evidence differs. Do not import another site's pundit records into ours.

### 3. Choose an angle and assess search intent

Propose three headlines, then select the strongest. Explore underdog results, what favorite-heavy records hide, and who correctly opposed the tracked majority. Choose based on evidence, not a requirement to make the week surprising.

Run a bounded search check for two or three relevant query families, such as college football expert underdog picks/results and expert pick accuracy. Report representative competing pages, the intent they satisfy, and what our article uniquely contributes. Label search-demand judgments as hypotheses unless actual volume or Search Console evidence is available. No invented keyword difficulty, traffic projections, or ranking promises.

Recommend the best publishing home: existing Week 1 archive, a season-long report, or a distinct multi-game synthesis. Avoid a duplicate URL for a single game result. Do not claim our selected slate measures how all college football favorites or underdogs performed. A retrospective must answer retrospective intent; it must not masquerade as current upcoming picks.

### 4. Deliver the article and social drafts

Article: approximately 500-800 words, shorter if the evidence warrants. Include the selected headline, proposed search title and meta description, a direct-answer opening, one useful table, linked receipts, and a brief sample/method note. Use people and games to explain the data. End with the question worth following next week, not a betting recommendation or invented upcoming selections.

X: three alternative original posts, each within 280 characters, led by a surprising verified statistic or comparison. They are options for this pilot, not three mandatory publications. Each must stand alone, identify college football Week 1 and our tracked scope, and avoid confusing picks with games. Pair each with a concise proposed graphic layout using verified numbers and the existing green/black identity; do not generate artwork for this test. Supply the receipt/report URL separately as proposed first-reply copy. Do not insert a link in the main post. Avoid routine game-result leads, generic engagement questions, and tags added just for reach. Do not invent an unapproved pundit handle.

### 5. Return one reviewable package

Return in this order: verified evidence table and provenance; chosen angle and search-intent rationale; complete article draft; three social options and graphic briefs; unresolved evidence issues; one-paragraph self-review.

This one-off assignment explicitly permits drafting a multi-game synthesis for review, despite ordinary Recap instructions limiting that bot to its standard recap. It does not authorize changing standing bot instructions, editing editorial JSON, grading picks, creating application routes, committing/pushing changes, publishing, posting to X, or deploying. Return the package in this conversation; if a file output is supported, label it Status: Evidence and provide its accessible path. Do not assume this local brief is already on GitHub.

## Review criteria

Pass only if the numbers reconcile; picks and games remain distinct; results are straight-up; market dates and coverage are honest; source links support the central claim; the article answers an identifiable search intent; and at least one social draft makes the data interesting without requiring interest in one specific game. No predictive-skill claim from one week, implied betting profit, synthetic quote, or unsupported generalization about all experts.

The test evaluates editorial quality and operating repeatability. It does not establish audience demand before publication. If approved for a later distribution test, measure organic social response and downstream receipt visits separately from search impressions/clicks over subsequent weeks.
