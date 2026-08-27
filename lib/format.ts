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
