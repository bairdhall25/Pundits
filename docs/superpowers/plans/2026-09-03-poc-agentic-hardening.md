# POC agentic hardening implementation plan

Status: Paused after Workstream 3 production closeout

Date: 2026-09-03

Revision: 2 — re-sequenced after Workstream 1 and the Workstream 2 merge

Program stop: Finish, release, and verify Workstream 3. Do not begin Workstreams 4–8 without a new operator decision. This pause is intentional to control agent-credit spend during live POC operation.

## Goal

Make Pundits.Pro fast and safe for full agentic development during the next few months of live proof-of-concept operation without replacing the current product architecture.

An agent entering a clean checkout should be able to understand the current state, work in isolation, get fast feedback, run the complete release gate, publish the exact reviewed commit, verify production, and recover from an interrupted release without relying on the operator's checkout or hidden chat context.

The public product remains a statically exported Next.js site on Cloudflare Pages. Git and repository JSON remain the editorial record. Grok Coordinator, Shows, X, News, Audit, Promote, Grader, and Recap retain their current ownership boundaries.

## Current decision

Do not migrate to Vercel or introduce a backend now.

The observed friction is primarily in repository checks, generated social assets, static verification, release coordination, and machine-readable handoffs. Those problems can be measured and corrected inside the current architecture. Revisit hosting or runtime architecture only after the revised Workstream 8 acceptance run demonstrates a remaining platform constraint.

## Current status

| Workstream | State | Evidence or next gate |
| --- | --- | --- |
| 1. Observable agent checks | Complete | Merged in `20a1144`; `doctor` and staged `check` are present. |
| 2. Incremental and atomic social cards | Complete | Merged in `1e6dbc8`; operator confirmed Grok completed the production release. The latest full local check is green. |
| 3. Agent and deployment speed | Complete | Merged in PR #20 (`c82cabe`); production deploy and live verification passed. `check:fast` is available; full `check` remains the release gate. |
| 4. Release and worktree safety | Paused | Do not start without a new operator decision. |
| 5. Scout/Audit pipeline contracts | Paused | Do not start without a new operator decision. |
| 6. Promotion planning | Paused | Do not start without a new operator decision. |
| 7. Grade planning | Paused | Do not start without a new operator decision. |
| 8. Agentic acceptance and architecture decision | Paused | Do not start without a new operator decision. |

## Why this revision

Workstream 1 made the release cost visible. A pre-WS2 successful `npm run check` took about 103 seconds:

| Stage | Time |
| --- | ---: |
| Tests | 29.5 seconds |
| Run validation | 1.3 seconds |
| Production build | 45.2 seconds |
| Static verification | 26.7 seconds |

Workstream 2 directly targets the generated-card portion of the build. It does not, by itself, address the roughly 56 seconds previously spent in tests and static verification or the additional Cloudflare upload and live-verification steps. Because every product and pipeline change pays these costs, development and deployment performance now moves ahead of further pipeline automation.

The latest successful post-merge `.agent-artifacts/check-summary.json` took 84.3 seconds: tests took 14.7 seconds, run validation 0.8 seconds, the production build 55.3 seconds, and static verification 13.4 seconds. This is a useful starting observation, but Workstream 3 must still record controlled cold-cache, warm-cache, and one-change runs before optimizing.

## Product and operating invariants

Every workstream must preserve:

- The core object is a verifiable public pick from a named pundit.
- A mapped pick retains its verbatim quote, source URL, source date, event, explicit side, and objective grading rule.
- On games, YES means the away team and NO means the home team.
- Frozen Kalshi context remains a capture-time snapshot, not live odds.
- Empty sides remain honest.
- Data and published URLs remain append-only.
- Scout finds candidates and evidence but never edits `data/*.json`.
- Audit independently reopens and checks proposed sources but never edits `data/*.json`.
- Grader proposes results and evidence but never edits `data/*.json`.
- Promote is the only bot role authorized by the operating workflow to edit `data/*.json`.
- Recap reads the ledger and does not edit `data/*.json`.
- Community tips remain untrusted Scout leads.
- Public display, methodology, metadata, structured data, feeds, and URLs must not change merely because the build or agent workflow changes.

## Delivery principles

1. Assign and merge one workstream at a time. Do not create one long-lived implementation branch.
2. Add automation only where repeated reasoning, delay, or failure already exists.
3. Preserve a correct cold path. Caching may accelerate work but must never be required for correctness.
4. Prefer additive schemas and versioned handoffs over rewriting historical run files.
5. Make status and dry-run commands trustworthy before allowing deterministic apply commands.
6. Stop after each workstream and reassess the next one against live use.
7. Keep external agent providers replaceable. Grok is a first-class worker, but repository contracts must not depend on one model's private memory.
8. Optimize measured bottlenecks rather than deleting safety checks to hit a target.

## Grok execution contract

This plan is designed to be handed to Grok. Do not ask one Grok task to execute the entire plan.

For every assigned workstream, Grok must:

1. Read `AGENTS.md` and the canonical documents it names before substantial work. Live code and data win when they differ from this dated plan.
2. Restate the assigned workstream, acceptance criteria, and assumptions before editing.
3. Inspect the current worktree and preserve unrelated changes. Prefer an isolated worktree or short-lived branch.
4. Make the smallest implementation satisfying the workstream. Do not introduce a new service, framework, data store, public feature, or editorial semantic as a convenience.
5. Keep implementation work out of `data/*.json`. None of these implementation workstreams requires sample editorial mutations.
6. Add or update focused tests with behavior changes.
7. Run the workstream-specific verification, `git diff --check`, and the repository gate required by `AGENTS.md`.
8. Report changed files, commands run, observed timings or failure-injection evidence, unresolved risks, and intentional deferrals.
9. Stop at the workstream merge boundary. Do not begin the next workstream automatically.

Grok must stop and request operator review when:

- current code makes an acceptance criterion unsafe or obsolete;
- implementation would change public methodology, pick eligibility, event mapping, grading semantics, published URLs, or append-only editorial history;
- a failing check appears unrelated and cannot be isolated without changing user work;
- production credentials, cleanup of another agent's worktree, or another destructive action is required;
- a task reaches a gated `promote:apply` or `grade:apply` step without the live dry-run evidence required below.

## Non-goals

Do not add or migrate to:

- Vercel;
- ISR, SSR, or a general Next.js runtime;
- D1, Queues, Workflows, a CMS, or a public application database;
- a general-purpose internal agent platform;
- JSON sharding;
- accounts, comments, live odds, betting controls, or new sports;
- a new public page, route, state, scoring system, or editorial field solely for operations.

Do not replace the Grok Bots or collapse the Scout, Audit, Promote, Grader, and Recap roles.

## Target command surface

The intended operator surface remains small. Exact implementation names may change when current code suggests a simpler interface.

```text
npm run doctor
npm run check:fast
npm run check
npm run pipeline:status
npm run promote:plan -- --run docs/runs/YYYY-MM-DD.md
npm run grade:plan -- --file docs/runs/YYYY-MM-DD-grade.md
npm run deploy
npm run verify:deployed
```

`promote:apply` and `grade:apply` remain gated. Do not expose them until their dry-run plans have matched real reviewed work.

## Workstream 1 — observable agent checks

Status: Complete in `20a1144`.

Delivered:

- `scripts/check.mjs` runs tests, run-file validation, the production build, and static verification as visible stages.
- Stage start, completion, timing, failure, and next-command output are visible.
- `.agent-artifacts/check-summary.json` provides machine-readable results.
- `scripts/agent-doctor.mjs` checks the local environment and reports actionable failures.
- CI uses the same repository check surface.
- Focused tests cover the check runner and doctor.

No more implementation is planned here. Extend these contracts rather than introducing a competing runner.

## Workstream 2 — incremental and atomic social cards

Status: Complete. Merged in `1e6dbc8`; operator confirmed the Grok production release completed.

Delivered code includes:

- an expected-asset manifest and fingerprint model;
- content-addressed cache support;
- runtime-context fingerprinting;
- atomic output publication;
- focused manifest, fingerprint, cache, and publication tests;
- CI cache support;
- integration with the existing renderer and preview validation.

### Release closeout evidence

Workstream 2 was closed with the following required evidence. Preserve the Grok handoff with the release record when available:

1. Diagnose the current build-stage failure without weakening the check.
2. Run the full `npm run check` successfully from the release checkout.
3. Record cold-cache, warm-cache, and one-pick-change card timings.
4. Confirm unchanged inputs reuse assets and a narrow change invalidates only expected assets.
5. Confirm a renderer failure cannot replace the last complete public asset set with partial output.
6. Confirm cache corruption or absence falls back to a correct rebuild.
7. Complete the normal deploy chain and require `npm run verify:deployed` to pass.
8. Report the deployed commit and observed production verification result.

The latest repository check is green. Workstream 3 begins from this released implementation and must create controlled performance baselines rather than inferring cache performance from this single run.

## Workstream 3 — agent and deployment speed

Status: Next.

Purpose: shorten the development feedback loop and the real release path while preserving the full production gate.

### Task 3.1 — establish the post-WS2 baseline

Measure from a clean checkout or clean agent worktree with the production-style environment:

- cold `npm run check` with an empty social-card cache;
- warm `npm run check` with unchanged inputs;
- warm check after changing one representative pick input;
- `npm test` by file or suite;
- `npm run verify:static` by major verification group;
- the complete `npm run deploy` chain, including guards, production URL verification, Cloudflare upload, live verification, and IndexNow preparation/submission.

Store a compact machine-readable timing artifact under `.agent-artifacts/` and summarize the baseline in the implementation handoff. Do not commit machine-specific timing artifacts.

### Task 3.2 — add `npm run check:fast`

Modify `package.json` and extend the existing staged-runner approach rather than creating a parallel framework.

The fast gate must:

- run inexpensive deterministic tests and run-file validation needed for normal agent edits;
- include a lightweight type or static check if the current toolchain supports one without invoking the production export;
- exclude social-card rendering, the production export, and output-dependent static verification;
- use the same visible stage, failure, timing, and next-command conventions as `npm run check`;
- write a distinct machine-readable summary;
- never be presented as sufficient for deployment or release-affecting completion.

Document when agents must use `check:fast` and when they must use the full `check`.

### Task 3.3 — replace mutable-editorial behavioral fixtures

Audit tests for assumptions tied to the current live ledger, including a specific pick remaining open, an event retaining an empty side, a record staying featured, or an item remaining inside a rolling feed window.

Replace those assumptions with purpose-built fixture builders or minimal checked-in test fixtures. Tests of live-data integrity may continue to read `data/*.json`; behavioral tests should control the state they are asserting.

Do not edit editorial JSON to satisfy a test.

### Task 3.4 — profile and optimize remaining release bottlenecks

Use the baseline to inspect the test and static-verification stages first. Likely changes include removing repeated parsing or traversal, sharing immutable in-process indexes, narrowing duplicate assertions, or separating fast behavioral checks from output-dependent release checks.

Rules:

- preserve every production invariant currently checked;
- do not skip or sample published routes in the full release gate;
- do not parallelize CPU-heavy stages until measurement shows that contention improves wall time on the operator machine and CI;
- do not rerun a successful deterministic stage within the same release unless an intervening action invalidates it;
- keep the deployed `out/` directory tied to the exact commit and successful check that produced it;
- make full deploy stages visible and timed, preferably through a small Node runner rather than an opaque shell chain.

### Workstream 3 acceptance

- A successful cold, warm, and one-change baseline is recorded.
- `npm run check:fast` is materially faster than the full check and fails clearly.
- The full check remains the required release gate.
- Normal editorial growth no longer breaks unrelated behavioral tests.
- The full deploy reports per-stage timings through production verification.
- Optimizations are supported by before/after measurements.
- No public behavior, editorial semantics, URL, methodology claim, or safety assertion changes.
- `npm run check` passes.

### Workstream 3 merge and stop gate

Merge Workstream 3 independently. Reassess Workstream 4 only after agents have used `check:fast` and one measured production deployment has completed through the new timing surface.

If the warm build and deploy are acceptably fast after Workstream 2, keep Task 3.4 small. The goal is to remove observed friction, not manufacture a performance project.

## Workstream 4 — release and worktree safety

Purpose: ensure agents can develop and release without depending on or damaging the operator checkout.

### Task 4.1 — reconcile deploy authorization with isolated worktrees

Inspect `scripts/deploy-guard.mjs`, scheduled-task guidance, and actual branch/worktree practice.

Define one supported release contract that verifies:

- the release commit equals the reviewed `origin/main` commit;
- tracked files are clean;
- prohibited environment flags such as `GITHUB_PAGES` are absent;
- required tools and production project configuration are present;
- generated output belongs to the checked release commit;
- a stale or advanced checkout cannot deploy accidentally.

Do not weaken commit identity to accommodate a temporary branch name. Prefer verifying exact commit identity over requiring the local branch to literally be named `main`.

### Task 4.2 — add safe worktree lifecycle guidance or tooling

Provide a minimal supported helper or documented command sequence for creating, validating, and retiring agent worktrees.

It must never recursively delete a computed path without validating the resolved target. It must not remove shared dependencies, caches, or another task's worktree. Treat `node_modules` ownership explicitly rather than assuming every worktree has an independent directory.

### Task 4.3 — exercise interrupted-release recovery

Test and document recovery from:

- failure before build completion;
- failure after a successful check but before upload;
- Cloudflare upload failure;
- live-verification failure after upload;
- IndexNow failure after a verified deployment.

Recovery must distinguish retryable distribution work from work that requires rebuilding or operator review.

### Workstream 4 acceptance

- A clean isolated agent checkout can release the exact reviewed `origin/main` commit.
- An unreviewed, dirty, stale, or advanced commit is rejected.
- Cleanup cannot damage another checkout or shared dependency state.
- Interrupted releases have an explicit recovery path.
- `npm run check` and deploy-guard tests pass.

## Workstream 5 — versioned Scout/Audit handoffs

Purpose: make repeated Grok operations understandable to agents without changing editorial ownership.

### Task 5.1 — add pipeline schema version 2

Add stable, short identities to new run artifacts:

- `runId` for an orchestrated cycle;
- `passId` for each Scout, Audit, Promote, Grade, or Recap pass;
- `candidateId` stable across Scout and Audit handoffs;
- explicit schema version;
- source-role and timestamps;
- explicit links from an Audit verdict to the exact candidate and evidence inspected.

Keep Markdown human-readable. Use a compact JSON sidecar only where it materially improves validation and status reporting. Historical schema-v1 run files remain valid and unchanged.

Represent proposal, audit, promotion, and supersession as distinct facts. A later failed audit must not silently erase the historical fact that an earlier version was promoted; it must make the conflict visible for review.

### Task 5.2 — add `npm run pipeline:status`

The command is read-only and must summarize:

- candidates awaiting Audit;
- pass, fail, conditional, duplicate, and superseded verdicts;
- accepted candidates awaiting Promote;
- promoted candidates and exact ledger identities;
- proposed grades awaiting review or application;
- ambiguous states requiring operator action.

It must exit nonzero for structural ambiguity and print the exact source artifacts involved.

### Workstream 5 acceptance

- Two real Grok cycles use schema v2 without hidden chat context.
- Scout and Audit can resume from repository artifacts alone.
- Historical v1 files continue to validate.
- `pipeline:status` identifies a deliberately constructed ambiguous fixture.
- No non-Promote role gains editorial JSON write authority.

## Workstream 6 — promotion planning and provenance

Purpose: make Promote deterministic and reviewable before automating writes.

### Task 6.1 — add a read-only promotion planner

Add `npm run promote:plan -- --run <path>` or an equivalent narrow command.

The planner must:

- read an accepted, audited candidate;
- resolve the proposed pundit, event, call, source, and frozen market references;
- reject missing evidence, ambiguous side mapping, duplicates, append-only violations, or incompatible event state;
- show the exact proposed additions and references without changing files;
- include provenance back to `runId`, `passId`, `candidateId`, and Audit verdict;
- explain every rejection in operator-readable language.

### Task 6.2 — gate deterministic apply

Do not add `promote:apply` until the planner output has matched two real, manually reviewed Promote operations.

If apply is later authorized, it must:

- require an explicit accepted plan artifact;
- revalidate against the current ledger immediately before writing;
- write the whole related change or nothing;
- stop before commit and deployment;
- leave the normal tests and release gate mandatory.

### Workstream 6 acceptance

- Two live dry-run plans match reviewed manual promotions.
- Duplicate, partial, stale, and ambiguous cases fail safely.
- Provenance survives into the proposed ledger change.
- Automatic apply remains absent unless the evidence gate is explicitly approved.

## Workstream 7 — formal grade planning

Purpose: make closing the loop as explicit and reliable as adding a pick.

### Task 7.1 — version and validate grade proposals

A grade proposal must identify:

- event and every affected call;
- authoritative result source and retrieval time;
- final score or objective outcome;
- proposed event result state;
- proposed call result for every affected call;
- any push, cancellation, postponement, correction, or unresolved ambiguity;
- Grader pass identity and evidence provenance.

Grader remains read-only against `data/*.json`.

### Task 7.2 — add a read-only grade planner

Add `npm run grade:plan -- --file <path>` or an equivalent command that validates whole-event consistency and shows the exact proposed change without writing.

Do not add `grade:apply` until at least one real event has completed the proposal, independent review, manual promotion, full check, deployment, and production verification loop with matching planner output.

Any later apply helper must update the complete event atomically, preserve evidence, and stop before commit or deployment.

### Workstream 7 acceptance

- A real completed event passes the full reviewed loop.
- Multi-call events cannot be partially graded.
- postponed, cancelled, pushed, and corrected fixtures fail or resolve explicitly.
- public records remain consistent with event and call results.
- automatic apply remains gated unless explicitly approved.

## Workstream 8 — agentic acceptance and architecture decision

### Task 8.1 — synchronize current operational documentation

Update the canonical operating documents named by `AGENTS.md` so they agree on:

- supported agent checkout and worktree practice;
- fast versus full checks;
- social-card cache behavior and cold fallback;
- Scout, Audit, Promote, Grader, and Recap ownership;
- schema-v2 artifact identities;
- release, verification, and recovery steps.

Do not rewrite dated historical run files. Update public methodology only if public product behavior or claims actually changed.

### Task 8.2 — run the clean-checkout acceptance story

From a new agent checkout with no private conversation context:

1. Run `npm run doctor`.
2. Understand current pipeline state from repository artifacts.
3. Process a representative Scout and Audit handoff.
4. Produce a read-only promotion or grade plan.
5. Run `npm run check:fast` during implementation.
6. Run the full production check.
7. Release the exact reviewed `origin/main` commit through the supported release path.
8. Verify production.
9. Demonstrate safe recovery from one injected interruption.

The acceptance operator records total hands-on time, waiting time, failed/repeated stages, manual interpretation required, and any hidden context the agent needed.

### Task 8.3 — make the architecture decision from evidence

Continue with static Next.js on Cloudflare Pages unless the acceptance evidence shows a concrete blocker such as:

- repository JSON no longer supports safe editorial concurrency;
- incremental static generation remains too slow after measured optimizations;
- deployment frequency or artifact size exceeds the current platform's practical limits;
- durable pipeline state cannot be represented safely in versioned repository artifacts;
- required scheduling or retries cannot be provided by the existing Grok and repository workflow.

If a blocker appears, write a separate architecture decision record comparing the smallest viable options. Do not treat Vercel as the default; compare it against remaining on Cloudflare and against narrowly adding only the missing capability.

### Workstream 8 acceptance

- One clean-checkout agent completes the full story without touching the operator checkout.
- Timings and manual interventions are recorded.
- Canonical documents match actual behavior.
- The architecture decision is explicit: remain, add a narrow capability, or begin a separately approved migration plan.

## Verification matrix

| Change class | Focused verification | Required final gate |
| --- | --- | --- |
| Check runner or doctor | runner unit tests and failure injection | `npm run check` |
| Social-card renderer, cache, or publisher | manifest, fingerprint, cache, atomic-publication tests; cold/warm/narrow-change run | `npm run check` and deployed asset verification |
| Fast gate or fixtures | fast-runner tests and fixture mutation tests | `npm run check` |
| Deploy guard or release runner | dirty, stale, branch, commit, environment, and interruption fixtures | production-style dry run, then reviewed deploy |
| Run schema or status | v1/v2 fixtures, ambiguous and partial states | `npm test` and `npm run validate:runs` |
| Promotion or grade planner | duplicate, stale, partial, mapping, correction, and atomicity fixtures | `npm run check`; live dry-run comparison before apply |
| Documentation only | link/path review and `git diff --check` | no application build unless behavior also changed |

## Risks and controls

### Stale or incorrect social cards

Control with content fingerprints, runtime-context versioning, a correct cold path, atomic publish, corruption fallback, and deployed URL verification.

### Faster checks weaken release confidence

Control by clearly separating `check:fast` from the full `check`, preserving every release assertion, and requiring the full check before deployment.

### Concurrency harms wall time or cache integrity

Control with measurement, bounded concurrency, content-addressed immutable cache entries, per-output atomic replacement, and explicit contention tests.

### Worktree automation damages user state

Control with resolved-path validation, narrow targets, no recursive cleanup of shared directories, clean-state checks, and explicit ownership of caches and dependencies.

### Schema ceremony slows Grok Scouts

Control with short generated IDs, additive fields, templates, two-cycle evaluation, and simplification before adding automatic apply.

### Deterministic tooling publishes a semantic error

Control by shipping read-only status and planning first, preserving independent Audit, requiring explicit review, gating apply with live comparisons, and stopping tools before commit or deployment.

### The POC turns into an internal platform project

Control with independent merge boundaries, real-use stop gates, explicit non-goals, no new hosted service, and no requirement to implement gated apply commands.

## Completion criteria

This plan is complete when:

- long checks, renders, and deployments report stage progress and timings;
- unchanged and narrowly changed builds reuse social assets safely;
- generated output publication is atomic and failure-safe;
- agents have a materially faster non-release check;
- mutable editorial growth no longer breaks unrelated behavioral fixtures;
- scheduled worktree guidance, cleanup, deploy guard, and recovery agree;
- Scout/Audit handoffs have stable identities and machine-readable status;
- promotion planning is deterministic and proven in dry run;
- grade planning is explicit, tested, and whole-event consistent;
- one clean-checkout acceptance story succeeds without touching the operator checkout;
- public behavior, methodology, URLs, and editorial truth remain unchanged;
- the decision to retain or revisit the architecture is supported by measured evidence.

The plan does not require `promote:apply`, `grade:apply`, a hosted control plane, or a platform migration to be considered successful.
