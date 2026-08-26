import { describe, expect, it } from "vitest";
import { eventShare, punditShare } from "./share";
import { getPundit, loadCalls, loadEvents, loadPundits } from "./data";
import { absoluteUrl, siteOrigin } from "./site";
import type { Call, Event, Pundit } from "./types";

const pundits: Pundit[] = [
  {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "Finebaum / ESPN",
    photo: "/photos/finebaum.jpg",
    sport: "ncaaf",
  },
];

const event: Event = {
  slug: "unc-vs-tcu",
  title: "North Carolina vs TCU",
  contractName: "North Carolina vs TCU",
  yesCents: 27,
  noCents: 75,
  sourceUrl: "https://example.com",
  sourcedAt: "2026-08-26",
  onHome: true,
  sport: "ncaaf",
  homeRank: 0,
  kind: "game",
  awayTeam: "North Carolina",
  homeTeam: "TCU",
};

const calls: Call[] = [
  {
    id: "finebaum-unc-tcu-20260825",
    punditId: "finebaum",
    claim: "I don't believe they'll win this game in Ireland.",
    source: "First Take",
    sourceUrl: null,
    sourceDate: "2026-08-25",
    kind: "hard",
    subject: "TCU",
    paysOn: "UNC vs TCU",
    status: "pending",
    eventSlug: "unc-vs-tcu",
    side: "no",
  },
];

describe("share copy", () => {
  it("names sides and freeze on a game card", () => {
    const share = eventShare(event, calls, pundits);
    expect(share.title).toBe("North Carolina vs TCU");
    expect(share.description).toContain("YES North Carolina 27¢");
    expect(share.description).toContain("NO TCU 75¢");
    expect(share.description).toContain("YES: nobody yet");
    expect(share.description).toContain("NO: Paul Finebaum");
    expect(share.description).toContain("as of Aug 26, 2026");
  });

  it("summarizes a pundit book", () => {
    const share = punditShare(
      {
        name: "Paul Finebaum",
        outlet: "Finebaum / ESPN",
        mappedPending: 2,
        season2026: { wins: 0, losses: 0, pending: 2 },
      },
      calls[0]
    );
    expect(share.title).toBe("Paul Finebaum");
    expect(share.description).toContain("Finebaum / ESPN");
    expect(share.description).toContain("2 live picks");
    expect(share.description).toContain("I don't believe they'll win this game in Ireland");
    expect(share.description).not.toMatch(/\.”\.$/);
  });

  it("matches the live Dublin row", () => {
    const live = loadEvents().find((e) => e.slug === "unc-vs-tcu");
    expect(live).toBeTruthy();
    const share = eventShare(live!, loadCalls(), loadPundits());
    expect(share.description).toContain("NO: Paul Finebaum");
    expect(share.description).not.toContain("wisconsin");
  });

  it("keeps Finebaum's live profile description first-person", () => {
    const callsLive = loadCalls();
    const p = getPundit("finebaum", loadPundits(), callsLive);
    expect(p).toBeTruthy();
    const latest = callsLive.find((c) => c.punditId === "finebaum");
    const share = punditShare(p!, latest);
    expect(share.title).toBe("Paul Finebaum");
    expect(share.description.length).toBeGreaterThan(20);
  });
});

describe("site urls", () => {
  it("defaults origin to GitHub Pages", () => {
    expect(siteOrigin()).toBe("https://bairdhall25.github.io");
    expect(absoluteUrl("/og.png")).toMatch(/\/og\.png$/);
  });
});
