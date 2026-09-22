<!-- sidecar for docs/runs/2026-09-21.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-09-21 ~9:30 PM ET | Night **opened/hit** (this_pass hard=1 candidates=0 bets=2). Empty approved unpublished Dispatch; Finebaum Mon H1–H3 dry; Simmons GTL → Bills mapped hard + Sal Steelers Bets. Radio n/a. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-09-21 night (Grok Bot)

Monday ~9:17 PM ET after-night. Re-ran `node scripts/scout-feeds.mjs` + Apple probes for night factories. Opened NEW Finebaum Mon H1–H3 (Fri hours left; Mon dropped after afternoon) and Bill Simmons Guess the Lines Week 3 (~01:07–01:32). ASR-verified. Do not restage afternoon dry opens. Did not invent slugs. Did not touch `data/`. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| simmons | | | It's 100% chance I'm putting the bills in the teas. | Josh Allen rampage; Chargers 0-2. | Approved unpublished — Chargers at Bills (2026). Favorite teaser → SU+Bets (house rule). Blank slug/side. GTL segment ~01:07–01:32 with Cousin Sal; never sal. | Bill Simmons Podcast GTL W3 | https://podcasts.apple.com/us/podcast/id1043699613?i=1000790902810 | 2026-09-21 | hard | nfl-w3-chargers-at-bills | Chargers at Bills (2026) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| simmons | | Chargers / Bills: Bills teaser (favorite) | It's 100% chance I'm putting the bills in the teas. | https://podcasts.apple.com/us/podcast/id1043699613?i=1000790902810 | 2026-09-21 |
| sal | | Bengals / Steelers: Steelers +3.5 (dog — Bets only) | This was an automatic. I'm taking the Steelers. … there's no way they're not covering the hook three and a half. | https://podcasts.apple.com/us/podcast/id1043699613?i=1000790902810 | 2026-09-21 |

### Radio coverage

| eventSlug / target | programs opened | outcome | notes |
|---|---|---|---|
| *(all Dispatch — still empty / early W3–W4)* | n/a | skipped | National night factories opened; one mapped hard only — no radio fallback. |

### Episode coverage

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| finebaum:1000790994850 | finebaum | 2026-09-21 ~4:22 PM ET | yes | dry | Apple i=1000790994850 / ASR full — Pat Forde LSU/Ole Miss + A&M/LSU schedule pressure; no Paul Week 4 who-wins | Tue who-wins / Upset Watch |
| finebaum:1000791000079 | finebaum | 2026-09-21 ~5:16 PM ET | yes | dry | Apple i=1000791000079 / ASR full — Billy Liucci (TexAggs) Kentucky loss + Baton Rouge hope; no Finebaum SU; Liucci team-analyst lean ≠ Intake | same |
| finebaum:1000791006509 | finebaum | 2026-09-21 ~6:09 PM ET | yes | dry | Apple i=1000791006509 / ASR full — Brockway Florida + Cubelic Week 3 tape (UF/AU, OM/LSU, Bama, A&M); caller Tennessee soft lean dropped (caller ≠ pundit) | same |
| finebaum:1000791010050 | finebaum | 2026-09-21 ~6:53 PM ET | skip | callers-only | Hour 4 Callers title — no named roster voice | |
| apple:1000790902810 | bill-simmons | 2026-09-21 ~4:54 AM ET | yes | **hit** — simmons Bills×1 + sal Bets | ASR GTL W3 ~01:07:04–01:31:48; Packers/Falcons + Ravens/Cowboys = line guesses only | Ringer 107 Week 3 picks |
| simms:1000790975238 | unbuttoned | 2026-09-21 | skip / recap | title Week 2 Recap | not Picks card | Fri Week 3 Picks |
| kapadia / ringer-nfl | ringer-nfl | — | waiting | no Week 3 drop (last Sep 18) | | Week 3 Ringer 107 |
| whats-wright | nick-wright | 2026-09-18/19 | skip | Week 2 Predictions / Best Of — settled slate | | Week 3 Predictions drop |
| nightcap / deebo-joe | nightcap | 2026-09-21 | skip / recap | Week 2 reaction Parts + Hours | | Week 3 who-wins |
| pft:1000790954031 / 1000790967149 | pft | 2026-09-21 | skip / recap | Mon H1/H2 Week 2 reaction titles | | Week 3 preview hour |
| against-all-odds | sal | dormant | skip | last ep 2025-08 | | |
| clay Mon | clay | 2026-09-21 | skip / off-topic | Daily Review / politics hours — no solo PICKS | | PICKS segment title |
| gmfb:1000791018454 | gmfb | 2026-09-21 ~7:47 PM ET | skip / reaction | NFL Report Darnold/Caleb — not who-wins | | Tue–Wed helmet |
| cover3 / bfw / see-ball / pate | — | | skip reopen | recap / afternoon dry / Tue prediction teased | | LOCKS / Sat BFW / Tue Pate |
| herd / eisen / mcafee Mon | — | | skip reopen | afternoon dry (no new reason) | | Tue Blazin'/locks |

### Dropped

- **Finebaum Mon H1–H3:** Forde/Liucci/Cubelic Week 3 reaction + schedule talk (A&M@LSU, Florida/Ole Miss, Oklahoma@Georgia soft) — no first-person Finebaum who-wins on Dispatch Week 4. Callers (Tennessee vs Texas soft; rankings debate) ≠ pick voices.
- **Finebaum H4:** Callers-only — skipped.
- **Simmons GTL Packers/Falcons:** Line guesses (Packers −7.5 / −9.5; actual −6.5) + Packers-not-good analysis — not SU. Free teaser Packers banter too thin / contradicted.
- **Simmons GTL Ravens/Cowboys:** Ravens −1.5 line guess + Brazil field warning — not SU.
- **Sal Steelers:** Dog +3.5 cover language → Bets only (no clear Steelers win).
- **Simms Mon:** Week 2 Recap — not Picks.
- **What's Wright:** Week 2 Predictions (settled) / Best Of — skip.
- **Nightcap / PFT Mon / GMFB NFL Report / Clay politics / Against All Odds dormant / Cover3 UFR / BFW recap / See Ball Instant Reaction / Pate Reaction (afternoon dry; Tue prediction teased).**
- Do not restage afternoon Herd/GMFB/Eisen/McAfee/Pate dry opens.

### Freeze

none (unpublished — no public card)

### Stories this would mint

- After mint: `/picks/{chargers-at-bills-slug}/simmons/` once event exists — Promote mint-ask first.

### Shows summary (this pass)

| metric | value |
|---|---|
| hard | 1 |
| candidates | 0 |
| bets | 2 |
| approved hunt hits | 1 mapped unpublished (Chargers@Bills) |
| overflow hard | 0 |
| audit | pending |
| promoted | false |

ASR-verified Apple URLs. Empty public eventSlug slate — blank slug/side on Intake.
