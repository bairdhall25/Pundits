# Open-pick language implementation plan

Status: Implemented

Date: 2026-08-29

## Goal

Stop presenting unresolved predictions as if their underlying events are underway. Display a call with `status: "pending"` as `Open`; retain `Hit` and `Miss` for settled calls; reserve `Live` and `In play` for a future event state backed by actual game-state data.

## Scope

- Change the shared status formatter from `Live` to `Open` for pending calls.
- Replace user-facing counts and prose such as `Live picks`, `live expert picks`, and `still live` with `Open picks`, `open expert picks`, and `still open`.
- Make story-feed status copy use the shared formatter rather than a second inline mapping.
- Update share descriptions and regression expectations.
- Correct internal comments and test descriptions when they use `live` to mean merely unresolved.

This plan does not add real-time scores, kickoff detection, a `live` data state, or a backend.

## Product contract

| Stored call status | Public label | Meaning |
| --- | --- | --- |
| `pending` | `Open` | The prediction has not settled. The event may be in the future, underway, or awaiting authoritative settlement. |
| `hit` | `Hit` | The prediction graded correctly. |
| `miss` | `Miss` | The prediction graded incorrectly. |

`Live` or `In play` may only be introduced when the product has authoritative event-state data. It must not be inferred from `status: "pending"`.

## Implementation

1. Update `statusLabel` and its unit expectation.
2. Use `statusLabel` in `StoryFeed` and update count labels on the leaderboard, pundit profile, and table peek.
3. Update weekly-archive, metadata, explanatory, and share copy.
4. Search rendered source for remaining cases where `live` means unresolved.
5. Run `npm test`, `npm run build`, and `npm run verify:static`.

## Acceptance criteria

- No public surface calls a pending prediction `Live` or a `live pick`.
- Existing legitimate uses such as `not live odds`, `alerts are not live yet`, and `aria-live` remain intact.
- Pending, hit, and miss formatter tests pass.
- The production-style static build and route verifier pass.
