# Shows Scout hunt map

Status: Operational

Date: 2026-08-29. Shows Scout hunts video, podcasts, TV clips, and durable sports-radio archives, then names the speaker. News is `docs/news-beats.md`. X is `bots/scout-x.md`.

If this file and `data/` disagree, **`data/` wins**.

## How to hunt

1. Read today’s `## Dispatch`.
2. Hunt `empty-side`, then `off-home`, then `thin`. Skip `dense` unless a source already open names that game.
3. Open listed picking programs that dropped in their real window. Jump locks, moneyline, “I’ll take,” or “who wins.” Captions and official transcripts count.
4. Use the bounded radio fallback only after the normal high-yield programs for that sport have been checked.
5. Name the speaker. Rostered people are Intake; add-list or qualified radio-pilot personalities are Candidates.

**SU** means the person picks the winner of a listed game. ATS, totals, win totals, title stretches, start/sit, and general matchup analysis are not SU.

## NCAAF

| Show | Voices | Drop | Jump | Notes |
|---|---|---|---|---|
| Cover 3 LOCKS | `kanell`, `patterson`; Fornelli/Elliott are Candidates | Thu/Fri | Moneyline Sprinkles | Same episode can produce several named rows |
| Josh Pate’s College Football Show | `pate` | frequent | end-of-show winners / “I’ll take” | Do not restage an existing event pick unless he clearly flips |
| Bear Bets / FOX | `fallica` | Thu–Sat | named winner | A bylined column is News |
| GameDay betting | `coughlin`; other roster faces when they pick | Saturday | Stanford Steve card / picks | Guests are the guest, never the host |
| BFW Show | `walker` | in-season | locks / named winner | Conference or season predictions are not game SUs |
| Barstool College Football Show | `walker`, `bigcat`, `portnoy` | Saturday | gambling locks | Name each speaker |
| Barstool Pick Em | `bigcat`, `portnoy`; Rico is Candidate | weekly | the card | PMT is not a locks show |
| Big Noon | `meyer`, `klatt`, `quinn`, `leinart`, `ingram`, `fallica` | Saturday | pregame picks | Only in the game’s pick window |
| Finebaum Show | `finebaum`; named guests | weekday | “who wins” | Also part of the national radio lane |

## NFL

Hunt week-of the game, not preseason desk chatter.

| Show | Voices | Drop | Jump | Notes |
|---|---|---|---|---|
| The Rich Eisen Show | `eisen`; named guests | weekday | “who wins” / locks | Also part of the national radio lane |
| The Herd | `cowherd`; named guests | weekday | bold predictions / “who wins” | Guest does not belong to Cowherd |
| Ringer NFL Show / gambling pods | `kapadia`, `sal`, `simmons` | weekly | named winner | Win totals are not game SUs; `ruiz` is at FOX |
| McAfee Show | `mcafee` only when Pat picks; guests are themselves | weekday | locks / “who wins” | Never pin a guest pick on McAfee |
| PFT Live / video | `florio`, `simms` | weekday | named winner | A column version is News |
| Barstool picking shows | `bigcat`, `portnoy`, `pft` | weekly | the card | PMT bits and guests are not automatically picks |

ESPN named expert-pick pages belong to News. A durable TV clip of the person making the pick belongs here.

## Sports radio pilot

Sports radio is a source lane inside Shows Scout, not a separate bot or schedule.

### National first

Prioritize rostered national programs already listed above: Finebaum for NCAAF; The Herd and Rich Eisen for NFL; plus any rostered personality’s official radio/podcast archive when the episode is explicitly a picking segment.

### Local fallback

For an under-dense Dispatch game that remains unresolved after the listed national programs:

1. Open at most **two** credible local archived programs for that matchup.
2. Prefer official station, team-affiliate, YouTube, podcast, or transcript pages published in the last ~3 days.
3. Search the two team names plus `pick`, `who wins`, `give me`, or `I'll take` inside the archive.
4. Stage a named off-roster host as a Candidate only when the radio-pilot rules in `docs/add-list.md` are satisfied.
5. Record the number of programs opened and outcome in the run file’s `Radio coverage` table.

One bounded radio fallback per sport/pick window is enough. Do not add another daily routine, re-open the same dry episode, or scan multi-hour live audio without a durable replay location.

### Radio evidence bar

- The exact speaker must be identifiable.
- Audit must be able to reopen the exact episode, clip, transcript, or show-note URL.
- A short quote or timestamp must prove the first-person winner pick.
- Live-only streams, callers, polls, anonymous station consensus, and “everyone around here likes LSU” are Dropped.
- If a transcript is machine-generated, verify the quote against the audio before staging it.

## URL starting points

- Cover 3: YouTube search `Cover 3 LOCKS {season}`.
- BFW: official Unnecessary Roughness channel.
- Barstool CFB Show / Pick Em: official Barstool show pages and YouTube.
- Pate: official Josh Pate show archive.
- On3 PICKING: official On3 page or channel.
- GameDay / Big Noon: official Saturday clips labeled locks or picks.
- Ruiz: FOX Sports digital, not old Ringer episodes.
- Radio: official show/station archives only; search-engine snippets are not evidence.

## Do not

- Hunt PMT as if it were a locks show.
- Pin a guest on a host or a station.
- Auto-roster Candidates or mint ids.
- Stretch title, fantasy, ATS, total, or season talk onto a game.
- Treat inaccessible or live-only radio as verified evidence.
