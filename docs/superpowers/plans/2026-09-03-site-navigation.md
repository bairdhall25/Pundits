# Global site navigation implementation plan

Status: Implemented locally; release pending

Date: 2026-09-03

## Implementation result

The shared navigation model, Base UI `More` menu, grouped footer, Storybook coverage, static assertions, and responsive browser tests are implemented. Targeted navigation verification passes at 320px, 390px, and desktop widths, including keyboard dismissal/focus return, exact-page semantics, touch targets, and overflow checks.

The community-submission destination is reserved for a follow-up release after its production queue binding is provisioned. This navigation release does not expose `/submit/` before that flow can accept submissions successfully.

## Goal

Make every important Pundits.Pro destination easy to find from any page while preserving the compact green/black broadcast header and keeping The Book correctly nested as a Takes view.

Audit evidence: [`docs/audits/2026-09-03-site-navigation/README.md`](../../audits/2026-09-03-site-navigation/README.md)

## Locked decisions

1. Keep `Picks`, `Takes`, and `Pundits` as the three primary product destinations.
2. Keep The Book as the compact Takes view. Do not promote it to a fourth primary product section.
3. Add one `More` control to the header so sport pages, Takes views, and trust pages are globally reachable without crowding the primary row.
4. Turn the footer into the complete site map, grouped by user intent rather than presented as one legal/company row.
5. Preserve the current logo, typography, colors, sticky behavior, disclaimer, routes, and product language.
6. Do not change editorial JSON, URL structure, pick semantics, market semantics, grading, or methodology copy.

## Target navigation model

### Header

- Logo → `/`
- Picks → `/`
- Takes → `/stories/`
- Pundits → `/leaderboard/`
- More menu:
  - Browse: College Football, NFL
  - Takes views: Quote feed, Compact ledger
  - About: About, Methodology, Contact

The `More` menu exposes child and utility destinations; it does not create new top-level product states. Privacy and Terms remain in the footer.

### Footer

- Explore: Picks, College Football, NFL
- Follow the record: Takes, Compact ledger, Pundits
- About: About, Methodology, Contact
- Legal: Privacy, Terms
- Existing ownership and frozen-market disclaimer beneath the navigation groups

## Task 1 — Centralize navigation destinations and active-state rules

Files:

- Create `lib/site-navigation.ts`
- Modify `components/NavLinks.tsx`
- Modify `components/SiteFooter.tsx`

Steps:

- [ ] Define client-safe navigation data for the three primary destinations, the grouped More menu, and the grouped footer.
- [ ] Keep the existing section-match rules: Picks owns home, sport slates, and event pages; Takes owns the feed, compact ledger, and individual take pages; Pundits owns the table and profiles.
- [ ] Separate visual section activity from exact-page semantics.
- [ ] Set `aria-current="page"` only when a link's destination is the current URL. Descendant routes may retain the green section styling but must not announce a different URL as the current page.
- [ ] Use `next/link` for internal routes and a normal anchor only for the contact mail link.
- [ ] Keep route strings trailing-slash consistent with the current static-export contract.

Acceptance:

- No header link announces `current page` when activating it would navigate somewhere else.
- Header and footer destinations cannot silently drift because both consume the shared navigation definitions.
- Published routes and redirects remain unchanged.

## Task 2 — Add the accessible More menu

Files:

- Modify `components/NavLinks.tsx`
- Modify `components/SiteHeader.tsx` only if the new control needs a wrapper or label
- Modify `app/globals.css`
- Add `components/SiteHeader.stories.tsx` if Storybook's current Next navigation mock supports pathname states cleanly

Steps:

- [ ] Add a text-labeled `More` trigger after the three primary links.
- [ ] Use Base UI Menu so Escape, outside click, focus return, arrow keys, and menu semantics are handled consistently with the existing Base UI pilot.
- [ ] Group menu items under visible `Browse`, `Takes views`, and `About` labels.
- [ ] Keep `Compact ledger` visually subordinate to Takes; do not label The Book as a separate primary section.
- [ ] Give the trigger and every menu item at least a 44px touch height.
- [ ] Keep the menu inside 320px and 390px viewports and above page content without clipping against the sticky header.
- [ ] Preserve the existing green active state, focus outline, and black broadcast treatment.
- [ ] Remove reliance on an invisible horizontally scrolling header row; all four controls must remain discoverable at 320px.

Acceptance:

- Every core product or trust destination is reachable from the header in no more than two interactions.
- The menu works with pointer, Enter/Space, arrow keys, Escape, and Tab without trapping focus.
- Opening or closing it does not move the page or cause horizontal overflow.

## Task 3 — Rebuild the footer as a site map

Files:

- Modify `components/SiteFooter.tsx`
- Modify `app/globals.css`
- Add `components/SiteFooter.stories.tsx`

Steps:

- [ ] Replace the flat footer row with the four groups in the target navigation model.
- [ ] Give each group a visible heading and a uniquely labeled navigation landmark.
- [ ] Keep the brand/ownership block first in reading order and the frozen-market disclaimer last.
- [ ] Use a responsive grid: four groups on wide screens, two columns where space is limited, and a readable stacked or two-column layout at phone widths.
- [ ] Make footer links at least 44px high on touch layouts while keeping the desktop footer compact.
- [ ] Preserve the current Contact destination, disclaimer wording, copyright, and legal links.
- [ ] Avoid accordions in the footer; the complete site map should remain visible without another interaction.

Acceptance:

- Picks, College Football, NFL, Takes, Compact ledger, Pundits, About, Methodology, Contact, Privacy, and Terms are one-click footer destinations from every page.
- Link groups remain scannable at 320px, 390px, tablet, and desktop widths.
- The footer contains no duplicate labels that point to conflicting destinations.

## Task 4 — Add navigation regression coverage

Files:

- Modify `tests/e2e/ui-pilot.pw.ts`
- Modify `scripts/verify-static.mjs`
- Add focused unit tests only if active-state matching is extracted into a pure helper

Automated checks:

- [ ] Assert the primary header destinations and More trigger exist on home, sport, take, Book, leaderboard, and pundit-profile routes.
- [ ] Assert exact URLs receive `aria-current="page"` and descendant-only section matches do not.
- [ ] Open the More menu with keyboard input, traverse items, close with Escape, and verify focus returns to the trigger.
- [ ] Run axe against the header with the menu closed and open.
- [ ] Assert all footer groups and destinations are present in static home output.
- [ ] Assert header and footer touch targets are at least 44px on mobile projects.
- [ ] Extend the no-horizontal-overflow test to include the open menu and footer at 320px and 390px.
- [ ] Preserve existing canonical, sitemap, route, social-card, and permalink assertions.

Browser checks:

- [ ] At 320px, verify all primary links and More are visible without horizontal scrolling.
- [ ] At 390px, verify the menu stays within the viewport and the footer groups reflow cleanly.
- [ ] At desktop width, verify the menu aligns with the header and the footer groups form a balanced grid.
- [ ] Tab through the header, menu, footer groups, and contact link with a visible focus indicator.
- [ ] Check representative descendant routes so active styling and current-page announcements agree.
- [ ] Check 200% zoom/reflow for clipping, overlap, and horizontal scrolling.

## Task 5 — Final verification and release handoff

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run test:ui`.
- [ ] Run `npm run storybook:build` if header/footer stories are added.
- [ ] Run `npm run check` for the complete UI and static-export verification.
- [ ] Open the finished local build in the Codex in-app browser at mobile and desktop widths for approval.
- [ ] Confirm `data/*.json`, permanent routes, redirects, structured data, feeds, and public product claims are unchanged.
- [ ] Methodology impact check: none expected because this is navigation and accessibility work only. Reopen the check if implementation changes any public product claim or behavior.
- [ ] Deploy through the documented Cloudflare Pages workflow only after explicit release approval, then run the live smoke check.

## Suggested implementation order

1. Centralize route definitions and correct active-state semantics.
2. Implement and verify the header More menu.
3. Implement the grouped footer and responsive layout.
4. Add automated and static regression checks.
5. Run the full repository check and browser QA.
6. Present the local preview, then deploy only when approved.

## Out of scope

- New routes, sports, accounts, comments, or backend services
- Editorial or market-data changes
- Rebranding the navigation labels or visual identity
- Changing The Book into a separate product section
- Altering the email-interest form or footer disclaimer
- Changing pick eligibility, side mapping, grading, records, or frozen-price semantics
