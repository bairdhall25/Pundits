# Pundits email early-access implementation plan for Grok

> Status: Historical implementation plan. Email capture now uses the Cloudflare KV endpoint described in `README.md`; the third-party collector prerequisites below are not current production instructions.

Date: 2026-08-28  
Audience: Grok Build / implementation agent  
Status: Historical; implemented with a different Cloudflare KV storage path

## Assignment

Add a small, honest demand test that collects email addresses from users who want notifications about new Pundits picks. This is an **early-access signup**, not a working notification product.

The implementation must preserve the static Next.js export. Do not add a Pundits backend, database, account system, email sender, notification scheduler, user preferences, or changes to the pick-capture bots. A third-party form collector will store submissions until the owner chooses an email product later.

Before editing:

1. Read this file, `README.md`, `bots/README.md`, `app/page.tsx`, `app/picks/[slug]/page.tsx`, `app/pundits/[id]/page.tsx`, `app/layout.tsx`, `app/globals.css`, `scripts/verify-static.mjs`, and `docs/RUNBOOK.md`.
2. Inspect `git status --short` and preserve all existing user changes and untracked files.
3. Run `npm test` and `npm run build`; report the baseline.
4. Confirm the owner has supplied both prerequisites in **Owner prerequisites**. If either is missing, implement behind the inactive configuration state, but do not claim production collection works.

## Product decision

We are testing whether a visitor will complete a meaningful action by submitting an email address. A CTA click is secondary evidence; a successfully stored email is the conversion.

Use one reusable form component in three contexts, ordered by expected reach and intent:

1. **Homepage:** between `.board-jump` and the first `Weekend`. This is the primary broad-intent test.
2. **Pick detail:** after `EventCard` and before `Expert takes`. This asks after the user has seen the pick, quote, and market context.
3. **Pundit profile:** after the identity/stats hero and before `Implied book`. This is the strongest contextual-intent test and should name the pundit.

Do not place the CTA in the global header, inside every event card, in `SiteFooter`, or in an automatic popup. Do not create a modal or bottom sheet for V1. These add interruption and complicate the experiment.

## Owner prerequisites

Production activation requires four owner-supplied public values. Do not invent them and do not commit secrets.

1. A public HTTPS form endpoint from a third-party collector that:
   - accepts browser POST requests from `https://pundits.pro`;
   - stores submissions and permits CSV/export;
   - accepts the metadata fields in this plan;
   - can disable automatic welcome/newsletter emails;
   - has acceptable retention, deletion, spam protection, and privacy terms.
2. The collector's public display name for the privacy notice.
3. A truthful retention/deletion statement supported by the collector and chosen owner policy.
4. A public contact email for privacy/deletion requests.

Configure them as:

```text
NEXT_PUBLIC_EMAIL_SIGNUP_ENDPOINT=https://provider.example/form-id
NEXT_PUBLIC_EMAIL_SIGNUP_PROVIDER=Provider name
NEXT_PUBLIC_EMAIL_SIGNUP_RETENTION=Retention and deletion statement
NEXT_PUBLIC_PRIVACY_CONTACT=owner@example.com
```

These are public build-time values in a static export. Never put an API secret, private token, provider password, or email-service credential in a `NEXT_PUBLIC_*` variable. Keep real values in the local/deployment environment, not committed `.env` files.

If the endpoint is missing, render a clearly disabled early-access control with `Email signup is temporarily unavailable.` Do not accept an address and do not show a fake success state.

## Copy contract

### Homepage

- Kicker: `PICK ALERTS · EARLY ACCESS`
- Heading: `Never miss a verified pick.`
- Body: `Join the early list for email alerts when new pundit picks are published. Alerts are not live yet.`
- Button: `Join the early list`

### Pick detail

- Kicker: `PICK ALERTS · EARLY ACCESS`
- Heading: `Get the next verified pick.`
- Body: `Join the early list for future Pundits email alerts. Alerts are not live yet.`
- Button: `Join the early list`

### Pundit profile

- Kicker: `PICK ALERTS · EARLY ACCESS`
- Heading: `Get new {pundit name} picks.`
- Body: `Tell us you want pundit-specific email alerts. Alerts are not live yet.`
- Button: `Join the early list`

### Shared form and states

- Visible label: `Email address`
- Placeholder: `you@example.com`
- Consent/reassurance: `We’ll only use this address for Pundits pick-alert updates. Unsubscribe anytime.`
- Pending button: `Joining…`
- Success heading: `You’re on the list.`
- Success body: `Pick alerts are not live yet—we’ll email you when they’re ready.`
- Invalid email: `Enter a valid email address.`
- Service error: `We couldn’t save your email. Try again.`

Do not say `notifications enabled`, `subscribed to {pundit}`, `we’ll alert you about every pick`, or give a delivery frequency. The system cannot yet honor those promises.

## Component contract

Create `components/EmailInterestForm.tsx` as a client component with this public shape:

```ts
type EmailInterestFormProps = {
  placement: "home" | "pick_detail" | "pundit_profile";
  scope: "all" | "event" | "pundit";
  scopeId?: string;
  subjectName?: string;
};
```

The component owns only the email field, submission state, provider POST, and analytics calls. It must not know about calls, events, pundit records, or notification delivery.

Submit these fields to the third-party endpoint:

```text
email
placement
scope
scopeId
pagePath
consentVersion=pick-alerts-early-access-v1
submittedAt=<ISO timestamp>
```

Requirements:

- Use native `type="email"`, `name="email"`, `required`, `inputMode="email"`, and `autoComplete="email"`.
- Normalize only for submission: trim whitespace and lowercase the address. Do not log the address.
- Use `fetch()` with the provider-supported browser format. Treat only a confirmed 2xx provider response as success.
- Abort or ignore stale responses when the component unmounts.
- Disable the input/button while submitting and prevent double submission.
- On success, replace the form controls with the confirmation while keeping the section heading/context visible.
- On error, keep the entered address so the user can retry.
- Do not persist the email in cookies, `localStorage`, the URL, GA, console logs, or repository files.
- Include the provider's honeypot field if supported, but keep it out of the accessibility tree and keyboard order.
- Do not attempt client-side deduplication. Deduplicate normalized addresses during analysis/export.

## Visual contract

Extend the existing visual system; do not redesign it.

- Add styles in `app/globals.css` using `--bg`, `--card`, `--ink`, `--muted`, and `--green`.
- Use a bordered `var(--card)` section with a restrained green accent, broadcast kicker/heading, and normal Inter body copy.
- Desktop: input and button may share a row, with the input taking remaining width.
- Mobile: stack input and button at full width.
- Input and button must be at least 44px high.
- Do not insert the form into `.board-jump` or another horizontal scroller.
- Keep the component compact enough that the homepage's first slate remains close to the initial viewport.
- Add visible hover, disabled, submitting, error, success, and `:focus-visible` states.
- Do not use green as the only success/error signal; include explicit text.

## Placement wiring

### `app/page.tsx`

Import the component and add:

```tsx
<EmailInterestForm placement="home" scope="all" />
```

Place it after `.board-jump` and before the first `Weekend` component.

### `app/picks/[slug]/page.tsx`

Add:

```tsx
<EmailInterestForm
  placement="pick_detail"
  scope="event"
  scopeId={event.slug}
  subjectName={event.title}
/>
```

Place it after the detail `EventCard` and before the conditional `Expert takes` section. It must render whether or not `takes.length` is nonzero.

### `app/pundits/[id]/page.tsx`

Add:

```tsx
<EmailInterestForm
  placement="pundit_profile"
  scope="pundit"
  scopeId={p.id}
  subjectName={p.name}
/>
```

Place it after the profile identity/stats hero and before `Implied book`.

Do not add the component to pick-story pages in this iteration. First measure the three placements above.

## Analytics contract

`app/layout.tsx` already loads Google Analytics in production with measurement ID `G-41GCD1K1PD`. Reuse that installation; do not add another analytics SDK.

Create a tiny client-safe helper, such as `lib/analytics.ts`, that guards for `window.gtag`. Add the minimal TypeScript declaration needed for `window.gtag`; do not use `any` throughout the component.

Send these events without email addresses or other PII:

- `email_interest_view` — once per rendered component when it first enters the viewport.
- `email_interest_submit` — after native validity passes and immediately before POST.
- `email_interest_success` — only after a confirmed provider success.
- `email_interest_error` — with `error_type` set to `validation`, `network`, `provider`, or `configuration`.

Include only:

```text
placement
scope
scope_id
page_path
consent_version
error_type (errors only)
```

Never send `email`, the email domain, form contents, or a hash of the email to GA.

Primary metric:

```text
unique email_interest_success users / unique email_interest_view users
```

Also inspect submit-to-success drop-off and results by placement. Treat 5%+ as a strong initial signal, 2–5% as directional, and below 2% as weak only after roughly 300–500 eligible unique views and after checking traffic source quality.

## Privacy notice

Create a small static `app/privacy/page.tsx` route. It should state, in plain language:

- what is collected: email address plus signup context and timestamp;
- purpose: measuring interest in and contacting users about Pundits pick alerts;
- that alerts are not live yet;
- the selected third-party form collector is the processor/storage location;
- retention/deletion approach supplied by the owner/provider;
- how to request deletion using `NEXT_PUBLIC_PRIVACY_CONTACT`;
- that the address is not sold and is not added to unrelated marketing lists.

Link `Privacy` from the reassurance text and add a small link in `SiteFooter`. Do not invent a company name, mailing address, retention period, processor, or contact address. If the necessary owner/provider facts are missing, keep production activation blocked and mark the exact placeholders in the implementation report rather than publishing false policy text.

## Tests and verification

Do not add a large browser-testing dependency for this small feature. Use the existing Vitest/build/static verification stack plus manual browser checks.

### Automated

1. Add focused unit tests for any pure payload/normalization helper:
   - trims and lowercases email for submission;
   - includes placement/scope/page/consent metadata;
   - never includes analytics PII.
2. Extend `scripts/verify-static.mjs` to verify:
   - homepage static output includes the early-access heading;
   - representative pick-detail and pundit-profile output include their contextual headings;
   - `privacy/index.html` exists and has a canonical URL;
   - existing required routes, redirects, and canonical assertions remain unchanged.
3. Run:

```text
npm test
npm run build
npm run verify:static
```

### Manual, with a test endpoint

Check at desktop width and 390px mobile width:

1. Homepage, representative pick detail, and representative pundit profile render without horizontal overflow.
2. Keyboard Tab reaches the visible label/input/button in a sensible order; focus is visible.
3. Empty submit and malformed email show native/custom validation without a provider request.
4. A valid submission shows `Joining…`, then success only after the collector confirms storage.
5. A rejected/failed request shows the service error and preserves the email for retry.
6. Double-clicking submit creates only one in-flight request.
7. Screen-reader status is announced with `role="status"` or an appropriate `aria-live` region.
8. Provider storage contains the email and correct placement/scope metadata.
9. GA DebugView receives view, submit, success, and error events without PII.
10. With the endpoint missing, the inactive state is honest and no fake capture occurs.

### Production-style release check

- Keep `GITHUB_PAGES` unset.
- Run `npm run check` before deployment.
- Deploy only after the owner confirms the collector, privacy contact, privacy text, and test submission.
- After deployment, make one owner-approved test signup, confirm the stored row and analytics event, then remove that test row in the provider UI.
- Run `npm run verify:live` and confirm `/`, one pick detail, one pundit profile, and `/privacy/`.

## Delivery sequence

Ship as three reviewable changesets. Do not mix in pick capture, grading, JSON edits, bot edits, route migrations, or unrelated design cleanup.

### Change 1 — Reusable form, configuration, analytics, and tests

Files expected:

- Create `components/EmailInterestForm.tsx`
- Create `lib/analytics.ts`
- Create a focused pure helper/test if useful
- Modify `app/globals.css`
- Modify `next.config.ts` only if required to expose non-secret build configuration cleanly

Gate: component states and unit tests work; missing configuration cannot fake success.

### Change 2 — Three placements and privacy notice

Files expected:

- Modify `app/page.tsx`
- Modify `app/picks/[slug]/page.tsx`
- Modify `app/pundits/[id]/page.tsx`
- Create `app/privacy/page.tsx`
- Modify `components/SiteFooter.tsx`

Gate: copy and placement match this plan; routes and static build remain intact.

### Change 3 — Static verification and production proof

Files expected:

- Modify `scripts/verify-static.mjs`
- Update `README.md` with the four public environment variables and how to deactivate collection
- No data or bot files

Gate: full check passes, responsive/manual checklist passes, provider stores a test row, and GA receives non-PII events.

## Explicit non-goals

- Sending any email now.
- Choosing instant, daily, or weekly frequency.
- Real pundit/event subscription rules.
- User accounts, login, saved preferences, or unsubscribe management UI.
- A Pundits API, database, server action, Cloudflare Function, Worker, KV, D1, or cron job.
- Editing `data/*.json`, `bots/*`, capture runs, grading, pick stories, slugs, redirects, navigation, or SEO behavior unrelated to the new privacy page.
- Adding the CTA to every route or card.
- Claiming that alerts are active.

## Definition of done

- A real address submitted on each placement is stored by the configured third-party collector with the correct metadata.
- The site never displays success without confirmed storage.
- The copy is explicit that alerts are not live.
- GA records the funnel without PII.
- The form is usable at 390px and by keyboard, with clear validation, pending, success, failure, and inactive states.
- A truthful privacy notice and deletion contact are available.
- Static export, existing routes, SEO, redirects, tests, and Cloudflare deployment remain green.
- No backend, database, email sender, bot edit, or pick-data mutation was introduced.

## Grok handoff prompt

Point Grok Build at this repository and say:

```text
Implement the approved early-access email demand test in:
docs/grok-email-early-access-implementation-plan-2026-08-28.md

Follow the plan exactly. Start by reporting git status and the npm test/build baseline. Preserve all existing user and untracked changes. Do not touch data/*.json or bots/*. Do not add a backend, database, email sender, accounts, notification scheduling, or fake success state. If the public form endpoint or privacy contact is missing, implement and verify the honest inactive configuration, list the exact owner prerequisite, and do not claim production email collection works.
```
