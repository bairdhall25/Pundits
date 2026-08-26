import type { Call, CallKind, Pundit, Sport } from "./types";

function mapped(call: Call): boolean {
  return Boolean(call.eventSlug && call.side);
}

export type BookFilter = {
  q: string;
  sport: "all" | Sport;
  kind: "all" | CallKind;
  mapping: "all" | "mapped" | "unmapped";
};

export const emptyBookFilter: BookFilter = {
  q: "",
  sport: "all",
  kind: "all",
  mapping: "all",
};

export function filterBook(
  calls: Call[],
  pundits: Pundit[],
  f: BookFilter
): Call[] {
  const byId = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const q = f.q.trim().toLowerCase();
  return calls.filter((c) => {
    const p = byId[c.punditId];
    if (!p) return false;
    if (f.kind !== "all" && c.kind !== f.kind) return false;
    if (f.mapping === "mapped" && !mapped(c)) return false;
    if (f.mapping === "unmapped" && mapped(c)) return false;
    if (f.sport !== "all" && p.sport !== "both" && p.sport !== f.sport) return false;
    if (!q) return true;
    const hay = [c.claim, c.subject, c.source, p.name, p.outlet]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
