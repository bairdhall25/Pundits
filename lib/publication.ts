import { isoDay } from "./seo-dates";
import type { Call, Event } from "./types";

/**
 * Parse a stored publication stamp.
 * Date-only values are the start of that UTC day. Datetimes keep their offset.
 * Invalid or empty values are unknown.
 */
export function parsePublicationInstant(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dayOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dayOnly) {
    const instant = new Date(`${dayOnly[1]}T00:00:00Z`);
    return Number.isNaN(instant.getTime()) ? null : instant;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

export function publicationDay(value: string | null | undefined): string | undefined {
  return isoDay(value);
}

/** First Pundits publication. No fallback to sourceDate, now, or noon. */
export function firstPublishedAt(call: Pick<Call, "firstPublishedAt">): string | undefined {
  const value = call.firstPublishedAt?.trim();
  return value || undefined;
}

export function materialUpdatedAt(
  call: Pick<Call, "firstPublishedAt" | "updatedAt" | "gradedAt" | "sourceDate">,
  event?: Pick<Event, "sourcedAt"> | null
): string | undefined {
  const days = [
    call.updatedAt,
    call.gradedAt,
    call.firstPublishedAt,
    event?.sourcedAt,
  ]
    .map(isoDay)
    .filter((day): day is string => Boolean(day))
    .sort();
  return days.at(-1);
}

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function addUtcDays(day: string, delta: number): string {
  const instant = new Date(`${day}T00:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + delta);
  return instant.toISOString().slice(0, 10);
}

/**
 * Google News two-day window against the current date, not the newest stored source.
 * Unknown or future firstPublishedAt is not eligible. Empty result sets are valid.
 */
export function isNewsEligible(
  published: string | null | undefined,
  now: Date = new Date(),
  days = 2
): boolean {
  if (!published) return false;
  const instant = parsePublicationInstant(published);
  if (!instant) return false;
  if (instant.getTime() > now.getTime()) return false;
  const pubDay = isoDay(published);
  if (!pubDay) return false;
  const today = utcDay(now);
  if (pubDay > today) return false;
  const cutoff = addUtcDays(today, -(Math.max(1, days) - 1));
  return pubDay >= cutoff;
}

export function rssPublicationDate(value: string): string {
  const dayOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dayOnly) return new Date(`${dayOnly[1]}T00:00:00Z`).toUTCString();
  const instant = parsePublicationInstant(value);
  if (instant) return instant.toUTCString();
  return new Date(`${isoDay(value) ?? "1970-01-01"}T00:00:00Z`).toUTCString();
}

export function newsPublicationDate(value: string): string {
  const dayOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dayOnly) return dayOnly[1];
  return value;
}
