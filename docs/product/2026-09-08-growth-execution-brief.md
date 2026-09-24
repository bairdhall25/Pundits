# Growth execution brief

Status: Active plan

Date: September 8, 2026. Product owner: Baird. Product manager: Codex. Engineer: Grok.

## Mandate and authority

Baird requested an audit of social, Scout, and SEO/AEO, accepted a page-type-specific SEO approach, and asked Codex to preserve the context and prepare an implementation plan for Grok. This brief records the product direction for that work. It does not claim the proposed behavior is already shipped.

Read [the evidence audit](../audits/2026-09-08-growth-engine.md), [the engineering plan](../superpowers/plans/2026-09-08-growth-engine-implementation.md), and [the Grok handoff](../grok-growth-handoff.md). Follow repository AGENTS.md. Current code and data control what is implemented; this dated brief controls the intended scope of this growth initiative. When a phase changes operating policy, synchronize the affected canonical and bot documents in that phase instead of leaving conflicting instructions active.

## Context to retain

Pundits.Pro records named sports voices' public predictions, preserves evidence and dated market context, and records results. The core object is a verifiable pick, not a betting recommendation or a generic article.

The growth chain is Scout discovery → Audit verification → Promote publication → search/social discovery → grading → renewed distribution → repeat visits. Scout is the linchpin: distribution cannot compensate for missing timely picks. Code should help complete valuable sources and concentrate coverage on games fans care about, without manufacturing disagreement or expanding to every game.

Baird considers the new social cards visually strong. Keep their current visual system. Weak engagement does not justify another redesign without evidence.

The September 8 audit found early search discovery (808 Web impressions, 10 clicks through September 6), weak response on X (median 32 impressions and no likes/reposts in a 15-post September 5–7 sample), and no News-tab search impressions. The old approximately 6,900-view post was paid/boosted. These are dated baselines, not current targets or proof of channel failure. No reliable site-retention or complete URL-click dataset was obtained.

Current main at audit revision `6e4470a` had 83 hard mapped calls, 45 graded calls, and 29 nonempty reasoning capsules. It had no upcoming college game events after September 7. Seven GameDay selections required operator intervention after density rules skipped them. Scout does substantial real source work; its target selection, episode bookkeeping, and handoffs need improvement.

The audit also found attribution/publication defects: recap labels displayed as spoken quotes; operational notes presented as rationale; JSON-LD rationale absent from visible receipts; source dates used as article publication dates; and shared refreshed event prices described too broadly as capture-time prices. Correct these before scaling distribution.

## Product decisions for implementation

1. **One evidence-backed ledger, many useful views.** Keep existing canonical URLs. No independent bot-written articles or duplicate news pages for the same pick.
2. **Each page type has a distinct search job.** Game comparisons, individual evidence, pundit history, team coverage, league discovery, and weekly synthesis should not be copies of the same text.
3. **Grades update existing game and pick URLs.** A separate recap is justified by synthesis of several results, not a second URL announcing the same single grade.
4. **Truth before additional reach.** Visible copy and structured data must agree. Source dates, first publication dates, updates, and market snapshots are distinct facts.
5. **Keep the existing eligibility bar.** Do not authorize newly mapped picks from unverified reported-selection labels. Correct legacy presentation without pretending those labels are spoken quotations; recover original evidence through Audit/Promote. Any proposed expansion of eligibility is a separate product decision.
6. **Keep shared event snapshots for this initiative.** Label their actual dates accurately. Do not add immutable per-call prices, retroactively reconstruct prices, or change hypothetical-return calculations in this project.
7. **Source completion is separate from visual density.** On approved priority games, complete designated high-value sources even after the card becomes dense. Preserve display caps and the green/black identity.
8. **Roll capture priorities forward.** Use a bounded upcoming-slate queue and explicit selection rather than stale launch-week instructions. No automatic bulk event minting or roster expansion.
9. **Social leads with a story.** Prioritize pregame disagreement, postgame resolution, and selective notable calls. Preserve cards, attribution, earned tags, and honest losses. Posting limits are ceilings, never production targets.
10. **News discovery is an experiment, not a promised outcome.** Make existing receipts worthy of consideration with timely original value and transparent publishing. No Publisher Center approval chase, aggregator integration, paid promotion, or article-volume quota in this scope.
11. **AEO means clear, accessible, source-backed answers.** No speculative special schema, FAQ multiplication, or llms.txt project as a substitute for useful content.
12. **Judge the next three settled slates on learning.** Use comparable-age organic social response, search clicks by page type, capture lead time, and real downstream site engagement. Do not fabricate unavailable metrics or promise a percentage lift.

## SEO contract by page type

| Type | Primary question | Required useful content | Lifecycle / indexing | Primary measure |
|---|---|---|---|---|
| Game/event | Who picked each side of this matchup? | Named sides, exact evidence links, verified rationale where available, event date, coverage count, result and grading scope | Same season-qualified URL before and after game; preserve earned-indexing rules | Search landings that lead to a receipt/evidence action; clicks by matchup |
| Individual pick/story | Who did this pundit pick, why, and was it right? | Direct answer; exact evidence; source identity/date/locator; truthful byline/publication time; actual rationale if present; disagreement context; result | One permanent URL; update grade and material update time, never reset publication for freshness | Relevant query clicks, evidence use, receipt sharing |
| Pundit profile | What are this person's current picks and tracked record? | Current mapped picks, dated season record and graded sample, historical receipts, truthful identity/outlet | Durable person URL; noindex empty shells; no implied complete career coverage | Profile search clicks and movement into current/historical picks |
| Team | Who is picking this team this week? | Next covered event and named picks, explicit coverage limits, past results | Existing team URL; earn indexing with real calls | Team-query clicks and event-detail visits |
| League | What expert picks are available for this week's NFL/college slate? | Current covered games, game dates/status, links to comparison and weekly history | Current league URL; retain existing live-week display rules | League-query landings and event opens |
| Weekly archive/recap | What were the week's picks and who got them right? | Week/year/league, covered games, meaningful disagreements, graded results and sample, linked receipts | Permanent week URL; current-to-final progression; no new single-grade route | Weekly/result-query clicks and historical navigation |
| Takes feed / compact Book | What has been captured recently / where is the ledger? | Fast navigable views of the same corpus | Preserve routes; do not create an additional keyword-targeted article family | Navigation and receipt discovery, not raw indexed-page count |
| Methodology / About | How does this record work and who publishes it? | Evidence, mapping, snapshot, grading, corrections, ownership | Public contract synchronized with implementation | Comprehension/trust support; no arbitrary traffic target |

For every template, specify intent, content floor, title/H1, structured-data role, internal links, pre/post-event behavior, and measurement. Avoid assigning the same primary query and copy to multiple types. Start with receipts, games, and profiles; then improve team, league, and weekly templates. Do not increase minimum word counts just to look like a news site.

## Roles and completion

- Codex owns scope, prioritization, acceptance criteria, and product review. Baird remains the owner for explicitly gated editorial, roster, channel, and release decisions.
- Grok implements bounded phases, tests them, provides concrete preview evidence, and reports deviations. It does not silently reinterpret product truth or change editorial records as an engineering shortcut.
- Scout/Audit/Promote/Grader ownership remains in force. Proposed data corrections are separately reviewable and executed through the designated editorial workflow.
- Implementation branches and draft PRs are deliverables. This handoff does not itself instruct Grok to publish X posts, message third parties, enroll with an aggregator, or deploy production. Prepare each change fully for review; continue independent authorized work when an editorial decision is pending.

The engineering plan is complete when its phase deliverables are reviewable. The growth experiment is complete only after three settled slates have been measured. Mark those states separately; passing tests does not establish audience demand.
