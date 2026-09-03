# Engagement events implementation plan

Status: Active plan

Date: 2026-08-31

> **For Codex:** paste the prompt at the bottom. Do not invent extra events, quotes in payloads, or a new analytics vendor.

**Goal:** Fire the five named engagement events in `docs/product/measurement.md` through the existing Google Analytics `gtag` helper, with stable object IDs and no PII.

**Architecture:** Extend `lib/analytics.ts` so email-interest and product events share one `gtag` sender. Add a tiny client `TrackView` for destination-page opens and click handlers on source, share, and filter controls. Static export stays; GA still loads only in production (`app/layout.tsx`). No backend, no cookies beyond GA, no quote text, no emails.

**Tech Stack:** Next.js static export, existing `gtag` in `app/layout.tsx`, Vitest.

**Spec:** `docs/product/measurement.md` (Required event vocabulary). Privacy copy in `app/privacy/page.tsx` must stay true.

## Global Constraints

- Event names and params are the vocabulary in `measurement.md`. Do not add siblings.
- Params are string IDs only: `event_slug`, `pundit_id`, `status`, `surface`, `source_type`, `artifact_type`, `filter_name`, `filter_value`. Never email, quote text, display names, or URLs.
- Existing `email_interest_*` events stay as implemented and must not include PII.
- `gtag` is production-only today. Tracking helpers must no-op when `window.gtag` is missing.
- Do not edit `data/*.json`, methodology, About, or Terms.
- Do not introduce a new analytics SDK.
- `npm test` after helper work. `npm run check` after UI wiring.

## File map

- Modify: `lib/analytics.ts`
- Modify: `lib/email-signup.test.ts` (keep PII assertion; add product-event tests here or in `lib/analytics.test.ts`)
- Create: `lib/analytics.test.ts` if the email test file is getting crowded
- Create: `components/TrackView.tsx`
- Modify: `components/ShareButton.tsx`
- Modify: `components/EventCard.tsx` (source link + event title click)
- Modify: `components/Receipt.tsx` (source link)
- Modify: `components/StoryBoard.tsx`
- Modify: `components/BookLedger.tsx`
- Modify: `components/StoryFeed.tsx` (optional; take-page mount covers destination)
- Modify: `app/picks/[slug]/page.tsx`
- Modify: `app/picks/[slug]/[punditId]/page.tsx`
- Modify: `app/privacy/page.tsx`
- Do not modify: `app/methodology/page.tsx`

## Event contract

| Event | When | Params |
|---|---|---|
| `event_detail_open` | EventCard permalink click; also mount on `/picks/{slug}/` | `event_slug`, `sport`, `surface` |
| `pick_story_open` | StoryFeed card click; also mount on `/picks/{slug}/{punditId}/` | `event_slug`, `pundit_id`, `status`, `surface` |
| `source_open` | Click `Open source →` or Kalshi/price-source link | `event_slug`, `pundit_id`, `source_type` (`evidence` or `kalshi`) |
| `share_intent` | Share sheet action (native share, copy, tweet, save image, save story) | `artifact_type` (`event` \| `take` \| `pundit`), `event_slug`, optional `pundit_id`, `status` |
| `filter_use` | Discrete tab/select change, not search keystrokes | `surface` (`stories` \| `book`), `filter_name`, `filter_value` |

`surface` values: `home`, `ncaaf`, `nfl`, `event`, `stories`, `take`, `book`.

Click + mount can both fire for the same visit. That is intended: `surface=home` answers homepage-to-event rate; `surface=event` answers total event opens including search.

---

### Task 1: Shared gtag helper and product event types

**Files:**
- Modify: `lib/analytics.ts`
- Create: `lib/analytics.test.ts`
- Modify: `lib/email-signup.test.ts` only if `analyticsParams` signature changes; keep the no-PII email test green

**Interfaces:**
- Produces: `trackEvent(event: string, params: Record<string, string>): void`
- Produces: typed builders that return the exact param objects below
- Keeps: `trackEmailInterest` behavior unchanged

- [ ] **Step 1: Write failing tests** in `lib/analytics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  engagementParams,
  eventDetailOpenParams,
  filterUseParams,
  pickStoryOpenParams,
  shareIntentParams,
  sourceOpenParams,
} from "./analytics";

describe("engagement params", () => {
  it("emits event_detail_open ids without names or quotes", () => {
    const params = eventDetailOpenParams({
      eventSlug: "clemson-at-lsu-2026",
      sport: "ncaaf",
      surface: "home",
    });
    expect(params).toEqual({
      event_slug: "clemson-at-lsu-2026",
      sport: "ncaaf",
      surface: "home",
    });
    expect(JSON.stringify(params)).not.toMatch(/Pate|Clemson|quote|"@/i);
  });

  it("emits pick_story_open ids", () => {
    expect(
      pickStoryOpenParams({
        eventSlug: "unc-vs-tcu-2026",
        punditId: "finebaum",
        status: "miss",
        surface: "take",
      })
    ).toEqual({
      event_slug: "unc-vs-tcu-2026",
      pundit_id: "finebaum",
      status: "miss",
      surface: "take",
    });
  });

  it("emits source_open with evidence or kalshi only", () => {
    expect(
      sourceOpenParams({
        eventSlug: "unc-vs-tcu-2026",
        punditId: "finebaum",
        sourceType: "evidence",
      }).source_type
    ).toBe("evidence");
  });

  it("omits empty optional share fields", () => {
    const params = shareIntentParams({
      artifactType: "event",
      eventSlug: "clemson-at-lsu-2026",
    });
    expect(params).toEqual({
      artifact_type: "event",
      event_slug: "clemson-at-lsu-2026",
    });
    expect(params).not.toHaveProperty("pundit_id");
  });

  it("drops blank values from the gtag payload", () => {
    expect(engagementParams({ event_slug: "x", pundit_id: undefined })).toEqual({
      event_slug: "x",
    });
  });

  it("records filter_use without the search box", () => {
    expect(
      filterUseParams({
        surface: "stories",
        filterName: "kind",
        filterValue: "game",
      })
    ).toEqual({
      surface: "stories",
      filter_name: "kind",
      filter_value: "game",
    });
  });
});
```

- [ ] **Step 2:** `npx vitest run lib/analytics.test.ts` — expect FAIL (exports missing).
- [ ] **Step 3: Implement** in `lib/analytics.ts`. Keep email types. Add:

```ts
export type EngagementSurface =
  | "home"
  | "ncaaf"
  | "nfl"
  | "event"
  | "stories"
  | "take"
  | "book";

export function engagementParams(
  params: Record<string, string | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) out[key] = value;
  }
  return out;
}

export function trackEvent(
  event: string,
  params: Record<string, string | undefined>
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, engagementParams(params));
}

export function eventDetailOpenParams(input: {
  eventSlug: string;
  sport: string;
  surface: EngagementSurface;
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    sport: input.sport,
    surface: input.surface,
  });
}

export function pickStoryOpenParams(input: {
  eventSlug: string;
  punditId: string;
  status: string;
  surface: EngagementSurface;
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    status: input.status,
    surface: input.surface,
  });
}

export function sourceOpenParams(input: {
  eventSlug: string;
  punditId: string;
  sourceType: "evidence" | "kalshi";
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    source_type: input.sourceType,
  });
}

export function shareIntentParams(input: {
  artifactType: "event" | "take" | "pundit";
  eventSlug: string;
  punditId?: string;
  status?: string;
}) {
  return engagementParams({
    artifact_type: input.artifactType,
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    status: input.status,
  });
}

export function filterUseParams(input: {
  surface: "stories" | "book";
  filterName: string;
  filterValue: string;
}) {
  return engagementParams({
    surface: input.surface,
    filter_name: input.filterName,
    filter_value: input.filterValue,
  });
}
```

Refactor `trackEmailInterest` to call `trackEvent` if that stays behavior-identical. Do not put email addresses in any payload.

- [ ] **Step 4:** `npx vitest run lib/analytics.test.ts lib/email-signup.test.ts` — expect PASS.
- [ ] **Step 5: Commit** `feat: add engagement event param builders`

---

### Task 2: TrackView and wire destination opens

**Files:**
- Create: `components/TrackView.tsx`
- Modify: `app/picks/[slug]/page.tsx`
- Modify: `app/picks/[slug]/[punditId]/page.tsx`
- Modify: `components/EventCard.tsx` (title/permalink click)
- Modify: `components/StoryFeed.tsx` (card hit click)

**Interfaces:**
- Consumes: `trackEvent` + builders from Task 1
- Produces: `<TrackView event="event_detail_open" params={...} />` fires once on mount

- [ ] **Step 1:** `TrackView` is a client component:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackView({
  event,
  params,
}: {
  event: string;
  params: Record<string, string>;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(event, params);
  }, [event, params]);
  return null;
}
```

Pass a stable `params` object (inline literals from server pages are fine; they are serialized into the client component).

- [ ] **Step 2:** On the event page (`app/picks/[slug]/page.tsx`), render:

```tsx
<TrackView
  event="event_detail_open"
  params={eventDetailOpenParams({
    eventSlug: event.slug,
    sport: event.sport,
    surface: "event",
  })}
/>
```

On the take page:

```tsx
<TrackView
  event="pick_story_open"
  params={pickStoryOpenParams({
    eventSlug: event.slug,
    punditId: take.pundit.id,
    status: take.call.status,
    surface: "take",
  })}
/>
```

- [ ] **Step 3:** EventCard permalink clicks. `EventCard` is a server component today. Do not convert the whole card. Add a tiny client wrapper around the title `Link` **or** pass `onNavigate` through a `TrackLink` client component:

```tsx
"use client";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function TrackLink({
  href,
  className,
  ariaLabel,
  event,
  params,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  event: string;
  params: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event, params)}
    >
      {children}
    </Link>
  );
}
```

Use it for:
- Event title permalink: `event_detail_open` with `surface` = `home` on `app/page.tsx`, `ncaaf` on the NCAAF slate, `nfl` on the NFL slate. If EventCard cannot see the surface, add an optional `surface` prop defaulting to `event`.
- StoryFeed `.feed-hit` Link: `pick_story_open` with `surface: "stories"`, `event_slug`, `pundit_id`, `status` from `StoryCard`.

Home EventCard already has `permalink`. Pass `surface="home"` from `app/page.tsx`. Sport slates pass `ncaaf` / `nfl`.

- [ ] **Step 4:** `npx vitest run` — still PASS. No new JSON.
- [ ] **Step 5: Commit** `feat: track event and take opens`

---

### Task 3: source_open, share_intent, filter_use

**Files:**
- Modify: `components/Receipt.tsx` — Receipt is a server component; wrap the source `<a>` with a client `TrackAnchor`
- Modify: `components/EventCard.tsx` — same for `Open source →` and Kalshi/price-source
- Modify: `components/ShareButton.tsx`
- Modify: `lib/share-link.ts` / `SharePayload` if the button needs `eventSlug` / `punditId` / `status` / `artifactType` (add optional fields; do not put them in the tweet text)
- Modify: `components/StoryBoard.tsx`
- Modify: `components/BookLedger.tsx`

- [ ] **Step 1:** `TrackAnchor` client helper (can live next to `TrackLink`):

```tsx
"use client";
import { trackEvent } from "@/lib/analytics";

export function TrackAnchor({
  href,
  event,
  params,
  children,
}: {
  href: string;
  event: string;
  params: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent(event, params)}
    >
      {children}
    </a>
  );
}
```

Receipt `Open source →` → `source_open` `source_type=evidence`.
EventCard evidence link → same.
EventCard `Price source` / Kalshi → `source_type=kalshi`. Use the take's `pundit_id` when the click is on a face row; on the event-level Kalshi link use the first mapped pundit on the event **or** omit `pundit_id` only if you extend the builder. Prefer passing the face's `pundit.id` from `FaceRow`. For the event-level freeze link, skip `source_open` unless a single pundit is in context — do not invent an id. Measurement requires `pundit_id`; so only face-level evidence links and take-page Receipt/Kalshi-in-grade-sheet must fire.

- [ ] **Step 2:** ShareButton. Extend `SharePayload` in `lib/share-link.ts` with optional `artifactType`, `eventSlug`, `punditId`, `status`. Existing tweet/url fields unchanged. In `copyLink`, `nativeShare`, tweet click, and save buttons:

```ts
trackEvent("share_intent", shareIntentParams({
  artifactType: share.artifactType ?? "take",
  eventSlug: share.eventSlug ?? "",
  punditId: share.punditId,
  status: share.status,
}));
```

Do not fire if `eventSlug` is missing. Wire `sharePayload(...)` call sites on take, event, and story cards with those ids. If a pundit-profile share has no event, skip `share_intent` rather than sending a fake slug.

- [ ] **Step 3:** Filters. In `StoryBoard`, when sport/kind/group tabs change (not the search input):

```ts
trackEvent("filter_use", filterUseParams({
  surface: "stories",
  filterName: "sport" | "kind" | "group",
  filterValue: nextValue,
}));
```

In `BookLedger`, fire on Sport/Kind/Mapping `<select>` change only. Do not fire on search keystrokes or Reset unless Reset is a discrete click (`filter_name=reset`, `filter_value=all`).

- [ ] **Step 4:** Privacy (`app/privacy/page.tsx`). Change the analytics sentence so it is still true:

> We use Google Analytics to see which pages people open and which product events they trigger (event opens, take opens, source clicks, shares, and filters). Those events use object IDs, never email addresses or quote text. Our email-form events also never include your address.

Do not claim we collect names. Do not edit methodology.

- [ ] **Step 5:** `npm test`. Then `npm run check`.
- [ ] **Step 6: Commit** `feat: track source, share, and filter events`

---

### Task 4: Verify the contract

- [ ] Confirm `lib/analytics.ts` event name strings are exactly `event_detail_open`, `pick_story_open`, `source_open`, `share_intent`, `filter_use`.
- [ ] Grep the diff for `gtag(` and `trackEvent(` — no quote fields, no `email`.
- [ ] `npm run check`.
- [ ] If a browser is available, production-style `npm run build` + open a take page, click Open source, open Share, toggle a Stories filter. Dev mode will no-op without `gtag`; that is expected. Do not add a debug console logger.

## Out of scope

- Search Console, IndexNow (already on deploy), title CTR tests
- Email alerts, accounts, heatmaps, session replay
- Changing GA measurement ID
- Firing on search-box keystrokes
- Methodology FAQ

## Codex prompt

```
You are implementing docs/superpowers/plans/2026-08-31-engagement-events.md on the Pundits.Pro repo.

Read first: docs/product/measurement.md (Required event vocabulary), lib/analytics.ts, app/layout.tsx (gtag is production-only), app/privacy/page.tsx, AGENTS.md.

Do the tasks in order. TDD for Task 1. Do not edit data/*.json, methodology, About, or Terms. Do not add analytics events beyond the five named ones plus existing email_interest_*. Never put email, quote text, or display names in payloads.

After Task 3 run npm test. After Task 4 run npm run check.

Commit after each task with feat: one-liners. Leave unrelated dirty files (app/about, app/methodology, docs/competitive, docs/analysis) untouched.
```
