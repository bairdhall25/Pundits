<!-- sidecar for docs/runs/2026-10-06.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-06 ~4:50 PM ET | Weekday after-afternoon **opened/hit** this_pass hard=7 candidates=0 bets=1 NEW=true (sidecar `docs/runs/2026-10-06b-weekday-afternoon-shows.md`). Empty approved Dispatch (no events with kickoff after 2026-10-04). NEW open: Cover 3 Week 6 Previews & Predictions Apple i=1000793486013 / YT _Uy6iG3V4Lg (overflow elliott×3 kanell×2 patterson×2; Week 6 LOCKS drop Thu ~11 AM ET per show). Opened dry: Eisen Tue H2 i=1000793499784 (Josh Pate Bama–Georgia segment ~18:24–21:05 — analysis, no winner). Title-skips: Finebaum Mon guests/callers; BFW 10.05 playoff-lock/Morris; See Ball Chambliss/CFP12; Pate W5 Reaction (prior); Clay Mon/Tue politics + SEC rankings reaction; Herd Tue H1–H3/BEST OF hierarchy + Sherman W4 Reaction + Sharp-or-Square W4 reactions; Eisen Tue H1/H3 + Mon hours; GMFB Tue H1/H2 + Mon reactions; McAfee 1638 recap. Radio skipped (no under-dense approved). Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-06 weekday afternoon (Grok Bot)

Tuesday ~4:20–4:50 PM ET after-afternoon. Ran `node scripts/scout-density.mjs` + `node scripts/scout-feeds.mjs` (~4:21 PM ET) on a fresh `origin/main` worktree, Apple lookups, local ASR (faster-whisper small.en; key windows re-run beam 5) on Cover 3 Week 6 Previews and Eisen Tue H2. Empty approved slate → factory overflow only. No diarization — speaker attribution from host cues/context; Audit confirm on the YouTube video. Did not invent slugs. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| elliott | | | Yeah, I think Oregon rolls them … I kind of think Oregon asserts himself here and wins by three scores. | Oregon front controls UCLA run game; UCLA hasn't faced a real defense. | Overflow unlisted — UCLA at Oregon (2026). Explicit winner + margin → SU. Home Oregon → Implied NO. Blank slug/side. Speaker by context (Bud: "to Tom's point", season win-total bettor) — Audit confirm on video. ASR ~18:42 / ~20:16. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | UCLA at Oregon (2026) |
| kanell | | | But I would, I would expect Oregon at home to be able to step up and take control of this game. | Picked Oregon for the title; expects Ducks to control the line of scrimmage at home. | Overflow unlisted — UCLA at Oregon (2026). First-person expectation of Oregon win → SU (near-legit bar). Home Oregon → Implied NO. Blank slug/side. Speaker by context (former backup-QB aside; picked Oregon to win title). ASR ~20:26–21:22. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | UCLA at Oregon (2026) |
| patterson | | | I think Sark says deal at 20. Yeah. I had 20 to 10 as kind of a, what would I, the way that this game unfolds in my mind's eye. DK, where are you at? | Texas defense; Oklahoma hasn't scored a TD on Texas since 2023. | Overflow unlisted — Texas vs Oklahoma (Red River, Dallas neutral, 2026). Score 20–10 in Sark/Texas context → Texas SU. Neutral site — side blank. Host Chip (hands off to DK). ASR ~28:51–29:01. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | Texas vs Oklahoma (2026, Dallas) |
| elliott | | | I think Indiana rolls them. … I just think Indiana is a way better team … I think Indiana will score in the 40s, and I think Nebraska will score in the 20s. | Indiana way better; Nebraska's SOS ranks 128th. | Overflow unlisted — Indiana at Nebraska (2026). Explicit winner + score range → SU. Away Indiana → Implied YES. Blank slug/side. Chip cue "Bud, what's it gonna look like?". ASR ~38:23–39:24. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | Indiana at Nebraska (2026) |
| elliott | | | I think, I think Louisville rolls out of bed and drops 35. … I don't have a lot of faith in his defense, like every competent passing game every Nole has faced has just totally diced them. | FSU defense diced by every competent passing game; Louisville up for Florida kids. | Overflow unlisted — Florida State at Louisville (Fri, 2026). Louisville win implied by "rolls out of bed" → SU (near-legit). Home Louisville → Implied NO. Blank slug/side. Speaker by context (FSU film rewatch / Kevin Wynn nose — Bud). ASR ~49:18–49:29. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | Florida State at Louisville (2026) |
| kanell | | | I do think this is one Provo, LJ Martin, steady dose on the ground, physicality. I think that's where BYU does have the significant edge. I think they're a better football team | BYU run game/physicality edge; Iowa State won't match last week's points. | Overflow unlisted — Iowa State at BYU (2026). "Better football team" + significant edge → SU (near-legit). Home BYU → Implied NO. Blank slug/side. Chip cue "DK, do you…". ASR ~53:05–53:43. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | Iowa State at BYU (2026) |
| patterson | | | I do think that they'll bring a fight here and ultimately find themselves at a talent and size disadvantage over the course of four quarters … all of the science says that BYU should be able to take care of business. | Iowa State fights but loses talent/size battle over four quarters. | Overflow unlisted — Iowa State at BYU (2026). ISU loses + BYU takes care of business → SU (near-legit). Home BYU → Implied NO. Blank slug/side. Host Chip ("vibes department"). ASR ~54:10–56:10. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | hard | | Iowa State at BYU (2026) |
| kanell | | | Similar. Um, I mean, did they have a bye week? … So yeah, I agree with you guys. | Agrees with Chip's Texas 20–10 but does not trust Arch / Texas consistency. | Overflow unlisted — Texas vs Oklahoma (2026, Dallas). Agreement-only → **soft** (not in hard count). Audit may upgrade if video shows a clear Texas call. ASR ~29:03–29:58. | Cover 3 Week 6 Previews & Predictions | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 | soft | | Texas vs Oklahoma (2026, Dallas) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| elliott | | UCLA season win total Over (futures — Bets only, not SU) | I had their over for the season win total. | https://www.youtube.com/watch?v=_Uy6iG3V4Lg | 2026-10-06 |

### Radio coverage

| eventSlug / target | programs opened | outcome | notes |
|---|---|---|---|
| *(empty Dispatch — no under-dense approved)* | n/a | skipped | Overflow factory opens only; no local radio fallback. |

### Episode coverage

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| cover3:1000793486013 | cover3 | 2026-10-06 ~12:34 PM ET | yes | **hit** — Intake overflow elliott×3 kanell×2 patterson×2 (+1 soft kanell) + Bets×1 | Apple https://podcasts.apple.com/us/podcast/week-6-college-football-previews-predictions-georgia/id1257913963?i=1000793486013; YT _Uy6iG3V4Lg; ASR full ~67m | Week 6 LOCKS (show says Thu 11 AM ET) |
| eisen:1000793499784 | eisen | 2026-10-06 ~2:09 PM ET | yes | dry — Josh Pate guest on Bama–Georgia: deciding factors / weather / "pencil the winner into the playoff", no winner named | Apple i=1000793499784; ASR full ~47m; Pate ~18:24–23:20 | Pate's own Week 6 picks show |
| finebaum Mon H1–H4 | finebaum | 2026-10-05 | title | skip — guests/callers; empty Dispatch | Apple i=1000793315128…1000793332962 | next Finebaum |
| bfw:1000793344438 | bfw | 2026-10-05 | title | skip — playoff locks + Eric Morris 1-on-1, not game SU | Apple | Thu/Sat locks |
| see-ball:1000793348596 | see-ball | 2026-10-05 | title | skip — Chambliss / CFP 12 | Apple | Week 6 PICKS |
| herd / eisen / gmfb / clay / mcafee Mon–Tue | various | 2026-10-05/06 | title | skip — Week 4 reactions / hierarchy / politics / recap | Apple | Week 5 NFL pick drops |

### Dropped

- **Georgia / Alabama:** no winner from any Cover 3 host ("I would favor Georgia, right?" ~14:18 immediately walked back: "I don't know, I was just spitting it out there"). Pate on Eisen H2 — analysis only.
- **UCLA / Oregon neutral-site hypothetical:** "I would take UCLA to beat Oregon on a neutral" (~25:14) is not this game → not SU. A host's "not enough stops … to pull off the upset" hedge (~23:13) left out.
- **Florida State / Louisville (kanell):** "I think they can" then "Do I trust them in this spot? No" (~48:11–48:42) — contradictory → not staged.
- **USC / Penn State:** "if they do that, USC should be able to handle their business" (~57:04) is conditional → not staged.
- **Indiana / Nebraska (patterson):** run-game/trenches analysis without a winner → not staged.
- **Iowa / Washington, Houston / Kansas State, Boise State / Fresno State, North Dakota State / UNLV, Texas A&M / Missouri, LSU / Kentucky:** analysis only.
- **Texas ML + Oklahoma defensive-score parlay:** musing, not a bet.

### Freeze

Do not restage these Cover 3 Week 6 Preview rows from later passes. Week 6 LOCKS (Thu) is a separate episode — hunt it fresh.
