<!-- sidecar for docs/runs/2026-10-08.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-08 ~11:20 PM ET | Weekday after-night **opened/hit** this_pass hard=8 candidates=2 bets=9 NEW=true (sidecar `docs/runs/2026-10-08c-weekday-night-shows.md`). Empty approved Dispatch (Week 6 events minted, all `onHome=false`, no approved capture-targets). **Audit-mandated restage:** compton `texas-vs-oklahoma-2026` YES from Pate Locker Room W6 (trim Lewan's folded "Plus 106 on minus 9.5"). NEW opens: Pate Week 6 Upset Alerts i=1000793959018 (Omny) — pate Missouri mapped NO + Ole Miss / LSU overflow; See Ball W6 Picks i=1000793934135 / YT I7h7hL7eHKs captions — pollack Georgia YES + Oregon NO + K-State mapped NO + LSU overflow; Sharp or Square W5 Bets i=1000793971130 — Candidates chad-millman Houston + simon-hunter Lions. Cover 3 W6 LOCKS i=1000793897036 / YT 1XrExuvf44s opened (chapters; ASR incomplete for main ATS board — ML sprinkles captured, speaker-unclear dog MLs left Bets/Dropped). What's Wright i=1000793952997 dry (analysis, no hard SU). Title-skips: Finebaum Thu H1–H4 (weather/callers/Drinkwitz/Elvis); Clay political; GMFB Thu H1/H2 + NFL Report (no locks format); Eisen Thu H1–H3 (NFC fugazi / Yankees / Higher Register — no locks board); BFW Wed preview already in feeds as unprocessed midweek (not Saturday locks). McAfee PMS 1641 TNF Preview Apple-opened; full TNF ASR incomplete this pass → reopen Fri if Dispatch still empty. Pate Locker Room W6 rows frozen except Compton Texas restage. Radio skipped (no under-dense approved). Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-08 weekday night (Grok Bot)

Thursday ~10:51–11:20 PM ET after-night. Fresh `origin/main` (26445bc, after 07c Audit + Promote). No prior 2026-10-08 day file (afternoon routine failed) — created from template. Ran `node scripts/scout-density.mjs` (empty approved Dispatch) + `node scripts/scout-feeds.mjs` (~10:52 PM ET), then direct Apple/Omny/YouTube for night factories. Evidence: Omny `TextWithTimestamps` (Pate Upset Alerts, Sharp or Square, What's Wright); See Ball YouTube auto-captions (I7h7hL7eHKs); Pate Locker Room Omny clip 6c75ca69-5060-42ab-8a74-b4dc014d4489 (Compton restage from prior-night transcript + Audit voice check); Cover 3 Apple audio/chapters (partial ASR). Mapped slugs only where the event exists in `data/events.json`. Did not invent slugs. X/News not-run.

**Compton Texas restage (Audit 07c fail 8c36f6003e63da73):** Prior quote ended with Lewan's board read "Plus 106 on minus 9.5" folded into Speaker 4's Omny turn. Clean Compton-only words end at "I don't see how Oklahoma pulls this one out." Do not restage pate Houston (Bets only / Audit).

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| compton | texas-vs-oklahoma-2026 | yes | I won't say he's inaccurate because he does have flashes. But I don't see how Oklahoma pulls this one out. | Texas defense is for real; Mateer must make tight throws vs Texas DBs on third down. | **Audit-mandated restage of 07c row** (fail 8c36f6003e63da73). Trimmed Lewan's folded "Plus 106 on minus 9.5". Mapped `texas-vs-oklahoma-2026` (neutral Cotton Bowl, Texas = YES). Compton not promoted on this event. Same Speaker 4 segment ~00:16:41–00:17:02 Omny; factors from his ~15:43–16:59 turns only. Attribution confidence: high. | Josh Pate's College Football Show — The Locker Room, College Football Week 6 Picks | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793748829 | 2026-10-07 | hard | | Texas vs Oklahoma (2026, Dallas) |
| pate | texas-am-at-missouri-2026 | no | I'm going to pick Missouri minus three and a half. … So give me Missouri minus three and a half. | A&M explosive pass gone (129th); Missouri gets pressure with four / green light for Simmons. | Mapped `texas-am-at-missouri-2026` (home Missouri = NO). Missouri −3.5 favorite cover → SU (house rule). Explicit pick language. `pate` not yet carded here (compton already NO). Omny Upset Alerts ~prediction block. Attribution: Pate solo show. | Josh Pate's College Football Show — Week 6 Upset Alerts + Commissioner's Poll Top 25 | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 | hard | | Texas A&M at Missouri (2026) |
| pate | | | But I'll still take Ole Miss. I think they may even cover. | Vandy can't run the ball; Ole Miss must-win out of the bye. | Overflow unlisted — Ole Miss at Vanderbilt (2026, Week 6). Explicit "take Ole Miss" → SU. Away Ole Miss → Implied YES. Blank slug/side. Upset-alert meter ~4–4.5 (not a flip of concern into a Vandy pick). | Josh Pate's College Football Show — Week 6 Upset Alerts + Commissioner's Poll Top 25 | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 | hard | | Ole Miss at Vanderbilt (2026) |
| pate | | | I think LSU will cover this game and win by double digits. | Kentucky can't convert third downs (138th); LSU top-five pressure / run D holds. | Overflow unlisted — LSU at Kentucky (2026, Week 6). Explicit "win by double digits" → SU. Away LSU → Implied YES. Blank slug/side. | Josh Pate's College Football Show — Week 6 Upset Alerts + Commissioner's Poll Top 25 | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 | hard | | LSU at Kentucky (2026) |
| pollack | georgia-at-alabama-2026 | yes | I choose Georgia. I'm betting 31-28. Georgia wins by a field goal margin. | Kirby/defense makes life harder for Keelan Russell; Russell looks more like a freshman under pressure. | Mapped `georgia-at-alabama-2026` (away Georgia = YES). Explicit choose + score → SU. YT captions ~12:55–13:13. `pollack` not carded here (pate/wasserman Alabama NO; compton Georgia YES). Caption quality medium — Audit reopen audio. | See Ball Get Ball with David Pollack — Week 6 CFB Picks | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 | hard | | Georgia at Alabama (2026) |
| pollack | ucla-at-oregon-2026 | no | So I'll choose Oregon. I'm betting on 34-27. | Oregon at home with playoff stakes / learned the USC lesson; still tempted by UCLA's offense. | Mapped `ucla-at-oregon-2026` (home Oregon = NO). Explicit choose + score → SU. YT captions ~22:01–22:03. `pollack` not carded (pate/elliott/kanell already Oregon NO). Caption quality medium — Audit reopen. | See Ball Get Ball with David Pollack — Week 6 CFB Picks | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 | hard | | UCLA at Oregon (2026) |
| pollack | houston-at-kansas-state-2026 | no | I think Kansas State will win on the road or at home against Houston. … I think Kansas State, Collin Klein, will get their first win, a really good win for them at home. | K-State careful with the ball; Klein first good home win. | Mapped `houston-at-kansas-state-2026` (home K-State = NO). Explicit "will win" → SU. YT captions ~upset-risk roundup. Caption says "on the road or at home" then clarifies home — Audit confirm. `pollack` not carded (compton already K-State NO). | See Ball Get Ball with David Pollack — Week 6 CFB Picks | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 | hard | | Houston at Kansas State (2026) |
| pollack | | | I think 30-21 in favor of LSU. I bet 31-20 for LSU. | LSU athleticism / DL creates the decisive takeaway; defense holds even without Spears. | Overflow unlisted — LSU at Kentucky (2026). Explicit score bet → SU. Away LSU → Implied YES. Blank slug/side. YT captions ~LSU–Kentucky segment. | See Ball Get Ball with David Pollack — Week 6 CFB Picks | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 | hard | | LSU at Kentucky (2026) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| chad-millman | Chad Millman | nfl | Sharp or Square (Volume) | | | They got to win this. It can't be 0-4. They got to dominate. So I'm going to go with Houston. I guess I'm taking minus seven and a half. | Texans must dominate Titans in a must-win; taking the number available. | Overflow unlisted — Tennessee at Houston (2026, NFL Week 5). Explicit "got to win" + favorite −7.5 → SU. Home Houston → Implied NO. Blank slug/side. Speaker 1 = Millman (self-ID). Existing candidate packets pending — do not auto-roster. | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | 2026-10-08 | needed | Sharp or Square co-host with Simon Hunter | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | herd / sharp-or-square |
| simon-hunter | Simon Hunter | nfl | Sharp or Square (Volume) | | | I'll join you on the chalk. I'll go. Give me Detroit. I'll go Lions. | Joining Millman on chalk favorites; Lions over Cardinals spot. | Overflow unlisted — Arizona at Detroit (2026, NFL Week 5). Explicit "Give me Detroit / I'll go Lions" → SU. Home Lions → Implied NO. Blank slug/side. Closing card ~01:00:46. Diarization: short Speaker 2 turn after Millman; content is Simon joining chalk. Do not auto-roster. | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | 2026-10-08 | needed | Sharp or Square co-host / professional better | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | herd / sharp-or-square |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| pate | georgia-at-alabama-2026 | Over 51.5 (Ramen; total — not SU) | Georgia-Alabama over 51.5. I think that number should be like 54. | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 |
| pate | | Penn State +1.5 / Buffalo +19.5 / UNLV +3.5 (Ramen dogs — Bets) | Penn State plus 1.5, check. Buffalo plus 19.5, check. UNLV plus 3.5, check. | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 |
| pate | ucla-at-oregon-2026 | Oregon −11.5 (repeat of carded Oregon NO — not restaged as Intake) | I'll take Oregon, and I'll lay the 11.5. | https://podcasts.apple.com/us/podcast/id1485905502?i=1000793959018 | 2026-10-08 |
| elliott | | West Virginia +150 ML vs Arizona (dog — Bets/overflow) | Mountaineers plus 150 at home against Arizona. I got to take a shot just based on price here | https://podcasts.apple.com/us/podcast/id1257913963?i=1000793897036 | 2026-10-08 |
| (cover3-unclear) | south-carolina-at-florida-2026 | South Carolina +440-ish ML (dog — speaker unclear on ASR) | Give me South Carolina 40. | https://podcasts.apple.com/us/podcast/id1257913963?i=1000793897036 | 2026-10-08 |
| chad-millman | | Houston −7.5 (favorite cover also SU — staged Candidate) | I'm going to go with Houston. I guess I'm taking minus seven and a half. | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | 2026-10-08 |
| simon-hunter | | Saints +115 / Raiders +164 (dog round-robin — Bets) | Get the Saints in there, plus 115. … Raiders, plus 164. | https://podcasts.apple.com/us/podcast/id1042368254?i=1000793971130 | 2026-10-08 |
| pollack | indiana-at-nebraska-2026 | no bet / pass (not SU) | I'm not ready to bet on either Indiana or Nebraska yet. | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 |
| pollack | usc-at-penn-state-2026 | USC lean only (not hard SU) | So I'm leaning towards USC. | https://podcasts.apple.com/us/podcast/id1769665459?i=1000793934135 | 2026-10-08 |

### Radio coverage

| eventSlug / target | programs opened | outcome | notes |
|---|---|---|---|
| *(empty Dispatch — no under-dense approved)* | n/a | skipped | Factory opens only; no local radio fallback. |

### Episode coverage

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| pate:1000793748829 | pate / locker-room | 2026-10-07 ~6:45 PM ET | yes (restage only) | **hit** — Audit-mandated compton Texas YES restage (trim Lewan fold); other 07c rows frozen | Apple i=1000793748829; Omny 6c75ca69-5060-42ab-8a74-b4dc014d4489; Texas segment ~00:15:43–00:17:02 | done |
| pate:1000793959018 | pate / upset-alerts | 2026-10-08 | yes | **hit** — pate Missouri mapped NO; Ole Miss + LSU overflow; Oregon repeat Bets-only; Ramen totals/dogs | Apple i=1000793959018; Omny clip 265e2a03-b866-4eea-9355-b4de0006efb6 transcript | Fri Night Lines / weekend |
| seeball:1000793934135 | see-ball | 2026-10-08 ~5:09 PM ET | yes | **hit** — pollack Georgia YES, Oregon NO, K-State NO; LSU overflow; Indiana/Nebraska pass; USC lean Bets | Apple i=1000793934135; YT I7h7hL7eHKs captions | next See Ball |
| cover3:1000793897036 | cover-3 / locks | 2026-10-08 ~12:59 PM ET | partial | **partial** — chapters opened; ML sprinkles (Bud WVU/Coastal; SC ML speaker-unclear); main ATS locks ASR incomplete → reopenReason=locks-board-asr | Apple i=1000793897036; YT 1XrExuvf44s; chapters Georgia 25:00 / Oregon 33:52 / Texas 40:36 / Indiana 44:55 / ML 1:20:51 | reopen Cover 3 LOCKS board with cleaner ASR |
| sos:1000793971130 | herd / sharp-or-square | 2026-10-08 | yes | **hit** — Candidates chad-millman Houston + simon-hunter Lions; dog RR Bets | Apple i=1000793971130; Omny 53d92e73-e0f0-437f-b3d8-b4dd0116a740 | Sunday final bets |
| wright:1000793952997 | herd / whats-wright | 2026-10-08 | yes | dry — Eagles SB-pick angst / 49ers–Seahawks talk; no hard named Week 5 winner in transcript | Apple i=1000793952997; Omny a1fd9adc-5c28-4972-9e52-b4dd01154114 | next What's Wright |
| mcafee:1000793924584 | mcafee | 2026-10-08 ~3:50 PM ET | partial | Apple page opened (TNF Bucs–Cowboys + Herbstreit/Kirby guests); full-show ASR incomplete this pass | Apple i=1000793924584 | reopen TNF desk if needed Fri |
| (title skips) | finebaum / clay / gmfb / eisen / bfw | 2026-10-08 | title | skip — weather/callers/Drinkwitz/Elvis; Clay political; GMFB/Eisen no locks board; BFW midweek preview | Apple lookups ~10:52–11:10 PM ET | Fri LOCKS / Saturday BFW |

### Dropped / not restaged

- **Pate Oregon −11.5:** already carded `ucla-at-oregon-2026` NO — consistent repeat → Bets note only.
- **Pate South Carolina–Florida:** upset-alert 6, "not ready to call for the upset" → not SU.
- **Pate BYU / Wake / UCF / Tennessee–Arkansas:** concern-meter only, no named winner.
- **Pate Penn State "going to win":** already carded `usc-at-penn-state-2026` NO — not restaged.
- **07c Locker Room rows** (compton Georgia/Nebraska/K-State/Mizzou; pate Oregon; Lewan candidates): frozen except Compton Texas restage. Do not restage pate Houston ML parlay leg.
- **Cover 3 main ATS locks board:** opened but ASR too incomplete to attribute clean SU quotes tonight — reopen; do not invent.
- **Cover 3 "Give me South Carolina":** dog ML likely SU but speaker not confidently attributed on ASR → Bets/unclear.
- **Pollack Indiana–Nebraska:** explicitly "not ready to bet on either" → dropped.
- **Pollack USC lean:** lean ≠ hard SU → Bets.
- **What's Wright:** no hard SU.
- **SoS ATS/survivor chatter** without explicit winner → Bets only where staged.

### Freeze

Do not restage: Compton Texas restage (once Audit-ok); pate Missouri; pollack Georgia / Oregon / K-State from this pass. Cover 3 LOCKS board still reopenable for other voices. Pate Locker Room W6 non-Texas rows remain frozen from 07c.

### Stories this would mint

- Compton finally joins the Texas YES card on `texas-vs-oklahoma-2026` with a clean single-speaker quote (Audit fix).
- Pate adds Missouri NO on `texas-am-at-missouri-2026` alongside compton.
- Pollack joins Georgia YES (with compton) opposite pate/wasserman Alabama NO; adds another Oregon NO; joins K-State NO with compton.
