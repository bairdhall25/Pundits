<!-- pundits-run date=2026-09-08 hard=3 candidates=1 audit=ok promoted=false acceptance-test=true -->
Overflow unlisted SUs: leave `eventSlug` and `side` blank; name the matchup in `note`, outside the verbatim quote. Do not invent a slug. See `docs/capture-policy.md`.
For approved unpublished targets, add targetId and matchup (including season) columns to Intake; also keep matchup in note. Leave eventSlug and side blank.
Acceptance test on commit `8251b1e` (branch `codex/scout-acceptance-fixes`). Do not promote. Do not edit `data/*.json`.

## Dispatch

Hunt order is priority, then verified kickoff, then coverage. Density is a display metric; designated sources on approved priority games still source-complete.

| eventSlug | sport | yes | no | status | hunt | priority | kickoff | targetId / matchup | designated sources |
|---|---|---|---|---|---|---|---|---|---|
| patriots-at-seahawks-2026 | nfl | (none) | cowherd | empty-side | Patriots YES first, then a third voice | 1 | 2026-09-09 | nfl-w1-patriots-at-seahawks / Patriots at Seahawks | gmfb, herd, eisen, mcafee |
| 49ers-vs-rams-2026 | nfl | brandt | eisen, cowherd, jmac | dense | source-complete designated voices (density is display-only); flip-check carded pundits only (kickoff date ≤3 days) | 1 | 2026-09-10 | nfl-w1-49ers-vs-rams / 49ers at Rams | gmfb, herd, eisen, mcafee |
| (unpublished) | ncaaf | (none) | (none) | off-home | stage verified SU unmapped; no public event yet | 1 | 2026-09-12 | ncaaf-w2-oklahoma-at-michigan / Oklahoma at Michigan (2026) | gameday, cover3, see-ball, clay-travis, finebaum, pate |
| (unpublished) | ncaaf | (none) | (none) | off-home | stage verified SU unmapped; no public event yet | 1 | 2026-09-12 | ncaaf-w2-ohio-state-at-texas / Ohio State at Texas (2026) | gameday, cover3, see-ball, clay-travis, finebaum, pate |
| (unpublished) | ncaaf | (none) | (none) | off-home | stage verified SU unmapped; no public event yet | 2 | 2026-09-12 | ncaaf-w2-arizona-state-at-texas-am / Arizona State at Texas A&M (2026) | cover3, see-ball, clay-travis, pate |
| (unpublished) | ncaaf | (none) | (none) | off-home | stage verified SU unmapped; no public event yet | 2 | 2026-09-12 | ncaaf-w2-alabama-at-kentucky / Alabama at Kentucky (2026) | gameday, cover3, see-ball, finebaum, pate |
| bills-at-texans-2026 | nfl | (none) | cowherd, jmac | empty-side | Bills YES first, then a third voice | 2 | 2026-09-13 | nfl-w1-bills-at-texans / Bills at Texans | gmfb, herd, eisen, mcafee |

### Proposed (not approved — do not hunt unless selected)

| id | sport | matchup | kickoff | eventSlug | priority | source |
|---|---|---|---|---|---|---|
| *(none)* | | | | | | |

### Decision queue (operator — not a new bot)

Operator reviews this queue at least twice weekly (Tuesday and Friday ET) before midweek pick shows publish. Coordinator surfaces it in Dispatch. This is not a new bot. No auto-roster, photo-approval bypass, or team-analyst eligibility.

| id | kind | needed | status |
|---|---|---|---|
| candidate-jerry-ostroski | roster-candidate | Photo + eligibility review. Staged as team-analyst on Locked On Bills. Team analysts are not pundits unless the operator overrides that definition. | pending |
| candidate-lainey-wilson | roster-candidate | Photo + association review for GameDay celebrity guest picker. Not Intake. | pending |
| overflow-walker-indiana | overflow-mint | Operator mint-or-discard for Audit-ok unmapped Walker Indiana SU (North Texas at Indiana). | pending |

## Lane status

Each expected lane reports completed, dry, blocked, or not-run. A missing run is not a dry hunt. A connector failure is blocked, not a sweep.

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-09-08T23:45:00-04:00 | Bounded: Cover 3 BGB + Pate Week 2 + Finebaum H1 + Sharp or Square + What's Wright + GMFB H2. Prior-dry Eisen/McAfee/Herd hours/Nightcap skipped without new reopenReason. |
| X | blocked | 2026-09-08T23:30:00-04:00 | MCP `user-X` failed_to_load; `user-X--tuned` connected but prior `get_users_me` = client-not-enrolled. Not treated as dry. |
| News | not-run | 2026-09-08T23:45:00-04:00 | Acceptance budget prioritized designated Shows factories for imminent + Week-2 targets. |

## Factory feeds

As of Sep 8, 2026, 11:29 PM ET. Hunt the recent-unprocessed queue, not only today's newest item. A feed check is not an inspection. Dry episodes stay dry unless a new reason is stated. Official short clips are eligible when they contain complete attributable evidence.

| factory | last drop (ET) | title | status | hunt |
|---|---|---|---|---|
| Finebaum Show | 2026-09-08 | Hour 4: Callers | today | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-08 | Hour 3: Jake Butt, The Blue Print Podcast | today | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-08 | Hour 2: Could LSU get kicked out of the SEC? | today | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-08 | Hour 1: Vince Young, CFB Hall of Famer | today | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-07 | Hour 4: Callers | unprocessed | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-07 | Hour 3: Brooks Austin, The Film Guy/On3 | unprocessed | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-07 | Hour 2: Michael Bratton, That SEC Podcast | unprocessed | open if the chapter is a winner pick |
| Finebaum Show | 2026-09-07 | Hour 1: Nicole Auerbach, NBC Sports | unprocessed | open if the chapter is a winner pick |
| Cover 3 | 2026-09-08 | BIG GAME BREAKDOWN: Ohio State-Texas, Oklahoma-Michigan & MORE / SMU-FSU REACTION! | today | open if the chapter is a winner pick |
| BFW Show | 2026-09-07 | Week 1 Clean Up + Brandon"s Updated Top 25 / The BFW Show 9.7.26 | unprocessed | open if the chapter is a winner pick |
| Josh Pate CFB Show | 2026-09-08 | SEC Threatening To Expel LSU + Week 2 Predictions & AP Poll Reaction | today | open |
| Josh Pate CFB Show | 2026-09-08 | You Might Also Like: The Oprah Podcast | today | open if the chapter is a winner pick |
| Josh Pate CFB Show | 2026-09-08 | SMU Beats FSU…Mike Norvell Finished? | today | open if the chapter is a winner pick |
| Josh Pate CFB Show | 2026-09-07 | REACTION: Ole Miss Beats Louisville + Notre Dame Rolls Wisconsin | unprocessed | open if the chapter is a winner pick |
| Josh Pate CFB Show | 2026-09-06 | Week 1 Reaction Show: Big Ten ROBS Western Michigan + LSU Splatters Clemson | unprocessed | open if the chapter is a winner pick |
| See Ball Get Ball | 2026-09-08 | SMU-FSU INSTANT REACTION / David Pollack's CFP 12 if the Playoff Started Today | recap | not LOCKS |
| Clay Travis Show | 2026-09-08 | Nation States: Canada, China, and the Future of North America | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | The Truth with Lisa Boothe: Dan Brouillette: Why Gas Prices Aren’t Coming Down Anytime Soon | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Daily Review with Clay and Buck - Sep 8 2026 | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Hour 1 - Dems Excusing 9/11? | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Hour 2 - Is Lindsay Clancy the OJ of the Times? | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Hour 3 - Sports Bar for Women Kicks Out XX-XY | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Clay Travis Show: Western Michigan Was ROBBED by the Big Ten | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Buck Brief - The Manufactured Delusion of Lindsay Clancy Supporters | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-08 | Normally Podcast: The Socialists Are Saying the Quiet Part Out Loud | today | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-07 | Hour 1 - The Best of Clay and Buck | unprocessed | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-07 | Hour 2 - The Best of Clay and Buck | unprocessed | open if the chapter is a winner pick |
| Clay Travis Show | 2026-09-07 | Hour 3 - The Best of Clay and Buck | unprocessed | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | Sharp or Square - NFL WEEK 1 BETS: Patriots-Seahawks, 49ers-Rams, Packers-Vikings, Bears-Panthers, Cowboys-Giants | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | What's Wright - Seahawks-Patriots Super Bowl REMATCH, Chiefs catching strays, BIGGEST storylines of the NFL season | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | THE HERD – HOUR 3 – Julian Edelman: Bills Still Have Issues / Concern About The Chiefs | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | THE HERD – HOUR 2 – Herd Hierarchy: Broncos IN, Chiefs OUT / Nick Wright: Sam Darnold Is Elite | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | THE HERD – HOUR 1 – Seahawks Are Under Rated / Lane Kiffin Is Villain Of CFB / Giants Surprisingly Good | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | BEST OF THE HERD – Seahawks Are Under Rated / Lane Kiffin Is Villain Of CFB / Nick Wright: Sam Darnold Is Elite | today | open if the chapter is a winner pick |
| The Herd | 2026-09-08 | Joe and Jada - Mario on stadium tour w/ Chris Brown & Usher, state of R&B, fatherhood & making of “Let Me Love You” | today | open if the chapter is a winner pick |
| The Herd | 2026-09-07 | Colin Cowherd Podcast | unprocessed | open |
| The Herd | 2026-09-07 | THE HERD - HOUR 1 - Controversial Calls & A Starter Named Tua | unprocessed | open if the chapter is a winner pick |
| The Herd | 2026-09-07 | THE HERD - HOUR 2 - Lane Kiffin's Halftime Comments | unprocessed | open if the chapter is a winner pick |
| The Herd | 2026-09-07 | THE HERD - HOUR 3 - 49ers Advantage & Rotating Captains | unprocessed | open if the chapter is a winner pick |
| Rich Eisen Show | 2026-09-08 | Hour 3: Falcons running back Bijan Robinson, AFC South Predictions, Overreaction Monday (On A Tuesday), tilted hat controversy | today | open |
| Rich Eisen Show | 2026-09-08 | Hour 2: ESPN College Football analyst Josh Pate, Steelers Defensive Tackle Cam Heyward | today | open if the chapter is a winner pick |
| Rich Eisen Show | 2026-09-08 | Hour 1: Michigan Wolverines Hail Mary victory, ESPN’s Troy Aikman, Tua Tagovailoa named starter in Atlanta, Wolverines victory reaction | today | open if the chapter is a winner pick |
| Rich Eisen Show | 2026-09-08 | 2026 NFL Season Preview | today | open if the chapter is a winner pick |
| Pat McAfee Show | 2026-09-08 | PMS 2.0 1619 - NFL Kickoff Eve, Ian Rapoport, Miami Head Coach Mario Cristobal, Taylor McGregor, SMU Head Coach Rhett Lashlee, Darius Butler, & AJ Hawk | today | open if the chapter is a winner pick |
| GMFB | 2026-09-08 | The NFL Report: Aaron Donald is A DNP for Week 1 + Devin McCourty Joins the Show | today | open if the chapter is a winner pick |
| GMFB | 2026-09-08 | Daily Buzz: Donald OUT, Tua IN and More Week 1 Notes | today | open if the chapter is a winner pick |
| GMFB | 2026-09-08 | 40s and Free Agents: Week 1 College Football Standouts and Lookahead to 2027 NFL Free Agents | today | open if the chapter is a winner pick |
| GMFB | 2026-09-08 | GMFB Tuesday Hour 2: MVP Predictions, Kyle's Playoff Picks, Survivor | today | open |
| GMFB | 2026-09-07 | Power Players: Ravens HC Jesse Minter | unprocessed | open if the chapter is a winner pick |
| GMFB | 2026-09-07 | GMFB Monday Hour 2: Rams Progress, Raheem Mostert, and more Player Predictions! | unprocessed | open |
| GMFB | 2026-09-07 | GMFB Monday Hour 1: Sam Darnold Outlook, Tua QB1, Off/Def ROY and Coach of the Year! | unprocessed | open if the chapter is a winner pick |
| GMFB | 2026-09-06 | Patriots-Seahawks and 49ers-Rams Week 1 Previews | unprocessed | open if the chapter is a winner pick |
| GMFB | 2026-09-05 | GMFB Saturday: D'Marco Farr, Tough Predictions, and Rams Captains | unprocessed | open |

## Community tips

Untrusted discovery leads only. A tip must clear the normal Scout, Audit, and Promote bar before it can become a pick.

tips:pull not run this acceptance pass.

| tipId | receivedAt | discovery | lane | pundit hint | event hint | sourceUrl | where to look | status |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Shows pass 2026-09-08 acceptance test (Grok Bot)

Bounded acceptance hunt vs approved capture-targets on `8251b1e`. **hard=3 · candidates=1.** Unmapped college Week-2 from Pate; NFL empty YES still empty (Pats/Bills). Did not touch `data/`. Did not mint events.

### Intake

| pundit | eventSlug | side | targetId | matchup | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pate |  |  | ncaaf-w2-oklahoma-at-michigan | Oklahoma at Michigan (2026) | but I'm going to slightly lean Oklahoma to win and cover. | Says the game stays competitive, not a blowout, then still expects Oklahoma enough margin to get the number; win+cover is the Week-2 call. | UNMAPPED approved target · winner Oklahoma (away/YES if mapped) · locator ~22:13 (1333.9s) Omny SubRip · also cover → Bets · Apple i=1000788580117 · rowId `73c9e34debbe7c9b` | Josh Pate CFB Show | https://podcasts.apple.com/us/podcast/sec-threatening-to-expel-lsu-week-2-predictions-ap/id1485905502?i=1000788580117 | 2026-09-08 | hard |
| pate |  |  | ncaaf-w2-ohio-state-at-texas | Ohio State at Texas (2026) | I'm going to side with Texas in this game, and I'm not really going to care what the model thinks. | Spring stance was Texas on desperation + home field unless Week 1 flipped him; Week 1 did not; still sides Texas with minimum confidence. | UNMAPPED approved target · winner Texas (home/NO if mapped) · locator ~39:34 · Apple i=1000788580117 · rowId `11debc61584a7738` | Josh Pate CFB Show | https://podcasts.apple.com/us/podcast/sec-threatening-to-expel-lsu-week-2-predictions-ap/id1485905502?i=1000788580117 | 2026-09-08 | hard |
| pate |  |  | ncaaf-w2-alabama-at-kentucky | Alabama at Kentucky (2026) | I think Alabama's going to win this game. | Separates SU (Alabama) from ATS (Kentucky +10.5) in the same breath; explicit win-the-game language. | UNMAPPED approved target · winner Alabama (away/YES if mapped) · locator ~57:03 · nearby also Kentucky +points → Bets · Apple i=1000788580117 · rowId `6e448223ffa0aeee` | Josh Pate CFB Show | https://podcasts.apple.com/us/podcast/sec-threatening-to-expel-lsu-week-2-predictions-ap/id1485905502?i=1000788580117 | 2026-09-08 | hard |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl |
|---|---|---|---|---|---|---|---|---|---|---|---|
| nick-wright | Nick Wright | other | What's Wright? with Nick Wright | patriots-at-seahawks-2026 | no | I'm going on the record. 27–17 Seattle. That's my pick. | First-person exact-score Seahawks SU for Wed rematch. Side = home = no. Not Pats YES. | Wrong side for empty-YES hunt; third-voice NO after cowherd. Not rostered. Apple i=1000788561935 · locator ~40:20–41:10 | https://podcasts.apple.com/us/podcast/id1042368254?i=1000788561935 | 2026-09-08 | needed |

### Bets

| pundit | eventSlug | targetId | matchup | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|---|---|
| pate |  | ncaaf-w2-oklahoma-at-michigan | Oklahoma at Michigan (2026) | Oklahoma -5.5 | I'm going to slightly lean Oklahoma to win and cover. | https://podcasts.apple.com/us/podcast/sec-threatening-to-expel-lsu-week-2-predictions-ap/id1485905502?i=1000788580117 | 2026-09-08 |
| pate |  | ncaaf-w2-alabama-at-kentucky | Alabama at Kentucky (2026) | Kentucky +10.5 | I would lean Kentucky plus the points. | https://podcasts.apple.com/us/podcast/sec-threatening-to-expel-lsu-week-2-predictions-ap/id1485905502?i=1000788580117 | 2026-09-08 |
| sharp-or-square hosts (unrostered) | 49ers-vs-rams-2026 | nfl-w1-49ers-vs-rams | 49ers at Rams | 49ers +hook ATS | Aren't we taking the Niners here? | https://podcasts.apple.com/us/podcast/id1042368254?i=1000788584046 | 2026-09-08 |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| *(none this acceptance pass)* | | | Designated national factories only for acceptance budget. |

### Episode coverage

Persist identity and target/segment coverage after opening with recordEpisodeInspection. It consumes an explicit reopenReason and preserves prior coverage. A feed check is not an inspection.

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| apple:1000788507619 | cover3 | 2026-09-08 ~1:19 PM ET | yes | dry | BGB chapters OSU/OU/BAMA/ASU — keys/props ≠ SU | LOCKS if posted |
| apple:1000788580117 | pate | 2026-09-08 ~9:54 PM ET | yes | hit | Ep 765 Week 2 Predictions — 3 hard unmapped | — |
| apple:1000788535757 | finebaum | 2026-09-08 ~5:01 PM ET | yes | dry | H1 Vince Young — no Finebaum SU | — |
| apple:1000788584046 | herd | 2026-09-08 | yes | dry | Sharp or Square W1 — empty YES dry; ATS only | — |
| apple:1000788561935 | herd | 2026-09-08 | yes | hit | What's Wright — Candidate nick-wright SEA NO | — |
| apple:1000788491419 | gmfb | 2026-09-08 | yes | dry | GMFB H2 — survivor Steelers; season board ≠ W1 SU | — |

### Dropped

- **Cover 3 BGB** — OSU/TEX / OU/MICH / BAMA/UK / ASU/TAMU chapters = keys, implied totals, conditional fronts. No named winner SU. Bud “lean over” = total.
- **Pate ASU–Texas A&M** — not in Week 2 prediction block (RNE = ODU / Miss St). Target still empty.
- **Finebaum H1** — “most people predicting a rout” ≠ host SU; Vince Young prompted/muddy ≠ Candidate.
- **Sharp or Square** — SEA favorite ATS / Niners dog ATS / Houston +7.5 — wrong way or ATS-only for empty YES.
- **Nick Wright SEA 27–17** — staged Candidate NO (wrong side for Pats YES).
- **GMFB H2** — playoff board + Steelers survivor lock; SEA/Niners survivor menu ≠ host W1 SU.
- **Prior-dry (no reopenReason):** Eisen H3 Overreaction satire; McAfee 1619; Herd H1–H3; Nightcap Deebo.
- **Do not restage:** brandt 49ers YES; cowherd/eisen/jmac booked NOs (no flip).

### Freeze

none

### Stories this would mint

*(none yet — unmapped until operator mint; Candidate not auto-rostered)*

## X pass 2026-09-08 acceptance test (Grok Bot)

**Lane status: blocked** (not dry).

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| *(empty)* | | | | | | | | | |

### Dropped

- **X MCP** — `user-X` failed_to_load; `user-X--tuned` not used for acceptance (prior client-not-enrolled). Connector failure ≠ dry sweep.

## News pass 2026-09-08 acceptance test (Grok Bot)

**Lane status: not-run.**

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| *(empty)* | | | | | | | | | |

### Dropped

- News lane not executed this acceptance pass (Shows designated sources prioritized).

### Home cards

-

### Stories this would mint

*(none)*
