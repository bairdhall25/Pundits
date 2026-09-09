# Post patterns

The primary editorial order is the job. Named archetypes below are treatments, not a checklist. Compose freshly every time, following `voice.md`. Original-post tags follow `tagging.md`; no treatment outside Roll Call, Flowers, or Milestone earns a tag.

Keep the existing Tier 1 cards. Use team, pundit, and event language first. Introduce a price only when it explains the story, and only as a dated Kalshi snapshot.

## Primary order

### 1. Pregame disagreement

**When:** a `kind: game` event has named pundits on both sides and is not yet settled.

**Shape:** name the people and the teams → why this split is the story (holdout, density, lopsided snapshot) → closer. The assertion is the post. Never a database dump, never a fake feud, never "empty side" when both arrays are populated.

**Image:** Tier 1 event card.

**Example** (calibration example — never repost verbatim): *"Kyle Brandt picks the 49ers. Cowherd, Eisen, and McIntyre pick the Rams. Four tracked calls, one holdout ahead of Thursday's opener."*

**Roll Call overlay:** if the event also passes the density gate in `tagging.md` (four distinct pundits, both sides), the same post may tag approved central voices. One Roll Call per event. If it misses that gate, post the disagreement untagged.

### 2. Postgame resolution of that disagreement

**When:** that same two-sided game grades, and `gradedAt` on a mapped take or the event `kickoffDate` is within 3 ET days. Older settled boards are not a resolution candidate. Do not backfill them to fill leftover cap.

**Shape:** final score → who had each team → straight-up result. Hits and misses stay in the same post. Never "cover" from a winner-only grade. Never imply we watched the game. If the stored claim names a spread or cover, name the team and the straight-up result; do not quote the cover fragment.

**Image:** Tier 1 event card — the same card family as the pregame post, now in its graded state if the build refreshed it.

**Example** (calibration example — never repost verbatim): *"North Carolina 15, TCU 10. Patterson and McElroy had the Heels. Finebaum and Compton had TCU. Straight-up, the underdog side hit."*

### 3. Selective notable individual call

**When:** a single mapped take has a specific reason to care: underdog at the snapshot, holdout on a tracked board, or unusually specific verified evidence. Not every pending row, and not a 94¢ favorite that won.

**Shape:** pundit → team → the reason it is notable → dated snapshot only if the price is the reason → result if graded. On `gradingScope: straight-up-winner`, never lead with a cover/ATS fragment even if that wording is in `claim`. Say the picked team, then that the tracked result is the straight-up winner.

**Image:** Tier 1 take card.

**Example** (calibration example — never repost verbatim): *"Chip Patterson picked North Carolina. Kalshi snapshot: 26¢, as of Aug 28, 2026. Final: North Carolina 15, TCU 10. Straight-up hit."*

**Flowers overlay:** a notable `hit` may use Flowers copy and the pundit tag when `tagging.md` passes. Flowers replaces an ordinary hit treatment; it does not add a second post about the same result. Never tag a miss.

## Optional treatments

Use these only when they add a fact the primary order does not already tell.

### The Freeze

A newly captured pending take that is not already named in a disagreement post. Quote spoken claims; label reported selections as selections. Untagged.

### The Receipt

An individual grade that is not already covered by a disagreement resolution or Flowers post. Even hits and misses. Never a cover claim from a winner-only grade.

### The Number / The Ledger Move / The Milestone

A tracked-record fact with stakes and a printed sample size. Skip 1-0 and other near-zero samples. Milestone tags follow `tagging.md`. Ordinary ledger movement stays untagged.

### The Slate

Morning of a game day, only when several tracked picks actually resolve today and the marquee disagreement has not already been posted. Never a futures "tonight."

### Live register

Only while a tracked game is genuinely underway. Pending pick plus the fact the game is in window. No scores, no manufactured viewing.

### The Self-Grade

The site's own week-leans grade (`docs/week1-leans.md` lineage), when that slate actually grades.

### The Harvest

Off-window observation about takes culture, at most rare, never to fill a quiet day.

## Futures

Rules for any `kind: "future"` event, whatever the treatment:

- **YES is the named outcome; NO is the field** — everything else. The NO price is the price of "anyone but," never the price of a pundit's stated alternative. A separate outcome ("Bills win the Super Bowl") has its own event and its own price; if it isn't in `cards.json`, don't attach a number to it.
- **A NO-side pundit whose claim names a specific alternative made a bolder call than the NO price implies.** Quote the claim and frame the boldness honestly, or give it its own post; never write "X says Bills … 16–84," which pins the field's price on one team.
- **Never write a future in game language.** No away/home, no "tonight," no "settling" — futures resolve at season's end. The Slate and Live register never include futures.

## Selection rule

Pick the treatment the moment calls for, in the primary order above. Do not rotate archetypes for variety. Prefer the event card for disagreement and resolution. A postgame resolution is eligible only when `gradedAt` or `kickoffDate` is within 3 ET days; skip older settled disagreements. Never exceed the day's cap in `schedule.md`. Never post to use leftover cap. Routine favorite wins and near-zero-sample records need a specific reason, or they stay off the timeline.
