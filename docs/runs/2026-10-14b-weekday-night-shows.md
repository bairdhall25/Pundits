<!-- sidecar for docs/runs/2026-10-14.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-14 ~9:50 PM ET | Weekday after-night **opened/hit** this_pass hard=2 candidates=1 bets=4 NEW=true (sidecar `docs/runs/2026-10-14b-weekday-night-shows.md`). Empty approved Dispatch → both hard rows are blank-slug overflow; mapped roster hard=0. NEW opens: The Locker Room CFB Week 7 Picks (Pate feed, Apple i=1000796394355) → compton Ohio State (OSU at Indiana) + compton Oklahoma (Kentucky at Oklahoma); Richard Sherman Podcast NFL Week 6 PREDICTIONS (Herd feed, i=1000796395807) → Candidate richard-sherman Seahawks TNF; Barstool Pick Em Week 7 (i=1000796395344) dry for staging; NFL Daily Week 6 Early + Standalone/Late previews (i=1000796399236 / i=1000796397209) dry. Afternoon rows not restaged. Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-14 weekday after-night (Grok Bot)

Wednesday ~9:25–9:50 PM ET after-night. Fresh `origin/main` (3660ec4). Afternoon sidecar `docs/runs/2026-10-14a-weekday-afternoon-shows.md` already landed — not restaged (pate Indiana / Alabama / Ole Miss; Candidate greg-rosenthal Seahawks). Ran `node scripts/scout-density.mjs` (empty approved Dispatch) + `node scripts/scout-feeds.mjs` (9:26 PM ET), plus Apple lookups for the night factories (Locker Room on the Pate feed, Sherman on the Herd feed, Pick Em, NFL Daily, Ringer, Simms, Nightcap, Andy & Ari, Hard Count, McAfee). Evidence: Omny official TextWithTimestamps transcripts (Locker Room clip 03883b26, Sherman clip 5e7d3915, NFL Daily clips c677a788 / 3fc4be4c); publisher audio downloaded 2026-10-14 ~9:29 PM ET; faster-whisper `small.en` on the pick windows (beam 5). Locker Room speaker attribution: resemblyzer scores against the validated Compton / Lewan / Pate references from the Week 6 Locker Room audit (`docs/runs/2026-10-07-audit.md`). Publisher audio runs about +7:13 behind Omny after ~25:00 because of inserted ads; Sherman audio runs about +4:35. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| compton |  |  | I'm just going to take Ohio State to cover three and a half. | Expects Ohio State to stop Indiana's run game the way Nebraska did, and thinks Indiana's pedestrian secondary cannot handle Arthur Smith's power run game with Jeremiah Smith going deep. | Overflow unlisted — Ohio State at Indiana (2026, CFB Week 7; proposed id ncaaf-w7-ohio-state-at-indiana, not approved; not minted on main). Away Ohio State → Implied YES. Blank slug/side. Favorite laying −3.5 → SU + Bets (house rule 3); two units. He adds that if it becomes a fourth-quarter game he would like Indiana more (hedge, note only). Disagrees with pate's afternoon Indiana row. Attribution high: one continuous Compton turn, 'I'm in Husker land' cue (Nebraska alum), voice C +0.07 to +0.10 over Lewan on the pick sentences. Omny ~1:09:45; publisher audio ~76:55–77:01; reasoning from the same turn (Omny ~1:07:51–1:08:59, audio ~75:04–76:08). | The Locker Room — CFB Week 7 Picks (Josh Pate's College Football Show feed) | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 | hard |  | Ohio State at Indiana (2026) |
| compton |  |  | So I'm going to go Oklahoma minus six and a half with one unit. | Thinks winning the Red River Shootout put juice back in Oklahoma's locker room, and that the Sooners' defense plus a special-teams spark (the blocked-punt touchdown) is the same formula that won last year. | Overflow unlisted — Kentucky at Oklahoma (2026, CFB Week 7; not proposed, not minted). Home Oklahoma → Implied NO. Blank slug/side. Favorite laying −6.5 → SU + Bets (house rule 3). Low confidence by his own words ('I'm not confident … I have no clue'; one unit), staged under the lower bar. Attribution high: one continuous Compton turn, voice C +0.02 to +0.08 over Lewan throughout. Omny ~46:09–47:10; publisher audio ~53:41–54:22. | The Locker Room — CFB Week 7 Picks (Josh Pate's College Football Show feed) | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 | hard |  | Kentucky at Oklahoma (2026) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| richard-sherman | Richard Sherman | nfl | The Richard Sherman Podcast (Volume, The Herd feed) |  |  | But I got the Seattle Seahawks winning this game. I don't think that the Denver Broncos have enough offensively. | Doesn't think Denver has enough offense, and expects a frustrated, motivated Seattle team that has played well on the road to come into Mile High and score. | Overflow unlisted — Seahawks at Broncos (2026, NFL Week 6 TNF Thu Oct 15 8:15 PM ET; ESPN 401872995; proposed id nfl-w6-seahawks-at-broncos, not approved, not minted). Away Seattle → Implied YES. Blank slug/side. Predicts 24-13 Seattle (co-host's '27. Let's go.' interjection not in quote). Speaker 1 self-IDs at open ('Welcome back to the Richard Sherman podcast'; promo code Sherman); Mitchell Eisenstein is Speaker 2 and only says 'I like it' (not staged; candidate-mitch-eisenstein eligibility pending). Omny ~17:32–18:13; publisher audio ~22:14–22:59 (small.en matches). Already pending roster-candidate (candidate-richard-sherman). photoUrl=needed. Do not auto-roster. | https://podcasts.apple.com/us/podcast/the-richard-sherman-podcast-nfl-week-6-predictions/id1042368254?i=1000796395807&uo=4 | 2026-10-14 | needed | Host, The Richard Sherman Podcast (Volume / The Herd feed) | https://podcasts.apple.com/us/podcast/the-herd-with-colin-cowherd/id1042368254 | herd-volume |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| compton |  | Ohio State −3.5 at Indiana — favorite, also Intake SU | I'm just going to take Ohio State to cover three and a half. | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 |
| compton |  | Oklahoma −6.5 vs Kentucky — favorite, also Intake SU | So I'm going to go Oklahoma minus six and a half with one unit. | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 |
| pate | notre-dame-at-byu-2026 | Notre Dame at BYU under 46.5 (total → Bets only) | So I'm going to go five units on the under at 46 and a half. | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 |
| pate |  | Kentucky +6.5 at Oklahoma (dog + points → Bets only) | So I'm going no confidence, Kentucky plus six and a half, one unit. | https://podcasts.apple.com/us/podcast/the-locker-room-cfb-week-7-picks-josh-pate-will/id1485905502?i=1000796394355&uo=4 | 2026-10-14 |

Bets matchups (outside quotes): Ohio State at Indiana (2026); Kentucky at Oklahoma (2026) ×2 (compton, pate); Notre Dame at BYU (2026, minted off-home). Pate's Kentucky line is Omny Speaker 3 lower-case run (~48:14 turn tail), voice P. Pate's Missouri +6.5, Indiana +3.5 and Alabama −8.5 repeat his afternoon picks — not restaged.

### Row identities

Computed with `rowIdentity` from `scripts/scout-handoff-lib.mjs` (main 3660ec4). Audit recomputes; if any differ, the script wins.

| table | pundit / proposedId | matchup | rowId |
|---|---|---|---|
| Intake | compton | Ohio State at Indiana (2026) | ac83860e0a3f7598 |
| Intake | compton | Kentucky at Oklahoma (2026) | 3f01b79af5cad4bf |
| Candidates | richard-sherman | Seahawks at Broncos (2026) | 1604d16dadeb076b |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| *(none)* | — | n/a | Empty approved Dispatch; no under-dense approved game. |

### Episode coverage

Recorded with recordEpisodeInspection into `docs/scout-episodes.json` (inspectedAt 2026-10-14T21:45:00-04:00, coverage target overflow (no approved Dispatch)).

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| pate:1000796394355 | pate (The Locker Room) | 2026-10-14 6:45 PM ET | yes (Omny transcript, all pick chapters; small.en + resemblyzer on pick windows) | **hit** — compton Ohio State + Oklahoma overflow; Bets ×4; Lewan picks not staged (candidate closed) | Omny 18:22 Mizzou–Ole Miss; 29:02 ND–BYU; 42:10 Kentucky–OU; 57:02 Bama–Tenn; 1:06:29 OSU–Indiana; 1:17:37 super slate; 1:20:16 PSU–Mich; 1:28:24 dogs; 1:31:07 parlays | — |
| herd:1000796395807 | herd (Richard Sherman Podcast) | 2026-10-14 7:00 PM ET | yes (Omny transcript full; small.en on the TNF window) | **hit** — Candidate richard-sherman Seahawks TNF | Omny ~17:32 TNF; full Week 6 slate of Sherman SUs ~23:54–56:32 (not staged — Sunday/Monday games unminted, off operator priority) | Sunday slate if operator wants Sherman packet rows |
| pick-em:1000796395344 | pick-em (Barstool Pick Em) | 2026-10-14 7:00 PM ET | yes (base.en full; small.en 73:40–78:18 ND–BYU chapter) | dry (staging) — see Dropped | ~73:40–78:13 ND–BYU; ~79:02–86:00 cards | — |
| gmfb:1000796399236 | gmfb (NFL Daily — Week 6 Early Games Preview) | 2026-10-14 7:29 PM ET | yes (Omny transcript scan) | dry — preview analysis, no named winner picks | full | — |
| gmfb:1000796397209 | gmfb (NFL Daily — Week 6 Standalone and Late Games Preview) | 2026-10-14 7:19 PM ET | yes (Omny transcript scan) | dry — preview analysis, no named winner picks | full | — |

### Dropped

- **Taylor Lewan (Locker Room):** voice-confirmed (L +0.04 to +0.14) SUs: Ole Miss ('I think Ole Miss wins this game', ~28:35 audio), Oklahoma ('I think Oklahoma still wins this game', with Kentucky +6.5), Notre Dame −10.5 ('I'll take Notre Dame minus 10 and a half', ~46:26 audio), Alabama −8.5 ('I'm going Alabama minus eight and a half', ~69:54 audio; small.en hears 'all day on'). Michigan −6.5 (~88:20 audio) was not voice-verified. None staged: `candidate-taylor-lewan` is closed by operator directive (2026-10-08: never roster or ship).
- **Compton Notre Dame:** at first 'I like Notre Dame to cover … three units' (Omny ~29:51), then 'Move my three units to the under' (audio ~45:52, voice C +0.06). He withdrew the pick, so it is not staged (the minted notre-dame-at-byu-2026 stays staples-only from this source).
- **Compton others:** Missouri +6.5 (dog + points; he says he is 'real close' to the Mizzou ML but does not take it); Alabama–Tennessee under 51.5 (total; speaker not voice-checked); Nebraska ML 'individually' (stated inside parlay talk, no matchup read) — not staged.
- **Wisconsin outright at UCLA (Locker Room dogs, ~1:28:13–1:29:29 Omny):** 'Give me Wisconsin outright' / 'I'll take Wisconsin outright against UCLA' lands in cross-talk. Voice splits between C and L (C +0.06 on one fragment, L +0.03 on the next), so the speaker is not confirmed and it is not staged. Oklahoma State +4.5 dog lines are Bets-only, with the speaker split as well.
- **Pate (Locker Room):** Missouri +6.5, Indiana +3.5 and Alabama −8.5 repeat his afternoon picks (not restaged); ND–BYU under and Kentucky +6.5 → Bets; Syracuse +14.5 (no opponent read) and parlay legs (Kentucky / Wisconsin / Nebraska ML) → not staged (parlay legs are Bets only, not hard SU).
- **Barstool Pick Em W7:** cards are ATS (Bets). ND–BYU chapter: 'I'm taking BYU … I don't think you go into Provo and win by 10 points' (ATS framing, near a 'Provo Dave' cue that does not confirm who is speaking) and 'I think BYU can win the game outright … throw the dice on BYU plus 300' (hedged 'can', and no name cue in the same turn among Portnoy / Big Cat / Rico). Not staged: attribution is unconfirmed, the same fail mode as the 10-10 Pick Em audit. Wisconsin 'mortal lock' (~84:31) is unattributed, so it is not staged.
- **NFL Daily Week 6 previews (Rosenthal / Jourdan Rodrigue):** Sunday/Monday analysis only, with no named winner picks in the transcript scan. The TNF Rosenthal Candidate from the afternoon stands.
- **Title-skipped:** Finebaum Wed H1 Pat Forde / H2 Tyler Horka / H3 Michael Katz / H4 Callers (guest hours); McAfee 1645 Watt Wednesday (JJ Watt, Thamel CFP expansion, no picks segment); Simms Unbuttoned 'Fatal Flaw or Fixable'; Hard Count MORE W7 PREDICTIONS (candidate-jd-pickell closed); Andy & Ari 10/14 'What changes will Dan Lanning make' (not a PICKING episode); Cover 3 Recruiting Show (LOCKS Thu 11 AM ET); GMFB Andre Johnson 'Second Acts' / Lots to Say W5 recap / Week 6 power rankings; Eisen Wed H1 MVP candidates / H2 power rankings; Herd Daniel Cormier Show; Bill Simmons NBA over/unders; Nightcap Best of W5; Mina Kimes W5 recap; Ringer Wise Guys (already skipped 10-13). BFW 10.12 and See Ball 10/13 are still dry, with no new drop.
- **TNF Seahawks at Broncos roster desks:** no cowherd / jmac / nick-wright / middlekauff / brandt / mcafee first-person SU found tonight. Sherman (Candidate) is the only new TNF voice. Cover 3 LOCKS are still due Thu ~11 AM ET.

### Freeze

*(none)* — no mapped roster faces gained; priority games unminted on main (FSU–Miami / ND–BYU minted off-home, no new mapped rows).

### Operator ping

| field | value |
|---|---|
| ready-to-audit | **2 hard** (+ **1 candidate**) |
| mapped vs overflow | mapped roster hard: **0**; overflow blank-slug: **2** (compton Ohio State, compton Oklahoma); Candidate: richard-sherman Seahawks TNF; Bets: 4 |
| Promote | none (no new mapped roster hard). Overflow = mint-or-discard ask only. Candidates are not auto-rostered. |
| sidecar | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-14b-weekday-night-shows.md |
| day | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-14.md |

### Stories this would mint

None until the operator mints Ohio State at Indiana (2026), Kentucky at Oklahoma (2026) and/or Seahawks at Broncos (2026). If minted (conventional slugs if asked: `ohio-state-at-indiana-2026`, `kentucky-at-oklahoma-2026`, `seahawks-at-broncos-2026`; not invented here), Audit-ok rows would map like this: compton Ohio State = YES (against pate Indiana NO, a real disagreement card); compton Oklahoma = NO; richard-sherman Seahawks = YES (Candidate, needs a roster yes before Promote).
