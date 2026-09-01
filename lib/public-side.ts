import { formatCents } from "./format";
import type { Event, Side } from "./types";

/** Fan-facing market label. Internal yes/no values must never reach public copy. */
export function publicSideLabel(event: Event, side: Side): string {
  if (event.kind !== "game") {
    return side === "yes" ? "Takes it" : "Against";
  }
  if (side === "yes") return event.awayTeam ?? "Away";
  return event.homeTeam ?? "Home";
}

export function mappedStakeLine(
  event: Event,
  side: Side,
  cents: number | null
): { label: string; line: string } {
  const label = publicSideLabel(event, side);
  return {
    label,
    line: `${event.title} · ${label} @ ${formatCents(cents)} · hypothetical $100`,
  };
}
