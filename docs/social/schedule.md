# Weekly schedule

Keyed to the CFB/NFL calendar so Poster knows when stories are likely. All times ET. This is not a production quota.

Poster computes "today" from `kickoff` fields in `cards.json` at run time. Rank by the primary editorial order in `post-patterns.md`: pregame disagreement, postgame resolution of that disagreement, then a selective notable individual call.

Cards refresh on deploy. `RUNBOOK.md` requires a deploy whenever the book changes — on game days that typically means at least one fresh deploy, but never assume it: always check `generatedAt` before leaning on freshness. If `generatedAt` in `cards.json` is older than 24h on a game day, skip time-sensitive claims rather than inventing a slate post.

## Caps, not slots

| Day | Original cap | Reply Guy |
|---|---|---|
| Tue | 0–2 | Reply sweep (15 cap). |
| Wed | 0–2 | Reply sweep. |
| Thu | 0–3 | Game-day sweep (25 cap) when CFB is actually in window. |
| Fri | 0–2 | Reply sweep. |
| Sat | 0–5 | Heavy sweep (25 cap). |
| Sun | 0–5 | Heavy sweep. |
| Mon | 0–3 | Recap sweep. |

Ranges are ceilings for days when the book actually has a new disagreement, a new result, or a notable individual call. Zero posts is a successful day when nothing new is on the ledger.

Poster: never more than 6 originals/day. Do not post a different archetype merely to alternate formats. Every post body is link-free (link in first self-reply) (sole exception: the Tier-1 attach-failure fallback in `images.md`). Reply Guy caps live in `reply-guide.md` and are also ceilings.

Do not fill leftover cap with:

- a routine favorite win on a one-sided board;
- a 1-0 / 0-1 / 1-1 record as if it were a milestone;
- a Freeze of a pick already named in today's disagreement;
- Harvest, Number, or Live register with no new fact.

Flowers is selective and does not add a posting slot. It may replace an ordinary notable-hit treatment when the call is specific. Miss receipts remain eligible so praise never turns the public record into a winners-only feed.

Tags do not create extra slots. Roll Call, Flowers, and Milestone are the only tagged originals, and each must pass `tagging.md`. A routine Freeze is never tagged. A miss Receipt is never tagged.

## Dead air rule

If live @Pundits_ timeline and destination search offer nothing new — no unposted pregame disagreement, newly graded resolution, or notable individual call — post nothing. Look across the pick/result lifecycle, not only since midnight. `generatedAt` proves freshness, not novelty. If coverage cannot be established, skip. Silence beats filler. Empty is better than false: this is a core product principle, not a style preference.
