<!-- sidecar for docs/runs/2026-10-13.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-13 ~10:20 PM ET | Weekday after-night **opened/hit** this_pass hard=3 candidates=0 bets=4 NEW=true (sidecar `docs/runs/2026-10-13c-weekday-night-shows.md`). Empty approved Dispatch → all 3 hard are blank-slug overflow (Week 7 NCAAF unminted); mapped roster hard=0. NEW opens: Andy & Ari On3 PICKING Week 7 (Mon 10/12, previously unprocessed) — staples×2 + wasserman×1 (same-turn name cues + resemblyzer); Andy & Ari Picking MORE of Week 7 (Tue 10/13) — all ATS dog picks or no same-turn cue → Bets/Dropped; Cover 3 Week 7 Big Game Breakdown (Tue 10/13) — dry (preview; picks Thursday LOCKS); Hard Count Week 7 PREDICTIONS (Tue 10/13) — five J.D. PicKell SUs not staged (candidate-jd-pickell closed by operator directive: never roster or ship). Title-skips: Finebaum Tue H2–H4 (guests/callers), Eisen Tue H1–H3, GMFB Tue H1–H2, Herd Tue, Clay Tue, Nightcap/Deebo & Joe, Unbuttoned Tue, What's Wright W5 Reaction, Wise Guys recap/leans, Kimes recap, McAfee 1644 MNF recap — all W5 reaction/recap. Radio n/a. Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-13 weekday after-night (Grok Bot)

Tuesday ~9:16–10:20 PM ET after-night. Fresh `origin/main` (f2a02b4). Afternoon pass (dry, no sidecar) already in the day file — not restaged. Ran `node scripts/scout-density.mjs` (empty approved Dispatch; proposed Week 7 shortlist still not approved) + `node scripts/scout-feeds.mjs` (9:17 PM ET). Evidence: publisher audio (Apple/Simplecast/Castfire RSS enclosures, downloaded 2026-10-13 ~9:20 PM ET); local faster-whisper `small.en` (VAD pass, then no-VAD window passes on pick chapters, beam 5 on quoted turns). Andy & Ari attribution follows the 2026-10-07 rule: stage only when a name cue sits in the **same turn**, never stitch across turns; corroborated with resemblyzer embeddings against in-episode references (Andy: records read ~4:59 and 'Give me the Tigers' ~1:02:45 after Ari asks 'Andy, who do you like?'; Ari: Ole Miss turn ~1:01:16 addressing Andy). All picks are ATS-framed; only favorites laying points route to SU (house rule 3); dogs-with-points stay Bets. No mapped slugs exist for Week 7 — Did not invent slugs. YouTube captions blocked (HTTP 429). X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| wasserman |  |  | So I'm taking Miami here. I'm done, you know, putting any hope or thought into Florida State being, you know, somewhat good. | Florida State's Friday-night collapse at Louisville felt like the turning point and final straw; he is done holding any hope that FSU performs. | Overflow unlisted — Florida State at Miami (2026, CFB Week 7; Coordinator proposed id ncaaf-w7-florida-state-at-miami, not approved). Home Miami → Implied NO. Blank slug/side. Miami is the favorite ('despite the giant spread') → favorite pick = SU (house rule 3); ATS framing also in Bets. Publisher audio (RSS download 2026-10-13) small.en ~1:17:01–1:17:42; turn opens 'After the way that they lost on Friday night, Andy, …' (same-turn name cue → Ari). Resemblyzer vs in-episode refs: Ari 0.96/0.93 vs Andy 0.82/0.76. Attribution confidence: high. Andy also took Miami — separate row. DAI may shift timestamps a few seconds. | Andy & Ari On3 — PICKING College Football Week 7 | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 | hard |  | Florida State at Miami (2026) |
| staples |  |  | I'll take Miami to cover here, despite the giant spread. | Expects a changed Mario Cristobal who learned his lesson from last year's midseason slide; Miami will not take its foot off the gas and will try to embarrass Florida State. | Overflow unlisted — Florida State at Miami (2026, CFB Week 7; proposed id ncaaf-w7-florida-state-at-miami, not approved). Home Miami → Implied NO. Blank slug/side. Favorite laying points → SU + Bets (house rule 3). small.en ~1:18:17–1:18:26; same turn continues 'Ari, let's go to Provo' (same-turn name cue → Andy). Reasoning from Andy's own ~1:15:43–1:16:36 turn (voice Andy 0.85–0.90 vs Ari ≤0.84). Pick turn voice Andy 0.95 vs Ari 0.85. Attribution confidence: high. Quote trimmed: leading 'Yes.' and trailing hand-off excluded. | Andy & Ari On3 — PICKING College Football Week 7 | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 | hard |  | Florida State at Miami (2026) |
| staples |  |  | If he has to do it all by himself, I just don't think they can do it. Give me Notre Dame to cover. | Asking too much of Bear Bachmeier to beat this Notre Dame defense single-handedly; another BYU back has to step up since LJ Martin went out. | Overflow unlisted — Notre Dame at BYU (2026, CFB Week 7; proposed id ncaaf-w7-notre-dame-at-byu, not approved). Away Notre Dame → Implied YES. Blank slug/side. Notre Dame is the favorite → laying points = SU + Bets (house rule 3). small.en ~1:26:37–1:27:46; same turn continues 'All right, Ari, that's eight picks down' (same-turn name cue → Andy). Voice Andy 0.90–0.94 vs Ari 0.83–0.85. Ari's earlier 'Give me Notre Dame' (~1:26:33) NOT staged — no same-turn name cue and voice split is ambiguous. Attribution confidence: high. | Andy & Ari On3 — PICKING College Football Week 7 | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 | hard |  | Notre Dame at BYU (2026) |

### Candidates

None this pass (J.D. PicKell SUs not staged — closed candidate; see Dropped).

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| wasserman |  | Miami −spread vs Florida State (number not read; 'giant spread') — favorite, also Intake SU | So I'm taking Miami here. | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 |
| staples |  | Miami −spread vs Florida State (unclear number) — favorite, also Intake SU | I'll take Miami to cover here, despite the giant spread. | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 |
| staples |  | Notre Dame −spread at BYU (unclear number) — favorite, also Intake SU | Give me Notre Dame to cover. | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 |
| staples |  | Mississippi State +13.5 at LSU (dog + points → Bets only) | I am taking Mississippi State plus 13 and a half. | https://podcasts.apple.com/us/podcast/picking-college-football-week-7-ohio-state-indiana/id1695325427?i=1000796000479&uo=4 | 2026-10-12 |

Bets matchups (outside quotes): Florida State at Miami (2026); Notre Dame at BYU (2026); Mississippi State at LSU (2026). Mississippi State row: ~1:42:01–1:42:03 (voice Andy 0.83 vs Ari 0.79), same turn continues 'Ari, let's head to Knox Vegas' (→ Andy); 'pending the availability report' qualifier precedes the pick.

### Row identities

Computed with `rowIdentity` from `scripts/scout-handoff-lib.mjs` (main f2a02b4). Audit recomputes; if any differ, the script wins.

| table | pundit | matchup | rowId |
|---|---|---|---|
| Intake | wasserman | Florida State at Miami (2026) | dfe058a8f9f50270 |
| Intake | staples | Florida State at Miami (2026) | 5073a0ff6e25a2ed |
| Intake | staples | Notre Dame at BYU (2026) | c9f34696756a5676 |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| *(none)* | — | n/a | Empty approved Dispatch; no under-dense approved game. |

### Episode coverage

Recorded with recordEpisodeInspection into `docs/scout-episodes.json` (inspectedAt 2026-10-13T22:10:00-04:00, coverage target overflow (no approved Dispatch)).

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| andy-ari:1000796000479 | andy-ari (staples, wasserman) | 2026-10-12 3:09 PM ET | yes (publisher audio small.en VAD + no-VAD windows on all 8 pick chapters) | **hit** — staples Miami + Notre Dame, wasserman Miami (overflow) + Bets | ~1:17:01–1:18:26; ~1:26:37–1:27:50 | — |
| andy-ari:1000796190890 | andy-ari | 2026-10-13 3:00 PM ET | yes (small.en VAD + no-VAD windows on 5 pick chapters) | dry (staging) — see Dropped | ~12:37–14:45, ~20:50–22:10, ~43:35–44:22, ~52:43–54:14, ~1:21:51–1:23:00 | — |
| cover3:1000796176808 | cover3 Big Game Breakdown W7 | 2026-10-13 1:06 PM ET | yes (small.en VAD full + no-VAD on 22 gaps / 33 min) | dry — preview analysis only; host says picks come Thursday 11 AM ET 'Week seven locks' | full 1:28:50 | Thu Cover 3 W7 LOCKS |
| hard-count:1000796153345 | hard-count (J.D. PicKell, solo) | 2026-10-13 10:57 AM ET | yes (small.en no-VAD full) | opened — five SUs (Ohio State, Notre Dame, Alabama, Texas, Kentucky) not staged: candidate-jd-pickell closed (operator directive 2026-10-06, never roster or ship) | ~16:20, ~33:39, ~47:47, ~1:01:42, ~1:16:45 | — |

### Dropped

- **Andy & Ari 10/12 (ATS, no same-turn cue):** Ohio State at Indiana — one host 'I think Ohio State is gonna win the game … win by four' (~15:20) and the other 'Give me Indiana' (+3.5, Bets); speakers not name-cued in the pick turns → not staged. Florida at Texas — 'I'm going to stick with Texas … to cover' (~30:49–31:03) and an earlier 'I'm taking Texas'; no same-turn name cue → not staged. Alabama at Tennessee — 'I'm going to lay the points … take Alabama' (~54:21–55:03), turn ends addressing producer River (not a host name cue) → not staged; producer River's 'give me the Vols' is a producer, not a pick voice. Missouri at Ole Miss — both hosts take Missouri +5.5 (dog → Bets only; not staged as SU). Penn State at Michigan — 'I'm taking Michigan to cover' / 'I'm going to take Penn State just to fade you' (~1:09:37–1:11:15), spread not read and turns interleaved → not staged. Notre Dame at BYU — Ari's 'Give me Notre Dame' (~1:26:33) has no same-turn cue → not staged (Andy's row staged).
- **Andy & Ari 10/13:** Wisconsin at UCLA — 'I'm going UCLA here. I'm going to lay the points' (~12:37) vs 'I'm taking the Badgers' (+3.5) — no same-turn cue on the UCLA turn → not staged. Auburn at Georgia — 'I am very confident Georgia is going to win this game … give me Georgia to cover' (~21:17–21:37) voice-matches Ari (0.94 vs 0.86–0.90) but the 'Andy' name cue (~21:50) sits after an interleaved 'Give me Georgia to cover' echo that voice-scores closer to Andy → cue not in the same turn; not staged per the 2026-10-07 rule. Oklahoma State at Houston — both lean Houston ('I'll go Houston here'; spread not read) → not staged. Nebraska at Oregon — 'Give me Oregon' (~54:12) follows 'So you are down on the Ducks, Ari Wasserman' in the other host's turn → cue not in the same turn; not staged. Kentucky at Oklahoma — both take Kentucky +6.5 (dog → Bets only).
- **J.D. PicKell (Hard Count W7):** Ohio State ('urgent Ohio State … ends up getting it done'), Notre Dame ('31-17 Irish get it done'), Alabama ('Alabama wins, Alabama covers, 27-17'), Texas ('I think Texas wins … Texas 31, Florida 20'), Kentucky ('I think Kentucky found a way to win this game') — solo host, clean SUs, but `candidate-jd-pickell` is closed by operator directive (never roster or ship) → not staged.
- **Cover 3 W7 Big Game Breakdown:** conditional/analysis only ('if they do, I think Kentucky can win this game'; 'if Bama comes out and scores 28, I think you feel amazing about them winning') — no winner picks; LOCKS episode Thursday.
- **Title-skipped (recap/reaction, no Week 6 NFL or Week 7 CFB picks):** Finebaum Tue H2 Billy Liucci / H3 Preston Guy / H4 Callers; Eisen Tue H1–H3; GMFB Tue H1–H2; Herd Tue H1–H3/Best Of; Clay Tue hours (politics); Nightcap H3 + Deebo & Joe P1/P2; Simms Unbuttoned Tue (LaFleur/Bills); What's Wright W5 Reaction (9:06 PM ET); Ringer Wise Guys Bills-Rams Recap + Week 6 Leans (leans = ATS, Wise Guys hosts off-roster); Mina Kimes Show W5 recap; McAfee 1644 MNF Recap; Simmons NBA over/unders. BFW 10.12 and See Ball 10/13 already dry (afternoon) — not reopened.
- **TNF Seahawks at Broncos:** unminted and unapproved; no roster SU heard tonight (Wise Guys 'Week 6 Leans' not opened — ATS/off-roster).

### Freeze

*(none)* — no mapped roster faces gained; Week 7 events unminted.

### Operator ping

| field | value |
|---|---|
| ready-to-audit | **3 hard** (+ 0 candidates) |
| mapped vs overflow | mapped roster hard: **0**; overflow blank-slug: **3** (wasserman Miami, staples Miami, staples Notre Dame); Bets: 4 |
| Promote | none (no new mapped roster hard). Overflow = mint-or-discard ask only. |
| sidecar | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-13c-weekday-night-shows.md |
| day | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-13.md |

### Stories this would mint

None until the operator mints Florida State at Miami (2026) and Notre Dame at BYU (2026). If minted (conventional slugs if asked: `florida-state-at-miami-2026`, `notre-dame-at-byu-2026` — not invented here), Audit-ok rows would map: wasserman + staples Miami = NO; staples Notre Dame = YES.
