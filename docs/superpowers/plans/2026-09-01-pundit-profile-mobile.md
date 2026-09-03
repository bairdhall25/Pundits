# Pundit profile mobile hierarchy implementation plan

Status: Historical

Date: 2026-09-01

Implementation note: Completed 2026-09-01. The profile is receipt-first, individual records are sample-aware, mapped rows use fan-facing side language, touch targets were enlarged, empty internal copy was removed, and the alert copy was tightened. `npm run check` passed with 217 tests and static verification; browser checks passed at 320 px, 390 px, and desktop.

## Goal

Make a mobile pundit profile answer the fan's question in this order: who is this, what did they pick, where is the receipt, and what is their graded sample. Preserve the portrait-led broadcast identity, source evidence, frozen price, permanent routes, and honest empty states.

Audit evidence: [`docs/audits/2026-09-01-wrighster-profile-mobile/audit.md`](../../audits/2026-09-01-wrighster-profile-mobile/audit.md)

## Dependency and scope

This plan is a focused follow-on to `docs/superpowers/plans/2026-09-01-post-grade-comprehension.md`. That plan already owns public side labels and removal of `YES`/`NO` and `at risk` from `CallCard`. Implement its relevant record/public-side work first or merge carefully; do not create a second competing side-label helper.

The production Wrighster fixture is ahead of this checkout. Use the saved audit screenshots as the visual reference and existing local profiles for tests. Do not edit `data/*.json` to recreate the screenshot.

Out of scope:

- New profile routes or a backend
- Accounts or working alerts beyond the existing early-interest form
- Live odds or betting controls
- Editorial data changes
- A rebrand or new type system
- Changes to pick eligibility, side mapping, grading, or hypothetical-return math

Methodology impact: none. This changes hierarchy and public labels without changing product semantics. Recheck this if implementation changes what counts as a record or mapped pick.

## Target information order

1. Breadcrumb and identity
2. Open-pick count and graded sample/record
3. Tracked mapped picks and receipts
4. Hypothetical record
5. More takes, only when present
6. Pick-alert early-access form

## Task 1 — Make the hero compact and sample-aware

Files:

- Modify `app/pundits/[id]/page.tsx`
- Modify `components/PunditAvatar.tsx`
- Modify `app/globals.css`
- Test `lib/records.test.ts` if a record-count helper is added

Steps:

- [ ] Replace the global `showRecord` gate on the profile with this pundit's graded mapped sample. Reuse the record-count helper from the post-grade plan when available; otherwise add one client-safe helper in `lib/records.ts` and test pending, hit, miss, unmapped, and other-pundit cases.
- [ ] Show `W–L · N graded` when the individual sample is non-zero.
- [ ] Show `No graded picks yet` when the sample is zero. Do not print `0–0` alone.
- [ ] Keep `Open picks` as the other primary statistic.
- [ ] Remove `Hypothetical $100` from the hero so the same dollar value is not repeated above the receipt.
- [ ] Give the hero avatar a profile-specific responsive size: 160 px below 480 px and the existing 192 px at larger widths. Do not change row, feed, peek, or receipt avatars.
- [ ] Replace the utility-only hero wrapper with named profile classes where needed so the mobile layout can be verified without brittle selector chains.
- [ ] Set `.share-toggle` to a minimum height of 44 px while preserving the current share menu.

Acceptance:

- At 390 px, identity, both primary stats, and the `Tracked picks` heading fit in the first viewport.
- At 320 px, the two primary stats remain on one row with no orphaned third statistic.
- Long names still wrap without colliding with Share.

## Task 2 — Put the receipt before the market analysis

Files:

- Modify `app/pundits/[id]/page.tsx`
- Modify `components/CallCard.tsx`
- Modify `app/globals.css`

Steps:

- [ ] Move the mapped-call list directly below the hero under `Tracked picks`.
- [ ] Preserve the original quote, source, source date, public side, frozen cents, status, and link to the permanent take page.
- [ ] Add a profile-facing `CallCard` option that hides the internal `Hard` badge for mapped receipts. Keep the kind available on views where distinguishing an unmapped take is useful.
- [ ] Keep `Open`, `Hit`, and `Miss`; do not introduce `Live` or `In play` for pending calls.
- [ ] Make the full event/receipt block the link target, not only its text.
- [ ] Use a clear two-line receipt action: matchup and picked side/frozen price first, then `View receipt →`. Reuse the public-side helper owned by the post-grade plan.
- [ ] Give Source and the receipt action a minimum 44 px touch height without turning the card into an oversized button.
- [ ] Ensure adjacent badge text has an accessible separator or label instead of announcing as `hardOpen`.
- [ ] For no mapped calls, retain an honest compact state such as `No tracked picks yet.`

Acceptance:

- The first mapped card begins within the first 700 CSS pixels at 390 px.
- The exact quote and frozen cents remain visible on the profile.
- Source and receipt actions are keyboard reachable and at least 44 px high at 320 px and 390 px.
- No public profile row prints `YES`, `NO`, `at risk`, or `Hard` for a mapped receipt.

## Task 3 — Demote and clarify hypothetical performance

Files:

- Modify `app/pundits/[id]/page.tsx`
- Modify `app/globals.css`
- Modify `scripts/verify-static.mjs`

Steps:

- [ ] Move the dollar summary below `Tracked picks`.
- [ ] Rename `Implied book` to `Hypothetical record`.
- [ ] Keep the existing frozen-Kalshi disclaimer and the statement that this is not a bet the pundit placed.
- [ ] Show open hypothetical exposure only when it is non-zero.
- [ ] When the pundit has no graded mapped picks, replace a bare settled `$0` with `No settled picks yet`.
- [ ] When the pundit has graded mapped picks, show settled net dollars together with the graded sample so `$0` cannot be mistaken for no history.
- [ ] Do not change `settledNetDollars` math.

Acceptance:

- Market context remains visible but never precedes the first receipt.
- A zero-sample pundit cannot be mistaken for a 0–0 performer with a settled bankroll.
- Static verification asserts the new heading and ensures it follows `Tracked picks` in rendered profile HTML.

## Task 4 — Remove the internal empty state and tighten the alert promise

Files:

- Modify `app/pundits/[id]/page.tsx`
- Modify `lib/email-signup.ts`
- Test `lib/email-signup.test.ts`
- Modify `scripts/verify-static.mjs`

Steps:

- [ ] Render the secondary-takes section only when `rest.length > 0`.
- [ ] Rename the populated section from `Other takes` to `More takes`.
- [ ] Remove the public phrase `No unmapped takes on file.`
- [ ] Keep the profile-specific heading `Get new {name} picks.`
- [ ] Replace research-oriented body copy with a direct benefit, for example: `Join the early list for an email when new picks are available. Alerts are not live yet.`
- [ ] Use `Request pick alerts` or another honest early-access button label; do not imply alerts already operate.
- [ ] Update the existing placement-specific copy tests.

Acceptance:

- A profile with no secondary takes moves directly from the hypothetical record to the alert form.
- The alert form still has a visible label, 44 px controls, privacy copy, status region, and hidden honeypot.

## Task 5 — Verification and release checks

Files:

- Modify `scripts/verify-static.mjs`
- Optionally add a focused browser-smoke script only if the repository's existing release checks can run it reliably

Automated checks:

- [ ] Add or update unit tests for individual graded-sample display logic.
- [ ] Add static assertions for `Tracked picks`, `Hypothetical record`, the new alert copy, and absence of `No unmapped takes on file`.
- [ ] Preserve existing canonical URL, structured data, OG image, evidence-source, and email-interest assertions.
- [ ] Run `npx vitest run lib/records.test.ts lib/public-side.test.ts lib/email-signup.test.ts`.
- [ ] Run `npm run check`.

Browser checks against a local production-style build:

- [ ] At 320 × 700, confirm no horizontal overflow, two hero stats on one row, a 44 px Share trigger, and the full receipt row as the tap target.
- [ ] At 390 × 844, confirm `Tracked picks` appears in the first viewport and the first receipt precedes `Hypothetical record`.
- [ ] Open Share and confirm the menu remains inside the viewport and every item is at least 44 px high.
- [ ] Tab through Share, Source, receipt, email, submit, and Privacy; confirm visible focus and logical order.
- [ ] Check 200% zoom/reflow and validate that the profile does not require horizontal scrolling.
- [ ] Inspect the accessibility tree for separated status labels and a correctly named email field.
- [ ] Recheck desktop so the existing 160 px avatar column, page width, share placement, and card hierarchy remain intact.

## Suggested implementation order

1. Complete or reconcile the overlapping post-grade record/public-side tasks.
2. Implement the compact hero and per-pundit sample state.
3. Reorder the receipt and hypothetical record sections.
4. Improve CallCard actions and labels.
5. Remove the empty secondary section and update alert copy.
6. Run unit/static checks, then the 320 px, 390 px, zoom, keyboard, and desktop browser pass.
