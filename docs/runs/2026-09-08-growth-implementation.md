# Growth-engine implementation journal

Status: Evidence

Product manager: Codex. Engineer: Grok. Product owner: Baird.

This journal records engineering progress on [the 2026-09-08 plan](../superpowers/plans/2026-09-08-growth-engine-implementation.md). It is not a Scout intake run. It does not set editorial `audit=` or `promoted=` flags. It does not edit `data/*.json`.

Phase 0 inventory: `6287aba`. Phase 1 HEAD: `cae79e9`. Phase 2 HEAD: `773e708`. Code/JSON baseline: `6e4470a`. Docs handoff: `5a31459`.

## Phase 0 — current truth and correction inventory

Outcome required: engineering starts from current code and an inspectable list of affected records, not from assumptions about the September 8 snapshot.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Inspect current implementations of types, SEO, feeds, social, Receipt, pick routes, methodology, source-selection scripts, bot prompts, and active run files | yes | Paths cited in the inventory; Scout scripts inspected only |
| Dated correction inventory in `docs/runs/` with stable call IDs, surfaces, evidence, defect, disposition, verification | yes | [2026-09-08-growth-correction-inventory.md](./2026-09-08-growth-correction-inventory.md) |
| Cover the seven GameDay recap-label rows | yes | Identified by Cole `sourceUrl` + restage doc; Cole page loaded 2026-09-08 |
| Cover every currently nonempty `reasoning` field (do not hard-code 29) | yes | Live count is 29 of 83 hard mapped; all 29 tabulated |
| Distinguish invalid rationale from an invalid pick | yes | Six operational capsules proposed for reasoning removal; picks stay |
| Source URL loading alone does not verify a quote or speaker | yes | GameDay Cole load confirms labels, not spoken wording. Reasoning classified from stored text |
| Publication history: commit ≠ first live publication; unknown stays unknown | yes | Brandt / Finebaum / Saban notes; no Cloudflare deploy logs in git |
| Inventory preserves originals and routes editorial changes to Audit/Promote | yes | No JSON edits |
| Baseline counts and missing fields reproducible | yes | Count table + absent `firstPublishedAt` / evidence-kind fields |
| No editorial JSON modified to create a clean fixture | yes | `data/*.json` untouched |
| Initiative referenced from product README, current-context, ROADMAP without replacing other priorities | yes | this Phase 0 change |
| Journal does not impersonate Scout or set editorial flags | yes | this file |

### Checks run

`npm run check:fast` on this worktree after the inventory and canonical-doc pointers were written: **pass**. Inexpensive tests 429 passed / 44 files; `validate:runs` passed on `docs/runs`. Note emitted: `check:fast is not a release gate.`

Phase 0 is documentation only. `npm run check` (full production-style) is not required for this phase and was not run as a release gate. No production deploy.

### Remaining product decisions

None invented. Real gaps Phase 0 cannot close:

1. **GameDay original evidence.** If Audit cannot recover spoken GameDay wording for the seven published rows, Codex still owns the narrow record-disposition rule (legacy reported-selection display vs a later void/correction state). Brief decision 5 already forbids newly mapped picks from unverified table labels. Phase 1 can implement truthful legacy presentation without expanding eligibility.
2. **Reasoning JSON.** Engineering will omit operational capsules from Phase 1 rendering. Actual field deletion or rewrite from source is Audit/Promote. Mixed rows (`kanell-western-michigan-at-michigan-20260903`, `kanell-fiu-at-usf-20260903`, `patterson-oklahoma-state-at-tulsa-20260903`) need Audit before a keep-or-remove call.
3. **First-publication schema.** Exact field names, optionality, date-only vs datetime, and what evidence counts as first live publication. No deploy logs are in this repository; unknown historical times must remain absent rather than backfilled from `sourceDate` or git commit time.
4. **News-sitemap expiry ownership.** Phase 1B needs a proposed static-output refresh; whether a scheduled empty deploy is the mechanism is a later review item, not a claim that a schedule is running.

Parked by the brief and not reopened: immutable per-call prices, ATS product, new sports, backends, aggregator enrollment, production deploy, live X posts.

## Phase 1 — evidence presentation and publication semantics

Outcome required: a person, Google, and a social bot receive the same faithful description of what was said, when Pundits published it, and what the snapshot means.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Spoken quote stays quoted speech | yes | Brandt local story/JSON-LD: `Kyle Brandt said: “The niners will beat the Rams in the opener.”` |
| Legacy GameDay table-label is a reported selection, not speech | yes | Saban local copy: Cole lists Saban selecting LSU over Clemson; `Nick Saban said` is gone; evidence-review note shown. Permanent URL kept. Grade unchanged. |
| Winner-only source omits rationale section | yes | Finebaum LSU has no `reasoning`; no “Why Paul Finebaum picked them” |
| Valid rationale renders | yes | Pollack LSU: `Why David Pollack picked them:` + stored capsule |
| Operational/mixed capsules omitted by inventory call IDs | yes | `OMIT_PUBLIC_RATIONALE_CALL_IDS` in `lib/evidence.ts`; Brandt “helmet props” absent from articleBody |
| June source does not become Pundits publication | yes | Finebaum LSU `sourceDate` 2026-06-23; `datePublished` omitted; byline “Source published Jun 23, 2026”; no “On Pundits” |
| Spread-origin winner pick is explicit SU, not a cover | yes | Compton claim `TCU -7.5`; grading line names the spread and says the tracked result is the straight-up winner |
| Refreshed event snapshot labeled as `sourcedAt` | yes | Cowherd 49ers sourceDate 2026-08-24; snapshot “as of Sep 8, 2026” |
| Quiet period / unknown firstPublishedAt excluded from news | yes | Local `out/news-sitemap.xml` empty; all current rows lack `firstPublishedAt` |
| Grade update does not mint a new publication | yes | Fixture `firstPublishedAt: 2026-08-26` + later `gradedAt` keeps `datePublished` 2026-08-26 |
| Canonical URLs preserved | yes | `verify:static` permalink ledger passed; no `data/*.json` edits |
| Methodology visible FAQ and FAQPage JSON-LD updated together | yes | `lib/methodology.ts` shared by page + `faqJsonLd`; `verify:static` asserts both |

### Schema (optional; no backfill)

On `Call` in `lib/types.ts`:

- `evidenceKind?`: `spoken-quote` \| `reported-selection`. Absent infers GameDay Cole URLs as reported-selection.
- `sourceLocator?`: optional `timestamp`, `section`, `transcriptUrl`. Absent = unknown.
- `firstPublishedAt?`: ISO date or datetime of first live Pundits publication. Immutable once set. Absent = unknown. No `sourceDate` / now / noon fallback.
- `updatedAt?`: material editorial update distinct from `sourceDate` and `gradedAt`.

Promote writes these on new live publication only.

### News expiry (prepared, not observed running)

- Eligibility: current two-day window on `firstPublishedAt` vs now.
- Rebuild: existing operator/Promote empty `npm run deploy`. GitHub Actions still does not deploy.
- Runtime check: `.github/workflows/news-sitemap-freshness.yml` + `npm run news:freshness`. Prepared in this PR. Not claimed running until it has fired on `main`.
- RUNBOOK release checklist requires that check to be installed and empty-deploy ownership active before calling the news-sitemap fix operationally complete.

### Checks run

`npm test`: **453 passed / 49 files**. `npm run check` with `GITHUB_PAGES` unset: **pass** (tests, `validate:runs`, production build, `verify:static` including 217 pages / 216 decoded images and permalink ledger). No production deploy.

### Remaining Codex decisions

1. GameDay record-disposition if Audit cannot recover spoken wording (legacy reported-selection display is shipped; void/correction state is not).
2. Keep/remove for mixed capsules `kanell-western-michigan-at-michigan-20260903`, `kanell-fiu-at-usf-20260903`, `patterson-oklahoma-state-at-tulsa-20260903` after Audit. Engineering omits them from public copy until then.
3. Whether any historical `firstPublishedAt` can later be populated from Cloudflare deploy logs. None were backfilled here.
4. Empty-deploy cadence for news expiry: the workflow and RUNBOOK are reviewable; activating and observing them is an operations step, not claimed complete.

Parked from Phase 1: Scout queue (landed in Phase 2), page-type SEO expansion, social selection rewrite, ATS, backends, production deploy, live X.

## Phase 2 — Scout queue, source completion, and handoffs

Outcome required: the next week's relevant evidence is found before kickoff without grinding indefinitely on the same empty side.

This journal is not a Scout intake run and does not set `audit=` / `promoted=` flags.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Upcoming NCAAF absence is flagged | yes | Live `ncaafAbsenceFlag` on current `data/events.json` + `docs/capture-targets.json`; Dispatch coverage flag. Proposed Week 2 shortlist is labeled proposed. |
| Approved dense game still source-completes a newly available GameDay voice | yes | `scripts/scout-density.test.mjs` source-completion fixture |
| Unseen yesterday episode remains eligible | yes | `classifyItem` unprocessed fixture in `scripts/scout-feeds.test.mjs` |
| Newer irrelevant episode does not hide a relevant one | yes | `classifyQueue` / `inspectableEpisodes` fixture |
| Dry episode is not reprocessed without cause | yes | ledger `outcome: dry` fixture; reopen only with `reopenReason` |
| Same-day imminent target precedes a later equal-priority one | yes | Patriots before Bills at equal priority |
| Unrelated failed row does not block an approved row | yes | `promoteReadyRows` Howard ok + Portnoy fail |
| Modified row cannot reuse approval | yes | quote change invalidates `rowId` |
| Past or settled event cannot receive pregame hunting | yes | settled → Grader or omit; past kickoff without a final → Grader; missing kickoff is not live |
| Current-main dry run does not publish data | yes | `node scripts/scout-density.mjs --dry-run` and `node scripts/scout-feeds.mjs --dry-run` print only |
| Journal is not a Scout intake and does not set editorial flags | yes | this file |

### Checks run

On this worktree after the Phase 2 code and operating-doc edits:

- `npm test`: **pass**, 453 tests / 47 files.
- `npm run check:fast`: **pass**. Inexpensive tests 452 passed / 46 files; `validate:runs` passed on `docs/runs`. Note: `check:fast is not a release gate.`
- `node scripts/scout-density.mjs --dry-run`: printed Dispatch + proposed shortlist + decision queue. Coverage flag: upcoming NCAAF game events: 0. Hunt order Patriots (Sep 9 empty-side) → 49ers (Sep 10 dense source-complete) → Bills (Sep 13 empty-side). Did not write `data/*.json`.
- `node scripts/scout-feeds.mjs --dry-run`: printed the recent-unprocessed queue including GMFB / See Ball / Clay Travis. GMFB `i=1000788488079` stayed inspected/hit and was not re-queued. Did not write `data/*.json` or mark new episodes inspected.

No production deploy. No `data/*.json` edits. Methodology page was not changed: this phase is operating policy, not public pick-eligibility semantics.

### Remaining product decisions

1. **NCAAF Week 2 shortlist.** Engineering bootstrapped four source-backed proposed games (Oklahoma at Michigan; Ohio State at Texas; Arizona State at Texas A&M; Alabama at Kentucky). Codex/PM must approve, replace, or defer. Silence is not “no college work” and is not permission to scout every game. No public events were minted.
2. **NFL add-ons.** Broncos–Chiefs, Commanders–Eagles, and Packers–Vikings are proposed only. Approved openers stay Patriots / 49ers / Bills.
3. **Factory IDs.** GMFB Apple `1171438277`, See Ball Get Ball `1769665459`, and Clay Travis `1498106610` are verified from existing repo URLs. No guessed IDs. No remaining factory-ID gap for those three.
4. **Episode ledger writer.** Shows is instructed to persist inspection outcomes in `docs/scout-episodes.json`. Coordinator feed checks only discover. Whether Coordinator should auto-write `outcome: discovered` on every feeds run is left to Codex; the CLI remains print-only by default so a dry run cannot mark episodes inspected.

Parked by the brief and not reopened: auto-roster, photo bypass, team-analyst eligibility, bulk event minting, new bots, `data/*.json` edits, production deploy, live X.

### Next phase

Phase 3 — SEO contract for existing page types (depends on Phase 1 content contract). Phase 4 — social selection (this branch).

## Phase 4 — simplify social selection while preserving the cards

Outcome required: the existing bots select meaningful verified stories and can be evaluated against actual outcomes. Cards and visual design are unchanged. No live X posts.

This journal is not a Scout intake run and does not set `audit=` / `promoted=` flags.

### Acceptance criteria

| Criterion | Met? | Evidence |
|---|---|---|
| Replay a fixture timeline crossing midnight and show duplicates skipped | yes | `lib/social-select.test.ts` pending take posted 23:40 ET still skipped next morning |
| Newly graded result is distinct from its original pending post | yes | same destination, `pregame` skip / `result` allow |
| If live coverage cannot be established, skip rather than assume novelty | yes | `coverage-unknown` fixture; Poster/Reply Guy remain read-only and do not write a log |
| Contradictory “empty side” language fails review | yes | `lib/social-copy.test.ts` |
| Unsupported cover language fails review | yes | “Cover crushed.” on a winner-only grade |
| No false quotation or missing-price-time implication in drafts | yes | reported-selection drafts unquoted; prices require `snapshotAt` / “as of” |
| All tags have approved provenance | yes | parser vs `docs/social/tagging.md`; unapproved `@randomfan` fails |
| Unavailable metrics remain blank/n/a | yes | `metricCell(undefined) === "n/a"`; paid vs organic vs unavailable reach |
| Reviewer separates originals, outside-thread replies, self-link replies, paid reach | yes | `classifyTimelineItem` + `bots/reviewer.md` |
| Daily caps are ceilings, not quotas | yes | leftover-cap skip; schedule rewritten as ranges |
| Routine favorite wins need a specific reason | yes | Wisconsin–ND / Miami–Stanford / Boise–Oregon / WMU–Michigan skipped |
| Primary order is disagreement → resolution → notable call; no forced archetype rotation | yes | `rankStories` + `docs/social/post-patterns.md` |
| Existing cards unchanged | yes | drafts reuse `ogCard` URLs; `docs/social/images.md` keeps the visual system |
| Additive `cards.json` fields, schemaVersion 2 | yes | `callId`, locator, rationale, snapshot, gradingScope, scores; no renamed fields |
| Offline review drafts, not live posts | yes | samples below |
| Methodology unchanged | yes | no pick-eligibility / grading / snapshot-semantics change |
| No `data/*.json` edits, no live X, no deploy | yes | this change |

### Payload (compatible)

`schemaVersion` stays **2**. Additive fields on existing arrays:

- events: `snapshotAt`, `gradingScope`, `trackedCount`, `bothSides`, `awayScore`, `homeScore`, `resultUrl`
- takes: `callId`, `source`, `sourceUrl`, `sourceLocator`, `rationale` (public only; operational capsules stay `null`), `gradingScope`, `spreadOrigin`

`pageUrl` / `ogCard` / `storyCard` / status / side are unchanged.

### Novelty contract

Poster/Reply Guy remain read-only. Novelty is live timeline + destination search keyed by canonical `pageUrl` + state across the pick/result lifecycle, not since midnight. Unverified coverage is a skip. A persistent publication log is **not** shipped; see remaining decisions.

### Offline drafts (review only)

Same card URLs as current `cards.json`. Not posted.

**1. 49ers vs Rams** (current pregame; no result draft — game is ungraded)

- Chosen card: `https://pundits.pro/og/events/49ers-vs-rams-2026.png`
- Why selected: only upcoming two-sided tracked game on 2026-09-09.
- Pregame: *Kyle Brandt picks 49ers. Rich Eisen, Colin Cowherd, and Jason McIntyre pick Rams. 4 tracked calls, both sides on the record ahead of Sep 10, 2026. Kalshi snapshot: 49ers 36¢ / Rams 65¢, as of Sep 8, 2026*
- Result: withheld. Inventing a score would manufacture evidence.

**2. Clemson at LSU** (historical disagreement)

- Chosen card: `https://pundits.pro/og/events/clemson-at-lsu-2026.png`
- Why selected: 12 tracked calls, both sides; postgame is the resolution of that split.
- Pregame reconstruction: *George Wrighster and Danny Kanell pick Clemson. Josh Pate, Paul Finebaum, Andy Staples, Greg McElroy, and 6 more pick LSU. 12 tracked calls, both sides on the record ahead of Sep 5, 2026. Kalshi snapshot: Clemson 23¢ / LSU 78¢, as of Sep 3, 2026*
- Result: *LSU 51, Clemson 10. George Wrighster and Danny Kanell had Clemson. Josh Pate, Paul Finebaum, Andy Staples, Greg McElroy, and 6 more had LSU. Tracked result is the straight-up winner, not a spread cover. Kalshi snapshot: Clemson 23¢ / LSU 78¢, as of Sep 3, 2026*
- Before (do not ship): “Kanell and Wrighster backing Clemson. Empty side.” / “Cover crushed.” Both fail review.

**3. North Carolina vs TCU** (historical disagreement; underdog side hit)

- Chosen card: `https://pundits.pro/og/events/unc-vs-tcu-2026.png`
- Why selected: four tracked calls, both sides; snapshot 26–75 explains why the split mattered.
- Pregame reconstruction: *Chip Patterson and Greg McElroy pick North Carolina. Paul Finebaum and Will Compton pick TCU. 4 tracked calls, both sides on the record ahead of Aug 29, 2026. Kalshi snapshot: North Carolina 26¢ / TCU 75¢, as of Aug 28, 2026*
- Result: *North Carolina 15, TCU 10. Chip Patterson and Greg McElroy had North Carolina. Paul Finebaum and Will Compton had TCU. Tracked result is the straight-up winner, not a spread cover. Kalshi snapshot: North Carolina 26¢ / TCU 75¢, as of Aug 28, 2026*
- Before (do not ship): “Finebaum took TCU at 75¢.” Fails `took-at-price`.

Routine candidates skipped on a 2026-09-09 replay: Wisconsin–ND, Miami–Stanford, Boise State–Oregon, Western Michigan–Michigan (one-sided favorite wins); leftover-cap notable underdogs after the primary six; 1-0 records. SMU–FSU remains a valid disagreement/resolution when it is still inside the three-day result window.

### Checks run

On this worktree after the Phase 4 code and playbook edits:

- Relevant logic tests (`lib/social.test.ts`, `lib/social-select.test.ts`, `lib/social-copy.test.ts`): **pass**.
- `npm run check:fast`: **pass**. Inexpensive tests 506 passed / 52 files; `validate:runs` passed on `docs/runs`. Note: `check:fast is not a release gate.`
- `npm run check` with `GITHUB_PAGES` unset: **pass**. Tests 507 passed / 53 files; `validate:runs`; production build; `verify:static` including social-index `schemaVersion` 2 and 217 pages / 216 decoded images. OG generation reused all 430 cards (`rendered=0`) — images unchanged.

No production deploy. No live X. No `data/*.json` edits. Images not regenerated.

### Remaining Codex decisions

1. **Publication log.** First implementation keeps Poster/Reply Guy read-only and uses live timeline/search. If that proves impractical in operation, a minimal append-only log (destination, state, post ID, timestamp) needs an explicit writer: Poster still should not write the repo. Candidate owner is Reviewer or Promote as a discrete later change, not a backend.
2. **Operator edit pass.** These drafts are machine-composed review copy. Brief allows a small amount of operator editing on the highest-value posts; that is not automated here.
3. **Roll Call tags on the 49ers card.** Four tracked pundits, both sides — density gate passes. Whether to tag Eisen/Cowherd (approved) plus Brandt (no approved handle → spelled, untagged) is a tagging.md application, not a new handle.

Parked: live X, paid boosts, card redesign, Phase 3 SEO templates, Phase 5 dashboards, production deploy.
