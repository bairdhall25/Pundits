# Capsule gate repair plan

Status: Approved 2026-09-03 — ready for implementation

Date: 2026-09-03

Owner: Codex

## Problem

On 2026-09-03 Audit reviewed 21 mapped/overflow hard rows and cleared 2. Promote
shipped 2 calls. 19 rows were rejected.

Classify the 19 by what was actually wrong:

| Bucket | Rows | Pick itself |
|---|---|---|
| `reasoning` capsule under the 25-word floor | **14** | Audit confirmed it, at a timestamp |
| `reasoning` capsule factually wrong | **2** | Audit confirmed it |
| Pick evidence defective | **3** | Genuinely bad |

**16 of 19 rejections were verified picks blocked by an optional field.** Only 3
rows had a defect in the pick: Patterson's Notre Dame quote stitched separated
remarks, Patterson's Ole Miss pick belongs to "the Dentist", and Compton's Auburn
quote was mixed with Taylor Lewan's.

Evidence: [`docs/runs/2026-09-03-audit.md`](../../runs/2026-09-03-audit.md),
[`docs/runs/2026-09-03e-locks.md`](../../runs/2026-09-03e-locks.md),
[`docs/runs/2026-09-03b-assoc.md`](../../runs/2026-09-03b-assoc.md).

Rows lost this way included Kanell on Oregon, Michigan, FIU and Cal, Patterson on
SMU, Toledo and Tulsa, Cowherd on Texas, and six McIntyre NFL Week 1 winners.

## Root cause

Three rules are individually sensible and collectively perverse.

1. `bots/README.md` house rule 10 and `bots/audit.md` rule 7 require a `reasoning`
   capsule of 25–60 words, faithful to the source.
2. `bots/audit.md` rule 7 also states **"Blank reasoning is valid."**
3. A capsule that violates the range makes the verdict `fail`, and
   `docs/board.md` is explicit that **"a fail stays out of JSON."**

Together: staging no capsule ships the pick, and staging an imperfect capsule
kills the pick. Scout is penalised for attempting the higher-value work, and the
penalty falls on the pick rather than on the field that was wrong.

A second defect compounds it. Scout writes routing notes for Promote and Audit
*inside* the `reasoning` cell — "Off-home; Scout does not propose the flip",
"Dense game; rostered LOCKS host, not previously carded here", "Conflicts
Patterson SMU −3; Audit reopen both". Those words are counted toward the 25-word
floor but must never reach a `/picks/` page. Promote therefore strips them, and
stripping can push a capsule that Audit passed below the floor. This happened
twice on 2026-09-03: Kanell's FSU capsule was 31 words as staged and 24 once the
routing clause was removed, and Patterson's SMU capsule went 18 → below floor.
Both shipped with `reasoning` omitted because rule 2 forbids Promote from
expanding a capsule.

## Goal

No verified pick is ever blocked by a defect in an optional field. `fail` means
the pick is not trustworthy. A bad capsule costs the capsule, not the pick.

## Locked decisions

1. `reasoning` stays **optional**, and blank stays valid. This plan does not
   weaken the capsule standard for capsules that ship.
2. Audit keeps full authority to reject a pick. Nothing here lets a
   wrong-speaker, stitched-quote, wrong-side, wrong-season, dead-URL or restaged
   row into `data/`.
3. Promote still never writes, expands, or repairs a capsule.
4. No change to pick semantics, URL structure, grading, or market semantics.
5. The 60-word ceiling stays. This pipeline runs on ASR and every 2026-09-03
   Scout pass flagged noisy audio, so "capture the reason" degrades into pasting
   transcript without a cap. House rule 10 already forbids play-by-play and
   transcript dumps; 60 words is what makes that enforceable rather than a
   judgment call.
6. **There is no minimum.** See § Capsule length below.
7. No limit of any kind applies to `claim`, the verbatim quote. A two-word pick
   is a pick.

## Capsule length — decided

**The floor is removed. The ceiling stays. Faithfulness is the gate.**

A word count cannot distinguish a good short capsule from a thin one:

> "Patterson takes SMU laying three as the better, more experienced team with the
> coaching edge over Florida State." — 18 words, rejected under the old floor
>
> "Moneyline sprinkle. He is picking Cal to beat UCLA outright." — 10 words,
> rejected under the old floor

Both are true and source-grounded. The second is short but carries real context:
"moneyline sprinkle" tells a reader this was a plus-money flyer rather than a
conviction call. Discarding it leaves the pick page with no reason at all, which
is worse for the reader and protects nothing.

What the floor was reaching for — "did you actually capture the reason" — is
already covered, and covered better, by Audit's faithfulness test: a capsule must
be a true paraphrase of at most two concrete factors the same speaker gave in
that source, with no invented analysis. Audit judges that on the audio. A word
count only guessed at it.

Implementation:

- `bots/README.md` house rule 10: drop the 25-word minimum, keep "at most 60
  words", keep the two-factor faithfulness requirement and the no-transcript-dump
  rule.
- `bots/audit.md` rule 7: drop the minimum; see Change 1 for the rewritten rule.
- `lib/calls.test.ts`: remove the `toBeGreaterThanOrEqual(25)` assertion on
  `reasoning`; keep `toBeLessThanOrEqual(60)` and the single-paragraph check.
- `scripts/validate-run.mjs` (Change 3): ceiling and single-paragraph only.

No limit is introduced on `claim`. There has never been one and there should not
be: "CATS win" is a complete straight-up pick.

## Change 1 — Audit verdicts separate pick defects from capsule defects

**This is the change that recovers the picks. Ship it first; it stands alone.**

`bots/audit.md`, the "Do" and "Output" sections.

Add two verdicts:

- `ok-no-reasoning` — the pick, speaker, event, side, season, URL and quote all
  hold, and the only defect is in `reasoning` (out of range, unsupported,
  speaker-mixed capsule text, factually wrong capsule, multi-paragraph).
- `ok-unmapped-no-reasoning` — same, for an overflow row.

Reserve `fail` for defects in the pick itself. Rewrite rule 7 so the capsule
clause cannot produce `fail`:

> 7. Any `reasoning` capsule must be at most 60 words, a faithful paraphrase of at most
>    two concrete factors the same speaker gave in that source, and free of
>    copied captions or added analysis. Blank reasoning is valid. A capsule that
>    is out of range, unsupported, speaker-mixed, or factually wrong is a
>    **capsule** defect, not a pick defect: verdict `ok-no-reasoning` (or
>    `ok-unmapped-no-reasoning`) and name the defect in the note. Never repair a
>    capsule by inventing copy. A capsule defect never makes the row `fail`.

Then state plainly what does:

> A row is `fail` only when the pick cannot be trusted: the `sourceUrl` is dead,
> the quote is not on the page, the quote stitches separated remarks into one
> utterance, the speaker is not the staged `punditId`, the row is a caller or
> anonymous consensus, the `eventSlug`/`side`/season mapping is wrong, the row is
> a total-only or cover-only bet staged as Intake, or it restages a booked
> pundit+event.

Update the tally line to carry the new buckets:

```
N ok / U ok-unmapped / R ok-no-reasoning / S ok-unmapped-no-reasoning / M fail / ready to promote K
```

`K` counts new mapped hard rows marked `ok` **or** `ok-no-reasoning` and not
already in `calls.json`.

Update the `audit=ok` / `audit=fail` rule: `audit=ok` when no new hard row is
`fail`. Capsule defects no longer flip a run to `audit=fail`.

Applied to 2026-09-03 this turns `1 ok / 1 ok-unmapped / 19 fail / promote 1`
into roughly `1 ok / 1 ok-unmapped / 14 ok-no-reasoning / 2 ok-unmapped-no-reasoning / 3 fail`,
with 3 rows correctly still out.

## Change 2 — routing notes leave the `reasoning` field

`docs/runs/_TEMPLATE.md`, `bots/scout-shows.md`, `bots/scout-x.md`,
`bots/scout-news.md`, `bots/README.md` house rule 10.

Add a `note` column to the Intake and Candidates tables, after `reasoning`:

```
| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
```

`reasoning` becomes strictly reader-facing: it is the only text that may reach a
`/picks/` page. `note` carries everything addressed to Promote, Audit or the
operator — off-home status, dense-game context, conflicts to reopen, split-or-
discard instructions, flip-check results.

Consequences to encode:

- Word counts are honest, because no routing text pads them.
- Promote stops stripping. `bots/promote.md` step 2 becomes "copy `reasoning`
  exactly as staged, or omit it when blank or when Audit marked the row
  `ok-no-reasoning`. Never copy `note` into a call."
- House rule 10 gains: "Routing notes go in `note`, never inside `reasoning`.
  `reasoning` is reader-facing copy and is the only field that can reach a pick
  page."

`note` is not written into `data/`. It exists only in the run file.

## Change 3 — validate capsules at staging time

New `scripts/validate-run.mjs`, plus `scripts/validate-run.test.mjs`.

Scout runs it before committing a run file; it also runs in the suite so a
committed run file with a broken row fails CI rather than surfacing an hour later
in Audit.

Per Intake/Candidates row, check:

1. `reasoning`, when present, is at most 60 words and single-paragraph. There is
   no minimum.
2. `reasoning` contains no routing-clause markers — `Off-home`, `Dense game`,
   `Conflicts`, `Audit reopen`, `Audit must reopen`, `operator splits`,
   `Scout does not propose`, `not previously carded`, `not a flip`. These belong
   in `note`.
3. `verbatim quote` is non-empty and carries no `Overflow: <matchup>.` prefix
   inside the quoted words — that label belongs in `note` or is implied by a
   blank `eventSlug`.
4. A row with an `eventSlug` has `side` in {`yes`,`no`}; a row with a blank
   `eventSlug` has a blank `side`.
5. `sourceDate` matches `YYYY-MM-DD`.
6. `sourceUrl` is present, and for an X row matches
   `x.com/<handle>/status/<id>` or the `twitter.com` equivalent.
7. No two rows share the same `punditId` + `eventSlug`.
8. Every `eventSlug` that is non-blank exists in `data/events.json`.

Exit non-zero with a per-row report naming the row and the failing check.

Wire into `package.json`:

```
"validate:runs": "node scripts/validate-run.mjs docs/runs"
```

and add `validate:runs` to whatever `npm run check` chains, so a bad run file
cannot reach `main`.

Add the command to each Scout standing block in `bots/README.md`: "Run
`node scripts/validate-run.mjs docs/runs/YYYY-MM-DD.md` before you commit. A
failing row is yours to fix, not Audit's to reject."

## Change 4 — Promote consumes the new verdicts

`bots/promote.md`.

- Step 1: promote rows Audit marked `ok` **or** `ok-no-reasoning`.
- Step 2: "If Audit approved a non-empty `reasoning` capsule, copy it exactly.
  If Audit marked the row `ok-no-reasoning`, omit the field. Never generate,
  expand, or repair a capsule, and never copy `note`."
- Step 6: `ok-unmapped` **and** `ok-unmapped-no-reasoning` overflow rows are both
  mint candidates when the operator asks.

## Backfill

Once Change 1 lands, re-run Audit over the 16 capsule-only rows from
2026-09-03 — they need no re-listening, only re-verdicting against the corrected
rule — and Promote the mapped ones.

Note the floor removal compounds the recovery. 14 of those 16 rows failed on
length alone, and their capsules were faithful; with no minimum most become plain
`ok` and their capsules **render** rather than being dropped. Only the two rows
with a factually wrong capsule (Kanell naming "Frazier", Cowherd naming Oklahoma
State) ship as `ok-no-reasoning` with the field omitted, because those are
content defects that Promote is forbidden to repair.

Expected recovery from that single run:

- `kanell` `clemson-at-lsu-2026` yes — capsule names the wrong quarterback; ships
  with `reasoning` omitted, so a second YES lands on the flagship home game
- `patterson` `wisconsin-vs-nd-2026` no — **stays out**, the quote is stitched
- 14 overflow SUs across Oregon, Michigan, FIU, Cal, SMU, Toledo, Tulsa, Texas
  and six NFL Week 1 winners, available to mint under the operator's multi-face
  rule

The 3 genuine pick defects stay out, which is the point.

## Verification

1. `npx vitest run` green, including the new `validate-run` tests.
2. `node scripts/validate-run.mjs docs/runs` passes on every committed run file,
   after Change 2's `note` column is applied to the 2026-09-03 sidecars.
3. A fixture run file with a 10-word capsule fails `validate-run.mjs` and names
   the row.
4. A fixture Audit row marked `ok-no-reasoning` is promoted by a Promote dry run
   with no `reasoning` key on the resulting call.
5. `npm run build && npm run verify:static` green.
6. `lib/calls.test.ts` enforces the 60-word ceiling and single-paragraph shape on
   every committed capsule, and no longer asserts a minimum. A fixture capsule of
   61 words fails; a truthful 10-word capsule passes.

## Out of scope

- Changing what counts as a straight-up pick. House rule 3 stands.
- Any length rule on `claim`. The verbatim quote has no minimum or maximum.
- Automating capsule authorship. No bot writes a capsule it did not hear.
- Re-listening to 2026-09-03 audio. The backfill is a re-verdict, not a re-hunt.
- Bets promotion. Bets stay out of `data/`.
