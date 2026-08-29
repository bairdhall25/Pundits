import { describe, expect, it } from "vitest";
import { socialIndex } from "./social";
import type { Call, Event, Pundit } from "./types";

const pundits: Pundit[] = [
  { id: "fin", name: "Paul Finebaum", outlet: "ESPN", photo: "/pundits/fin.jpg", sport: "ncaaf" },
  { id: "pat", name: "Chip Patterson", outlet: "CBS", photo: "/pundits/pat.jpg", sport: "ncaaf" },
];

const events: Event[] = [
  {
    slug: "unc-vs-tcu-2026",
    title: "North Carolina vs TCU",
    contractName: "UNC to win",
    yesCents: 41,
    noCents: 61,
    sourceUrl: "https://kalshi.com/markets/x",
    sourcedAt: "2026-08-25",
    onHome: true,
    sport: "ncaaf",
    homeRank: 1,
    kind: "game",
    awayTeam: "North Carolina",
    homeTeam: "TCU",
    kickoff: "2026-08-29T19:00:00-04:00",
    kickoffDate: "2026-08-29",
    season: 2026,
    week: 0,
  },
];

const calls: Call[] = [
  {
    id: "c1",
    punditId: "fin",
    claim: "TCU wins this game.",
    source: "The Paul Finebaum Show",
    sourceUrl: "https://example.com/a",
    sourceDate: "2026-08-25",
    kind: "hard",
    subject: "UNC at TCU",
    paysOn: "TCU win",
    status: "hit",
    gradedAt: "2026-08-30",
    eventSlug: "unc-vs-tcu-2026",
    side: "no",
  },
  {
    id: "c2",
    punditId: "pat",
    claim: "Give me the Heels.",
    source: "Cover 3",
    sourceUrl: "https://example.com/b",
    sourceDate: "2026-08-26",
    kind: "hard",
    subject: "UNC at TCU",
    paysOn: "UNC win",
    status: "miss",
    gradedAt: "2026-08-30",
    eventSlug: "unc-vs-tcu-2026",
    side: "yes",
  },
];

describe("socialIndex", () => {
  const index = socialIndex(calls, events, pundits, "2026-08-29T12:00:00.000Z");

  it("passes generatedAt and site through", () => {
    expect(index.generatedAt).toBe("2026-08-29T12:00:00.000Z");
    expect(index.site).toBe("https://pundits.pro");
  });

  it("lists every event with absolute page and card urls plus settled state", () => {
    expect(index.events).toHaveLength(1);
    const e = index.events[0];
    expect(e.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/");
    expect(e.ogCard).toBe("https://pundits.pro/og/events/unc-vs-tcu-2026.png");
    expect(e.storyCard).toBe("https://pundits.pro/og/stories/events/unc-vs-tcu-2026.png");
    expect(e.settled).toBe(true); // a graded call on the event settles it
    expect(e.kickoffDate).toBe("2026-08-29");
    expect(e.yesPundits).toEqual(["Chip Patterson"]);
    expect(e.noPundits).toEqual(["Paul Finebaum"]);
  });

  it("lists one take per mapped hard call with status, side label, and frozen cents", () => {
    expect(index.takes).toHaveLength(2);
    const hit = index.takes.find((t) => t.punditId === "fin")!;
    expect(hit.status).toBe("hit");
    expect(hit.side).toBe("no");
    expect(hit.cents).toBe(61);
    expect(hit.claim).toBe("TCU wins this game.");
    expect(hit.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/fin/");
    expect(hit.ogCard).toBe("https://pundits.pro/og/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.storyCard).toBe("https://pundits.pro/og/stories/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.sideLabel.length).toBeGreaterThan(0);
  });

  it("lists every pundit with live record and card urls", () => {
    expect(index.pundits).toHaveLength(2);
    const fin = index.pundits.find((p) => p.id === "fin")!;
    expect(fin).toMatchObject({ name: "Paul Finebaum", outlet: "ESPN", wins: 1, losses: 0, pending: 0 });
    expect(fin.pageUrl).toBe("https://pundits.pro/pundits/fin/");
    expect(fin.ogCard).toBe("https://pundits.pro/og/pundits/fin.png");
    const pat = index.pundits.find((p) => p.id === "pat")!;
    expect(pat).toMatchObject({ wins: 0, losses: 1, pending: 0 });
  });
});
