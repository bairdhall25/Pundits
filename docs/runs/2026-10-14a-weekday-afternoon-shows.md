<!-- sidecar for docs/runs/2026-10-14.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-14 ~4:50 PM ET | Weekday after-afternoon **opened/hit** this_pass hard=3 candidates=1 bets=3 NEW=true (sidecar `docs/runs/2026-10-14a-weekday-afternoon-shows.md`). Empty approved Dispatch → all 3 hard are blank-slug overflow (Week 7 NCAAF / TNF unminted); mapped roster hard=0. NEW opens: Josh Pate Week 7 Predictions (Apple i=1000796237740) — pate Indiana outright + Alabama −8.5 SU + Ole Miss SU; NFL Daily Would You Rather + Seahawks-Broncos TNF Preview (i=1000796223010 / Omny 788d000f) — Candidate greg-rosenthal Seahawks lean; Sharp or Square W6 BETS (i=1000796223603) — dry for roster (Chad Noman / Simon Hutter off-roster ATS); Eisen H3 Josh Pate (i=1000796370612) — dry (preview/analysis; Eisen “don’t know who I’m taking on Sunday yet”). Title-skips: Herd Wed H1–H3/Best Of (SB contenders / Herbert / ARod), What's Wright W5 reaction, 3&Out, Clay Wed politics/hours, Cover 3 (LOCKS Thu), See Ball CFP12 dry, Finebaum Tue guest hours, GMFB Wed H1/H2 outlook, McAfee 1644 recap. Radio n/a. Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-14 weekday after-afternoon (Grok Bot)

Wednesday ~4:15–4:50 PM ET after-afternoon. Fresh `origin/main` (f32f4e0). First 10-14 Shows pass — no earlier sidecar. Ran `node scripts/scout-density.mjs` (empty approved Dispatch; minted FSU–Miami / ND–BYU off-home only) + `node scripts/scout-feeds.mjs` (4:14 PM ET). Evidence: publisher audio (Omny/Megaphone enclosures, downloaded 2026-10-14 ~4:16 PM ET); Omny official TextWithTimestamps transcripts for Pate + NFL Daily + Sharp; faster-whisper `small.en` corroboration on pick windows (beam 5). Did not invent slugs. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pate |  |  | So I'm taking Indiana to win this game outright. | Kurt Signetti is not going to hurt him anymore — if he is wrong from here until they lose, it will be by Indiana losing; last weekend's Indiana win felt good after putting the clown nose on once. | Overflow unlisted — Ohio State at Indiana (2026, CFB Week 7; proposed id ncaaf-w7-ohio-state-at-indiana, not approved). Home Indiana → Implied NO. Blank slug/side. Explicit outright winner (not ATS). FanDuel Ohio State −3.5 / model −2 cited in same segment. Publisher audio + Omny transcript ~12:41; DAI may shift a few seconds. | Josh Pate's College Football Show — Week 7 Predictions + New JP Poll & Big Overreactions | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 | hard |  | Ohio State at Indiana (2026) |
| pate |  |  | I'm going to go Alabama minus eight and a half. | Believes Alabama is good enough to circumvent the normal hangover / road-in-Neyland trends after the Georgia loss; calls −8.5 the right side versus a model that only has Alabama −5. | Overflow unlisted — Alabama at Tennessee (2026, CFB Week 7; proposed id ncaaf-w7-alabama-at-tennessee, not approved). Away Alabama → Implied YES. Blank slug/side. Favorite laying points → SU + Bets (house rule 3). Not betting money — reputation only. Omny ~28:05–28:16. | Josh Pate's College Football Show — Week 7 Predictions + New JP Poll & Big Overreactions | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 | hard |  | Alabama at Tennessee (2026) |
| pate |  |  | I do think Ole Miss will win the game. | Sees a high-variance, last-possession type game because of explosive plays; still picks Ole Miss to win while taking Missouri plus the points for the wager. | Overflow unlisted — Missouri at Ole Miss (2026, CFB Week 7). Home Ole Miss → Implied NO. Blank slug/side. Explicit winner language for the favorite; Missouri +6.5 is Bets only (dog + points). Quote trimmed to the winner sentence (same turn continues confidence split). Omny ~57:39. | Josh Pate's College Football Show — Week 7 Predictions + New JP Poll & Big Overreactions | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 | hard |  | Missouri at Ole Miss (2026) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| greg-rosenthal | Gregg Rosenthal | nfl | NFL Daily with Gregg Rosenthal |  |  | I still like the Seahawks in this game. | Questions whether Denver's defense is dominant enough to hold Seattle down — he does not think Denver has been as good this year; still likes Seattle despite the short week on the road. | Overflow unlisted — Seahawks at Broncos (2026, NFL Week 6 TNF Thu Oct 15 8:15 PM ET; ESPN 401872995; proposed id nfl-w6-seahawks-at-broncos, not approved). Away Seattle → Implied YES. Blank slug/side. Soft lean with short-week hedge — staged under lower bar; quote trimmed to end on his own winner lean (trailing hedge stays in note context). Speaker 1 Omny transcript self-ID 'Greg Rosenthal' at open. Already pending roster-candidate (candidate-greg-rosenthal). photoUrl=needed. Do not auto-roster. Cross-posted under GMFB Apple i=1000796223459. | https://podcasts.apple.com/us/podcast/would-you-rather-trade-herbert-eagles-fandom-qb-or/id680904259?i=1000796223010&uo=4 | 2026-10-13 | needed | Host, NFL Daily with Gregg Rosenthal (NFL Network / Omny) | https://podcasts.apple.com/us/podcast/nfl-daily-with-gregg-rosenthal/id680904259?uo=4 | gmfb |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| pate |  | Alabama −8.5 at Tennessee — favorite, also Intake SU | I'm going to go Alabama minus eight and a half. | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 |
| pate |  | Brigham Young +10.5 vs Notre Dame (dog + points → Bets only) | I am going to take Brigham Young plus 10.5. | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 |
| pate |  | Missouri +6.5 at Ole Miss (dog + points → Bets only; Ole Miss winner is Intake) | So I'm going to take Missouri plus six and a half. | https://podcasts.apple.com/us/podcast/week-7-predictions-new-jp-poll-big-overreactions/id1485905502?i=1000796237740&uo=4 | 2026-10-13 |

Bets matchups (outside quotes): Alabama at Tennessee (2026); Notre Dame at BYU (2026); Missouri at Ole Miss (2026). BYU row: Omny after 'Jesse, you're taking Notre Dame, right?' — Pate takes the dog with points only (no staged SU). Notre Dame at BYU already has staples YES promoted — do not restage.

### Row identities

Computed with `rowIdentity` from `scripts/scout-handoff-lib.mjs` (main f32f4e0). Audit recomputes; if any differ, the script wins.

| table | pundit / proposedId | matchup | rowId |
|---|---|---|---|
| Intake | pate | Ohio State at Indiana (2026) | 67003685d081748c |
| Intake | pate | Alabama at Tennessee (2026) | 822de3bd02ab0896 |
| Intake | pate | Missouri at Ole Miss (2026) | 64e60060cd0cedef |
| Candidates | greg-rosenthal | Seahawks at Broncos (2026) | aa949e8c649618ad |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| *(none)* | — | n/a | Empty approved Dispatch; no under-dense approved game. |

### Episode coverage

Recorded with recordEpisodeInspection into `docs/scout-episodes.json` (inspectedAt 2026-10-14T16:45:00-04:00, coverage target overflow (no approved Dispatch)).

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| pate:1000796237740 | pate | 2026-10-13 ~10:02 PM ET (pub Wed 02:02Z) | yes (Omny transcript + small.en pick windows) | **hit** — pate Indiana / Alabama / Ole Miss overflow + Bets ×3 | ~12:41 Indiana; ~28:05 Alabama; ~36:14 BYU ATS; ~57:08 Missouri/Ole Miss | — |
| nfl-daily:1000796223010 | gmfb / nfl-daily | 2026-10-13 ~7:33 PM ET | yes (Omny transcript + small.en TNF window) | **hit** — Candidate greg-rosenthal Seahawks | ~55:36 | — |
| sharp-or-square:1000796223603 | herd (Sharp or Square) | 2026-10-13 ~7:25 PM ET | yes (Omny transcript; TNF chapter ~8:26–11:25) | dry (roster) — Chad Noman / Simon Hutter off-roster Seattle ATS leans; not staged | ~8:26–11:25 TNF | roster Herd/GMFB TNF desks |
| eisen:1000796370612 | eisen | 2026-10-14 ~3:24 PM ET | yes (small.en VAD full ~48 min) | dry — Pate guest preview OSU–Indiana / Alabama–Tennessee analysis; Eisen says he does not know who he is taking on Sunday yet | full | — |

### Dropped

- **Pate BYU +10.5:** dog with points only — Bets, not hard SU. No same-turn Notre Dame winner from Pate (he asks Jesse if Jesse is taking ND).
- **Pate FSU at Miami / ND at BYU SU:** no first-person winner on those matchups this episode (Miami ML vs Texas was hypothetical JP-poll illustration). Do not restage wasserman/staples on minted florida-state-at-miami-2026 / notre-dame-at-byu-2026.
- **Sharp or Square (Chad Noman / Simon Hutter):** Seattle −3/−3.5 ATS leans on TNF — off-roster Volume hosts, not Herd roster voices; not staged as Candidates this pass (operator priority = roster SU).
- **Eisen H3:** no staged SU; guest analysis only.
- **Title-skipped:** Herd Wed H1 Brock Purdy / SB Contenders; H2 Herbert / Drew Brees; H3 ARod Yankees; Best Of; What's Wright W5 Reaction; 3&Out; Clay Wed Daily Review + Hours 1–3 + politics pods; Cover 3 W7 Big Game Breakdown (already dry; LOCKS Thu 11 AM); See Ball 10/13 CFP12 (already dry); Finebaum Tue H1–H4 guests/callers; GMFB Wed H1 Rams Outlook / H2 Broncos Offense & AFC South odds (outlook, not picks); McAfee 1644 MNF Recap; Andy & Ari W7 already processed 10-13 night.
- **TNF Seahawks at Broncos roster desks:** no cowherd / jmac / middlekauff / brandt / mcafee first-person SU heard this pass (Rosenthal Candidate only). Cover 3 LOCKS not dropped yet.

### Freeze

*(none)* — no mapped roster faces gained; priority games unminted (except FSU–Miami / ND–BYU already minted off-home).

### Operator ping

| field | value |
|---|---|
| ready-to-audit | **3 hard** (+ **1 candidate**) |
| mapped vs overflow | mapped roster hard: **0**; overflow blank-slug: **3** (pate Indiana, pate Alabama, pate Ole Miss); Candidate: greg-rosenthal Seahawks; Bets: 3 |
| Promote | none (no new mapped roster hard). Overflow = mint-or-discard ask only. Candidates are not auto-rostered. |
| sidecar | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-14a-weekday-afternoon-shows.md |
| day | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-14.md |

### Stories this would mint

None until the operator mints Ohio State at Indiana (2026), Alabama at Tennessee (2026), Missouri at Ole Miss (2026), and/or Seahawks at Broncos (2026). If minted (conventional slugs if asked: `ohio-state-at-indiana-2026`, `alabama-at-tennessee-2026`, `missouri-at-ole-miss-2026`, `seahawks-at-broncos-2026` — not invented here), Audit-ok rows would map: pate Indiana = NO; pate Alabama = YES; pate Ole Miss = NO; greg-rosenthal Seahawks = YES (Candidate — needs roster yes before Promote).
