# Shows Scout

You hunt **video, podcasts, TV clips, and bounded durable sports-radio archives**. X Scout owns status URLs. News Scout owns bylined columns and expert-pick pages.

Also follow `bots/README.md` house rules and `docs/scout-plan.md`.

## Load first

From https://github.com/bairdhall25/Pundits (main), in this order:

- today’s `docs/runs/YYYY-MM-DD.md`; hunt `## Dispatch`. If missing, run `node scripts/scout-density.mjs` and write Dispatch first
- `docs/pick-shows.md`; load only sports present on Dispatch
- `docs/add-list.md`; Candidates only
- `docs/board.md`; do-not-touch
- `data/pundits.json`, `data/events.json`, `data/calls.json`
- live https://pundits.pro/stories/; do not restage an existing pundit/event page

## Hunt

For Dispatch rows in this order: `empty-side`, `off-home`, `thin`. Skip `dense` unless a source already open names the game.

1. Open the listed high-yield programs for that sport that dropped in their actual pick window.
2. Jump locks, moneyline, “I’ll take,” or “who wins.” Captions and official transcripts count.
3. Then open idle roster voices whose pick window is open.
4. Named add-list speakers on those programs are Candidates.
5. If the card remains under-dense, run the bounded radio fallback in `docs/pick-shows.md`.

PMT is not a locks show. Guests are the guest, never the host. A radio pick belongs to the named personality, never the station.

Do not sweep X handles. If an episode leads to a tweet, X Scout still owns the systematic status pass.

## Radio pilot limits

- Use this existing Shows job; do not create or request another routine.
- National rostered programs first.
- Open at most two local archived programs per under-dense matchup.
- Run one radio fallback per sport/pick window; do not reopen the same dry episode.
- Require a durable episode, clip, transcript, or show-note URL Audit can reopen.
- Drop live-only audio, callers, polls, anonymous consensus, and inaccessible snippets.
- Record every radio attempt in `### Radio coverage`, including zero-yield attempts.
- Stop after the curated sources and two reasonable named searches per game.

## Evidence bar

- **SU:** the named speaker picks the winner. ATS, totals, “tough game,” and season opinions do not qualify.
- **URL:** opened, durable, correct speaker, exact quote, current season.
- **Speaker:** name the person. Same URL with two speakers can yield two rows.
- **Photo:** required to roster; a qualifying off-roster radio host may be a Candidate with `photoUrl=needed`.
- YES is away. Wrong year is Dropped. Futures stay on future slugs.

Keep the decisive quote to the shortest one or two sentences that prove the SU, normally at most 60 words. Add a 25–60 word reasoning capsule only when the same speaker gives concrete rationale nearby in the same source.

## Output

Append or update `## Shows pass YYYY-MM-DD (Grok Bot)` without deleting Dispatch or other passes.

Update the first-line `hard=` and `candidates=` totals across all passes. New hard rows set `audit=pending` and `promoted=false`.

Write:

- Intake
- Candidates
- Radio coverage: event, programs opened, outcome, notes
- Dropped: what was opened per under-dense game
- Freeze
- Stories this would mint

Write Home cards only if no later X or News pass will run.

## Stop

Do not edit `data/`, test, deploy, tweet, or contact a personality. After GitHub, report `ready to audit N hard rows` and the Candidate count.
