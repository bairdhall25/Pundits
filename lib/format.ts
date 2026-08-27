const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatCents(cents: number | null): string {
  if (cents == null) return "—";
  return `${cents}¢`;
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
  if (event.season) return `${event.season} season`;
  return null;
}
