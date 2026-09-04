# Product system

Status: Canonical

## Source of truth

The current product is a static Next.js export. Repository JSON is the editorial record:

- `data/pundits.json` — rostered people and identity metadata.
- `data/calls.json` — captured claims, sources, mapping, and grade state.
- `data/events.json` — games/futures, market mapping, frozen prices, and schedule metadata.
- `data/teams.json` — stable team IDs and display metadata.

The application derives pages, records, structured data, feeds, sitemaps, and images from those files. Dated documents do not override live JSON.

## Core objects

### Pundit

A named public sports voice who picks winners as independent analysis, with a stable ID, display name, outlet, photo, and sport scope. A team beat or homer covering one program is not a pundit. A roster entry without a captured call is a thin shell and should remain non-indexable.

### Call

A preserved public statement by a pundit.

- `hard`: objectively testable and eligible to map to an event.
- `soft`: relevant commentary that does not meet the mapping threshold.
- `pending`, `hit`, `miss`: lifecycle states. Unmapped and soft calls remain pending.
- `gradedAt`: optional date added when a mapped hard call leaves pending status, used for audit and crawler freshness.

A call is not automatically a pick. Only a hard call with `eventSlug` and `side` is a mapped pick.

### Event

A game or future with a permanent season-qualified slug. It holds the market contract, frozen cents, source and timestamp, sport, team IDs, and—when relevant—kickoff and week.

Older future records may omit `kind`; application code treats an omitted kind as `future`. New data should make event kind explicit.

### Team

A stable ID and display identity. Team IDs, not mutable display names, connect events and team archive pages.

### Pick story

A derived SEO and sharing object at `/picks/{eventSlug}/{punditId}/`. It is templated from a verified mapped call; it is not separately authored content and must not diverge from the ledger.

## Mapping rules

- Game YES = away team wins.
- Game NO = home team wins.
- A future maps to the explicit contract proposition.
- One hard row per pundit and event.
- Futures never map onto a game merely because the subject overlaps.
- ATS, totals, props, fantasy, title, playoff, and game-winner claims are different objects and must not be stretched across contracts.
- Every mapped call needs a source URL and must reference an existing pundit and event.

## Lifecycle

1. **Submit or discover** — readers may send a public source link as an untrusted lead; Scout also searches high-yield shows, columns, podcasts, bounded durable sports-radio archives, and approved social sources.
2. **Mailbox** — queued community tips are imported into the dated Git run file and routed to Shows, X, or News. A mailbox row is not a call and has no publication authority.
3. **Verify** — confirm the speaker, verbatim quote, publication date, and source URL.
4. **Classify** — determine hard versus soft and reject vague or untestable statements.
5. **Map** — attach an explicit event and side only when semantics match exactly.
6. **Freeze** — record the relevant Kalshi price, source, ticker, and timestamp.
7. **Audit** — reopen evidence before promotion.
8. **Promote** — write validated rows to JSON, run checks, build, and publish.
9. **Distribute** — mint pages, feeds, structured data, OG/story images, and social posts.
10. **Grade** — after settlement, collect authoritative result evidence and propose hit/miss.
11. **Promote result** — update the record without changing the original quote or frozen context.
12. **Recap** — publish the receipt, record change, disagreement outcome, and archive context.
13. **Correct** — preserve URL and history; apply an auditable correction rather than deleting the object.

## Public surfaces

| Surface | Job |
|---|---|
| `/` | Curated scan of timely games, disagreements, recent takes, and active pundits |
| `/ncaaf/`, `/nfl/` | Current sport slates and futures |
| `/ncaaf/{season}/week-{week}/`, `/nfl/{season}/week-{week}/` | Permanent weekly archives |
| `/picks/{eventSlug}/` | Event consensus, sides, quotes, price, and result |
| `/picks/{eventSlug}/{punditId}/` | Permanent individual pick receipt/story |
| `/stories/` | Visual quote and pick feed |
| `/book/` | Dense searchable ledger of hard and soft calls |
| `/pundits/{id}/` | Person history, open exposure, and settled record |
| `/teams/{id}/` | Team-centered picks for and against |
| `/leaderboard/` | Activity before grading; performance after results exist |
| `/submit/` | Public-source tip intake; tips enter Scout for verification and are never published directly |

Published routes are search equity. Data and URL sets are append-only; corrections require redirects or record updates, not deletion.

## Derived record behavior

The code currently infers an event's winning side from consistent graded mapped calls instead of storing a separate event result field. If graded evidence conflicts, the UI must not invent a winner. A future explicit result model should be designed and migrated deliberately, with tests and backward compatibility.

`awayScore` and `homeScore` mean the game is complete. `settledSide` means mapped picks are finished. Winner display on a scored game comes from the scores. Do not invent a new result object in this change.

## Operating boundaries

- Static architecture is intentional at this stage.
- Email early-access capture and the short-lived community-tip queue are the only current server-side persistence, both using Cloudflare KV. The editorial record remains static repository JSON.
- There is no authentication, personalization, comments, live-odds service, or general application database.
- Production is Cloudflare Pages project `pundits`; GitHub Actions verifies but does not deploy.
- `npm test` protects data and logic. `npm run check:fast` runs inexpensive tests and run-file validation during ordinary edits; it is not a release gate. `npm run check` remains mandatory for production build, route, canonical, sitemap, and redirect verification.

## Integrity checks future work must preserve

- Unique call IDs, event slugs, pundit IDs, and team IDs.
- Existing references resolve.
- Only hard calls are mapped.
- Mapped calls have real URLs and valid sides.
- Season-qualified slugs remain permanent.
- Priced events include source provenance and sane cents.
- Thin pundit/team pages remain non-indexable until they have content.
- All public counts and derived records reconcile.
