# Community tip intake implementation plan

Status: Implemented; production deployment pending

Date: 2026-09-03

Implementation outcome (2026-09-03): the shared contract, Pages Function, Scout mailbox importer, website flow, public trust copy, analytics, social card, and route verification are implemented. `npm run check` passes, the browser flow reaches local KV, and Design QA passes. Production and preview `PUNDITS_TIPS` namespaces are provisioned and bound in `wrangler.toml`; production release remains gated on deployment and one live queue-to-mailbox smoke test. The source link is the only required public field; Scout accepts and triages source-only leads. No `data/*.json` file was changed.

> **For Codex:** community submissions are untrusted discovery leads. They never publish directly, never map themselves, and never write `data/*.json`.

**Goal:** Let fans send an original public pundit-pick source from the website or X DMs, route it into the existing Git mailbox, and process it through the same Scout → Audit → Promote controls as any other discovery.

**Proof point:** A family member surfaced George Wrighster's public Clemson-over-LSU post after the normal Scout lanes missed it. Audit verified the source, the operator approved Wrighster for the roster, and Promote made it the only Clemson pick on the marquee event.

**Product decision:** Build a `Submit a pick` intake surface, not a community-picks product. The submitter is helping Scout find public evidence; Pundits.Pro still decides whether the speaker qualifies, extracts the quote, maps the side, audits the source, and promotes the record.

**Placement evidence:** `docs/audits/2026-09-03-community-tip-placement/audit.md`.

## Experience decision

### Where it lives

- **Primary contextual entry:** a compact prompt immediately after the EventCard on open `/picks/{eventSlug}/` pages and before the email-interest module.
  - Empty side: `Know a public Wisconsin pick? Send the source →`
  - No empty side: `Know another public pick we missed? Send the source →`
- **Global entry:** add `Submit a pick` to the footer.
- **Destination:** a dedicated `/submit/` page. Event links carry `event`, optional `side`, and `placement=event` query parameters so the form can show the context without asking the fan to re-enter it.

### Where it does not live

- No fourth primary-navigation item.
- No homepage-hero button.
- No new control inside homepage or league scan cards; their empty state continues to open the event page.
- No account, public profile, public queue, voting, comments, or submitter leaderboard.

### Navigation decision

Keep the primary header as `Picks / Takes / Pundits` for v1. Submission is a secondary contribution action, not a peer browsing destination. The event prompt catches a fan at the moment they see incomplete coverage, while the footer serves visitors who arrive with a source already in hand.

Revisit header placement only after the three-slate rollout review. If qualified submissions prove frequent enough to justify permanent global prominence, test a visually separated `Submit` utility action rather than adding a fourth equal navigation section. Mobile header space and the effect on the three primary destinations must be verified before that change.

### Form copy and fields

Page heading: `Found a pick we missed?`

Intro: `Send the original public post, article, podcast, or video. We verify every source before anything reaches the board.`

Fields:

| Field | Requirement | Notes |
|---|---|---|
| Public source URL | Required | Original source preferred; HTTP(S) only. |
| Pundit name | Optional | A hint for Scout, never trusted as attribution. |
| Game or prediction | Optional | Prefilled from an event page when available. |
| Timestamp or where to look | Optional | Short plain text; useful for video/audio. |
| Website | Honeypot | Hidden from people and excluded from storage. |

Do not ask the fan to choose YES/NO, hard/soft, winner/bet, event slug, or a verbatim quote. Those are editorial decisions. Do not collect the submitter's name, email, X handle, or other identity in v1.

Success copy: `Tip received. Scout will reopen the public source before anything is published.`

Reassurance beneath the button: `Submitting a source does not guarantee publication. Do not send private messages, paywalled copies, or personal information.`

## End-to-end contract

```text
Website form or X DM
        ↓
Untrusted tip queue / manual X-DM entry
        ↓
## Community tips in docs/runs/YYYY-MM-DD.md
        ↓
Owning Scout lane opens the original source
        ↓
Normal Intake / Candidates / Bets / Dropped row
        ↓
Audit reopens evidence
        ↓
Promote alone may write data/*.json
```

The public website must not hold GitHub credentials or write to the repository. Website tips first land in a separate Cloudflare KV namespace. The Coordinator imports sanitized rows into Git at the start of its normal run. Cloudflare documents [KV bindings for Pages Functions](https://developers.cloudflare.com/pages/functions/bindings/) and [prefix-based, paginated key listing](https://developers.cloudflare.com/kv/api/list-keys/), which supports an idempotent pull without exposing a public read endpoint.

## Tip record

Create a shared `TipSubmission` contract in `lib/tip-submission.ts`:

```ts
type TipSubmission = {
  id: string;                 // server-generated
  receivedAt: string;         // server-generated ISO timestamp
  discovery: "website" | "x-dm";
  sourceUrl: string;
  punditHint?: string;
  eventHint?: string;
  eventSlugHint?: string;
  sideHint?: "yes" | "no";  // event-link context only; never editorial mapping
  timestampHint?: string;
  placement: "event" | "footer" | "direct";
};
```

Server rules:

- Generate `id` and `receivedAt` on the server.
- Accept only `http:` and `https:` URLs; reject local/private hosts and credentials in URLs.
- Normalize whitespace and cap every field before storage.
- Treat event and side values as context hints. Scout must validate them against live JSON.
- Escape Markdown table delimiters, HTML, and newlines before a row can enter the Git mailbox.
- Use a separate `PUNDITS_TIPS` KV binding; do not mix tips with `PUNDITS_EMAIL`.
- Expire queued website records after 90 days. The Git run record remains the operational audit trail after import.
- Store no submitter identity or request IP in the tip record.

## Mailbox contract

Add this block to `docs/runs/_TEMPLATE.md` after Factory feeds and before the three Scout passes:

```md
## Community tips

| tipId | receivedAt | discovery | lane | pundit hint | event hint | sourceUrl | where to look | status |
|---|---|---|---|---|---|---|---|---|
```

`lane` is derived from the source URL, not chosen by the fan:

- X/Twitter status URL → X Scout
- YouTube, podcast, video, audio, or transcript → Shows Scout
- Article, newsletter, or other page → News Scout

Allowed statuses: `pending`, `intake`, `candidate`, `bets`, `dropped`, `duplicate`.

The row is only routing state. A Scout must open the source and create a normal lane-owned Intake, Candidate, Bets, or Dropped entry. Promotion reads the normal audited row, never the raw tip row.

X DMs are manual in v1. The operator copies only the original public source and helpful context into the same mailbox contract with `discovery=x-dm`; the sender's identity and private message text do not enter Git. Do not add X API access or automated DM replies in this change.

## Implementation tasks

### Task 1 — Lock the product and editorial contract

Files:

- Modify `docs/product/decision-log.md`
- Modify `docs/product/product-system.md`
- Modify `docs/capture-policy.md`
- Modify `bots/README.md`
- Modify `bots/scout.md`, `bots/scout-x.md`, `bots/scout-shows.md`, `bots/scout-news.md`
- Modify `docs/runs/_TEMPLATE.md`

Checklist:

- [ ] Record the accepted decision: community tips are Scout discovery leads, not picks and not publication authority.
- [ ] Add `Community tip` to the product lifecycle before Discover/Verify without changing Call, Event, or Pundit objects.
- [ ] Make Coordinator responsible for importing queued tips without opening sources.
- [ ] Make each Scout lane process its pending routed tips before broader hunting for the same Dispatch target.
- [ ] Preserve capture-eagerly, mint-lazily, operator-roster, audit, and Promote ownership rules.
- [ ] Add the mailbox table and statuses to the run template.

### Task 2 — Build the validated queue

Files:

- Create `lib/tip-submission.ts`
- Create `lib/tip-submission.test.ts`
- Create `functions/api/tips.ts`
- Create `functions/api/tips.test.ts`
- Modify `wrangler.toml`
- Optionally extend `lib/email-notify.ts`, its tests, and `workers/email-notify/src/index.ts` for a time-sensitive tip notification

Checklist:

- [ ] Write validation, normalization, URL-safety, length-limit, honeypot, and serialization tests first.
- [ ] Add `POST /api/tips`; return generic errors and never echo submitted content.
- [ ] Store each valid tip under a time-sortable prefix such as `tip:{receivedAt}:{id}` with expiration.
- [ ] Put bounded routing metadata on the KV entry so a pull can list efficiently without exposing a public read endpoint.
- [x] Create and bind a separate production/preview `PUNDITS_TIPS` KV namespace.
- [ ] Keep the endpoint same-origin. Do not add a public list, admin route, or GitHub token.
- [ ] Start with the existing honeypot and bounded validation. Add Turnstile only if real abuse appears.

### Task 3 — Import tips into the Git mailbox

Files:

- Create `scripts/tip-mailbox-lib.mjs`
- Create `scripts/tip-mailbox.mjs`
- Create `scripts/tip-mailbox.test.mjs`
- Modify `package.json`
- Modify `bots/scout.md`

Checklist:

- [ ] Add `npm run tips:pull -- --date YYYY-MM-DD` to list queued `tip:` records through the configured Cloudflare binding.
- [ ] Paginate KV listing correctly and import each `id` once.
- [ ] Create or update only the `## Community tips` block; never recreate or wipe an existing run file.
- [ ] Escape all public strings before writing Markdown.
- [ ] Route by source host/type and leave ambiguous sources pending for operator review.
- [ ] Add a local `tips:add` mode for manually received X DMs using the same validation and row renderer.
- [ ] Make repeated pulls idempotent. Existing tip IDs must not produce duplicate rows.
- [ ] Do not delete imported KV records as part of the pull; expiration handles queue cleanup and Git preserves the run history.

### Task 4 — Build the website flow

Files:

- Create `app/submit/page.tsx`
- Create `components/TipSubmissionForm.tsx`
- Create `components/TipPrompt.tsx`
- Modify `app/picks/[slug]/page.tsx`
- Modify `components/SiteFooter.tsx`
- Modify `app/globals.css`
- Modify `app/sitemap.ts`
- Modify `scripts/required-routes.mjs`

Checklist:

- [ ] Build `/submit/` in the existing black/green broadcast system; reuse the form and focus patterns established by `EmailInterestForm`.
- [ ] Prefill visible event context from valid query parameters. Never hide the only explanation of what will be submitted.
- [ ] Add the event-page prompt after EventCard and before EmailInterestForm.
- [ ] Name the missing team only for an open game with exactly one empty mapped side.
- [ ] Add the footer link; leave the primary header and homepage hero unchanged.
- [ ] Implement pending, success, validation-error, provider-error, and unavailable states.
- [ ] Prevent repeat submission while a request is pending and abort an in-flight request on unmount.
- [ ] Add the route to static verification and the sitemap with low utility-page priority.

### Task 5 — Synchronize public trust copy and measurement

Files:

- Modify `app/methodology/page.tsx`
- Modify `app/privacy/page.tsx`
- Modify `app/terms/page.tsx`
- Modify `docs/product/measurement.md`
- Modify `lib/analytics.ts`
- Modify analytics tests

Checklist:

- [ ] Add a visible methodology FAQ: submissions are leads; Pundits.Pro independently reopens the public source and applies the same eligibility rules.
- [ ] Because the visible FAQ and FAQPage JSON-LD share the `FAQ` constant, verify both render the same new answer.
- [ ] Explain tip fields, Cloudflare storage, 90-day queue retention, and the absence of submitter identity in Privacy.
- [ ] State in Terms that submissions must point to lawful public sources and do not guarantee publication.
- [ ] Add only the events needed to answer whether the flow works: `tip_form_view`, `tip_submit`, `tip_success`, and `tip_error`.
- [ ] Analytics parameters may include placement, event slug, side context, and error type. They must never include the submitted URL, pundit name, timestamp hint, or any free text.
- [ ] Add operating metrics: received tips, duplicates, audit pass rate, promoted tips, event holes filled, and received-to-mailbox/audit latency.

### Task 6 — Verify and release

Checklist:

- [ ] Unit-test shared validation, Pages Function behavior, mailbox escaping/routing/idempotence, and analytics payloads.
- [ ] Browser-test direct, footer, dense-event, and empty-side event entry paths at 320 px, 390 px, and desktop.
- [ ] Keyboard-test labels, focus order, error recovery, pending state, and success focus.
- [ ] Confirm the form cannot write `data/*.json` and the endpoint has no read/list method.
- [ ] Confirm the visible methodology FAQ and rendered FAQPage JSON-LD agree.
- [ ] Run `npm test` and `npm run check` with `GITHUB_PAGES` unset.
- [ ] Provision the separate KV binding before production deployment; verify a real test tip reaches KV, imports once into a run file, and is processed by the correct Scout lane.
- [ ] Deploy through the documented Cloudflare Pages path and verify `/submit/`, one event CTA, footer entry, success state, and live privacy/methodology copy.

## Rollout

1. Keep accepting X DMs manually while the website work is built.
2. Soft-launch the footer link and event prompts without a homepage announcement.
3. Review after three settled slates: volume, duplicates, audit failures, promotions, coverage holes filled, and operational time.
4. If tips are useful, add the CTA to occasional @Pundits_ posts. Consider a separated header utility action only if the contextual and footer paths prove qualified demand. If tips are mostly spam or duplicates, tighten copy/routing before adding friction such as Turnstile.

## Out of scope

- Publishing fan picks or private predictions
- Automatic roster creation, mapping, grading, or promotion
- Public submitter credit or identity storage
- Accounts, authentication, comments, voting, leaderboards, or rewards
- Automated X DM reading or replies
- A general backend or migration away from static editorial JSON
- Attachments, screenshots, pasted transcripts, or copyrighted uploads

## Implementation prompt

```text
Implement docs/superpowers/plans/2026-09-03-community-tip-intake.md in order.

Read AGENTS.md and the current canonical product, capture, roster, methodology, privacy, bot, run-template, Cloudflare, and release files named by the plan. Preserve all unrelated dirty-worktree changes, especially current EventCard/global CSS/accessibility work. Do not edit data/*.json.

Use test-first changes for the shared tip contract, Pages endpoint, and mailbox renderer. Community submissions are untrusted discovery leads only. The website must never receive GitHub credentials or write directly to Git. Scout must reopen the original public source; Audit and Promote ownership do not change.

Run npm test for logic/data work and npm run check for the completed route/UI/release change. Verify the visible methodology FAQ and FAQPage JSON-LD together before finishing.
```
