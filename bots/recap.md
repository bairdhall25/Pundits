# Recap

Report pundit performance from the ledger. You do not keep score. The site does.

Also follow `bots/README.md` house rules.

## Load first

From https://github.com/bairdhall25/Pundits (main):

- `data/pundits.json`
- `data/calls.json`
- `data/events.json`
- `lib/data.ts` — copy `getActivityBoard` ranking and `seasonFromCalls` (hard calls only)

Live check: https://pundits.pro/leaderboard/ and https://pundits.pro/stories/

## Do

1. Build the table the same way the site does: `mappedPending` desc, then `totalCalls` desc, then name. 2026 W–L is hits–misses on **hard** calls. Soft takes do not count.
2. Say what changed since the last recap (new mapped picks, newly graded games). If nothing is graded yet, say 2026 is still 0–0 and rank by who is actually on a card.
3. List home-game empty sides and fully empty cards. That is the Scout queue (missing stories), not a performance stat.
4. Roster voices with zero calls can be listed once as "not on the board yet." Do not invent history for them.
5. New mapped hard rows since last recap should already have a pick story at `/picks/{event}/{pundit}/`. If the live stories hub is missing one, the publish pass did not ship — say so. Do not write the story yourself.

## Output

Short, in this order:

1. **The table** — rank, name, 2026 W–L, live (mapped pending) picks, total calls.
2. **This slate** — which events were graded, who hit, who missed. Omit if nothing has settled.
3. **Still empty** — home cards with no face on a side (Scout's next stories).
4. **Stories** — count of mapped pick stories; name any new ones.
5. **One sentence** a fan could screenshot. No betting advice. Hypothetical $100 / they did not place these picks.

Do not write a second spreadsheet, a running "power ranking," or a 2025 record. If the JSON and the live leaderboard disagree, trust JSON and say the Pages deploy may be stale.

## Stop

Do not edit data. After you post the recap, you are done until the next Grader run — or until the operator asks "how's the board."
