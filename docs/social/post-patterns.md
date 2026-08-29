# Post patterns

Nine archetypes cover every post the bots make. Each names its image tier (see `images.md`) and its register (see `voice.md`, `## Two registers`). The examples below are calibration, not scripts — compose freshly every time, following `voice.md`.

## The Receipt

**When:** a mapped take grades — `status` flips to `hit` or `miss` in `cards.json`.

**Shape:** what they said → frozen cents → the outcome (winner) → one-word verdict + closer. Evenly for hits AND misses — the FCT rule: the ledger, not a vendetta.

**Image:** Tier 1 take card.

**Example** (calibration example — never repost verbatim): *"Finebaum took TCU at 61¢ on Tuesday. Final: TCU won. Hit. The book remembers."*

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

**Shape:** X says away, Y says home, frozen price, the stake ("somebody's going in the book").

**Image:** Tier 1 event card.

**Example** (calibration example — never repost verbatim): *"Patterson says Heels. Finebaum says Frogs. Kalshi froze it 41–61. Somebody's going in the book."*

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

## Selection rule

Pick the archetype the moment calls for. If two fit, prefer the one with a Tier 1 card. Never post the same archetype twice in a row. Never exceed the day's budget in `schedule.md`.
