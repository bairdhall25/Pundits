# Experience principles

Status: Canonical

## 1. Feel like sports media, not a database

Lead with the matchup, recognizable faces, stakes, time, disagreement, and result. Filters, schemas, market mechanics, and provenance support the experience but should not dominate the first scan.

The fan-facing hierarchy is:

> Event and stakes → who picked each side → frozen price → current/result state → quote and reasoning → evidence and methodology

## 2. One glance should answer the fan's question

A scan card should communicate:

- What event is this?
- When does it happen?
- Who picked each side?
- Is one side honestly empty?
- How surprising was the pick at the frozen price?
- Is it pending, currently underway, a hit, or a miss?

The detail page can expose the complete quote, source, date, exact market mapping, price source, methodology, and correction history.

## 3. Personality creates attention; evidence earns trust

Named voices, faces, outlets, rivalries, and disagreements make the product interesting. Exact quotes, source links, timestamps, frozen prices, and consistent grading make it credible. Neither half is sufficient alone.

Do not attribute a claim to a generic staff identity when the source supports a named speaker. Do not pin a guest's statement on a host or show.

## 4. Empty is better than false

An empty side tells the truth about the current corpus. A vague, inferred, off-topic, or misattributed pick damages the entire product. Design the empty state to be compact and honest; solve coverage through capture, not fabrication.

## 5. Market context is a ruler, not the product

The frozen Kalshi price makes a call concrete and shows how bold or conventional it was at capture time. Keep the price visible, but describe it in sports language. Exact YES/NO mechanics and hypothetical-return calculations belong deeper in the experience.

Never imply the displayed number is a live sportsbook line or that the pundit placed a wager.

## 6. Time words have strict meanings

- `Pending` or `Open`: the outcome has not settled. On a game card, `Open` means there is not yet a box score.
- `Tonight`: the event is expected to resolve within roughly 24 hours.
- `Live now` or `In play`: the underlying event is actually underway. Do not infer this from a pending pick or a past kickoff date.
- `Final`: the game has a box score. If mapped picks are still pending, label it `Final · Grading`. If every mapped pick is graded, keep `Final` and show Hit/Miss on the faces.
- `Hit` or `Miss`: the individual mapped pick has been graded.

Season-long futures are not live merely because they are unresolved. A future live product should separate `Live now`, `Tonight`, and `Long range` rather than mixing them into one open-picks feed.

## 7. Results are the payoff

The original quote and price must remain visible after grading. A result should feel like a receipt, not a silent database mutation. Hits, misses, upsets, disagreements, and record changes should become prominent, dated, shareable moments.

## 8. Use progressive disclosure without hiding the hook

### Scan

Teams, kickoff, faces, empty side, frozen price, compact state.

### Understand

Short quote or stance, disagreement, plain-language market context, current or final event state.

### Verify

Full quote, source link and date, exact side mapping, ticker and price source, freeze timestamp, methodology, grading evidence, and correction trail.

## 9. Editorial hierarchy beats exhaustive equality

Not every record deserves the same visual weight. Promote:

- Events resolving soon.
- Recognizable personalities.
- Two-sided disagreements.
- Bold underdog calls.
- Newly graded hits and misses.
- Calls with strong source evidence and clear stakes.

Long-range or low-interest records remain searchable without crowding out today's story. Homepage hero and this-week boards prefer open games; finished games are compact receipts, not the lead.

## 10. Consistency is a product feature

Counts, records, status labels, attribution, event results, and URLs must reconcile across the homepage, event page, take story, pundit profile, leaderboard, weekly archive, feed, sitemap, and social card. A polished interface cannot compensate for contradictory records.

## 11. A record is not proof of skill

Always show the number of graded picks behind a record. Before meaningful sample sizes exist, present activity and receipts rather than declaring someone the best, most accurate, or predictive. Shared shows, copied consensus, event selection, and market difficulty make raw win rates non-independent and potentially misleading.

The leaderboard may rank open activity before grading and display records afterward, but performance claims, minimum-sample eligibility, and price-adjusted comparisons require deliberate methodology and enough real results.
