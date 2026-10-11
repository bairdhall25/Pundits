<!-- sidecar for docs/runs/2026-10-11.md — day file owns hard=/candidates= header -->
## Lane status

| lane | status | asOf | note |
|---|---|---|---|
| Shows | completed | 2026-10-11 ~7:57–8:10 AM ET | Sunday NFL pregame bounded pass this_pass hard=14 candidates=0 bets=0 NEW=true (sidecar `docs/runs/2026-10-11a-sunday-nfl-pregame.md`). Empty approved Dispatch; NFL Week 5 events exist (onHome=false) so roster SUs map. First push prioritizes the London kickoff (9:30 AM ET): Florio PFT Week 5 column, 14 mapped SUs incl. Eagles vs Jaguars (Jaguars NO). Single-call games covered: texans-at-titans, bengals-at-dolphins, broncos-at-chargers (+ raiders-at-patriots, lions-at-cardinals which also have pending 09e Simms restages). Did not touch `data/`. |
| X | not-run | | |
| News | not-run | | |

## Shows pass 2026-10-11 Sunday NFL pregame (Grok Bot)

hard=14 candidates=0 bets=0. Did not touch data/. Never mint ids. Never tweet.

Sunday ~7:57 AM ET (America/New_York). Bounded one-off pass with a 9:10 AM ET push deadline. Coverage read from fresh `data/calls.json` + `data/events.json` (raw main ~7:58 AM ET) and the 10-09c Audit / 09e restage: one mapped hard call each on texans-at-titans (nick-wright), bengals-at-dolphins (simms), broncos-at-chargers (simms), raiders-at-patriots (simms; 09e restage pending), lions-at-cardinals (simms; 09e restage pending). Hunted those first, then London (9:30 AM ET kickoff — counts only if pushed before KO).

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| florio | eagles-vs-jaguars-2026 | no | Jaguars 27, Eagles 12. | Florio says the Eagles went from 2-0 to 2-2 with few answers amid injuries and roster turmoil, and winning after a flight to London would take all of Sirianni's abilities and the Jaguars treating them as a bye week. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Eagles vs Jaguars (London, Tottenham), 9:30 AM ET; Jaguars designated home = NO; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | bears-at-packers-2026 | yes | Bears 27, Packers 20. | Florio says the Bears have the better team even without Caleb Williams, and their head coach needs to back up his big talk about Chicago's top rival. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Bears at Packers, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | bengals-at-dolphins-2026 | yes | Bengals 26, Dolphins 14. | Florio says Miami isn't good enough on either side of the ball, and the Bengals can't afford a third straight loss in a game they absolutely should win. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Bengals at Dolphins, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | raiders-at-patriots-2026 | no | Patriots 27, Raiders 24. | Florio says the Patriots rediscovered their swagger at Buffalo, and they (and Vrabel) will remember the Raiders beating them at Gillette last year. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Raiders at Patriots, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | vikings-at-saints-2026 | yes | Vikings 23, Saints 17. | Florio says the Vikings' strong 2025 finish has carried over while the Saints' has not. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Vikings at Saints, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | browns-at-jets-2026 | yes | How good are the 2026 Browns? I didn’t even think twice about this one. Browns 17, Jets 10. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Browns at Jets, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | colts-at-steelers-2026 | no | Steelers 24, Colts 20. | Florio says the Steelers get three extra days to prepare while the Colts had to fly back from London. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Colts at Steelers, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | texans-at-titans-2026 | yes | Texans 21, Titans 16. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Texans at Titans, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | giants-at-commanders-2026 | no | Commanders 27, Giants 23. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Giants at Commanders, 1:00 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | broncos-at-chargers-2026 | yes | Broncos 27, Chargers 17. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Broncos at Chargers, 4:05 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | lions-at-cardinals-2026 | yes | Lions 24, Cardinals 23. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Lions at Cardinals, 4:25 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | 49ers-at-seahawks-2026 | no | Seahawks 21, 49ers 17. | Florio says the Seahawks can't afford to fall two games behind the 49ers, and Seattle vividly remembers losing at home to San Francisco last year. | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). 49ers at Seahawks, 4:25 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | ravens-at-falcons-2026 | no | Falcons 30, Ravens 21. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Ravens at Falcons (SNF), 8:20 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |
| florio | bills-at-rams-2026 | no | Rams 38, Bills 35. |  | Mike Florio bylined PFT Week 5 picks column (NBC Sports, published 2026-10-08 12:13 PM ET). Written column, single byline — attribution confidence HIGH. Straight-up score pick (no spread in column). Bills at Rams (MNF Mon Oct 12), 8:15 PM ET; YES = away/listed-first team. First Florio W5 row staged (none in 10-06…10-10 passes). | PFT — Florio Week 5 picks | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | 2026-10-08 | hard |

### Candidates

| proposedId | name | group | outlet | eventSlug | side | verbatim quote | reasoning | note | sourceUrl | sourceDate | photoUrl | association | associationUrl | factory |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | |

### Bets

| pundit | eventSlug | bet | verbatim quote | sourceUrl | sourceDate |
|---|---|---|---|---|---|
| | | | | | |

### Row identities

Computed with `rowIdentity` from `scripts/scout-handoff-lib.mjs` (main @ fetch time). Audit recomputes; if any differ, the script wins.

| table | pundit | eventSlug | side | rowId |
|---|---|---|---|---|
| Intake | florio | eagles-vs-jaguars-2026 | no | 49cb5fc2e3a57288 |
| Intake | florio | bears-at-packers-2026 | yes | 207e7a99bec2ca28 |
| Intake | florio | bengals-at-dolphins-2026 | yes | 855305c20e22354b |
| Intake | florio | raiders-at-patriots-2026 | no | fa88d7ac6c8f11b5 |
| Intake | florio | vikings-at-saints-2026 | yes | c547a28be1ba3381 |
| Intake | florio | browns-at-jets-2026 | yes | 1cd5f6b85fc3128f |
| Intake | florio | colts-at-steelers-2026 | no | d697e6b8a142dddf |
| Intake | florio | texans-at-titans-2026 | yes | f0be5293e9c33673 |
| Intake | florio | giants-at-commanders-2026 | no | b5d7542c78bcc7fe |
| Intake | florio | broncos-at-chargers-2026 | yes | cb66d1053a773e67 |
| Intake | florio | lions-at-cardinals-2026 | yes | d1ca0ee31bb835e4 |
| Intake | florio | 49ers-at-seahawks-2026 | no | 0e3ade30ac9b9bca |
| Intake | florio | ravens-at-falcons-2026 | no | 033db1788bbe12c5 |
| Intake | florio | bills-at-rams-2026 | no | 7a5ccbad4537707a |

### Radio coverage

| eventSlug / target | programs opened | outcome | notes |
|---|---|---|---|
| *(none — empty approved Dispatch)* | — | **skipped** | Bounded Sunday pregame pass; no radio. |

### Episode coverage

| episodeId | factory | published | inspected | outcome | locator | next check |
|---|---|---|---|---|---|---|
| pft-florio:2026-10-08-w5 | pft | 2026-10-08 12:13 PM ET | yes | **hit** — Intake florio ×14 (every Sunday/Monday W5 game; TNF Cowboys row past KO, dropped) | https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/pfts-week-5-2026-nfl-picks | — |

### Dropped

- **Florio Cowboys over Buccaneers (TNF Oct 8):** settled — not staged (Grader flag only).
- **Do not restage:** 10-09c / 09e Simms, Cowherd, Wright, Brandt, Coughlin, Hawk, Middlekauff, Clay W5 rows.

### Freeze

none (no approved/onHome Dispatch rows; Week 5 NFL events are onHome=false — Promote freezes at mint if needed)

### Stories this would mint

Mapped roster hard rows, if Audit ok: florio pick pages on all 14 Week 5 Sunday/Monday slugs. Disagreement adds: florio Lions YES vs simms Cardinals (09e restage), florio Commanders NO vs cowherd/simms Giants YES, florio Bengals/Texans/Broncos as second faces on single-call games.

### Operator ping

| field | value |
|---|---|
| ready-to-audit | **14 hard** (+ **0 candidates**) |
| mapped vs overflow | mapped roster hard: **14**; overflow blank-slug: **0**; Candidates: **0** |
| London | florio eagles-vs-jaguars-2026 NO staged in first push (before 9:30 AM ET KO) |
| sidecar | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-11a-sunday-nfl-pregame.md |
| day | https://github.com/bairdhall25/Pundits/blob/main/docs/runs/2026-10-11.md |
