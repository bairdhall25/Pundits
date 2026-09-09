export function isoDay(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return m?.[1];
}

export function latestDay(dates: Array<string | null | undefined>): string | undefined {
  const days = dates.map(isoDay).filter((d): d is string => Boolean(d));
  if (!days.length) return undefined;
  return days.sort()[days.length - 1];
}
