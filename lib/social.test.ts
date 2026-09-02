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
  {
    slug: "mia-vs-fsu-2026",
    title: "Miami vs FSU",
    contractName: "Miami to win",
    yesCents: 55,
    noCents: 48,
    sourceUrl: "https://kalshi.com/markets/y",
    sourcedAt: "2026-08-25",
    onHome: true,
    sport: "ncaaf",
    homeRank: 2,
    kind: "game",
    awayTeam: "Miami",
    homeTeam: "FSU",
    kickoff: "2026-08-29T20:30:00-04:00",
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
  {
    id: "c3",
    punditId: "pat",
    claim: "Hurricanes got this.",
    source: "The Pat Show",
    sourceUrl: "https://example.com/c",
    sourceDate: "2026-08-27",
    kind: "hard",
    subject: "Miami at FSU",
    paysOn: "Miami win",
    status: "pending",
    eventSlug: "mia-vs-fsu-2026",
    side: "yes",
  },
];

describe("socialIndex", () => {
  const index = socialIndex(calls, events, pundits, "2026-08-29T12:00:00.000Z");

  it("passes generatedAt and site through", () => {
    expect(index.schemaVersion).toBe(2);
    expect(index.generatedAt).toBe("2026-08-29T12:00:00.000Z");
    expect(index.site).toBe("https://pundits.pro");
  });

  it("adds stable page and week landscape-card registries without changing existing rows", () => {
    expect(index.pages).toHaveLength(10);
    expect(index.pages.find((page) => page.key === "home")).toEqual({
      key: "home",
      pageUrl: "https://pundits.pro/",
      ogCard: "https://pundits.pro/og/pages/home.png",
    });
    expect(index.pages.find((page) => page.key === "methodology")?.ogCard).toBe(
      "https://pundits.pro/og/pages/methodology.png"
    );
    expect(index.weeks).toEqual([
      {
        sport: "ncaaf",
        season: 2026,
        week: 0,
        pageUrl: "https://pundits.pro/ncaaf/2026/week-0/",
        ogCard: "https://pundits.pro/og/weeks/ncaaf-2026-week-0.png",
      },
    ]);
    expect(index.teams).toEqual([]);
  });

  it("lists every event with absolute page and card urls plus settled state", () => {
    expect(index.events).toHaveLength(2);
    const settled = index.events.find((e) => e.slug === "unc-vs-tcu-2026")!;
    expect(settled.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/");
    expect(settled.ogCard).toBe("https://pundits.pro/og/events/unc-vs-tcu-2026.png");
    expect(settled.storyCard).toBe("https://pundits.pro/og/stories/events/unc-vs-tcu-2026.png");
    expect(settled.settled).toBe(true); // all graded calls settle the event
    expect(settled.kickoffDate).toBe("2026-08-29");
    expect(settled.yesPundits).toEqual(["Chip Patterson"]);
    expect(settled.noPundits).toEqual(["Paul Finebaum"]);

    const pending = index.events.find((e) => e.slug === "mia-vs-fsu-2026")!;
    expect(pending.pageUrl).toBe("https://pundits.pro/picks/mia-vs-fsu-2026/");
    expect(pending.settled).toBe(false); // pending call prevents settlement
    expect(pending.yesPundits).toEqual(["Chip Patterson"]);
  });

  it("lists one take per mapped hard call with status, side label, and frozen cents", () => {
    expect(index.takes).toHaveLength(3);
    const hit = index.takes.find((t) => t.punditId === "fin" && t.eventSlug === "unc-vs-tcu-2026")!;
    expect(hit.status).toBe("hit");
    expect(hit.side).toBe("no");
    expect(hit.cents).toBe(61);
    expect(hit.claim).toBe("TCU wins this game.");
    expect(hit.pageUrl).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/fin/");
    expect(hit.ogCard).toBe("https://pundits.pro/og/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.storyCard).toBe("https://pundits.pro/og/stories/takes/unc-vs-tcu-2026--fin.png");
    expect(hit.sideLabel.length).toBeGreaterThan(0);

    const pending = index.takes.find((t) => t.eventSlug === "mia-vs-fsu-2026")!;
    expect(pending.status).toBe("pending");
    expect(pending.punditId).toBe("pat");
    expect(pending.claim).toBe("Hurricanes got this.");
    expect(pending.pageUrl).toBe("https://pundits.pro/picks/mia-vs-fsu-2026/pat/");
  });

  it("lists every pundit with live record and card urls", () => {
    expect(index.pundits).toHaveLength(2);
    const fin = index.pundits.find((p) => p.id === "fin")!;
    expect(fin).toMatchObject({ name: "Paul Finebaum", outlet: "ESPN", wins: 1, losses: 0, pending: 0 });
    expect(fin.pageUrl).toBe("https://pundits.pro/pundits/fin/");
    expect(fin.ogCard).toBe("https://pundits.pro/og/pundits/fin.png");
    const pat = index.pundits.find((p) => p.id === "pat")!;
    expect(pat).toMatchObject({ wins: 0, losses: 1, pending: 1 });
    expect(pat.storyCard).toBe("https://pundits.pro/og/stories/pundits/pat.png");
  });
});
