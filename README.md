# Pundits

Public CFB pundit analytics. Homepage is Kalshi-mapped event cards (YES vs NO). Leaderboard is the table. The Book is every take.

Live: https://pundits.pro/

## Development

- `npm run dev` starts the local Next.js server.
- `npm test` runs the data, ledger, and SEO test suite.
- `npm run check` runs tests, builds the production static export, and verifies routes, canonical URLs, the sitemap, and Cloudflare redirects.
- `npm run verify:live` checks the deployed routes and a representative 301 redirect.

## Deployment

Production is the existing Cloudflare Pages project `pundits`. GitHub Actions is CI-only and does not deploy.

1. Run `npm run check`.
2. Confirm the current branch is the intended Cloudflare deployment branch (`main` for production; any other branch creates a preview).
3. Run `npm run deploy`.
4. Run `npm run verify:live` and complete the release checks in `docs/RUNBOOK.md`.

The deploy command uploads the generated `out/` directory with Wrangler. `GITHUB_PAGES` must remain unset so canonical paths do not gain the retired `/Pundits` prefix.

Grok Bot instructions: `bots/`.

## Email early-access list

The site stores early-list addresses in a Cloudflare KV cell (`PUNDITS_EMAIL`) via `POST /api/email-interest`. Email is the key; placement/scope/timestamp is the value. No Mailchimp, no Formspree, no Pundits mailer. Alerts are not live. Duplicate emails keep the first row and still return success.

Dump keys:

```
npx wrangler kv key list --namespace-id cda9bfd1f31f441297a3082a8875363b --remote
```

Set `NEXT_PUBLIC_EMAIL_SIGNUP_DISABLED=true` and rebuild to hide the form. Optional `NEXT_PUBLIC_PRIVACY_CONTACT` overrides the GitHub issues deletion path.

Hypothetical $100. Kalshi snapshot, not live. Not affiliated with Kalshi or these pundits. These are mapped picks, not bets they placed.
