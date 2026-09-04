import type { Call, Event, Pundit, Side } from "./types";

export function fixturePundit(id: string, patch: Partial<Pundit> = {}): Pundit {
  return {
    id,
    name: id
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    outlet: "Fixture Network",
    photo: `/photos/${id}.jpg`,
    sport: "both",
    ...patch,
  };
}

export function fixtureGame(slug: string, patch: Partial<Event> = {}): Event {
  const awayTeam = patch.awayTeam ?? "Away";
  const homeTeam = patch.homeTeam ?? "Home";
  return {
    slug,
    title: `${awayTeam} at ${homeTeam}`,
    contractName: `${awayTeam} vs ${homeTeam} — moneyline`,
    yesCents: 40,
    noCents: 60,
    sourceUrl: "https://example.com/freeze",
    sourcedAt: "2026-09-01",
    onHome: true,
    sport: "ncaaf",
    homeRank: 10,
    kind: "game",
    awayTeam,
    homeTeam,
    kickoffDate: "2026-09-05",
    kickoff: "Sat 7:30 ET",
    network: "ABC",
    season: 2026,
    week: 1,
    ...patch,
  };
}

export function fixtureFuture(slug: string, patch: Partial<Event> = {}): Event {
  return {
    slug,
    title: slug,
    contractName: slug,
    yesCents: 40,
    noCents: 60,
    sourceUrl: "https://example.com/freeze",
    sourcedAt: "2026-09-01",
    onHome: true,
    sport: "ncaaf",
    homeRank: 10,
    kind: "future",
    season: 2026,
    teamId: "fixture-team",
    ...patch,
  };
}

export function fixtureCall(
  patch: Partial<Call> & Pick<Call, "id" | "punditId" | "claim">
): Call {
  return {
    source: "Fixture Network",
    sourceUrl: "https://example.com/pick",
    sourceDate: "2026-09-01",
    kind: "hard",
    subject: patch.eventSlug ?? patch.punditId,
    paysOn: patch.eventSlug ?? "fixture",
    status: "pending",
    ...patch,
  };
}

export function fixturePick({
  eventSlug,
  punditId,
  side,
  status = "pending",
  claim,
  sourceDate = "2026-09-01",
}: {
  eventSlug: string;
  punditId: string;
  side: Side;
  status?: Call["status"];
  claim?: string;
  sourceDate?: string;
}): Call {
  return fixtureCall({
    id: `${eventSlug}-${punditId}-${side}`,
    punditId,
    claim: claim ?? `${punditId} takes ${side}`,
    eventSlug,
    side,
    status,
    sourceDate,
    subject: eventSlug,
    paysOn: eventSlug,
  });
}

export function fixtureFaces(count = 6): Pundit[] {
  return Array.from({ length: count }, (_, index) =>
    fixturePundit(`face-${index + 1}`, { name: `Face ${index + 1}` })
  );
}

export function twoSidedPicks(eventSlug: string, firstFace = 1): Call[] {
  return [
    fixturePick({ eventSlug, punditId: `face-${firstFace}`, side: "yes" }),
    fixturePick({ eventSlug, punditId: `face-${firstFace + 1}`, side: "no" }),
  ];
}
