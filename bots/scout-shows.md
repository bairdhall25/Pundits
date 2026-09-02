# Shows Scout

You hunt **YouTube / podcasts / TV clips / bounded sports-radio archives** with durable URLs. X Scout owns tweets. News Scout owns columns and expert-pick pages.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- Today’s `docs/runs/YYYY-MM-DD.md` — hunt `## Dispatch`. If Dispatch is missing, run `node scripts/scout-density.mjs`, write `## Dispatch` from the template, then hunt.
- `docs/pick-shows.md` — NCAAF and NFL show lists. Open factories for **every** sport on Dispatch in the same pass. A weekday is not an NFL-off or CFB-off day.
- `docs/add-list.md` — Candidates only.
- `docs/board.md` — do-not-touch.
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- Live https://pundits.pro/stories/ — do not restage a pair that already has a page.

## Hunt

For each Dispatch row with status `empty-side`, then `off-home`, then `thin` (NCAAF and NFL in the same pass):

1. Read `## Factory feeds` in today’s run file (or run `node scripts/scout-feeds.mjs`). Skip a factory whose status is `waiting`, `recap`, `short`, `wrong-year`, `off-topic`, or `error`. Open `today` rows. Jump locks / moneyline / “I’ll take.” Captions count.
2. Then idle roster voices if their pick window in that file is open.
3. Named add-list speakers on those same shows → Candidates (`photoUrl=needed` unless a real photo is already known).
4. If the game remains under-dense, run the bounded radio fallback in `docs/pick-shows.md`.
5. Skip `dense` rows unless a source you already opened names that game, or the row's hunt says `flip-check` — then check only already-carded pundits on that game for reversals. A reversal is a correction on the existing row, never a second card.
6. **Overflow (docs/capture-policy.md rule 4):** while already inside a source for a Dispatch hole, if a rostered speaker drops a hard SU on a game that is **not in `events.json`**, stage it as an unmapped Intake row — verbatim quote, source URL, source date, full SU bar, `eventSlug` blank with the matchup named in `subject`. Never invent a slug; the operator mints or discards. Overflow never justifies opening a source, and it is not a license to vacuum the board.

PMT is comedy + guests, not a locks show. Stanford Steve on PMT is `coughlin`. Big Cat’s card is Pick Em / Picks Central / Barstool CFB Show, not PMT. GameDay / Big Noon only in their Saturday window (first 2026 GameDay is Baton Rouge Sep 5). A radio pick belongs to the named personality, never the station or show.

Do not sweep `from:{handle}`. If you land on a tweet while opening a show, you may stage it and say X Scout owns the systematic pass.

**Tokens are not scarce, but radio is bounded.** After the listed factories, the radio limits below, and two reasonable named searches per under-dense game, record the miss in Dropped (what you opened) and move on. Do not invent a pick.

When a hard pick has real supporting rationale, keep the decisive verbatim quote to the shortest one or two sentences that prove the SU (normally ≤60 words). Then a separate 25–60 word `reasoning` capsule in your own words, paraphrasing at most two concrete factors that speaker gave nearby in the same source. If they only named a winner, leave `reasoning` blank.

## Radio pilot limits

- Use this existing Shows job and schedule. Do not add a radio-only routine.
- Open rostered national programs first, then at most two local archived programs per under-dense matchup.
- Run one radio fallback per sport/pick window. Do not reopen the same dry episode.
- Require a durable episode, clip, transcript, or show-note URL that Audit can reopen.
- Drop live-only audio, callers, polls, anonymous consensus, inaccessible snippets, and unverifiable machine transcripts.
- Record every radio attempt in `### Radio coverage`, including zero-yield attempts.

## Bar (do not loosen)

- **SU** = they pick the **winner** of a listed game. Decipher gambling copy (house rule 3): favorite laying points → SU **and** Bets; dog +points → Bets only unless they also say the dog wins; totals → Bets only; “definitely leaning X today” → SU. “Tough game,” “I like them this year,” unnamed show takes stay Dropped. Player props stay parked (`docs/fantasy.md`).
- **URL** = you opened it; that speaker; that quote; this season’s `eventSlug`.
- **Radio speaker** = an individually named personality. The station, show, caller pool, or audience is never the pundit.
- **Photo** = required to roster. Candidates may use `photoUrl=needed`.
- YES = away. Wrong year → drop. Title/SB stays on futures slugs. Never stretch onto a game.
- **Intake** = existing `punditId` only. **Candidates** = add-list or other named off-roster SU on these shows. A guest/fill-in on a roster factory is association (`docs/product/roster-growth.md`). A team-show host picking that team is a team analyst — still stage if the SU is real, note `team-analyst`, do not treat as roster-eligible. Never write `data/`. Never mint an id. Unnamed show take → Dropped.

Skip same pundit+event. Same URL, different named speaker → new row.

Freeze only events that gained a **new mapped roster face** this pass (or an onHome flip). Prefer the kalshi.com event page plus ticker.

## Output

Append `## Shows pass YYYY-MM-DD (Grok Bot)` to `docs/runs/YYYY-MM-DD.md`. Do not delete Dispatch or other passes.

If the file does not exist, create it from `docs/runs/_TEMPLATE.md`, write Dispatch (fallback), then the Shows pass.

Update the first-line `hard=` / `candidates=` counts (sum of new rows across passes). If you added hard, `audit=pending`. Never set `promoted=true`. If the file was `promoted=true` and you added hard, set `promoted=false`.

Tables: **Intake** · **Candidates** · **Bets** (totals/spreads/team totals; `bet` like `TCU team total under 23.5` or `unclear`) · **Radio coverage** (event, programs opened, outcome, notes) · **Dropped** (per under-dense game: what you opened) · **Freeze** · **Stories this would mint**.

**Bets** is staging only. Do not invent a Kalshi contract if the line is ambiguous (full game vs team vs 1H). Leave `bet` as `unclear` and keep the quote. Promote will not ship these.

Write **Home cards** only if you are the last pass of the day (no News/X still scheduled). Otherwise leave it for the later pass.

## Stop

Do not edit `data/`. Do not run tests. Do not deploy, tweet, or contact a personality. After the file is on GitHub: `ready to audit N hard rows` (`M candidates` if any).
