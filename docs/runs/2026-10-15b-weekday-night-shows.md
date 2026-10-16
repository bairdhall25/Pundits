<!-- sidecar for docs/runs/2026-10-15.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-15 ~9:45 PM ET | Weekday after-night **opened/hit** this_pass hard=2 candidates=1 bets=1 NEW=true (sidecar `docs/runs/2026-10-15b-weekday-night-shows.md`). Empty approved Dispatch → both hard are blank-slug overflow (TNF past KO); mapped roster hard NEW=0. NEW opens: Chris Simms Unbuttoned TNF pick (i=1000796534534) → simms Seahawks + Candidate connor-rogers Seahawks (−2.5 Bets); What's Wright Nick Wright (i=1000796531142) → nick-wright Seahawks; Ringer Wise Guys TNF preview (i=1000796523942) dry staging (Seahawks lean unattributed). Afternoon rows not restaged. Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-15 weekday after-night (Grok Bot)

Thursday ~9:22–9:45 PM ET after-night. Fresh `origin/main` (dbc20d7). Afternoon sidecar `docs/runs/2026-10-15a-weekday-afternoon-shows.md` already landed — not restaged (cowherd / brandt / john-middlekauff Seahawks; elliott ND YES; Clay FSU +21.5 Bets). Ran `node scripts/scout-feeds.mjs` (~9:24 PM ET) + Apple lookups for night factories (Unbuttoned, What's Wright / Capper, Wise Guys, Nightcap, Hard Count, Andy & Ari, Pick Em, BFW, Pate, Finebaum, Barstool CFB). Evidence: publisher audio (Omny Unbuttoned + What's Wright; Megaphone Wise Guys) downloaded ~9:25 PM ET; faster-whisper `small.en` (beam 5, VAD + no-VAD tight pass on Unbuttoned pick). Quotes trimmed to named speaker's own words. Reasoning ≤60 words, two same-speaker factors only. Parlay legs → Bets only. Did not invent slugs. TNF past kickoff (8:15 PM ET) — overflow only from night factories opened for night windows. X/News not-run.

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft | targetId | matchup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| simms |  |  | I'm going to take Seattle. I'll give you a score. I'm going to say 20 to 16. | Denver hasn't played an impressive game yet, and he expects Seattle's defense to show up and choke out the Broncos' offense. | Overflow unlisted — Seahawks at Broncos (2026, NFL Week 6 TNF Thu Oct 15 8:15 PM ET; ESPN 401872995; proposed id nfl-w6-seahawks-at-broncos, not approved). Away Seattle → Implied YES. Blank slug/side. Joining turn after Connor Rogers Seattle pick on Unbuttoned; predicts 20-16. Attribution medium-high: host joining language after Connor short-and-sweet; no same-turn "Chris" name cue on the pick sentence. Chapter "TNF props & pick" ~39:24; publisher audio ~50:32–50:36. Do not restage afternoon cowherd/brandt/middlekauff. | Chris Simms Unbuttoned — John Lynch on 49ers injuries; Seahawks Broncos TNF pick | https://podcasts.apple.com/us/podcast/john-lynch-on-49ers-injuries-seahawks-broncos-tnf-pick/id1454809704?i=1000796534534&uo=4 | 2026-10-15 | hard |  | Seahawks at Broncos (2026) |
| nick-wright |  |  | I love Seattle tonight. I don't care that they're a road dog. | Doesn't see a path for Denver while Bo Nix has flatly not been good, and frames it as a must-have home game for Denver's divisional race that they still can't win. | Overflow unlisted — Seahawks at Broncos (2026). Away Seattle → Implied YES. Blank slug/side. Solo Nick Wright show. "Love … tonight" + road-dog dismissal = SU under lower bar / leaning-plus-today. Publisher audio ~23:36–23:39. Past KO at Scout open — overflow from night Capper factory already opened. | What's Wright? with Nick Wright — Broncos Bo Nix PROBLEM, Cowboys-Packers BLOCKBUSTER SHOWDOWN | https://podcasts.apple.com/us/podcast/broncos-bo-nix-problem-cowboys-packers-blockbuster/id1612694726?i=1000796531142&uo=4 | 2026-10-15 | hard |  | Seahawks at Broncos (2026) |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| connor-rogers | Connor Rogers | nfl | Chris Simms Unbuttoned (NBC Sports / Volume) |  |  | I'm taking Seattle tonight. | Sees a show-me moment for Denver even after Sean Payton called plays, and says Bo Nix simply has to play better while Seattle's defense is healthy. | Overflow unlisted — Seahawks at Broncos (2026). Away Seattle → Implied YES. Blank slug/side. Same turn also takes Seattle −2.5 to cover → Bets (favorite covering). Attribution medium-high: "for everything you said … short and sweet" after Simms Denver-offense rant; already pending candidate-connor-rogers. photoUrl=needed. Do not auto-roster. Audio ~49:35–49:36. | https://podcasts.apple.com/us/podcast/john-lynch-on-49ers-injuries-seahawks-broncos-tnf-pick/id1454809704?i=1000796534534&uo=4 | 2026-10-15 | needed | Co-host, Chris Simms Unbuttoned (NBC Sports / Volume) | https://podcasts.apple.com/us/podcast/chris-simms-unbuttoned/id1454809704 | simms |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| connor-rogers |  | Seattle −2.5 at Denver — favorite covering, also Candidate SU | Yeah with the two and a half points to cover. | https://podcasts.apple.com/us/podcast/john-lynch-on-49ers-injuries-seahawks-broncos-tnf-pick/id1454809704?i=1000796534534&uo=4 | 2026-10-15 |

Bets matchups (outside quotes): Seahawks at Broncos (2026). Connor cover line is contiguous with his Seattle SU turn (Omny chapter ~39:24; audio ~49:36–49:38).

### Row identities

Computed with `rowIdentity` from `scripts/scout-handoff-lib.mjs` (main dbc20d7). Audit recomputes; if any differ, the script wins.

| table | pundit / proposedId | matchup | rowId |
|---|---|---|---|
| Intake | simms | Seahawks at Broncos (2026) | 392491df83d4a3ea |
| Intake | nick-wright | Seahawks at Broncos (2026) | 57a66450d9ae2737 |
| Candidates | connor-rogers | Seahawks at Broncos (2026) | 21e5e650482bc384 |

### Radio coverage

| eventSlug | programs opened | outcome | notes |
|---|---|---|---|
| *(none)* | — | n/a | Empty approved Dispatch; no under-dense approved game. |

### Episode coverage

Recorded with recordEpisodeInspection into `docs/scout-episodes.json` (inspectedAt 2026-10-15T21:45:00-04:00, coverage target overflow (no approved Dispatch)).

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| simms:1000796534534 | simms (Unbuttoned) | 2026-10-15 ~2:54 PM ET | yes (small.en on TNF preview ~31:23 + props/pick ~39:24; no-VAD tight on pick) | **hit** — simms Seahawks + Candidate connor-rogers Seahawks (−2.5 Bets) | chapter TNF Seahawks Broncos Preview ~31:23; TNF props & pick ~39:24; pick audio ~49:35–50:36 | — |
| whats-wright:1000796531142 | whats-wright (Nick Wright / Capper) | 2026-10-15 ~2:16 PM ET | yes (small.en 0–20 + 15–40 TNF window) | **hit** — nick-wright Seahawks | ~16:40–25:00 Seahawks-Broncos; SU ~23:36 | — |
| wise-guys:1000796523942 | wise-guys (Ringer) | 2026-10-15 ~1:12 PM ET | yes (small.en TNF chapter ~2:50–16:35) | dry (staging) — Seahawks lean heard ("I'm laying it with the Seahawks" / "I'm going Seahawks") but no same-turn name cue among Sal / Bundle / Raheem | TNF preview ~2:50–16:35 | — |

### Dropped

- **Ringer Wise Guys TNF:** Seahawks ATS/SU lean without a same-turn name cue (Sal vs Anthony Dabbundo "the Bundle" vs Raheem). Props for Bundle/Raheem only. Not staged — same fail mode as Pick Em without cues.
- **Connor / Simms props (Unbuttoned):** Bo Nix INT, second-half / WR props, JSN — player props parked (`docs/fantasy.md`).
- **Nick Wright rest of Week 6 slate:** Cowboys-Packers / Caleb return analysis only in the opened window; no additional first-person SU staged (Sunday games unminted / off night scope).
- **Title-skipped:** Finebaum Thu H1 Dellenger/Dinich, H2 Pete Thamel, H3–H4 Callers (guest/caller hours); Hard Count "Progrum Panic Meter" (not predictions; candidate-jd-pickell closed); Andy & Ari "24-team CFP" (not PICKING); Nightcap Thu H1/H2 early-AM news (Alaric Jackson / AJ Brown — no pick chapter); Pick Em W7 already dry 10-14; Barstool CFB no 2026 drop; Pate "School of Greatness" cross-promo + Locker Room already hit 10-14; BFW Week 7 Preview 10.14.26 still waiting (Saturday locks preferred — not gap-opened).
- **Do not reopen dry without new reason:** afternoon Cover 3 LOCKS / See Ball / Herd H1–H3 / GMFB H1–H2 / 3&Out / Eisen H1 / McAfee 1646 / Clay.
- **Do not restage:** afternoon cowherd/brandt/middlekauff Seahawks + elliott ND; 10-14 pate/compton/rosenthal/sherman/wasserman/staples.

### Freeze

*(none)* — no mapped roster faces gained (both hard rows blank-slug overflow; Seahawks at Broncos still unminted).

### Operator ping

| field | value |
|---|---|
| ready-to-audit | **2 hard** (+ **1 candidate**) |
| mapped vs overflow | mapped roster hard NEW: **0**; overflow blank-slug: **2** (simms Seahawks, nick-wright Seahawks); Candidate: connor-rogers Seahawks; Bets: 1 |
| Promote | none (no new mapped roster hard). Overflow = mint-or-discard ask only (Seahawks at Broncos). Candidates are not auto-rostered. |
| sidecar | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-15b-weekday-night-shows.md |
| day | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-15.md |

### Stories this would mint

None until the operator mints Seahawks at Broncos (2026). If minted (conventional slug if asked: `seahawks-at-broncos-2026`; not invented here), Audit-ok rows would map like this: simms Seahawks = YES; nick-wright Seahawks = YES; connor-rogers Seahawks = YES (Candidate, needs a roster yes before Promote). Pairs with afternoon cowherd/brandt/middlekauff + prior Candidates greg-rosenthal + richard-sherman.
