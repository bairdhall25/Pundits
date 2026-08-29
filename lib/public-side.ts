import type { Event, Side } from "./types";

/** Fan-facing market label. Internal yes/no values must never reach public copy. */
export function publicSideLabel(event: Event, side: Side): string {
  if (event.kind !== "game") {
    return side === "yes" ? "Takes it" : "Against";
  }
  if (side === "yes") return event.awayTeam ?? "Away";
  return event.homeTeam ?? "Home";
}
