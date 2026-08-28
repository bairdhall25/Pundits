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

The homepage, pick-detail, and pundit-profile pages can collect emails for a future pick-alert product. Alerts are not live. There is no Pundits backend; a third-party form collector stores submissions.

Set these **public** build-time values (never put secrets in `NEXT_PUBLIC_*`):

```
NEXT_PUBLIC_EMAIL_SIGNUP_ENDPOINT=https://provider.example/form-id
NEXT_PUBLIC_EMAIL_SIGNUP_PROVIDER=Provider name
NEXT_PUBLIC_EMAIL_SIGNUP_RETENTION=Retention and deletion statement
NEXT_PUBLIC_PRIVACY_CONTACT=owner@example.com
```

If any of those are missing, the form stays disabled and shows `Email signup is temporarily unavailable.` It will not fake a successful signup. Unset the endpoint to deactivate collection after a build/deploy.

Hypothetical $100. Kalshi snapshot, not live. Not affiliated with Kalshi or these pundits. These are mapped picks, not bets they placed.
