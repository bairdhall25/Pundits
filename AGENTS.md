# Pundits.Pro agent guide

This file applies to the entire repository.

## Read before substantial work

1. `docs/product/README.md`
2. `docs/product/current-context.md` for the concise business thesis, current risks, and order of operations.
3. `docs/README.md` when the task touches dated plans, audits, handoffs, or run logs.
4. The product document relevant to the task.
5. `docs/ROADMAP.md` for current priorities.
6. `docs/RUNBOOK.md` for data, publishing, URL, and deployment contracts.
7. `lib/types.ts` and the live `data/*.json` files when work touches product objects.
8. `bots/README.md` when work touches capture, grading, promotion, or recap operations.

Live code and JSON win when an older brief or snapshot disagrees. Treat dated handoffs, audits, and plans as historical context unless a current canonical document adopts the decision.

## Product invariants

- Pundits.Pro records public sports predictions from named people, preserves the source and frozen market context, and closes the loop with a result.
- The core fan object is a verifiable pick, not an article, betting recommendation, generic assertion, or model output.
- A mapped pick requires a named pundit, verbatim public quote, source URL, source date, real event, explicit side, and objective grading rule.
- On game events, YES means the away team and NO means the home team. Do not change that mapping.
- The displayed price is a frozen Kalshi snapshot. It is not live odds and does not imply the pundit placed a bet.
- Empty sides are honest product truth. Do not invent or stretch a pick to make a card look complete.
- Data and published URLs are append-only. Do not delete or rename a published event, call, pundit, or route. Add a 301 when a slug correction is unavoidable.
- The season suffix is the year the regular season starts, including playoffs played in the following calendar year.
- Static JSON in this repository is the current editorial record. Do not introduce a backend casually.

## Data and agent ownership

- Scout finds candidates and records evidence; it does not edit `data/*.json`.
- Audit reopens and checks proposed sources.
- Grader proposes results and evidence; it does not edit `data/*.json`.
- Promote is the only bot role authorized by the operating workflow to edit `data/*.json` and publish promoted changes.
- Recap reads the ledger and creates summaries; it does not edit `data/*.json`.
- The application templates pick stories. Bots do not write standalone SEO articles for mapped calls.

Do not edit editorial JSON during product or UI work merely to improve a screenshot, fill an empty side, or satisfy an implementation fixture.

## Development discipline

- Preserve unrelated user changes in a dirty worktree.
- Make the smallest change that advances the approved product outcome.
- Protect source evidence, canonical URLs, redirects, structured data, feeds, and permanent archives.
- Keep the green/black broadcast identity unless a rebrand is explicitly authorized.
- Treat `Live`, `Tonight`, `Open`, `Pending`, and `In play` as distinct states. Never call an unresolved season-long prediction live or in play.
- Run `npm test` for data or logic changes. Run `npm run check` for route, UI, SEO, build, or release-affecting changes.
- Production is Cloudflare Pages project `pundits`; keep `GITHUB_PAGES` unset for the production-style build.

## Public methodology synchronization

- Treat `app/methodology/page.tsx`, including its visible FAQ and FAQPage JSON-LD, as a public product contract rather than static marketing copy.
- Before finishing any change to product behavior, data semantics, or user-facing claims, perform a methodology impact check. Update the methodology in the same change when the work alters pick eligibility, evidence or attribution requirements, event/side mapping, frozen-market semantics, grading or result states, record calculations, correction handling, or roster criteria.
- When a changed claim is repeated in About, Terms, metadata, structured data, feeds, or tests, update those surfaces together so they do not contradict the methodology. Keep the canonical Pundits.Pro entity description in `lib/site.ts` aligned with the public explanation.
- Do not edit the methodology for an internal refactor, fixture change, or visual-only adjustment that leaves public behavior and product truth unchanged.
- In the final verification for an affected change, confirm both the visible methodology copy and the rendered structured FAQ, then run the repository check required for that change class.

## Product-stage discipline

The present goal is to build dense coverage of events fans care about, prove the grading loop, and establish repeatable distribution before optimizing monetization. Do not optimize raw pick or page count. New features should improve at least one of: event-level coverage, grading speed, fan comprehension, repeat use, search discovery, social distribution, or operating reliability.

Accounts, comments, live odds, betting controls, a general backend, additional sports, and complicated scoring remain out of scope until explicitly unparked.
