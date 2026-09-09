<!-- pundits-run date=YYYY-MM-DD hard=0 candidates=0 audit=pending promoted=false -->
Overflow unlisted SUs: leave `eventSlug` and `side` blank; name the matchup in `note`, outside the verbatim quote. Do not invent a slug. See `docs/capture-policy.md`.
Row-level Audit identity is `rowId` from `scripts/scout-handoff-lib.mjs`. A day-level fail does not block other ok mapped rows. Do not backfill publication milestones from sourceDate.

## Dispatch

Paste `node scripts/scout-density.mjs`. Hunt approved targets only. Proposed shortlist is PM review, not a hunt list.

| eventSlug | sport | yes | no | status | hunt | priority | kickoff |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Lane status

Each expected lane reports completed, dry, blocked, or not-run. A missing run is not a dry hunt. A connector failure is blocked, not a sweep.

| lane | status | asOf | note |
|---|---|---|---|
| Shows | not-run | | |
| X | not-run | | |
| News | not-run | | |

## Factory feeds

Paste `node scripts/scout-feeds.mjs`. This is a discovery check, not an inspection. Open recent-unprocessed episodes; skip dry rows unless a new reason is stated.

| factory | last drop (ET) | title | status | hunt |
|---|---|---|---|---|
| | | | | |

## Community tips

Untrusted discovery leads only. A tip must clear the normal Scout, Audit, and Promote bar before it can become a pick.

| tipId | receivedAt | discovery | lane | pundit hint | event hint | sourceUrl | where to look | status |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Shows pass YYYY-MM-DD (Grok Bot)

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| | | | | | |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| | | | |

### Episode coverage

Persist identity in `docs/scout-episodes.json` after opening. A feed check is not an inspection.

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| | | | | | | |

### Dropped

-

### Freeze

none

### Stories this would mint

*(none)*

## X pass YYYY-MM-DD (Grok Bot)

X (Twitter) only. Shows Scout owns episodes. News Scout owns columns.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| | | | | | |

### Dropped

-

### Freeze

none

### Stories this would mint

*(none)*

## News pass YYYY-MM-DD (Grok Bot)

Bylined columns and expert-pick pages only.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| | | | | | |

### Dropped

-

### Freeze

none

### Home cards

-

### Stories this would mint

*(none)*
