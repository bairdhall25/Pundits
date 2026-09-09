# Phase 3A implemented SEO contract

Status: Evidence. Date: 2026-09-08.

This is the implemented page-type contract for receipts, game comparisons, and pundit profiles. It does not create duplicate routes for wording variants. Team, league, and weekly templates remain Phase 3B.

Shared rules: existing URLs; existing card previews; no SportsEvent markup; no FAQPage on these templates; schema and snippets derive from the same public content helpers in `lib/page-content.ts`; crawler access and `max-image-preview:large` unchanged.

| Type | Intent / search question | Content floor | Title / H1 | Schema | Internal links | Lifecycle | Analytics |
|---|---|---|---|---|---|---|---|
| Receipt `/picks/{slug}/{punditId}` | Who did this pundit pick, why, and was it right? | Direct answer first; source identity/date/locator; actual rationale only if present (winner-only stays short); publisher and timestamps; named disagreement; dated optional Kalshi snapshot; result and winner-only grading scope | Title and H1 from `takeHeadline` (`{name} picks/picked {team} over {team}` plus verdict when graded). No “best experts” claims | `NewsArticle` from the same `pickStory` paragraphs as the visible article. Pundit is `mentions`, not author | Game comparison (or Market page on futures), source, profile, teams, week archive. Previous/next exist but are not the only path | One permanent URL. Grade updates `dateModified` / visible result; unknown `firstPublishedAt` stays omitted | `pick_story_open` with `page_type=receipt`, `event_slug`, `pundit_id`, `status`, `surface` |
| Game `/picks/{slug}` | Who picked each side of this matchup? | Named sides, tracked count, named disagreement when both sides exist, honest empty sides, event date, result, accessible source-backed receipt list. Never a complete survey of all experts | Title: pending `{matchup}: who picked whom` (date when known); graded `{winner} beat {loser}: who called it`. H1 is the matchup title | `WebPage` with the comparison description. `about` SportsTeam names only. No SportsEvent / Event | Individual receipts; relevant team pages; week archive when the event has season/week | Same season-qualified URL before and after the game. Empty shells stay noindex until a mapped pick lands | `event_detail_open` with `page_type=game`, `event_slug`, `sport`, `surface` |
| Profile `/pundits/{id}` | What are this person's current picks and tracked record? | Outlet identity; current mapped picks; dated 2026 record with graded sample; linked historical receipts; explicit tracked-sample disclaimer | Title: `{name}: current picks and tracked record`. H1 is the person name | `WebPage` with `mainEntity` Person, plus Person. No career-skill claim | Current and past CallCards link to receipts and sources | Durable person URL. Empty shells stay noindex until the first tracked call | `pundit_profile_open` with `page_type=profile`, `pundit_id`, `surface=profile`; CallCard `pick_story_open` / `source_open`; native `share_intent` |

How each template answers its question:

- Receipt: the H1 is the pick and result; the receipt block is the evidence; story paragraphs do not synthesize a missing rationale.
- Game: the lede names who picked each team, including empty sides, without opening a card; the receipt list is crawlable HTML.
- Profile: current vs past are separate sections; the 2026 line states the graded sample and that it is not a career record or skill score.
