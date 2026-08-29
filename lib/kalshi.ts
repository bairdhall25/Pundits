import type { Event } from "./types";

export function isKalshiUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "kalshi.com" || host.endsWith(".kalshi.com");
  } catch {
    return false;
  }
}

/** Public event page from a Kalshi event ticker. Null if the series is unknown. */
export function kalshiEventUrl(ticker: string | null | undefined): string | null {
  if (!ticker) return null;
  const t = ticker.trim().toUpperCase();
  if (!t) return null;
  const path = t.toLowerCase();
  if (t.startsWith("KXNCAAFGAME-")) {
    return `https://kalshi.com/markets/kxncaafgame/college-football-game/${path}`;
  }
  if (t.startsWith("KXNCAAFPLAYOFF-")) {
    return `https://kalshi.com/markets/kxncaafplayoff/college-football-playoff/${path}`;
  }
  if (t.startsWith("KXNFLGAME-")) {
    return `https://kalshi.com/markets/kxnflgame/nfl-game/${path}`;
  }
  return null;
}

/** Fan-facing Kalshi page: stored kalshi.com URL, else built from ticker. */
export function eventKalshiUrl(
  event: Pick<Event, "ticker" | "sourceUrl">
): string | null {
  if (isKalshiUrl(event.sourceUrl)) return event.sourceUrl;
  return kalshiEventUrl(event.ticker);
}
