# Weekly schedule

Keyed to the CFB/NFL calendar. Poster computes "today" from `kickoff` fields in `cards.json` at run time. All times ET.

Cards refresh on deploy. `RUNBOOK.md` requires a deploy whenever the book changes — on game days that typically means at least one fresh deploy, but never assume it: always check `generatedAt` before leaning on freshness. If `generatedAt` in `cards.json` is older than 24h on a game day, prefer archetypes that don't depend on freshness (The Number, The Harvest) and avoid The Slate.

## The week

| Day | Poster slots | Reply Guy |
|---|---|---|
| Tue | 1–2 posts — The Freeze as picks land; The Number. | Reply sweep (15 cap). |
| Wed | 2 posts — The Disagreement (best both-sides event); The Freeze. | Reply sweep. |
| Thu | 2–3 posts — The Slate (if CFB tonight), Live register in window, The Receipt same night. | Game-day sweep (25 cap). |
| Fri | 2 posts — The Slate (weekend preview); The Freeze — favor pending takes at long cents (bold calls). | Reply sweep. |
| Sat | 3–5 posts — The Slate (morning), Live register, The Receipt as games settle, The Ledger Move (night). | Heavy sweep (25 cap). |
| Sun | 3–5 posts — NFL mirror of Saturday. | Heavy sweep. |
| Mon | 2–3 posts — choose 2–3 among: The Ledger Move, The Self-Grade, The Slate (MNF), The Receipt (same night). | Recap sweep. |

## Budgets

Poster: never more than 6 posts/day; never two identical archetypes in a row; every post body link-free (link in first self-reply) (sole exception: the Tier-1 attach-failure fallback in `images.md`). Reply Guy caps live in `reply-guide.md`.

## Dead air rule

If the live @Pundits_ timeline comparison offers nothing new — no unposted pending take, newly graded result, or unused scheduled moment — post nothing. `generatedAt` proves freshness, not novelty. Silence beats filler. Empty is better than false: this is a core product principle, not a style preference.
