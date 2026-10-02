<!-- sidecar for docs/runs/2026-10-02.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-02 ~4:31 PM ET | Weekday after-afternoon **opened/hit** (this_pass hard=20 candidates=5 bets=14). Empty approved Dispatch (W4 NCAAF + W3 NFL past KO / expired). NEW open: (1) Josh Pate Week 5 Upset Alerts Apple i=1000792675479 / Omny 1d5905fb / YT 8dXEH2hmgsY — overflow pate Indiana + Georgia + Auburn (do **not** restage Miami win+cover already Locker Room); (2) Clay Travis CFB Picks Apple i=1000792565012 — clay-travis Nebraska crush Maryland; (3) What's Wright Week 4 Predictions Apple i=1000792862641 — nick-wright ×4; (4) Unbuttoned Week 4 Picks Apple i=1000792881030 / YT lT5l9c11jDI — simms ×12 + Candidates connor-rogers ×5. Do **not** restage Cover3 LOCKS / See Ball / pate Predictions+Locker Room / McAfee PMS 1636. Title-skips: Finebaum Thu guests (no Fri yet); Cover3 Recruiting; BFW Preview dry; Clay Fri politics hours; Herd BEST OF; Eisen Fri Right&Wrong/reaction; GMFB Thu desk (no Fri yet); McAfee 1637 LIVE Iowa (not picks card); Nightcap TNF reaction. Radio skipped. Did not touch `data/`. |

## Shows pass 2026-10-02 weekday afternoon (Grok Bot)

Friday ~4:15–4:31 PM ET after-afternoon. Re-ran `node scripts/scout-feeds.mjs` (~4:17 PM ET) + Apple/iTunes + Omny transcripts (Pate/Clay/Wright) + Unbuttoned YT chapters + local ASR (faster-whisper base.en) on Unbuttoned card/late/best-bets. Empty approved slate → factory overflow only. Did not invent slugs. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pate | | | I'm going to put a one on the upset alert concern meter. I think it's body bag time. … So I think they're going to run it up on Rutgers. | Indiana should splat Rutgers; look-ahead to Nebraska not enough for Rutgers. | Overflow unlisted — Indiana at Rutgers (2026). Explicit run-it-up SU. Away Indiana → Implied YES. Blank slug/side. Omny Upset Alerts ~11:12. Do not invent slug. | Josh Pate CFB Ep 775 Week 5 Upset Alerts | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 | hard | | Indiana at Rutgers (2026) |
| pate | | | …pray for Jared Curtis and the Vanderbilt Commodores because this is a two on the upset alert concern meter. … Unless you could tell me Georgia's minus four turnovers here, I don't see much of a shot. | Vandy can't run; no defensive profile to hang with Georgia four quarters. | Overflow unlisted — Vanderbilt at Georgia (2026). Upset meter 2 + no-shot language → Georgia SU. Away Vandy → Implied NO. Blank slug/side. Omny ~05:40. Soft-ish meter; lower bar. | Josh Pate CFB Ep 775 Week 5 Upset Alerts | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 | hard | | Vanderbilt at Georgia (2026) |
| pate | | | Jesse, you worried about this game? Like you think Auburn could win this game. I think Auburn could win this game. | Meter 8.5; Tenn OL injury / Auburn QB edge path. | Overflow unlisted — Auburn at Tennessee (2026). Explicit Auburn-could-win + high upset meter → Auburn SU. Away Auburn → Implied YES. Blank slug/side. Conflicts prior pollack Tennessee. Omny ~07:52. | Josh Pate CFB Ep 775 Week 5 Upset Alerts | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 | hard | | Auburn at Tennessee (2026) |
| clay-travis | | | The blood bank guarantee this week, I am very confident. I'm sorry to put it on you, Nebraska. Nebraska is going to crush Maryland. | Blood-bank guarantee on Nebraska vs Maryland. | Overflow unlisted — Maryland at Nebraska (2026). Explicit crush SU. Home Nebraska → Implied NO. Blank slug/side. Omny Clay CFB Picks ~picks graphic segment. Other Clay card stays graphic-only (no verbal winners) — not staged. | Clay Travis Show: FlyDubai / College Football Picks | https://omny.fm/shows/the-clay-travis-show/clay-travis-show-israel-bound-flydubai-terror-plot-college-football-picks-cornell-case | 2026-10-01 | hard | | Maryland at Nebraska (2026) |
| nick-wright | | | I think the Bills win this game easily. And we're talking like 28-13 type of game. So Buffalo minus 6.5. | Bills elite offense vs injured Pats OL; −6.5 still comfortable. | Overflow unlisted — Patriots at Bills (2026 W4). Favorite laying + explicit easy win → SU+Bets. Home Bills → Implied NO. Blank slug/side. Omny Nick's Picks ~21:12. | What's Wright NFL Week 4 Predictions | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 | hard | | Patriots at Bills (2026 W4) |
| nick-wright | | | I think the Jags win this game. I think this is 28, 27, Jacksonville. Jacksonville getting two and a half is pick number two. | Jags better coach/D/QB moment; +2.5 dog he still has winning. | Overflow unlisted — Jaguars at Bengals (2026 W4). Explicit Jags win → SU+Bets. Away Jags → Implied YES. Blank slug/side. Omny ~22:48. | What's Wright NFL Week 4 Predictions | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 | hard | | Jaguars at Bengals (2026 W4) |
| nick-wright | | | I'll take Minnesota minus the 10 and a half. | Miami dog-walked three straight; Flores blitz vs no Achane. | Overflow unlisted — Dolphins at Vikings (2026 W4). Favorite laying → SU+Bets. Home Minnesota → Implied NO. Blank slug/side. Omny ~27:49. | What's Wright NFL Week 4 Predictions | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 | hard | | Dolphins at Vikings (2026 W4) |
| nick-wright | | | I think the Chiefs have an elite offense again, so I don't mind laying four and a half on the road. … So I'll lay the four and a half with Kansas City. | Projects ~30–24 Chiefs at Vegas. | Overflow unlisted — Chiefs at Raiders (2026 W4). Favorite laying road → SU+Bets. Away Chiefs → Implied YES. Blank slug/side. Omny ~29:31. | What's Wright NFL Week 4 Predictions | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 | hard | | Chiefs at Raiders (2026 W4) |
| simms | | | but I have 3121 Rams the Rams I've got them winning the game, right? … the Rams win it that way | Rams 31–21; Eagles offense/Devonta doubt. | Overflow unlisted — Rams at Eagles (2026 W4). Explicit score SU. Away Rams → Implied YES. Blank slug/side. ASR YT lT5l9c11jDI ~35:33. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Rams at Eagles (2026 W4) |
| simms | | | I got 3827 Jaguars and this will be a Sims Bucks $300 there it is | Score 38–27 Jags; $300 Sims Bucks best bet. | Overflow unlisted — Jaguars at Bengals (2026 W4). Explicit score SU. Away Jags → Implied YES. Blank slug/side. ASR ~37:21 / best-bets wrap. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Jaguars at Bengals (2026 W4) |
| simms | | | Yeah I you know this is one where I'm definitely taking the Ravens thereays no way you can take the Titans. … I think Baltimore totally controls this game | No faith in Cam Ward/Titans offense vs Ravens. | Overflow unlisted — Titans at Ravens (2026 W4). Explicit taking Ravens → SU. Home Ravens → Implied NO. Blank slug/side. ASR ~48:15. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Titans at Ravens (2026 W4) |
| simms | | | I think Green Bay … does win | Packers at Bucs; Baker out / UDFA QB. | Overflow unlisted — Packers at Buccaneers (2026 W4). Explicit GB win (disagrees Connor Bucks). Away Packers → Implied YES. Blank slug/side. ASR ~50:38 / wrap. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Packers at Buccaneers (2026 W4) |
| simms | | | I'm with you I'm gonna go with the Cardinals | Cards at Giants; likes Arizona to score. | Overflow unlisted — Cardinals at Giants (2026 W4). Explicit Cards SU. Away Cardinals → Implied YES. Blank slug/side. ASR ~54:39 / $200 Sims Bucks. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Cardinals at Giants (2026 W4) |
| simms | | | I'm going 49ers, excuse me, I'm going 49ers. … I'm going 49ers 27, 19 at home … I'm taking the Niners to cover as well. | Shanahan hot; no faith Denver offense. | Overflow unlisted — Broncos at 49ers (2026 W4). Explicit score SU+cover. Home 49ers → Implied NO. Blank slug/side. ASR ~63:57. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Broncos at 49ers (2026 W4) |
| simms | | | I think Seattle bounces back here. … I'm going to go 31 21 again. … I do feel like the Seahawks will kind of slowly choke out the Chargers. | Seattle pulls away late 31–21. | Overflow unlisted — Chargers at Seahawks (2026 W4). Explicit score SU. Home Seattle → Implied NO. Blank slug/side. ASR ~68:05. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Chargers at Seahawks (2026 W4) |
| simms | | | I am going Vikings 2413 to win this one. … I'm going with the Viking. | No faith Miami moves ball vs Flores/Vikings D. | Overflow unlisted — Dolphins at Vikings (2026 W4). Explicit score SU. Home Vikings → Implied NO. Blank slug/side. ASR ~70:10. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Dolphins at Vikings (2026 W4) |
| simms | | | 3834 Lions win this one on the road. | Lions 38–34 at Carolina (weather caveat on total). | Overflow unlisted — Lions at Panthers (2026 W4). Explicit road Lions SU. Away Lions → Implied YES. Blank slug/side. ASR ~73:13. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Lions at Panthers (2026 W4) |
| simms | | | I'm going to have the Jets cover. … Bears win 2724 I think they … win 2724 | Jets cover as dog; Bears still win 27–24. | Overflow unlisted — Jets at Bears (2026 W4). Explicit Bears win score → SU; Jets cover → Bets. Home Bears → Implied NO. Blank slug/side. ASR ~47:27. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Jets at Bears (2026 W4) |
| simms | | | I went with the commanders. You went with the Colts. That's a London game. | Disagreement wrap: Chris = Colts. | Overflow unlisted — Colts vs Commanders London (2026 W4). Chris Colts SU; confirm home/away for side. Blank slug/side. Best-bets wrap ASR ~4667s. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Colts vs Commanders London (2026 W4) |
| simms | | | Other games that I do like. I do like the Ravens. I like the Cowboys. I like the Vikings. And as I told you, I like the Seahawks. | Mid-tier likes after best bets. | Overflow unlisted — Cowboys at Texans (2026 W4). Soft "I like" Cowboys → SU (lower bar). Away Cowboys → Implied YES. Blank slug/side. Ravens/Vikings/Seahawks already scored above. Best-bets ~4834s. | Chris Simms Unbuttoned Ep 930 Week 4 Picks | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | hard | | Cowboys at Texans (2026 W4) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned | | | I put, you know, 200 Sims bucks on the bills, 200 Sims bucks on the Cardinals, 175 on the bears. | Sims Bucks card for W4. | Overflow unlisted — Patriots at Bills (2026 W4). $200 Bills → SU. Home Bills → Implied NO. Blank slug/side. Already pending roster packet (decision queue). | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | needed | Co-host / producer voice on Chris Simms Unbuttoned | https://podcasts.apple.com/us/podcast/nfl-week-4-picks-browns-down-steelers/id1454809704?i=1000792881030 | unbuttoned |
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned | | | 200 Sims bucks on the Cardinals | Same card. | Overflow unlisted — Cardinals at Giants (2026 W4). Cards SU. Away → Implied YES. Blank slug/side. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | needed | Co-host on Chris Simms Unbuttoned | https://podcasts.apple.com/us/podcast/nfl-week-4-picks-browns-down-steelers/id1454809704?i=1000792881030 | unbuttoned |
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned | | | 175 on the bears | Same card. | Overflow unlisted — Jets at Bears (2026 W4). Bears SU. Home → Implied NO. Blank slug/side. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | needed | Co-host on Chris Simms Unbuttoned | https://podcasts.apple.com/us/podcast/nfl-week-4-picks-browns-down-steelers/id1454809704?i=1000792881030 | unbuttoned |
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned | | | I went with the commanders. You went with the Colts. That's a London game. | Disagreement wrap. | Overflow unlisted — Colts vs Commanders London (2026 W4). Connor Commanders SU. Blank slug/side. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | needed | Co-host on Chris Simms Unbuttoned | https://podcasts.apple.com/us/podcast/nfl-week-4-picks-browns-down-steelers/id1454809704?i=1000792881030 | unbuttoned |
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned | | | I went with the Bucks. You went with the Packers | Disagreement wrap. | Overflow unlisted — Packers at Buccaneers (2026 W4). Connor Bucs SU. Home Bucs → Implied NO. Blank slug/side. Conflicts simms Packers. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 | needed | Co-host on Chris Simms Unbuttoned | https://podcasts.apple.com/us/podcast/nfl-week-4-picks-browns-down-steelers/id1454809704?i=1000792881030 | unbuttoned |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| pate | | Michigan State +10.5 | Michigan State plus 10.5. Cincinnati plus 7.5. Florida, Missouri over 56.5. … Let's go Buffalo plus 13.5. Let's go Auburn, Tennessee under 54.5. | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 |
| pate | | Cincinnati +7.5 | Michigan State plus 10.5. Cincinnati plus 7.5. | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 |
| pate | | Florida/Missouri Over 56.5 | Florida, Missouri over 56.5. | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 |
| pate | | Buffalo +13.5 | Let's go Buffalo plus 13.5. | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 |
| pate | | Auburn/Tennessee Under 54.5 | Let's go Auburn, Tennessee under 54.5. I think that number should be 50. | https://omny.fm/shows/josh-pates-college-football-show/week-5-upset-alerts-cfp-expansion-stupidity | 2026-10-01 |
| nick-wright | | Bills −6.5 (favorite — also Intake SU) | So Buffalo minus 6.5. | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 |
| nick-wright | | Jaguars +2.5 (dog — also Intake SU) | Jacksonville getting two and a half is pick number two. | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 |
| nick-wright | | Jets +3.5 (ATS — no clear SU) | So I'll take the Jets plus three and a half. | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 |
| nick-wright | | Vikings −10.5 (favorite — also Intake SU) | I'll take Minnesota minus the 10 and a half. | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 |
| nick-wright | | Chiefs −4.5 (favorite — also Intake SU) | So I'll lay the four and a half with Kansas City. | https://podcasts.apple.com/us/podcast/nfl-week-4-predictions-chiefs-raiders-patriots-bills/id1612694726?i=1000792862641 | 2026-10-02 |
| simms | | Jets cover / Bears still win (also Intake Bears SU) | I'm going to have the Jets cover. … Bears win 2724 | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 |
| simms | | 49ers cover (also Intake SU) | I'm taking the Niners to cover as well. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 |
| clay-travis | | Nebraska (blood bank — also Intake SU) | Nebraska is going to crush Maryland. | https://omny.fm/shows/the-clay-travis-show/clay-travis-show-israel-bound-flydubai-terror-plot-college-football-picks-cornell-case | 2026-10-01 |
| connor-rogers | | Chargers cover vs Seattle (ATS) | I am foolishly believing in the Chargers just to cover a touchdown line against Seattle. | https://www.youtube.com/watch?v=lT5l9c11jDI | 2026-10-02 |

### Radio coverage

| eventSlug / target | programs opened | outcome | notes |
|---|---|---|---|
| *(empty Dispatch — no under-dense approved)* | n/a | skipped | Overflow factory opens only; no local radio fallback. |

### Episode coverage

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| pate:1000792675479 | pate | 2026-10-01 ~9:30 PM ET (pub Fri 01:30Z) | yes | **hit** — Intake overflow pate Indiana + Georgia + Auburn; Bets Ramen ×5; do **not** restage Miami win+cover (Locker Room) | Apple i=1000792675479; Omny clip 1d5905fb; YT 8dXEH2hmgsY; Omny TextWithTimestamps | next Pate live / Knoxville |
| clay:1000792565012 | clay-travis | 2026-10-01 ~8:00 AM ET | yes | **hit** — Intake clay-travis Nebraska crush Maryland; rest of card graphic-only | Apple i=1000792565012; Omny 2bc8c988 | next solo PICKS |
| wright:1000792862641 | herd / nick-wright | 2026-10-02 ~12:09 PM ET | yes | **hit** — Intake nick-wright ×4 (Bills/Jags/Vikings/Chiefs); Bets Jets+3.5 ATS-only | Apple i=1000792862641; Omny 04e6aa5e | next Wright predictions |
| unbuttoned:1000792881030 | unbuttoned / simms | 2026-10-02 ~2:33 PM ET | yes | **hit** — Intake simms ×12; Candidates connor-rogers ×5; Bets covers | Apple i=1000792881030; YT lT5l9c11jDI chapters + ASR | next Unbuttoned |
| cover3 LOCKS / see-ball W5 | cover3 / see-ball | 2026-10-01 | prior afternoon | **hit** staged — do not restage | YT tCdDrdgpIHk / NCsPfpqNw7k | |
| pate locker/predictions | pate | 2026-09-30 | prior | **hit** staged — do not restage (incl. Miami) | Apple / Omny | |
| mcafee:1000792633691 | mcafee | 2026-10-01 | prior night | **hit** staged — do not restage TNF | Apple / YT a2Nx-De1n_Q | |
| mcafee:1000792883476 | mcafee | 2026-10-02 | title | skip — LIVE From Iowa guests; not picks/LOCKS card | Apple i=1000792883476 | GameDay Sat |
| finebaum Thu H1–H4 | finebaum | 2026-10-01 | prior | title-skip — guests; no Fri drop yet | Apple | next Finebaum Fri |
| eisen Fri H1–H3 | eisen | 2026-10-02 | title | skip — Right&Wrong / Browns reaction / no who-wins Week card | Apple | next Eisen locks |
| gmfb | gmfb | 2026-10-01 | prior | title-skip — Thu desk; no Fri yet | Apple | next predictions hour |
| herd BEST OF / hours | herd | 2026-10-01 | prior | title-skip — BEST OF / no Fri live yet | Apple | next live Herd |
| nightcap Fri | nightcap | 2026-10-02 | title | skip — TNF Browns reaction / not Super Chats who-wins | Apple | next Super Chats |
| bfw:1000792484742 | bfw | 2026-09-30 | prior | **dry** — do not reopen | Apple | Sat locks |
| clay Fri hours / Daily Review | clay-travis | 2026-10-02 | title | skip — midterms/politics | Apple | |
| cover3 Recruiting | cover3 | 2026-09-30 | title | skip — recruiting / not LOCKS | Apple | |

### Dropped

- **Pate Miami win+cover (Upset Alerts):** Explicit "Miami's going to win and cover" — **do not restage** (already Locker Room / prior pate Miami@Clemson).
- **Pate Washington@USC meter 7 / BYU@TCU meter 6:** Concern meters only — no clean first-person winner.
- **Clay full CFB graphic card:** Screen-only; only Nebraska verbalized — rest not staged.
- **Wright Jets +3.5:** ATS-only (no clear Jets SU) — Bets row only.
- **Wright stay-aways** (Cowboys/Texans, Rams/Philly, etc.): Explicit stay-away — not staged.
- **Cover3 LOCKS / See Ball / pate Predictions+Locker / McAfee 1636:** Do not restage.
- **McAfee 1637 Iowa / Eisen Fri / Nightcap TNF reaction / Finebaum Thu / Herd BEST OF / GMFB Thu / BFW dry / Clay Fri politics:** Title-skips.
- **Jesse (producer) Rutgers lean on Pate:** Producer bit — not Candidate.

### Freeze

- unpublished blank-slug overflow: no public freeze until mint
- no new mapped roster face this pass (all blank-slug overflow / Candidates)

### Stories this would mint

*(none mapped — overflow blank-slug waits operator mint + Audit; Candidates not auto-rostered)*

### Shows summary (this pass)

| metric | value |
|---|---|
| hard | 20 |
| candidates | 5 |
| bets | 14 |
| approved hunt hits | 0 (empty Dispatch) |
| overflow hard | 20 |
| mapped roster hard | 0 |
| audit | pending |
| promoted | false |

Quiet-if-dry N/A — NEW episodes opened + hard overflow + Candidates.
