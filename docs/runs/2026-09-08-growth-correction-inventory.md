# Growth-engine correction inventory — 2026-09-08

Status: Evidence

This is a Phase 0 current-truth inventory for the growth-engine implementation. It is not a Scout intake run, not an Audit verdict file, and not a Promote. No `audit=` / `promoted=` flags are set here. No `data/*.json` was modified.

Editorial corrections listed below are **staged for Audit/Promote only**. They are not promoted in this change.

Inspected HEAD:

- Docs handoff commit: `5a31459` (`docs: hand off growth-engine implementation to Grok`)
- Code and editorial JSON baseline: `6e4470a` (`feat: promote Audit-ok Brandt 49ers opener pick`)
- This inventory was written while branch `codex/growth-engine-phase-0` was at `5a31459`. Live `data/*.json` at that revision is identical to `6e4470a`.

Intended behavior: [execution brief](../product/2026-09-08-growth-execution-brief.md), [implementation plan](../superpowers/plans/2026-09-08-growth-engine-implementation.md). Shipped behavior: live code and `data/*.json`. Dated evidence: [growth-engine audit](../audits/2026-09-08-growth-engine.md).

## Reproducible corpus counts

Counted from live `data/calls.json`, `data/events.json`, and `data/pundits.json` at `6e4470a`. Do not treat the September 8 audit's "29" as a hardcoded target; it happens to still match.

| Object | Count | How to reproduce |
|---|---|---|
| Calls | 106 | `data/calls.json` length |
| Hard calls | 88 | `kind === "hard"` |
| Mapped calls (eventSlug + side) | 83 | all 83 are hard |
| Hard mapped calls | 83 | `kind === "hard" && eventSlug && side` |
| Graded hard mapped (`hit` or `miss`) | 45 | |
| Pending hard mapped | 38 | |
| Hard mapped with nonempty `reasoning` | 29 | trim; empty string does not count |
| Any call with nonempty `reasoning` | 29 | same 29; no unmapped/soft capsules |
| Events | 44 | `data/events.json` `events` |
| Game events (`kind === "game"`) | 22 | |
| Events with missing `kind` | 22 | futures/default-future shape |
| Game events with `kickoffDate >= 2026-09-08` | 9 | all NFL |
| Upcoming NCAAF game events (`kickoffDate >= 2026-09-08`) | 0 | |
| Rostered pundits | 55 | `data/pundits.json` |
| GameDay recap-label published rows | 7 | `sourceUrl` contains `gamedaycole.com` |

Events file `freezeDate` is `2026-08-26`; per-event `sourcedAt` is authoritative for the displayed Kalshi snapshot.

Missing fields that can be reproduced as **absent** from `lib/types.ts` and live JSON:

- No `firstPublishedAt` / `publishedAt` / Pundits publication timestamp on `Call`
- No `updatedAt` distinct from `gradedAt`
- No `evidenceKind`, source locator, transcript URL, or timestamp fields on `Call`
- No per-call immutable price snapshot; cents live on `Event` (`yesCents` / `noCents` / `sourcedAt`)
- `reasoning` is optional; 54 of 83 hard mapped calls have no capsule (honest empty, not a defect by itself)

## GameDay recap-label rows (7)

Identified by current `sourceUrl` (Cole Week 1 post) plus [the restage document](./2026-09-05f-gameday-restage.md), not by guessing names. Herbstreit has no Clemson/LSU row on the Cole card and is not in this cohort. Lainey Wilson Candidate rows were not promoted and are not published calls.

Cole source (loaded 2026-09-08 during this inventory): [Week 1 Saturday morning College GameDay picks](https://gamedaycole.com/2026/09/05/week-1-2026-saturday-morning-college-gameday-picks-stanford-steve-celebrity-guests-super-dog-picks-and-more/). The post lists named-picker tables with labels such as "LSU over Clemson" and "Notre Dame over Wisconsin". That is a recap table, not a spoken ESPN clip or transcript.

Current rendering (inspected live 2026-09-08, Saban/LSU representative):

- `components/Receipt.tsx` wraps `call.claim` in a `<blockquote class="receipt-quote">` with quotation marks and the pundit's name beneath.
- `lib/seo.ts` `pickStory` appends `` `${pundit.name} said: “${call.claim}”` ``.
- Live JSON-LD `articleBody` for `/picks/clemson-at-lsu-2026/saban/` includes `Nick Saban said: “LSU over Clemson”`. Visible page shows `“LSU over Clemson”` as a quotation. `datePublished` is the source date `2026-09-05`.

A correct team selection in a third-party recap table is not evidence of those exact spoken words.

| call id | pundit | event | claim as stored | source URL | why it is a recap label, not a spoken quote | proposed Audit/Promote disposition | verification status |
|---|---|---|---|---|---|---|---|
| `howard-clemson-at-lsu-20260905` | Desmond Howard | Clemson at LSU (`clemson-at-lsu-2026`, NO) | LSU over Clemson | https://gamedaycole.com/2026/09/05/week-1-2026-saturday-morning-college-gameday-picks-stanford-steve-celebrity-guests-super-dog-picks-and-more/ | Restage explicitly: “Recap label, not spoken ESPN clip.” Cole table under Desmond Howard uses that exact label. Receipt/JSON-LD present it as Howard's spoken quotation. | Reopen for original GameDay spoken/transcript evidence. Do not delete the permanent URL. Until original wording is recovered, Phase 1 should render a reported Cole-table selection, not direct speech. Mapping (named person, LSU/NO, event) is not automatically an invalid pick. | Cole page loaded; restage `2026-09-05f`; Audit `2026-09-05-audit.md` (ok as table label); live Howard receipt URL in permalinks. Spoken clip **not** recovered. |
| `mcafee-clemson-at-lsu-20260905` | Pat McAfee | Clemson at LSU (`no`) | LSU over Clemson | same Cole URL | Restage: “Cole table under Pat McAfee. Recap label. Pat only (not Lainey).” | Same as Howard row. | Same. |
| `saban-clemson-at-lsu-20260905` | Nick Saban | Clemson at LSU (`no`) | LSU over Clemson | same Cole URL | Restage: “Cole table under Nick Saban. Recap label.” Live receipt HTML and NewsArticle JSON-LD treat the label as spoken. | Same as Howard row. Representative live receipt inspected. | Cole page + live Saban receipt + JSON-LD inspected 2026-09-08. Spoken clip **not** recovered. |
| `howard-wisconsin-vs-nd-20260905` | Desmond Howard | Wisconsin vs Notre Dame (`wisconsin-vs-nd-2026`, NO) | Notre Dame over Wisconsin | same Cole URL | Restage: Cole table under Howard; home/NO; does not fill Wisconsin YES. Claim matches Cole label, not a quoted sentence. | Same. Permanent `/picks/wisconsin-vs-nd-2026/howard/` stays. | Cole page loaded; restage + 2026-09-05 audit. Spoken clip **not** recovered. |
| `mcafee-wisconsin-vs-nd-20260905` | Pat McAfee | Wisconsin vs Notre Dame (`no`) | Notre Dame over Wisconsin | same Cole URL | Restage: Cole table under McAfee. Recap label. | Same. | Same. |
| `saban-wisconsin-vs-nd-20260905` | Nick Saban | Wisconsin vs Notre Dame (`no`) | Notre Dame over Wisconsin | same Cole URL | Restage: Cole table under Saban. Recap label. | Same. | Same. |
| `herbstreit-wisconsin-vs-nd-20260905` | Kirk Herbstreit | Wisconsin vs Notre Dame (`no`) | Notre Dame over Wisconsin | same Cole URL | Restage: Cole table under Herbstreit; no Clemson/LSU row on his card (booth). Cole page confirms Herbstreit list has Notre Dame over Wisconsin and no LSU/Clemson line. | Same. | Cole page loaded; restage + audit. Spoken clip **not** recovered. |

Affected surfaces for all seven: receipt quote block (`components/Receipt.tsx`), pick story (`app/picks/[slug]/[punditId]/page.tsx`), `pickStory` / `articleJsonLd` (`lib/seo.ts`), RSS/news title+body (`lib/feeds.ts`), social take `claim` (`lib/social.ts`), OG take cards, methodology's "verbatim public quote" contract (`app/methodology/page.tsx`).

Original stored claims, source URLs, source dates (`2026-09-05`), grades (LSU rows `hit` / `gradedAt` 2026-09-06; Wisconsin rows `hit` / `gradedAt` 2026-09-07), and permalinks are preserved. This inventory does not change them.

## Nonempty `reasoning` fields (29)

All 29 nonempty capsules are on hard mapped calls. Classification is from the **stored capsule text**. Invalid rationale is not automatically an invalid pick. Source URL presence is not quote or speaker verification.

Legend:

- **actual source-grounded rationale** — capsule paraphrases why the speaker made the pick, from the same source.
- **operational/Scout note** — restates wager category, lock-card bookkeeping, or why Scout accepted the row.
- **invalid/unavailable** — reserved for empty/fabricated; none of the 29 are empty.

Proposed dispositions:

- **keep+render in Phase 1** — engineering may show the capsule if Audit later confirms it is speaker-grounded. JSON stays until Audit/Promote says otherwise.
- **Audit/Promote removal** — omit from Phase 1 visible copy and JSON-LD; Promote removes or replaces the field after Audit. Keep the pick.
- **needs Audit** — mixed operational prefix plus possible speaker content; do not render as “why he picked them” until Audit decides.

Verification for the whole cohort unless a row says otherwise: classified from live `data/calls.json` at `6e4470a`; this PR did not reopen audio or transcripts.

| call id | pundit | event | capsule text (verbatim) | classification | proposed disposition | verification status |
|---|---|---|---|---|---|---|
| `mcelroy-unc-tcu-20260829` | Greg McElroy | North Carolina vs TCU | McElroy leaned UNC after the host clocked his Tar Heel-blue tie. He said last year's offense was among the worst in the country, so they need competent offense from Bobby Petrino and Billy Edwards, while the defense already played well. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms speaker-grounding | inventory classification only |
| `compton-unc-tcu-20260829` | Will Compton | North Carolina vs TCU | Compton says Belichick's second year at North Carolina will not be better and that TCU will be sneaky in the Big 12. He is taking TCU minus 7.5 as the first win of the season. | actual source-grounded rationale (spread-origin claim is also restated) | keep+render in Phase 1; Phase 1C must not treat the winner grade as a cover | stored claim is the -7.5 pick; inventory classification only |
| `patterson-ncsu-uva-20260827` | Chip Patterson | NC State at Virginia | Patterson takes the Wolfpack in a game decided in the 20s. He points to the South Florida high-school trio of CJ Bailey, Daveion Gause, and JoJo Trader, and says Bailey leads a game-winning touchdown drive. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `wasserman-wisconsin-nd-20260831` | Ari Wasserman | Wisconsin vs Notre Dame | Ari says Notre Dame is foaming to leave no doubt after last year's playoff snub and will flex in week one as one of the five best teams. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `staples-wisconsin-nd-20260831` | Andy Staples | Wisconsin vs Notre Dame | Andy agrees with Ari's leave-no-doubt read and expects Notre Dame to look like the team they think they are in week one (favorite laying 20.5). | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `wrighster-clemson-lsu-20260901` | George Wrighster | Clemson at LSU | Wrighster notes both teams finished 7-6 last season. He contrasts LSU's 43-transfer, $50 million roster with Clemson's answer of a quarterback who waited three years, and still takes Clemson as the upset. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `jmac-49ers-vs-rams-20260901` | Jason McIntyre | 49ers vs Rams | JMac takes the Rams as the favorite laying three and a half. He cites 49ers injury and availability uncertainty around Kittle, Bosa, and the receivers, and he doubts Aaron Donald even travels to Australia. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `jmac-bills-at-texans-20260901` | Jason McIntyre | Bills at Texans | He takes Houston outright, citing the Texans' career edge against Josh Allen, a nasty Houston defense, Buffalo's new offensive coordinator Joe Brady, and questions on the Bills defense. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `kanell-baylor-vs-auburn-20260903` | Danny Kanell | Baylor vs Auburn | Kanell lays Auburn because he does not trust Lagway to take over Baylor yet and because he thinks Auburn’s defense plus Byron Brown will control the line even with a shaky Tigers offensive line. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `patterson-smu-at-fsu-20260903` | Chip Patterson | SMU at Florida State | Favorite laying 3 vs FSU on his lock card (opposite Kanell’s FSU sprinkle). | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | capsule restates wager category, not why Patterson picked FSU |
| `kanell-ucla-at-cal-20260903` | Danny Kanell | UCLA at California | Moneyline sprinkle. He is picking Cal to beat UCLA outright. | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | wager-category restatement |
| `kanell-boise-state-at-oregon-20260903` | Danny Kanell | Boise State at Oregon | He says Oregon dominates start to finish because Boise no longer has Ashton Jeanty and Maddox Madsen has not traveled vs Power 4 heavyweights. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `kanell-western-michigan-at-michigan-20260903` | Danny Kanell | Western Michigan at Michigan | Favorite laying 27.5 vs in-state Western Michigan; he frames it as a gate-crash massacre for the Whittingham-era opener. | operational/Scout note with possible speaker frame | needs Audit | do not render until Audit separates bookkeeping from speaker wording |
| `kanell-fiu-at-usf-20260903` | Danny Kanell | FIU at South Florida | Moneyline sprinkle. Same FIU/USF dog Bud took; he had already faded USF’s win total. | operational/Scout note with possible speaker content | needs Audit | “moneyline sprinkle” is operational; win-total fade may be speaker-grounded |
| `patterson-toledo-at-michigan-state-20260903` | Chip Patterson | Toledo at Michigan State | Moneyline sprinkle (dog to win) vs Michigan State. | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | wager-category restatement |
| `patterson-oklahoma-state-at-tulsa-20260903` | Chip Patterson | Oklahoma State at Tulsa | Moneyline sprinkle. Fades OSU’s Morris start as a road in-state rivalry that Tulsa already won in Stillwater last year. | operational prefix plus possible source-grounded fade | needs Audit | do not render the sprinkle label; Audit decides whether the fade sentence is speaker-grounded |
| `clay-travis-miami-at-stanford-20260903` | Clay Travis | Miami at Stanford | Miami travels cross-country into a dead Stanford crowd he likens to low-energy Friday high-school ball. He still expects the Hurricanes to win by about 14–17 while the dog stays closer than the number, so Miami is the SU and Stanford is the cover. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms; Phase 1C must not treat the SU hit as a cover | inventory classification only |
| `clay-travis-clemson-at-lsu-20260903` | Clay Travis | Clemson at LSU | LSU owns the offseason spotlight with a new quarterback; Clemson is quiet and under the radar. He expects a single-digit game, so he still takes LSU straight up while fading the double-digit home lay as a cover. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms; winner grade ≠ cover | inventory classification only |
| `clay-travis-ucla-at-cal-20260903` | Clay Travis | UCLA at California | New UCLA coach Bob Chesney as a fix for Nico; he is not sold on Cal and expects the Bruins to win by a touchdown or more on the road, so the small lay is also the straight-up winner. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `clay-travis-smu-at-fsu-20260903` | Clay Travis | SMU at Florida State | Statement spot after a soft prior week. He likes Florida State to win outright and will lay about three, so FSU is the SU (favorite laying). | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `elliott-fiu-at-usf-20260903` | Bud Elliott | FIU at South Florida | Moneyline sprinkle. FIU to beat USF outright. | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | wager-category restatement |
| `fornelli-clemson-at-lsu-20260903` | Tom Fornelli | Clemson at LSU | He is laying LSU because Clemson’s QB/OL/defense attrition has the program in a bad spot and because he thinks LSU is clearly more talented in Kiffin’s Baton Rouge opener. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms; winner grade ≠ cover | inventory classification only |
| `fornelli-ucla-at-cal-20260903` | Tom Fornelli | UCLA at California | Moneyline sprinkle (Cal wins). | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | wager-category restatement |
| `pollack-clemson-at-lsu-20260903` | David Pollack | Clemson at LSU | Pollack takes LSU in a 24–20 type game and refuses the Clemson upset on the road. He frames it as old-school Dabo versus new-school Kiffin/portal football and expects a lower-scoring slog because both sides are breaking in a lot of new pieces, especially Clemson's offense after last year's identity mess. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `pollack-baylor-vs-auburn-20260903` | David Pollack | Baylor vs Auburn | Pollack goes War Eagle and scores it 30–20 after floating a 34–24 type game. He likes Golesh's physical identity — Byron Brown, Jake Johnson, and ex-Baylor runner Bryce Washington — and thinks Baylor is still sorting a new defensive coordinator and offensive staff. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `pollack-smu-at-fsu-20260903` | David Pollack | SMU at Florida State | Pollack still picks SMU as the better, better-coached team going in the right direction. He scores it 27–24 and would not be shocked if Florida State won, because the home crowd and a week of getting kicked around keep the circumstances on the Seminoles' side. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `pollack-ucla-at-cal-20260903` | David Pollack | UCLA at California | Pollack picks UCLA 31–27. He is shaking his head at Nico Iamaleava's inconsistency after a laser first start that has not shown up since, and he likes UCLA's late add of Sun Belt defensive player of the year Trent Hendrick at linebacker. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms | inventory classification only |
| `pate-smu-at-fsu-20260903` | Josh Pate | SMU at Florida State | Model has SMU −3; he declines to bet but names SMU outright and to cover on QB/talent edge vs FSU. | actual source-grounded rationale | keep+render in Phase 1 after Audit confirms; winner grade ≠ cover | inventory classification only |
| `brandt-49ers-vs-rams-20260908` | Kyle Brandt | 49ers vs Rams | GMFB predictions hour with helmet props; repeats Niners over Rams in week one. Clear W1 winner. | operational/Scout note | Audit/Promote removal of `reasoning` (keep pick) | Scout/Audit notes explain acceptance, not Brandt's reason. Live JSON-LD currently emits this capsule; visible receipt does not. |

Reasoning cohort summary from this inventory (not an Audit tally): 20 keep+render candidates, 6 proposed reasoning-field removals, 3 needs-Audit mixed rows. The pick rows themselves stay published.

## Publication-history notes

A git commit time is **first appeared in repository**, not first live Pundits publication. Cloudflare deploy summaries write to gitignored `.agent-artifacts/deploy-summary.json`; none are in this repository. GitHub Actions does not deploy production. This inventory did not retrieve Cloudflare dashboard logs. Unknown first-live timestamps stay **unknown**.

### Brandt / 49ers (`brandt-49ers-vs-rams-20260908`)

| Milestone | Evidence | Value |
|---|---|---|
| Source date | `data/calls.json` `sourceDate` | 2026-09-08 |
| Original episode publication | Scout run `docs/runs/2026-09-08.md` / `2026-09-08e-afternoon-shows.md`; audit | GMFB Hour 1 Predictions about 11:11 ET 2026-09-08 (Apple `i=1000788488079`) |
| Staged in Scout | `docs/runs/2026-09-08e-afternoon-shows.md` | afternoon Shows ~16:35–17:55 ET; quote preserved; reasoning is the Scout capsule above |
| Audit | `docs/runs/2026-09-08-audit.md` | ok; Omny transcript 09:40–09:48 names Kyle Brandt. Public row still has no structured locator. |
| First appeared in repository | `git log -S brandt-49ers-vs-rams-20260908 -- data/calls.json` | `6e4470a` 2026-09-08 19:09:14 -0400, Promote of the Audit-ok row; event snapshot frozen YES 36¢ / NO 65¢, `sourcedAt` 2026-09-08 |
| Graded | `gradedAt` | none (pending) |
| Publicly recorded publication | live GET 2026-09-08 during this inventory | https://pundits.pro/picks/49ers-vs-rams-2026/brandt/ returns 200; JSON-LD `datePublished` is `2026-09-08` (source date). Growth audit also observed a live social index at 23:23:28Z the same evening. |
| First live Pundits publication | deploy logs not in repo | **unknown** (not later than the live 200 observed here; not proven equal to the git commit time) |

### Finebaum / LSU (`finebaum-clemson-lsu-20260623`)

| Milestone | Evidence | Value |
|---|---|---|
| Source date | `data/calls.json` | 2026-06-23 |
| Source | stored | The Paul Finebaum Show (TigerNet); https://www.tigernet.com/clemson-football/news/paul-finebaum-offers-2026-clemson-season-forecast-lsu-opener-outlook-49055 |
| First appeared in repository | `git log -S finebaum-clemson-lsu-20260623 -- data/calls.json` | `52dd077` 2026-08-26 10:22:17 -0400 (`data: promote Scout 2026-08-26`) |
| Live as of | `docs/runs/2026-08-27-audit.md` | “Live stories confirmed: … `/picks/clemson-at-lsu-2026/finebaum/`” |
| Graded | `gradedAt` + `docs/runs/2026-09-06-grade.md` | 2026-09-06, hit |
| Event snapshot now on the receipt | `data/events.json` `clemson-at-lsu-2026` | 23¢ / 78¢, `sourcedAt` 2026-09-03 — later than the June source and later than the August promote |
| Publicly recorded publication | live GET 2026-09-08 | page byline “Source published Jun 23, 2026 · Graded Sep 6, 2026”; no Pundits first-publication timestamp. JSON-LD `datePublished` is `2026-06-23`. |
| First live Pundits publication | | **unknown** (not later than 2026-08-27 live confirmation; not equal to sourceDate) |

### GameDay row (representative: `saban-clemson-at-lsu-20260905`)

| Milestone | Evidence | Value |
|---|---|---|
| Source date | stored | 2026-09-05 |
| Restage | `docs/runs/2026-09-05f-gameday-restage.md` | Saturday ~3:56 PM ET; recap labels; did not touch `data/` |
| Audit | `docs/runs/2026-09-05-audit.md` GameDay section | 7 ok as Cole-table mappings; day-level `audit=fail` because of an unrelated Portnoy row; operator-directed promote followed |
| First appeared in repository | `git log -S saban-clemson-at-lsu-20260905` | `1a7d014` 2026-09-05 16:11:38 -0400 (`promote: GameDay desk — Howard/McAfee/Saban LSU, four ND on Wisconsin`) |
| Graded | stored | 2026-09-06 hit (LSU 51–10) |
| Publicly recorded publication | live GET 2026-09-08 | https://pundits.pro/picks/clemson-at-lsu-2026/saban/ 200; `datePublished` `2026-09-05` |
| First live Pundits publication | | **unknown** |

Same repository-first-appearance commit covers the other six GameDay ids. Permalinks for those seven URLs were appended in `1a7d014`.

## Current code/template defects Phase 1 must fix

Do **not** implement these in this PR. File paths are current at `6e4470a`.

1. **Recap labels rendered as spoken quotations.** `components/Receipt.tsx` (`<blockquote class="receipt-quote">“{call.claim}”</blockquote>`). `lib/seo.ts` `pickStory` (`${pundit.name} said: “${call.claim}”`). Live Saban JSON-LD and visible receipt confirm it. Methodology still requires a “verbatim public quote” (`app/methodology/page.tsx`, FAQ JSON-LD).

2. **Hidden rationale / JSON-LD divergence.** `Receipt.tsx` and `app/picks/[slug]/[punditId]/page.tsx` do not render `call.reasoning`. `pickStory` still injects `The reasoning ${pundit.name} gave: …` into `articleBody`. Live Brandt JSON-LD includes the Scout capsule; the visible receipt does not. Tests in `lib/seo.test.ts` currently require that hidden JSON-LD path.

3. **`sourceDate` used as Pundits publication date.** `articleJsonLd` `datePublished: isoDay(take.call.sourceDate)` in `lib/seo.ts`. `generateMetadata` passes `take.call.sourceDate` into `articleMeta` (`app/picks/[slug]/[punditId]/page.tsx`, `lib/site.ts`). RSS `<pubDate>` and news `<news:publication_date>` use `take.call.sourceDate` (`lib/feeds.ts`). Live Finebaum `datePublished` is `2026-06-23`. Visible byline is “Source published …”, which is honest as a source label but is the only date besides `gradedAt`.

4. **News window relative to newest stored source, not now.** `recentNewsTakes` in `lib/feeds.ts` subtracts two days from the max `sourceDate` in the corpus. `lib/feeds.test.ts` encodes that behavior. Live news sitemap on 2026-09-08 happened to contain only Brandt (`publication_date` 2026-09-08) because that is the newest sourceDate. The stale-window defect is in code; it is not an observed stale live sitemap today.

5. **“Took [team] …” wager-like copy.** `pickStory` dek: `${pundit.name} ${graded ? "took" : "is taking"} ${game.picked} over ${game.other}` (`lib/seo.ts`). Live Saban/Finebaum `description` uses “took LSU over Clemson”. Social calibration copy is stronger: `docs/social/post-patterns.md` and `docs/social/voice.md` examples “Finebaum took TCU at 61¢”. `lib/social.ts` itself emits `claim` + cents without that sentence, but Poster is instructed to write it.

6. **Shared event snapshot described as capture-time market.** Methodology FAQ: “what the market believed at the time” and “market context when the pick was captured” (`app/methodology/page.tsx`). Finebaum's June quote currently displays Clemson 23¢ / LSU 78¢ as of Sep 3, 2026 — the event snapshot refreshed when later faces were added, not a June or 2026-08-26 capture freeze. Brandt promote `6e4470a` refreshed `49ers-vs-rams-2026` to 36/65 on 2026-09-08 for every linked receipt (Cowherd/Eisen/McIntyre included). `priceLine` / grade sheet “The price” use `event.yesCents`/`noCents` and `event.sourcedAt`.

7. **Present-tense story copy after settlement.** Live Saban `articleBody` still says “Nick Saban is backing the market favorite” after a hit. `pickStory` uses present-tense posture for graded games.

8. **Winner-only grading language vs spread-origin evidence.** Several stored claims and capsules are ATS/moneyline sprinkles mapped to SU sides. Social “Cover crushed” is called out in the dated audit; not re-verified here as a live post. Phase 1 must not imply a cover from `status: hit`.

Scout selection defects (density skip, yesterday=`waiting`) live in `scripts/scout-density-lib.mjs` and `scripts/scout-feeds-lib.mjs`. They are Phase 2, not Phase 1, and were inspected only.

## Explicit record

No `data/*.json`, photos, or published URLs were modified. Original claims, source URLs, source dates, grades, and permalinks are preserved. Editorial changes listed here remain unpromoted.
