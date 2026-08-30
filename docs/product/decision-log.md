# Product decision log

Status: Canonical

This file records durable product decisions and working assumptions. Change an accepted decision only with explicit operator direction or strong new evidence. Date substantive changes.

## Accepted decisions

| Decision | Rationale | Status |
|---|---|---|
| The core product is public-pick accountability for named sports voices. | A focused promise is easier to understand and verify than general sports intelligence. | Accepted |
| Frozen Kalshi cents remain visible on scan cards. | Price communicates how bold or conventional a call was and is part of the first-time hook. | Accepted |
| Game YES = away and NO = home. | Existing data, grading, URLs, and market contracts depend on this mapping. | Accepted |
| Empty sides remain visible and honest. | Weak or invented symmetry would undermine trust. | Accepted |
| Exact evidence is progressively disclosed, not removed. | Fans need a clean scan; trust still requires full source access. | Accepted |
| Stories/Takes and The Book are two views of the same calls. | One corpus should not fork into contradictory content systems. | Accepted |
| Pick stories are derived from mapped calls. | Avoids standalone article drift and makes every story auditable. | Accepted |
| Published data and URLs are append-only. | Historical pages and results are compounding search equity and public receipts. | Accepted |
| Season slugs use the regular-season start year. | Keeps playoffs and championship outcomes attached to the correct season. | Accepted |
| Static JSON and Cloudflare Pages remain the architecture for the current stage. | It is inspectable, inexpensive, and adequate before dynamic demand is proven. | Accepted |
| Capture, audit, grade, promote, and recap have separate ownership. | Separation reduces fabrication and accidental data mutation. | Accepted |
| Volume and the accountability loop precede monetization optimization. | Revenue options become clearer after the corpus and distribution show demand. | Accepted |
| `Live now`/`In play` is reserved for events actually underway. | Sports fans expect immediate game state, not merely unresolved predictions. | Accepted 2026-08-29 |
| Event-level density matters more than raw call count. | Several credible voices on an important event create more fan value and faster feedback than isolated long-range claims. | Accepted 2026-08-29 |
| The first end-to-end grading cycle precedes new platform scope. | Accountability is the product promise and remains unproven while every call is pending. | Accepted 2026-08-29 |
| Hypothetical $100 is secondary analysis, not the primary fan promise. | It can express price-adjusted performance but can also make the product feel like a betting tool. | Accepted 2026-08-29 |
| Records show receipts and sample size before they imply skill. | Early records are selective, correlated, and statistically thin. | Accepted 2026-08-29 |
| Scout is a density engine: coordinator + Shows/X/News beats against homepage games. | Empty-YES Google against CFB YouTube factories produced dry mornings and ignored NFL/news. | Accepted 2026-08-29 |
| Sports radio is a bounded source lane inside Shows Scout. | Named radio personalities can fill important local and national coverage gaps without another always-on bot; durable evidence and pilot cost gates preserve trust and usage. | Accepted 2026-08-29 |
| Growth target is dense marquee game cards, not more object types. | Event-level SU density is the thesis; Bets, fantasy, bulk roster, and extra homepage games do not create Dublin-shaped cards. Hold new product work through the 2026-09-05 week and observe capture. See `docs/product/2026-08-30-dense-marquee-cards.md`. | Accepted 2026-08-30 |

## Working assumptions

| Assumption | Evidence needed |
|---|---|
| Fans will return for receipts and updated pundit records. | Return visits and post-grade engagement across several slates. |
| Disagreements outperform single-sided consensus cards. | Detail opens, shares, and time-on-page by card type. |
| Recognizable faces improve acquisition, while smaller pundits improve sharing. | Social/referral performance by pundit reach segment. |
| Search traffic will compound through pick stories, weeks, teams, and records. | Indexed-page cohorts, impressions, clicks, and persistence after grading. |
| Fast grading materially improves trust and distribution. | Engagement and mentions correlated with settlement-to-grade latency. |
| Market price makes calls more interesting without making the product feel like a sportsbook. | Comprehension studies and engagement with/without price framing. |
| Marquee weekly games are the best initial acquisition wedge. | Engagement and repeat behavior compared with futures and long-tail events. |

## Parked scope

- Fantasy football and player props; see `docs/fantasy.md`.
- Fan-facing Bets pages (spreads/totals/team totals on the game card). Scout may still stage them in the run-file Bets table. Revisit after Week 1 capture; see `docs/product/2026-08-30-dense-marquee-cards.md`.
- Bulk roster expansion and auto-roster of Candidates. Tiny opinionated adds (add-list names who actually lock a homepage game) remain operator-gated.
- Accounts, authentication, saved picks, comments, and personalization.
- Live odds and automatic price refresh.
- Betting controls or claims that pundits placed wagers.
- Additional sports beyond NCAAF and NFL.
- Complex multi-axis pundit scores.
- A general backend/database migration.
- Group-vs-group leaderboards.
- Team logos without an approved ID, rights, fallback, and accessibility plan.

## Unresolved decisions

- What minimum corpus or engagement threshold should trigger the first monetization test?
- Which initial retention mechanism is best: email recap, alerts, social follow, or habit around weekly archives?
- Should an explicit event-result object eventually replace result inference from graded calls?
- What is the correction/audit presentation once the first disputed grade occurs?
- Which measurements can be collected with the lightest privacy and infrastructure cost?
- When qualified event coverage grows, should automation remain file-based or move to a review queue with durable workflow state?

## Competitive decision: Pundit Ledger

As of 2026-08-29, treat Pundit Ledger as a technically credible but commercially weak competitor. Monitor monthly. Do not copy its API, MCP, cryptographic, or multi-axis-scoring scope merely because it exists.

Partnership remains possible if its ingestion and corpus become reliable while Pundits.Pro establishes stronger consumer experience and distribution. See `docs/competitive/pundit-ledger.md` for evidence and partnership gates.
