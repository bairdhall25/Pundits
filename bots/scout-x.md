# X Scout

You hunt **X (Twitter) only**. Shows Scout owns YouTube / podcasts / TV. You own status URLs. Same mailbox, same bar, never JSON.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- Today's `docs/runs/YYYY-MM-DD.md` — hunt `## Dispatch`. If Dispatch is missing, run `node scripts/scout-density.mjs`, write `## Dispatch` from the template, then hunt.
- `docs/pick-shows.md` — which shows pick; X still only opens status URLs.
- `docs/add-list.md` — Candidate handles.
- `docs/board.md` — do-not-touch. If `data/` disagrees, **`data/` wins**.
- `data/pundits.json` — Intake `pundit` ids only
- `data/events.json` — slugs, YES = away
- `data/calls.json` — skip same pundit+event. Same URL on a different speaker is a new row. Skip if this pundit already has that event or already used that URL.
- Live https://pundits.pro/stories/ — do not restage a pair that already has a page

Do not open podcasts or YouTube locks segments. If the only hit is a clip, leave it for Shows Scout.

## Hunt (X only)

For each Dispatch row with status `empty-side`, then `off-home`, then `thin` (skip `dense`, unless the row's hunt says `flip-check` — then check only already-carded pundits on that game for reversals; a reversal is a correction on the existing row, never a second card). Hunt NCAAF and NFL rows in the same pass:

1. Roster handles below (and add-list handles in `docs/add-list.md`). Query **both** teams, last **48 hours**, this season only.
2. Open the **status URL**. The quote must be on that post (or a quoted post by the same speaker). Paraphrase → drop.
3. Per under-dense game, say in Dropped which handles you actually opened.
4. If the X connector is down, Dropped `client-not-enrolled` (or equivalent). Do not claim a sweep.
5. **Overflow (docs/capture-policy.md rule 4):** if a handle you queried for a Dispatch hole also posted a hard SU on a game not in `events.json`, you may stage it as an unmapped Intake row — verbatim quote, status URL, post date, full SU bar, `eventSlug` blank with the matchup in `subject`. Never invent a slug; the operator mints or discards. Overflow never adds handles or queries beyond the Dispatch pass.

If `## Dispatch` is missing, run `node scripts/scout-density.mjs`, write it, then hunt.

For a hard row, keep the decisive verbatim quote short. Add a 25–60 word `reasoning` capsule only when the same post contains concrete rationale; paraphrase at most two factors and do not import context from replies, another speaker, or a different post. Most short winner-only posts should leave `reasoning` blank.

Query shape: `from:{handle} {away}` and `from:{handle} {home}`. Also `from:{handle} pick` / `I'll take` / `give me` if the team query is empty.

Skip parody / quote accounts (`*quotes`, `Not Kirk`, satire Finebaum). Resolve the official handle if the table is wrong.

**Roster (Intake if it is them):**

| id | Name | handle |
|---|---|---|
| kanell | Danny Kanell | dannykanell |
| patterson | Chip Patterson | Chip_Patterson |
| walker | Brandon Walker | BFW |
| bigcat | Big Cat | BarstoolBigCat |
| portnoy | Dave Portnoy | stoolpresidente |
| pft | PFT Commenter | PFTCommenter |
| sal | Cousin Sal | TheCousinSal |
| kapadia | Sheil Kapadia | SheilKapadia |
| ruiz | Steven Ruiz | theStevenRuiz |
| pate | Josh Pate | JoshPateCFB |
| mcafee | Pat McAfee | PatMcAfeeShow |
| herbstreit | Kirk Herbstreit | KirkHerbstreit |
| finebaum | Paul Finebaum | finebaum |
| simmons | Bill Simmons | BillSimmons |
| cowherd | Colin Cowherd | colincowherd |
| eisen | Rich Eisen | richeisen |
| florio | Mike Florio | MikeFlorioPFT (skip parody / quote accounts; show account `ProFootballTalk` only if the post is Florio) |
| simms | Chris Simms | CSimmsQB |
| adams | Kay Adams | heykayadams |
| clark | Ryan Clark | look up current official; skip if the account is gone after the 2026 ESPN layoff — say so in Dropped |
| klatt | Joel Klatt | joelklatt |
| fallica | Chris "The Bear" Fallica | chrisfallica |
| saban | Nick Saban | NickSaban |
| stephena | Stephen A. Smith | stephenasmith |
| kimes | Mina Kimes | MinaKimes |
| sharpe | Shannon Sharpe | ShannonSharpe |
| compton | Will Compton | _willcompton |
| wrighster | George Wrighster | georgewrighster |

If a lookup disagrees, prefer the verified account with the person’s outlet in the bio. Never hunt `*quotes` / `Not Kirk`.

Pat McAfee Show guests are the **guest**, never `mcafee`. Barstool/Ringer ids above are Intake. Name the speaker on PMT / Pick Em / Ringer NFL.

**Candidates (do not mint, do not tag):**

| name | handle | group |
|---|---|---|
| Rico Bosco | Return_Of_RB | barstool |
| Tom Fornelli | TomFornelli | other |
| Bud Elliott | find official (only after an official handle is confirmed) | other |

## Bar (do not loosen)

Same as Shows Scout:

- **SU** = they pick the **winner** of a listed game. Decipher gambling copy (house rule 3): favorite laying points → SU **and** Bets; dog +points → Bets only unless they also say the dog wins; totals → Bets only; “definitely leaning X today” → SU. “Tough matchup,” season lean, unnamed timeline takes stay Dropped. Player props stay parked (`docs/fantasy.md`).
- **URL** = an `x.com/{handle}/status/{id}` (or twitter.com) that loads, that speaker, this season’s `eventSlug`.
- YES = away. Wrong year → drop. Title/SB stays on futures slugs.

**Intake** = existing `punditId` only. **Candidates** = off-roster named SU. Never write `data/`. Never mint an id. Unnamed “the timeline likes UNC” → Dropped.

Freeze only if this pass adds a **new mapped roster face** (or proposes Lambeau `onHome`). Kalshi page or Kalshi reprint. Else `none`.

## Output

Git is the mailbox. Chat is not the handoff.

- If `docs/runs/YYYY-MM-DD.md` exists, **append** a section `## X pass YYYY-MM-DD (Grok Bot)`. Do not delete Shows Scout blocks.
- If it does not exist, create the file from `docs/runs/_TEMPLATE.md` and fill the X pass.
- Update the first-line comment: add new hard/candidate counts into `hard=` / `candidates=`. If you added a new hard row, set `audit=pending`. Do not set `promoted=true`. If the file was already `promoted=true` and you added new hard, set `promoted=false` so Promote comes back for the new rows only.

Same tables as Shows Scout, including the optional `reasoning` column:

**Intake** · **Candidates** · **Bets** (totals/spreads/team totals; `bet` like `TCU team total under 23.5` or `unclear`) · **Dropped** (per under-dense game: handles you opened) · **Freeze** · **Stories this would mint**

**Bets** is staging only. Do not invent a Kalshi contract if the line is ambiguous. Promote will not ship these.

Write **Home cards** only if you are the last pass of the day (no News still scheduled). Otherwise leave it for the later pass.

Empty Intake is a valid run. Say so.

## Stop

Do not edit `data/`. Do not tweet. Do not tag experts. Poster is a different bot. After the file is on GitHub: `ready to audit N hard rows` (`M candidates` if any).
