# Images

The site pre-renders a branded card for every event, take, and pundit — a 1200×630 OG card and a 1080×1920 story card. `cards.json` carries the exact URL for each. Generated imagery is allowed only inside the Tier 2 brand spec below — nowhere else.

**Image hard rule:** never AI-generate a real person's face or likeness; never fabricate a screenshot or stat graphic. When in doubt: real card or no image.

## Tier 1 — Receipts (mandatory)

Any post about a specific pundit, pick, event, or result attaches the pre-rendered card from `cards.json` — `ogCard` for feed posts, `storyCard` for vertical formats. Post the image natively. `pageUrl` goes in the first self-reply, never in the post body. If attaching the image fails, fall back to a link post (X renders the OG card from the link) and note the failure in the run summary.

### Flowers treatments

The Flowers uses the same verified Tier 1 take card and never generates or alters a pundit's likeness. The treatment is a restrained presentation layer; the pundit and exact call remain the subject.

- **Broadcast Spotlight:** lead with a compact `CALLED IT` result treatment, final score, frozen probability, and a small flowers mark. Keep the existing black-and-neon-green broadcast identity.
- **Quote-First:** make the pundit's face, name, and faithful quote fragment the dominant elements. Result details and the flowers mark are supporting proof.

Use `GIVE THEM THEIR FLOWERS` or a small `💐` badge, not floral backgrounds, bouquets covering the card, greeting-card styling, or victory effects that obscure evidence. Until a dedicated rendered Flowers card exists in `cards.json`, use the standard take card and carry the Flowers treatment in the post copy; do not improvise an AI-generated result graphic.

## Tier 2 — Editorial (fenced creativity)

Allowed only for posts about no specific pundit, pick, or result — week hype, discussion starters, polls. Generated imagery must follow this brand spec exactly, as hard requirements:

- Ground: `#0a0a0a`.
- Accent: `#39ff14`.
- Off-white text: `#f5f5f5`.
- Condensed bold uppercase headline type (Oswald-like).
- Dark background, light text, generous margins.
- No human faces or likenesses.
- No team logos.
- No numbers of any kind.
- No screenshot look-alikes.
- No betting slips.

Two ready prompt templates, with slots to fill:

- *"Minimal dark sports graphic, matte near-black background (#0a0a0a), a single bold condensed uppercase headline in off-white reading '{SHORT LINE, MAX 6 WORDS}', one thin neon-green (#39ff14) underline accent, subtle film grain, no people, no logos, no numbers, no small text, no screenshot look-alikes, no betting slips."*
- *"Dark editorial poster, near-black (#0a0a0a), abstract geometric goal-line/field texture in charcoal (#141414), condensed uppercase headline '{SHORT LINE}' in off-white, one neon-green (#39ff14) chevron accent, no people, no logos, no numbers, no small text, no screenshot look-alikes, no betting slips."*

## Tier 3 — Text

Default for replies and conversational posts. Attach a Tier 1 card only when it directly answers the thread.

## Decision rule

- About a real pick, pundit, event, or result → Tier 1.
- A successful call selected for The Flowers → Tier 1 take card with Broadcast Spotlight or Quote-First treatment; standard take card until that treatment is rendered by the site.
- About the vibe of the week → Tier 2 or no image.
- A reply → Tier 3.
