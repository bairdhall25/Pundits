import type { Call, Event } from "./types";

/** True once at least one pick has graded; gates the season record column. */
export function hasGradedRecords(
  board: Array<{ season2026: { wins: number; losses: number } }>
): boolean {
  return board.some((p) => p.season2026.wins + p.season2026.losses > 0);
}

/**
 * Net result of a pundit's graded mapped calls: hypothetical $100 at the
 * frozen price of their side. Hit pays 100 * (100 - cents) / cents; a miss
 * loses the stake. Calls without a frozen price are skipped.
 */
export function settledNetDollars(
  punditId: string,
  calls: Call[],
  events: Event[]
): number {
  const bySlug = new Map(events.map((e) => [e.slug, e]));
  let net = 0;
  for (const c of calls) {
    if (c.punditId !== punditId) continue;
    if (!c.eventSlug || !c.side) continue;
    if (c.status !== "hit" && c.status !== "miss") continue;
    if (c.status === "miss") {
      net -= 100;
      continue;
    }
    const event = bySlug.get(c.eventSlug);
    const cents = c.side === "yes" ? event?.yesCents : event?.noCents;
    if (cents == null || cents <= 0) continue;
    net += Math.round((100 * (100 - cents)) / cents);
  }
  return net;
}

export function formatNetDollars(net: number): string {
  if (net > 0) return `+$${net}`;
  if (net < 0) return `−$${Math.abs(net)}`;
  return "$0";
}
