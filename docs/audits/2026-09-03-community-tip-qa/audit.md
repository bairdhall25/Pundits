# Community tip intake QA

Status: Evidence

Date: 2026-09-03  
Viewport: 1280 × 720, Codex in-app browser  
Build: local Cloudflare Pages preview from the production static export

## Verdict

The local community-tip experience passes its core UX, accessibility, API, and persistence checks. At audit time, production deployment was blocked because the remote `PUNDITS_TIPS` KV namespace and the corresponding `wrangler.toml` binding did not exist.

Follow-up: resolved on 2026-09-03 in `codex/community-tip-wip` at `620ab47`. Dedicated production and preview namespaces now exist and are declared in `wrangler.toml`. The form now requires only the public source link; pundit, event, and location hints are optional and source-only tips remain visible in the Scout mailbox. Deployment and a live post-deploy smoke test are still pending.

## Audit scope

User goal: find a public pick Pundits.Pro missed, send the original public source with enough context for Scout, and understand that submission does not publish a pick.

Accessibility target: clear labels and recovery, keyboard-usable navigation, visible focus, and a perceivable confirmation state. This was a focused audit, not a full WCAG conformance assessment.

## Walkthrough

1. Event entry — the Clemson–LSU page presents a contextual “Send the source” prompt without promoting the intake form into a betting or publication control. Evidence: `01-event-prompt.png`.
2. Context transfer — the CTA opens `/submit/` with the canonical event prefilled and a visible “For this card” banner. Evidence: `02-prefilled-form.png`.
3. Validation — submitting blank fields adds specific inline errors, marks both required inputs invalid, announces a form-level recovery message, and focuses the source-link field. Evidence: `03-validation.png`.
4. Ready state — a real public X URL, named pundit, event, and source cue can be reviewed before submission. Evidence: `04-filled-form.png`.
5. Confirmation — the API response replaces the form with a focused status region that says Scout will verify the tip and repeats the Audit/Promote boundary. Evidence: `05-success.png`.
6. Alternate entry — “Submit a source” is available in the global footer and routes to a neutral, unprefilled form. Evidence: `06-footer-entry.png`.
7. Coverage targeting — an event with an empty side asks specifically for a Wisconsin pick and sends `side=yes`; a settled event renders no prompt. Evidence: `07-empty-side-target.png`.
8. Global navigation — the More menu exposes “Submit a source” as a one-click destination, uses menu/menuitem semantics, closes with Escape, and restores focus to the More trigger. Evidence: `08-more-menu.png`.

## Confirmed strengths

- The source-first framing is consistent across the CTA, form, confirmation, methodology, Privacy, and Terms.
- “A submission is a lead, not a published pick” is explicit before submit; the confirmation reinforces the same operating contract.
- Contextual event and side hints reduce Scout sorting work without letting a visitor publish or map a pick.
- Required inputs have visible labels, native required state, `aria-invalid`, and error descriptions.
- Invalid submission focuses the first problem field; success focuses a status region; the More menu supports Escape and focus return.
- The endpoint rejects unsupported methods, malformed fields, cross-origin posts, and oversized bodies, while silently accepting the honeypot path without queueing a lead.
- The submitted Wrighster example was persisted in local KV with the canonical event slug, source URL, placement, and discovery metadata.
- Browser console errors: none. Framework error overlays: none.

## Findings

### Release blocker — remote queue is not provisioned

`wrangler kv namespace list` currently returns only `PUNDITS_EMAIL`, and `wrangler.toml` declares only that binding. The handler deliberately returns `503 {"error":"configuration"}` when `PUNDITS_TIPS` is absent. Provision a dedicated production namespace (and preview namespace if previews will accept tips), bind it as `PUNDITS_TIPS`, then run one live submit → KV → mailbox smoke test before deployment.

Resolution: fixed in `620ab47`. Cloudflare now lists `PUNDITS_TIPS` and `PUNDITS_TIPS_preview`; the production and preview bindings are present in `wrangler.toml`.

### Verification gap — narrow responsive states were not captured

This run visually inspected the desktop flow at 1280 × 720. The selected in-app browser did not expose viewport resizing, so the 320 px and 390 px states in the product roadmap were not rechecked here. This is an evidence gap, not a confirmed defect.

### Verification gap — no full assistive-technology conformance claim

The audit confirmed semantic labels, error relationships, status roles, keyboard dismissal, and focus movement. It did not run a screen reader session or a numerical color-contrast scan, so it does not claim full WCAG conformance.

## Automated verification

- `npm run check`: passed.
- Vitest: 35 files, 326 tests passed.
- Static build: `/submit/` generated successfully.
- Static verification: 33 required files passed.
- Preview verification: 127 pages and 127 decoded images passed.
- Endpoint probes: GET 405; invalid fields 400; cross-origin POST 403; honeypot 200; oversized request 413.

## Recommendation

Keep the current UX. Provision and bind `PUNDITS_TIPS`, then perform the live queue-to-mailbox smoke test. After that, the remaining QA work is a narrow mobile/assistive-technology regression pass rather than a redesign.
