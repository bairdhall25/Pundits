const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function statusLabel(status: "pending" | "hit" | "miss"): string {
  if (status === "hit") return "Hit";
  if (status === "miss") return "Miss";
  return "Open";
}

export function verdictClass(status: "pending" | "hit" | "miss"): "hit" | "miss" | "open" {
  return status === "pending" ? "open" : status;
}

/** Verdict chips pair a glyph with the word so color is never the only signal. */
export function statusChipText(status: "pending" | "hit" | "miss"): string {
  if (status === "hit") return "✓ Hit";
  if (status === "miss") return "✗ Miss";
  return "Open";
}

export function formatCents(cents: number | null): string {
  if (cents == null) return "—";
  return `${cents}¢`;
}

/** Kalshi cents ≈ implied win probability. Translate to sportsbook-style American odds. */
export function americanOdds(cents: number | null | undefined): string | null {
  if (cents == null || cents <= 0 || cents >= 100) return null;
  const p = cents / 100;
  if (p > 0.5) return `-${Math.round((p / (1 - p)) * 100)}`;
  return `+${Math.round(((1 - p) / p) * 100)}`;
}

export function formatShortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return null;
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

export function formatAsOf(sourcedAt: string | null): string | null {
  const day = formatShortDate(sourcedAt);
  return day ? `as of ${day}` : null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatGameDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = MONTHS[Number(m[2]) - 1];
  const day = Number(m[3]);
  if (!month) return null;
  const weekday = WEEKDAYS[new Date(Date.UTC(year, Number(m[2]) - 1, day)).getUTCDay()];
  return `${weekday} ${month} ${day}, ${year}`;
}

export function kickoffClock(kickoff: string | null | undefined): string | null {
  if (!kickoff) return null;
  const clock = kickoff.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/i, "").trim();
  return clock || null;
}

/** 2026 NFL/CFB regular season plays into 2027. Never a single calendar year. */
export function seasonSpan(season: number | null | undefined): string | null {
  if (season == null || !Number.isFinite(season)) return null;
  return `${season}–${String(season + 1).slice(-2)}`;
}

export function seasonLabel(season: number | null | undefined): string | null {
  const span = seasonSpan(season);
  return span ? `${span} season` : null;
}

function easternDate(at: Date): string {
  // en-CA gives YYYY-MM-DD, matching kickoffDate's format
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(at);
}

export function kickoffTag(
  kickoffDate: string | null | undefined,
  now: Date
): "Today" | "Tomorrow" | null {
  if (!kickoffDate) return null;
  if (kickoffDate === easternDate(now)) return "Today";
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (kickoffDate === easternDate(tomorrow)) return "Tomorrow";
  return null;
}

export function formatGameWhen(event: {
  kickoffDate?: string | null;
  kickoff?: string | null;
  network?: string | null;
  season?: number | null;
}): string | null {
  const date = formatGameDate(event.kickoffDate);
  const clock = kickoffClock(event.kickoff);
  const bits = [date, clock, event.network].filter(Boolean);
  if (bits.length) return bits.join(" · ");
  return seasonLabel(event.season);
}
