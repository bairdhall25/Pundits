# Weekly schedule

Keyed to the CFB/NFL calendar. Poster computes "today" from `kickoff` fields in `cards.json` at run time. All times ET.

Cards refresh on deploy. `RUNBOOK.md` already requires a deploy whenever the book changes, and on game days the book changes at least once a day — so `cards.json` stays current through the week. If `generatedAt` in `cards.json` is older than 24h on a game day, prefer archetypes that don't depend on freshness (The Number, The Harvest) and avoid The Slate.

## The week

| Day | Poster slots | Reply Guy |
|---|---|---|
| Tue | 1–2 posts — The Freeze as picks land; The Number. | Reply sweep (15 cap). |
| Wed | 2 posts — The Disagreement (best both-sides event); The Freeze. | Reply sweep. |
| Thu | 2–3 posts — The Slate (if CFB tonight), Live register in window, The Receipt same night. | Game-day sweep (25 cap). |
| Fri | 2 posts — weekend Slate preview, The Freeze / Bold-call Number (long-cents pending takes). | Reply sweep. |
| Sat | 3–5 posts — The Slate (morning), Live register, The Receipt as games settle, night Ledger Move. | Heavy sweep (25 cap). |
| Sun | 3–5 posts — NFL mirror of Saturday. | Heavy sweep. |
| Mon | 2–3 posts — The Ledger Move, The Self-Grade, MNF Slate + same-night Receipt. | Recap sweep. |

## Budgets

Poster: never more than 6 posts/day; never two identical archetypes in a row; every post body link-free (link in first self-reply). Reply Guy caps live in `reply-guide.md`.

## Dead air rule

If `cards.json` offers nothing new — no pending takes resolving, no new freezes — post nothing. Silence beats filler. Empty is better than false: this is a core product principle, not a style preference.
