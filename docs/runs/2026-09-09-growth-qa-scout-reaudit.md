# Growth QA Scout handoff correction / re-audit

Status: Evidence

Correction to the 2026-09-08 bounded Scout acceptance run after Task 4 engineering. **Not a Scout intake run.** Does not set `audit=` or `promoted=` on live mailbox files. Does not edit `data/*.json`, mint events, roster, or invent consent.

Originals retained, not rewritten:

- [2026-09-08-acceptance-test.md](./2026-09-08-acceptance-test.md) (copy of `test/scout-acceptance-2026-09-08`)
- [2026-09-08-acceptance-test-audit.md](./2026-09-08-acceptance-test-audit.md)
- [2026-09-08-acceptance-test-episodes.json](./2026-09-08-acceptance-test-episodes.json)
- GitHub: https://github.com/bairdhall25/Pundits/blob/test/scout-acceptance-2026-09-08/docs/runs/2026-09-08-acceptance-test.md

Tested engineering SHA: `aa8c790` on `codex/growth-qa-corrections`. Historical acceptance SHA remains `8251b1e`.

## Capsule re-audit (Pate, rationale only)

Source locators reopened 2026-09-09:

| locator | result |
|---|---|
| Apple `i=1000788580117` | Loads. Host Josh Pate. Published 2026-09-09T01:54:23Z. |
| Omny clip `a6078064-14bf-4657-8131-b4c00017fce1` | Episode page loads. “Clip with transcript” UI present. |
| Omny `/transcript` | **404 Page not found** |
| `traffic.omny.fm/.../transcript.srt` | **404 Not Found** |
| `traffic.omny.fm/.../transcript.vtt` | **404 Not Found** |
| `omnycontent.com/.../info.json` | **404 Not Found** |
| YouTube `wQCT7xl78ZY` chapters | Oklahoma preview 13:39; Texas 30:21; Alabama 50:16 — locators align; captions not recovered as text |

Quotes were independently verified on 2026-09-08 (Omny SubRip + Vosk). This pass does not re-claim audio verification. Capsule verdicts below are rationale-only against the staged capsules and the corrected Audit rule. Pick quotes are unchanged.

| pundit | eventSlug | side | targetId | matchup | rowId | prior verdict | correction verdict | note |
|---|---|---|---|---|---|---|---|---|
| pate |  |  | ncaaf-w2-alabama-at-kentucky | Alabama at Kentucky (2026) | 6e448223ffa0aeee | ok-unmapped | ok-unmapped-no-reasoning | Staged capsule is SU vs ATS routing plus “explicit winner language,” not why Alabama should win. Omit capsule. Quote unchanged. |
| pate |  |  | ncaaf-w2-oklahoma-at-michigan | Oklahoma at Michigan (2026) | 73c9e34debbe7c9b | ok-unmapped | ok-unmapped-no-reasoning | Mixed capsule: routing (“win+cover is the Week-2 call”) plus unverified why-the-pick. Audio/transcript not recovered this pass, so source-supported rationale is not preserved. Omit capsule. Quote unchanged. |
| pate |  |  | ncaaf-w2-ohio-state-at-texas | Ohio State at Texas (2026) | 11debc61584a7738 | ok-unmapped | ok-unmapped-no-reasoning | Staged capsule may be why-the-pick (desperation + home field) but was not re-verified from audio/transcript this pass. Fail closed: omit unless verified. Quote unchanged. |

0 ok / 0 ok-unmapped / 0 ok-no-reasoning / 3 ok-unmapped-no-reasoning / 0 fail / ready to promote 0

`callFieldsForPromotion` on each no-reasoning row omits `reasoning` and keeps the verbatim quote. `promoteReadyRows` still blocks on explicit operator mint. Three accepted unmapped picks are not three publishable picks. Event creation stays gated.

Changed-rationale identity: rowIds above still include the staged (defective) capsules. Blanking a capsule would be a new `rowId` and would invalidate the 2026-09-08 approval. This correction keeps identity and changes only the capsule verdict so Promote omits the field.

## Nick Wright association workflow

Speaker: Nick Wright, host of What's Wright? with Nick Wright (The Volume / The Herd factory). Not on `data/pundits.json`. Official handle `@getnickwright`.

| field | value |
|---|---|
| proposedId | nick-wright |
| eventSlug / side | patriots-at-seahawks-2026 / no |
| quote (staged) | I'm going on the record. 27–17 Seattle. That's my pick. |
| sourceUrl | https://podcasts.apple.com/us/podcast/id1042368254?i=1000788561935 |
| Omny | https://omny.fm/shows/whats-wright-with-nick-wright/seahawks-patriots-super-bowl-rematch-chiefs-catching-strays-biggest-storylines-of-the-nfl-season |
| rowId | 87c6a4d31c8bac0b |
| eligibility | association |
| pick verdict | not issued — quote not independently re-verified (same Omny transcript 404s) |
| photo | proposed X avatar https://pbs.twimg.com/profile_images/1625257379330723842/xhgoMlnd.jpg — permission **not** confirmed |
| packet | [2026-09-09-nick-wright-proposal.json](./2026-09-09-nick-wright-proposal.json) |
| packet state | needs-evidence |
| next action | Reopen audio/transcript to verify the quote; operator must approve any photo. Do not roster. |
| rosterApproved / photoApproved | false / false |

A pick on an already-covered Seattle NO side does not disqualify the voice. Coordinator visibility: `docs/capture-decisions.json` item `candidate-nick-wright` (pending).

## Lane status

Hunted today's Dispatch, not historical post-kickoff games. Patriots-at-Seahawks remains on the printed slate (kickoffDate 2026-09-09).

| lane | status | asOf | note |
|---|---|---|---|
| Shows | not-run | 2026-09-09 | Engineering re-audit only. No new Shows hunt. Historical Shows completed on 2026-09-08. |
| X | completed | 2026-09-09 | Built-in X search succeeded (not MCP `user-X`). Sampled `from:ClayTravis`, `from:ColinCowherd`, `from:davidpollack47`, `from:rich_eisen`, `from:getnickwright` since 2026-09-07 against current NFL Dispatch names. No new Week 1 SU. Clay Super Bowl futures dropped. Cowherd show promo dropped. Nick Wright posted a What's Wright live link, not a new SU. |
| News | completed | 2026-09-09 | ESPN NFL expert-picks grid loaded. Rostered News voices (`stephena`, `kimes`, `orlovsky`, `spears`) are not on that grid; named staff picks are not Intake. CBS expert-picks page is ATS-only (Bets, not SU). No rostered bylined SU staged. Dry for designated News voices. |

## Shows pass 2026-09-09 evidence reconstruction (not a hunt)

Candidate restage for packet generation only. Association columns added; routing language moved out of `reasoning`. Original 2026-09-08 candidate row is unchanged.

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory | xHandle | photoSource |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nick-wright | Nick Wright | other | What's Wright? with Nick Wright | patriots-at-seahawks-2026 | no | I'm going on the record. 27–17 Seattle. That's my pick. |  | Association host on Herd/Volume factory. Side = home = no (already-covered NO; does not disqualify). Quote not independently re-verified this pass. Apple i=1000788561935. | https://podcasts.apple.com/us/podcast/id1042368254?i=1000788561935 | 2026-09-08 | https://pbs.twimg.com/profile_images/1625257379330723842/xhgoMlnd.jpg | Host of What's Wright? with Nick Wright on The Herd / The Volume factory | https://podcasts.apple.com/us/podcast/id1042368254?i=1000788561935 | herd | getnickwright | Official X avatar @getnickwright; usage permission not confirmed |

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| *(empty)* | | | | | | | | | |

## X pass 2026-09-09 evidence (current Dispatch)

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| *(empty)* | | | | | | | | | |

### Dropped

- `from:ClayTravis` 2097682570112532907 — Super Bowl Bills/Rams futures, not a Week 1 SU.
- `from:ColinCowherd` 2097420083937018253 — Tuesday Herd promo, not a first-person Week 1 winner.
- `from:davidpollack47` / `from:rich_eisen` — no matching posts since 2026-09-07.
- `from:getnickwright` 2097331964319559926 — show-link post for What's Wright, not a new SU quote.

## News pass 2026-09-09 evidence (current Dispatch)

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| *(empty)* | | | | | | | | | |

### Dropped

- ESPN https://www.espn.com/nfl/picks — Week 1 grid. Designated roster voices absent. Unrostered staff logos are not Intake. Several cells are “No Pick.”
- CBS https://www.cbssports.com/nfl/expert-picks/ — ATS page, not SU.

## Episode history

Live `docs/scout-episodes.json` was **not** rewritten. The 2026-09-08 acceptance ledger is retained in [2026-09-08-acceptance-test-episodes.json](./2026-09-08-acceptance-test-episodes.json). Inspected Pate/Herd/Cover 3/Finebaum/GMFB rows still carry the obsolete generated note `"Feed check only. Not inspected."` That is the defect Part A now replaces after `recordEpisodeInspection`. Custom GMFB Brandt note is preserved in that ledger.

## Confirmation

- `validate:runs` run on this file and `docs/runs`.
- No `data/` changes, promotions, roster adds, or live X posts from this task.
