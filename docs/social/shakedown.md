# Shakedown — the first weeks of manual review

For the operator, not the bots. No bot instruction file points here. Run this routine daily for the first week or two after go-live, then relax to weekly spot checks once the output is boringly on-brand.

The system's key property: **every fix is a doc commit.** The bots fetch their instructions fresh at the start of every job, so nothing gets re-pasted into Grok.

## Daily (~10 minutes, game days especially)

1. **Tone check.** Skim the @Pundits_ timeline against `voice.md` `## Sounds like us / not us`. Tone drift is the most common bot regression. Off-brand → edit `voice.md`.
2. **Verify one number.** Pick any post with a stat or price and confirm it on the pundits.pro page it should come from. The brand is "we don't invent numbers" — this is the highest-value check in this file. An unverifiable number is an incident, not a nit: pull the post, find what the bot read, tighten the rule it slipped past.
3. **Image check.** Every post about a specific pick/pundit/event carries a pre-rendered card (Tier 1), never a generated image. Any generated image looks like the `images.md` brand spec: dark ground, neon green accent, no faces, no numbers.
4. **Tag check.** Every original-post tag must be an earned Roll Call, Flowers, or Milestone under `tagging.md`, use an approved handle, and put the tagged person at the center of the copy and card. A tagged miss, routine Freeze, or mention block is an incident to correct.

## Reply Guy, in context

- Open a handful of reply threads and read them as the thread's audience would. The failure mode: replies that are technically on-rules but read as spam because the thread didn't want a stat. If a thread reads that way → tighten `reply-guide.md` `## Targets, in order`.
- Confirm caps and disengagement: one exchange per thread, no arguing, under the daily cap.

## Weekly

- **Run reports.** Check the Poster's job output for skips and attach failures. Repeated attach failures mean the link-only fallback is kicking in and reach is suffering — fix the attach path before blaming the content.
- **Freshness.** Confirm game-day deploys actually happened (`generatedAt` in `https://pundits.pro/social/cards.json` should be same-day on game days).
- **Reweight.** Note which archetypes earned replies/quote-posts and adjust `schedule.md`. The schedule is a starting hypothesis, not doctrine.
- **Earned-tag experiment.** Compare Roll Call, Flowers, and Milestone separately against untagged originals: pundit/outlet reposts, replies, quote-posts, profile visits, and referral visits where analytics are available. Keep smaller creators and national personalities separate. Separate paid reach and do not infer success from impressions alone.

## Where fixes go

| Symptom | File to edit |
|---|---|
| Off-brand tone, wrong register | `voice.md` |
| Wrong/ugly images, generated when a card existed | `images.md` |
| Wrong post shape for the moment | `post-patterns.md` |
| Guessed, excessive, or unearned tags | `tagging.md` |
| Spammy or mistargeted replies | `reply-guide.md` |
| Wrong cadence, wrong day emphasis | `schedule.md` |
| Bot touching things it shouldn't | `bots/poster.md` / `bots/reply.md` hard rules |
