# Pick shows (Scout hunt map)

Date: 2026-08-29. **Shows Scout** hunt map (YouTube / podcasts / TV clips / durable sports-radio archives). News is `docs/news-beats.md`. X is `bots/scout-x.md`. Famous-face Google is not the job.

If this file and `data/` disagree, **`data/` wins**.

## How to hunt (every run)

1. Run `node scripts/scout-feeds.mjs` (Coordinator pastes `## Factory feeds`). Only open factories marked `today`. `waiting` / `recap` / `short` / `wrong-year` / `off-topic` / `error` means skip — do not burn a pass on Friday’s Finebaum or a UFR recap. Jump the locks / moneyline / “I’ll take” chapter. Captions count.
2. Then `empty-side` / `off-home` / `thin` on today’s `## Dispatch` (`docs/board.md` is do-not-touch, not the scorecard). Hunt NCAAF and NFL rows in the same pass. Skip `dense` unless hunt says `flip-check`. Do not park a sport. Doctrine: `docs/capture-policy.md`.
3. Then idle roster voices **only if their pick window is open**.
4. Named off-roster speakers on those same shows → Candidates. Never “the show likes UNC.”
5. If the game remains under-dense, use the bounded sports-radio fallback below.

Do not stop after `{name} {away} {home} 2026 pick`. A first empty query is not the end of the hunt. Tokens are not scarce.

**SU** = they pick the winner of a listed game. ATS, totals, win totals, “tough matchup,” title stretches, start/sit, and fantasy rankings are not SU.

## Weekly SU factories (open first)

| Show | Voices (roster id) | Drop | Jump | Notes |
|---|---|---|---|---|
| Cover 3 LOCKS | `kanell`, `patterson`, Fornelli/Elliott (Candidates) | Thu/Fri | ATS locks, then **Moneyline Sprinkles** | Kanell Wolfpack ML and Patterson UNC ML both from Week 0 LOCKS `hhgxVGYo6Cc`. |
| Josh Pate’s College Football Show | `pate` | almost daily | end-of-show winners / “I’ll take” | Already LSU. Only restage if he **flips** to Clemson. |
| Bear Bets / FOX | `fallica` | column + Big Noon | bylined best bets | Dispatch empty-side / thin / off-home only. Futures are not this beat. |
| GameDay betting | `coughlin` | Sat 9am ET; midweek PMT guest | Stanford Steve card | First 2026 show is **Baton Rouge Sat 9/5** (Clemson YES). Guest on PMT is `coughlin`, never `mcafee`. |
| BFW Show | `walker` | Mon / Thu / **Sat** in-season | Saturday recap + locks; midweek is often conference/Top 25 | 8/24 B1G+ACC and 8/27 SEC+Big 12 were **conference** preds, not Week 0 SU. Hunt Saturday. YouTube `UC9v6icpVdER0VGQpA3uUUsQ`. |
| Barstool College Football Show | `walker`, `bigcat`, `portnoy` (name the speaker; Kayce only if she picks) | Saturday | **gambling locks of the week** | This is the Barstool game-SU show. PMT is not. 2026 Week 0 not posted. |
| Picks Central | `walker`, `bigcat`, `portnoy` | daily | moneylines / locks | Name the speaker. Dormant as of 8/28 (last ep Jun 2026). |
| Barstool Pick Em | `bigcat`, `portnoy`, Rico (Candidate until photo) | weekly once CFB is on | the card | Not PMT. 2026 Week 0 not dropped. Rico Bosco `Return_Of_RB` stays Candidate (no real headshot yet). |
| The Herd / Sharp or Square | `cowherd`, `jmac`; guests (Duck, etc.) | weekday | bold predictions; gambling hour is often a **guest** | Guest ≠ Cowherd. Prefer a different NFL YES than Cowherd’s three home cards. |
| Finebaum Show | `finebaum` | weekday | “who wins” | Dublin NO already booked. Do not restage. |

## Brand faces — only in their pick window

| Voices | Window | Until then |
|---|---|---|
| `herbstreit`, `saban`, `howard`, `davis`, `mcafee` (Pat only) | **GameDay Saturday** (Baton Rouge 9/5 is Clemson YES) | Analysis, title talk, “50-burger” weasels ≠ SU |
| `meyer`, `klatt`, `quinn`, `leinart`, `ingram`, `fallica` | Big Noon Saturday pregame | Title/undefeated stretches stay futures |
| `stephena`, `kimes`, `orlovsky`, `spears` | TV/clip **Tue–Sat of that NFL week** | Week 1 grid was still No Pick as of 8/28 |
| `eisen`, `florio`, `simms` | show + weekly column | AFC East lean ≠ Patriots–Seahawks. SB score ≠ Week 1 |
| `simmons`, `sal` | Ringer gambling pods / Cousin Sal | Win totals ≠ Week 1 SU. Hunt the week of NFL games. |
| `kapadia` | Ringer NFL Show | Hosts. Analysis ≠ SU until he names a Week 1 winner. |
| `ruiz` | FOX Sports digital (left The Ringer 2026-08-21) | Hunt FOX NFL copy / @theStevenRuiz, not Ringer NFL Show. Analysis ≠ SU. |
| `bigcat`, `portnoy`, `pft` | Pick Em, Picks Central, Barstool CFB Show, PMT only if **they** pick | **Do not** treat PMT bits as a pick show. PFT is the guest/host, never `bigcat`. |

ESPN expert **page** is News Scout (`docs/news-beats.md`). If they say it on TV and a clip URL exists, Shows may stage it.

## Already-rostered talkers (open the actual *PICKING* episode)

| id | Show | Hunt |
|---|---|---|
| `staples`, `wasserman`, `wrighster` | Andy & Ari On3 | Episode titled **PICKING** / game preview. 8/25 `DCFInXgbMtY` UNC–TCU is **ATS cover** (TCU 7.5) — dropped, not SU. Re-open if they name a winner without the number. |
| `mcelroy` | Always College Football | Locks / “I’ll take” only |
| `thamel`, `feldman` | insiders | Program talk. Do not force a SU. |
| `kanell` | Cover 3 | NC State YES booked. Still hunt Clemson, Dublin, Lambeau. Totals/ATS ≠ SU. |

## URL patterns (start here)

- Cover 3: YouTube search `Cover 3 LOCKS 2026`
- BFW: https://www.youtube.com/@UnnecessaryRoughness (channel `UC9v6icpVdER0VGQpA3uUUsQ`)
- Barstool CFB Show / Picks Central / Pick Em: barstoolsports.com shows + YouTube
- Pate: Josh Pate’s College Football Show YouTube
- On3 picking: YouTube `PICKING {away} {home}` on the On3 channel
- GameDay: Saturday live + clips labeled locks / picks. **First 2026 show is Baton Rouge Sep 5, not Dublin 8/29.**
- Ruiz: FOX Sports digital / https://www.foxsports.com/personalities/steven-ruiz — not Ringer NFL Show.

## X handles (X Scout owns the sweep)

| id | handle |
|---|---|
| `patterson` | Chip_Patterson |
| `walker` | BFW (person), BFWshow (show — clips only if the post is him) |
| `bigcat` | BarstoolBigCat |
| `portnoy` | stoolpresidente |
| `pft` | PFTCommenter |
| `sal` | TheCousinSal |
| `kapadia` | SheilKapadia |
| `ruiz` | theStevenRuiz |
| `kanell` | dannykanell |
| `pate` | JoshPateCFB |
| `compton` | _willcompton |

## Do not

- Hunt PMT as if it were a locks show (comedy + guests). Stanford Steve on PMT → `coughlin`.
- Pin a guest on the host (`mcafee`, `eisen`, `walker` when the guest is talking).
- Auto-roster Candidates. Photo still required to mint.
- Stretch title / fantasy / ATS onto a game SU.

## NFL (Shows Scout)

Hunt only when Dispatch includes `sport=nfl` rows that are `empty-side`, `thin`, or `off-home`. Week-of the game, not August desk chatter.

| Show | Voices (roster id) | Drop | Jump | Notes |
|---|---|---|---|---|
| The Rich Eisen Show | `eisen`; guests are the guest | weekday | “who wins” / locks | AFC East lean ≠ Patriots–Seahawks |
| The Herd | `cowherd`; guests (Duck, etc.) | weekday | bold predictions | Guest ≠ Cowherd. Prefer a different NFL YES than Cowherd’s three home cards |
| Ringer NFL Show / gambling pods | `kapadia`, `sal`, `simmons` | weekly | named winner | Win totals ≠ Week 1 SU. `ruiz` is FOX now — do not hunt him here |
| McAfee Show | `mcafee` only if Pat picks | weekday | locks | Guests are the guest (`pft`, etc.), never `mcafee` |
| PFT video / PFT Live | `florio`, `simms` | weekday | “who wins” | Column version is News |

Brand faces — NFL pick window (also in the table above this file): `stephena`, `kimes`, `orlovsky`, `spears` on the ESPN **page** are News Scout. If they say it on TV and a clip URL exists, Shows may stage it.

## Sports radio pilot

Sports radio is a source lane inside Shows Scout, not a separate bot or schedule.

### National first

Prioritize rostered national programs already listed above: Finebaum for NCAAF; The Herd and Rich Eisen for NFL; plus a rostered personality’s official radio or podcast archive when the episode is explicitly a picking segment.

### Local fallback

For an under-dense Dispatch game that remains unresolved after the listed national programs:

1. Open at most **two** credible local archived programs for that matchup.
2. Prefer official station, team-affiliate, YouTube, podcast, transcript, or show-note pages published in the last ~3 days.
3. Search the team names plus `pick`, `who wins`, `give me`, or `I'll take` inside the archive.
4. Stage a named off-roster host as a Candidate only when the radio-pilot rules in `docs/add-list.md` are satisfied. Team-show hosts picking that team are `team-analyst` Candidates, not roster-growth (`docs/product/roster-growth.md`). Independent guests on those shows may still be association-eligible.
5. Record the programs opened and outcome in the run file’s `Radio coverage` table.

Run one radio fallback per sport/pick window. Do not add another daily routine, reopen the same dry episode, or scan multi-hour live audio without a durable replay location.

### Radio evidence bar

- Identify the exact speaker; a station or show cannot own a pick.
- Audit must be able to reopen the exact episode, clip, transcript, or show-note URL.
- Preserve a short quote or timestamp proving the first-person winner pick.
- Drop live-only streams, callers, polls, anonymous station consensus, and inaccessible snippets.
- Verify a machine transcript against the audio before staging it.
