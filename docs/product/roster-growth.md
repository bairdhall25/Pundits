# Roster growth — validation by association

Date: 2026-09-01. Operator-agreed.

This is **who may join the roster**, not which games go on `/`. Homepage featuring is `docs/product/featured-games.md`. Capture doctrine is `docs/capture-policy.md`. Scout still does not mint ids. Promote still does not auto-roster unless the operator asked this pass. Audit still reopens the quote. A real photo is still required.

## Why Candidates existed

Two different fears got stacked:

1. Thin cards would dilute `/`. Featured display + league pages (`/ncaaf/`, `/nfl/`) now hold those cards. That fear is closed.
2. The roster is the product’s identity. That fear remains. We do not scrape the universe, and we do not treat every named host as a pundit.

## What a pundit is here

A **pundit** is a named public sports voice who picks winners as independent analysis across the sport.

A **team analyst** is not a pundit, by definition: their job is covering or advocating one team (beat reporter, Locked On *[Team]* host, team-affiliate homer). A first-person “Auburn wins” from the Auburn show is expected. It is not the same object as Finebaum or a Herd fill-in picking across the slate.

## Team podcasts as a source

Team shows can be huge. Use them as a **source** when the speaker is an independent pundit (including a guest) or already on the roster.

Do not use “it was on Locked On Auburn” as the reason to *roster the host*. The show is not the defect. The team-analyst role is.

## How the roster grows (the loop)

1. Scout hunts the standing factories in `docs/pick-shows.md` because the current roster is on them (Cover 3, The Herd, Finebaum, On3, GameDay, McAfee, Eisen, and the rest of that map).
2. A **named guest or fill-in** on those shows who makes a first-person SU is the next class of voice fans already heard next to the roster. That is **validation by association**.
3. Audit reopens the URL. Real photo required. Empty `photoUrl=needed` stays a Candidate until a file exists in `public/photos/`.
4. If the operator asks this Promote pass to roster them: confirm a rights-safe photo, then run `node scripts/roster-add.mjs apply docs/runs/YYYY-MM-DD-roster-{id}.json`. That writes the pundit, the mapped hard SUs, the X handle, the pick-shows factory voice, and `docs/roster-pipeline.json`. Off-home if the game is not featured. League page may show a thin card. `/` only if `docs/product/featured-games.md` says so.
5. Later hunts treat them as **Intake** and search them independently (X `from:{handle}`, Shows on their factory). Do not hand-patch a subset of those files.

That is organic expansion: association → roster → independent search. It is not a crawl of every local archive.

## Stage vs roster

| Speaker | Where they appeared | Stage | Roster? |
|---|---|---|---|
| Jason McIntyre fill-in on The Herd, first-person Rams/Texans SU | Roster factory | Candidate (or Intake once rostered) | Eligible — association |
| Tom Fornelli / Bud Elliott on Cover 3 LOCKS | Roster factory | Candidate (already on add-list) | Eligible — association |
| Rostered voice on Locked On LSU as a guest | Team podcast as source | Intake | Already a pundit |
| Independent CFB voice guesting on a team show, SU on a Dispatch game | Team podcast as source | Candidate | Eligible if they pick as an independent, not as that team’s analyst |
| Locked On Auburn host picking Auburn | Team show, team role | Candidate at most; note `team-analyst` | **No** — not a pundit |
| Caller, unnamed staff, “the show likes Miami” | Any | Dropped | No |

Radio-pilot fallback may still *record* a named host SU in Candidates so the operator can see it. That does not authorize roster growth. Do not add team analysts to `docs/add-list.md` to launder them into association.

## What this does not change

- First-person SU bar, YES = away, Audit, freeze, append-only URLs.
- Scout never writes `data/`.
- Promote does not invent photos or ids unless the operator asked this pass.
- Homepage waterfall. A new rostered face on Miami does not auto-feature Miami.
