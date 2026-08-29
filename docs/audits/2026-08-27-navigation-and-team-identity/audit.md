# Pundits navigation and team-identity audit

Status: Evidence

Date: 2026-08-27

## Scope

Combined UX and screenshot-based accessibility audit of the rendered local Pundits app, focused on:

- navigation across markets, takes, sports, and pundit-ranking surfaces;
- the role of team identity and logos in game, futures, story, and market-detail views;
- desktop and mobile discoverability.

## Overall verdict

The visual language is distinctive and the core market-versus-pundit concept reads quickly. The information architecture is the weaker layer: the global navigation currently gives equal weight to content formats (`Stories`, `The Book`), sports (`NCAAF`, `NFL`), a landing view (`Picks`), and an outcome view (`Leaderboard`). Team identity is almost entirely textual, so matchup cards ask the user to read before they can recognize.

## Step 1 — Home / Picks

Health: **Good visual energy; overloaded as a directory.**

![Home](./01-home.png)

- Strong: the broadcast typography, black/green palette, cents, and pundit faces make the product feel ownable.
- Risk: the header nav and the second jump-link nav substantially repeat one another while using different ordering and grouping.
- Risk: team names carry all matchup recognition. Pundit faces are visually memorable, but the teams—the subjects of the picks—are not.
- Recommendation: keep the homepage as `Picks`, but make sport a local filter (`All`, `College Football`, `NFL`) instead of a peer global destination.

## Step 2 — NCAAF slate

Health: **Clear within the page; weak cross-product orientation.**

![NCAAF slate](./02-ncaaf.png)

- Strong: the page separates games and futures and preserves the market-card language.
- Risk: `NCAAF` behaves like both a destination and a filter. The same concept appears again in Stories and The Book filters.
- Risk: repeated dark cards have nearly identical silhouettes. Logos would dramatically improve scanning without changing the established style.
- Recommendation: put a 28–36 px team mark beside each team name in game cards and a 32–40 px single-team mark on futures cards. Retain names as text.

## Step 3 — Stories / individual takes

Health: **Useful feed and filters; overlaps conceptually with The Book.**

![Stories](./03-stories.png)

- Strong: this is the best browsing surface for “who said what,” and search/filter controls are visible.
- Risk: `Stories` sounds editorial, but the content is a structured feed of takes. `The Book` contains the same underlying objects in denser form, making the difference hard to predict before clicking.
- Recommendation: rename this primary object to `Takes` (or retain “Stories” only as an editorial subsection). Move the dense ledger into this area as a `Feed / Ledger` view toggle rather than a separate global destination.

## Step 4 — The Book

Health: **Powerful utility; too prominent for its level of abstraction.**

![The Book](./04-book.png)

- Strong: exhaustive filters and provenance make it useful for deep inspection.
- Risk: its brand name does not reveal that it is the complete takes ledger. It competes with Stories while being a denser view of much of the same content.
- Recommendation: treat `The Book` as a named advanced view inside `Takes`, with explanatory copy such as `The Book — every tracked take`.

## Step 5 — Market detail

Health: **Strong evidence and source structure; low team recognition.**

![Market detail](./05-pick-detail.png)

- Strong: price source, frozen date, side split, quoted pundits, and source links establish trust.
- Risk: the two teams have no visual anchors, so the large green/white price areas read before the matchup identity.
- Recommendation: use a matchup lockup above the market—logo, team name, price on each side—and preserve pundit portraits only inside the supporting evidence rows. This establishes a clean visual grammar: **team logo = subject; face = speaker**.

## Step 6 — Mobile home navigation

Health: **Usable, but priority is unclear.**

![Mobile home](./06-home-mobile.png)

- Strong: primary targets are approximately touch-sized and the active route has `aria-current` in the implementation.
- Risk: `More` hides Leaderboard and The Book, while NCAAF and NFL remain first-class. The header and horizontal jump rail create two compact navigation systems immediately above the content.
- Recommendation: expose only object-level global navigation on mobile (`Picks`, `Takes`, `Pundits`, `Search/More`) and keep the sport switch within Picks/Takes.

## Step 7 — Mobile Stories

Health: **Good content layout; controls consume the first screen.**

![Mobile Stories](./07-stories-mobile.png)

- Strong: the first item clearly connects a pundit, stance, market, and price.
- Risk: three tab groups plus search occupy substantial vertical space. League is repeated in global navigation and again as a filter.
- Recommendation: remove league from global navigation, keep the local filter, and collapse secondary sort controls behind a single `Filter & sort` action after the most-used sport switch.

## Recommended information architecture

### Global navigation

1. **Picks** — markets and matchups; the homepage.
2. **Takes** — every individual claim, with Feed and Ledger (`The Book`) views.
3. **Pundits** — leaderboard by default, with roster/search available.
4. **More** — methodology, about, and low-frequency utilities.

### Local filters

- Sport: `All`, `College Football`, `NFL`.
- Market type: `Games`, `Futures`.
- Takes-specific: `Latest`, `By game`, plus search and status/mapping filters.

This separates **what the object is** from **how it is filtered**.

## Team-logo system

1. Add stable team IDs and `logo` metadata to the event/team model; do not key logo lookup from display names.
2. Use logos in three deliberate sizes: 24 px inline labels, 32–40 px cards, and 48–64 px detail headers.
3. Use pundit portraits and team logos together, but with separate jobs: faces identify the speaker; logos identify the subject.
4. Keep team names visible. When adjacent text already names the team, use empty alt text on the logo to avoid duplicate screen-reader announcements.
5. Use a consistent official/licensed asset source, transparent crops, and a neutral fallback mark only when an asset is genuinely unavailable.

## Highest-impact sequence

1. Reframe the global nav around `Picks`, `Takes`, and `Pundits`.
2. Merge Stories and The Book as two views of Takes.
3. Add team IDs/logo metadata and introduce logos on game cards and market detail first.
4. Extend logos to futures and take rows.
5. Re-test mobile navigation, keyboard focus, 200% zoom/reflow, and screen-reader announcements.

## Evidence limits

This audit is based on current desktop and mobile screenshots plus rendered DOM structure. It does not establish WCAG compliance. Keyboard order, screen-reader output, contrast ratios, motion behavior, and zoom/reflow beyond the captured mobile viewport still need hands-on verification.
