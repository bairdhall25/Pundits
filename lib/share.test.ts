import { describe, expect, it } from "vitest";
import { eventShare, punditShare } from "./share";
import { sharePayload, tweetIntent } from "./share-link";
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
  slug: "unc-vs-tcu-2026",
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
    eventSlug: "unc-vs-tcu-2026",
    side: "no",
  },
];

describe("share copy", () => {
  it("names sides and freeze on a game card", () => {
    const share = eventShare(event, calls, pundits);
    expect(share.title).toBe("North Carolina vs TCU expert picks");
    expect(share.description).toContain("Paul Finebaum picks TCU");
    expect(share.description).toContain("Nobody on North Carolina yet");
    expect(share.description).toContain("TCU 75¢");
    expect(share.description).toContain("North Carolina 27¢");
    expect(share.description).not.toMatch(/\bYES\b/);
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
    expect(share.title).toBe("Paul Finebaum picks");
    expect(share.description).toContain("Finebaum / ESPN");
    expect(share.description).toContain("2 open picks");
    expect(share.description).toContain("I don't believe they'll win this game in Ireland");
    expect(share.description).not.toContain("2026 record 0–0");
    expect(share.description).not.toMatch(/\.”\.$/);
  });

  it("adds the season record only after the record gate opens", () => {
    const share = punditShare(
      {
        name: "Paul Finebaum",
        outlet: "Finebaum / ESPN",
        mappedPending: 2,
        season2026: { wins: 0, losses: 0, pending: 2 },
      },
      calls[0],
      { showRecord: true }
    );
    expect(share.description).toContain("2026 record 0–0");
  });

  it("matches the live Dublin row", () => {
    const live = loadEvents().find((e) => e.slug === "unc-vs-tcu-2026");
    expect(live).toBeTruthy();
    const share = eventShare(live!, loadCalls(), loadPundits());
    expect(share.description).toContain("Paul Finebaum and Will Compton pick TCU");
    expect(share.description).toContain("Chip Patterson and Greg McElroy pick North Carolina");
    expect(share.description).not.toContain("wisconsin");
  });

  it("names Super Bowl futures by the 2026–27 season, not Kalshi's 2027 champion year", () => {
    const rams = loadEvents().find((e) => e.slug === "rams-sb-2026")!;
    const share = eventShare(rams, loadCalls(), loadPundits());
    expect(share.title).toBe("Rams win the Super Bowl expert picks · 2026–27");
    expect(share.description).toMatch(/take Rams win the Super Bowl/i);
    expect(share.description).toMatch(/against/i);
    expect(share.description).not.toContain("2027 NFL Champion");
  });

  it("keeps Finebaum's live profile description first-person", () => {
    const callsLive = loadCalls();
    const p = getPundit("finebaum", loadPundits(), callsLive);
    expect(p).toBeTruthy();
    const latest = callsLive.find((c) => c.punditId === "finebaum");
    const share = punditShare(p!, latest);
    expect(share.title).toBe("Paul Finebaum picks");
    expect(share.description.length).toBeGreaterThan(20);
  });
});

describe("share payload", () => {
  it("points at the landscape card, the story card, and an X intent", () => {
    const payload = sharePayload({
      title: "Paul Finebaum picks TCU over North Carolina",
      text: "Paul Finebaum picks TCU over North Carolina",
      path: "/picks/unc-vs-tcu-2026/finebaum",
      image: "/og/takes/unc-vs-tcu-2026--finebaum.png",
      story: "/og/stories/takes/unc-vs-tcu-2026--finebaum.png",
    });
    expect(payload.url).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/");
    expect(payload.image).toBe("/og/takes/unc-vs-tcu-2026--finebaum.png");
    expect(payload.story).toBe("/og/stories/takes/unc-vs-tcu-2026--finebaum.png");
    expect(payload.tweetHref).toContain("https://twitter.com/intent/tweet?");
    expect(payload.tweetHref).toContain(encodeURIComponent(payload.url));
    expect(tweetIntent("hello", "https://pundits.pro/x/")).toContain("text=hello");
  });
});

describe("site urls", () => {
  it("defaults origin to the production domain", () => {
    expect(siteOrigin()).toBe("https://pundits.pro");
    expect(absoluteUrl("/og.png")).toMatch(/\/og\.png$/);
  });
});

describe("settled event share copy", () => {
  it("titles a settled game with the result", () => {
    const graded: Call[] = [
      { ...calls[0], status: "hit" },
      {
        ...calls[0],
        id: "patterson-unc-tcu-20260827",
        punditId: "patterson",
        side: "yes",
        status: "miss",
      },
    ];
    const share = eventShare(event, graded, pundits);
    expect(share.title).toBe("TCU beat North Carolina: who called it");
    expect(share.description.startsWith("Final: TCU won.")).toBe(true);
  });
});
