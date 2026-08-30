# Post patterns

Ten archetypes cover every post the bots make. Each names its image tier (see `images.md`) and its register (see `voice.md`, `## Two registers`). The examples below are calibration, not scripts — compose freshly every time, following `voice.md`.

## The Receipt

**When:** a mapped take grades — `status` flips to `hit` or `miss` in `cards.json`.

**Shape:** what they said → frozen cents → the outcome (winner) → one-word verdict + closer. Evenly for hits AND misses — the FCT rule: the ledger, not a vendetta.

**Image:** Tier 1 take card.

**Example** (calibration example — never repost verbatim): *"Finebaum took TCU at 61¢ on Tuesday. Final: TCU won. Hit. The book remembers."*

## The Flowers

**When:** a notable mapped take grades `hit` and the pundit made a clear, specific call worth celebrating. Use selectively; not every hit needs flowers.

**Shape:** name the pundit → preserve the strongest faithful fragment of the original call → state the frozen cents and final result → give specific credit. Prefer "called this one" or "got this one right" over claims that one result proves expertise. Tag the pundit and original outlet when appropriate.

**Image:** Tier 1 take card using one of the approved Flowers treatments in `images.md`: Broadcast Spotlight or Quote-First.

**Example** (calibration example — never repost verbatim): *"Give Chip Patterson his flowers. He took North Carolina outright at 41¢, on the record, before kickoff. Final: Carolina won. Called it. 💐"*

**Boundary:** The Flowers is the celebratory layer, not the ledger. It never replaces The Receipt's even coverage of hits and misses, never hides the sample size behind an overall record, and never turns one correct pick into a claim of predictive skill.

## The Freeze

**When:** a new hard pick lands — a new take row, `status` pending.

**Shape:** quote-lede (the most arguable short phrase of `claim`, in quotes) → pundit named → event + frozen cents.

**Image:** Tier 1 take card.

**Example** (calibration example — never repost verbatim): *"'Give me the Heels.' Chip Patterson is on North Carolina at 41¢. It's in the book."*

## The Number

**When:** the ledger yields a stat with stakes — a streak, a first, a worst-since, a rank — computed only from `cards.json` records, never invented.

**Shape:** Opta anatomy — "N — fact with stakes. Closer."

**Image:** Tier 1 pundit card, or none.

**Example** (calibration example — never repost verbatim): *"3 — Finebaum has taken the road team three straight weeks. All three are in the book."*

## The Disagreement

**When:** an event has named pundits on both sides — `yesPundits` and `noPundits` both non-empty.

**Shape:** name the pundits on each side → the frozen price with each side attached to it → assert who is bolder at the price. Near a coin flip, the stake is that somebody's record takes the loss. When the price is lopsided, the story is the minority side: say what the underdog pundits put on the record, priced. The assertion is the post — never just a list of who-said-what.

Team language ("X says away, Y says home") is for `kind: "game"` only. On a `kind: "future"` the sides are the named outcome vs. the field — follow `## Futures` below.

**Image:** Tier 1 event card.

**Example — game, near coin flip** (calibration example — never repost verbatim): *"Patterson says Heels. Finebaum says Frogs. Kalshi froze it 41–61. Somebody's going in the book."*

**Example — future, lopsided price** (calibration example — never repost verbatim): *"'Stafford wins it.' Orlovsky and Butler both have the Rams winning it all, priced at 16¢. Bold, on the record, in the book."*

## The Slate

**When:** morning of a game day — computed from `kickoff` at post time.

**Shape:** how many tracked picks resolve today + the marquee disagreement.

**Image:** Tier 1 event card of the marquee game.

**Example** (calibration example — never repost verbatim): *"9 tracked picks settle today. The loudest: Patterson and Finebaum on opposite sides of UNC–TCU at 41–61."*

## The Ledger Move

**When:** after a graded slate reshuffles records.

**Shape:** the number is the headline — who leads, who slid.

**Image:** Tier 1 pundit card of the mover.

**Example** (calibration example — never repost verbatim): *"New leader in the book: Patterson, 5-1 on the season. Finebaum drops to 3-3. Standings don't argue."*

## Live register

**When:** games underway — computed from `kickoff`; only while genuinely in-window.

**Shape:** fragments; no scores, no in-game stats — the post uses only what the index carries: the pending pick, the frozen price, and the fact the game is underway (computed from `kickoff`); never an outcome claim before the take settles.

**Image:** none or Tier 1.

**Example** (calibration example — never repost verbatim): *"Finebaum's TCU lean is live. 61¢ frozen on Tuesday, settling tonight. The book is watching."*

## The Self-Grade

**When:** the site's own week-leans grade (see `docs/week1-leans.md` lineage).

**Shape:** our record first, dry.

**Image:** Tier 1 or none.

**Example** (calibration example — never repost verbatim): *"Our Week 0 leans went 1-2. The receipt cuts both ways."*

## The Harvest

**When:** 1–2x weekly, off game windows.

**Shape:** prompt-shaped observation about takes culture (never a bare question); feature the best replies later by quoting them with credit.

**Image:** Tier 2 or none.

**Example** (calibration example — never repost verbatim): *"Every fanbase has one pundit they refuse to forgive. The book just writes down why."*

## Futures

Rules for any `kind: "future"` event, whatever the archetype:

- **YES is the named outcome; NO is the field** — everything else. The NO price is the price of "anyone but," never the price of a pundit's stated alternative. A separate outcome ("Bills win the Super Bowl") has its own event and its own price; if it isn't in `cards.json`, don't attach a number to it.
- **A NO-side pundit whose claim names a specific alternative made a bolder call than the NO price implies.** "I have the Bills beating the Rams in the Super Bowl" is not an 84¢ position — it's a precise two-team call. Quote the claim and frame the boldness honestly, or give it its own post; never write "X says Bills … 16–84," which pins the field's price on one team.
- **Never write a future in game language.** No away/home, no "tonight," no "settling" — futures resolve at season's end. The Slate and Live register never include futures.

## Selection rule

Pick the archetype the moment calls for. If a hit fits both The Receipt and The Flowers, use Flowers only when the call is specific, notable, and likely to matter to the pundit's audience; otherwise use The Receipt. Prefer a Tier 1 card when two other archetypes fit. Never post the same archetype twice in a row. Never exceed the day's budget in `schedule.md`.
