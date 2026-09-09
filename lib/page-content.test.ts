import { describe, expect, it } from "vitest";
import { getPundit, loadCalls, loadEvents, loadPundits } from "./data";
import {
  TRACKED_RECORD_DISCLAIMER,
  TRACKED_SUBSET_DISCLAIMER,
  gameComparison,
  profileContent,
  receiptContextLinks,
  receiptDisagreement,
} from "./page-content";
import { mappedTakes } from "./seo";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

describe("game comparison contract", () => {
  it("names both sides, the tracked count, and disagreement on Dublin", () => {
    const event = loadEvents().find((row) => row.slug === "unc-vs-tcu-2026")!;
    const comparison = gameComparison(event, loadCalls(), loadPundits());
    expect(comparison.h1).toBe("North Carolina vs TCU");
    expect(comparison.title).toBe("North Carolina beat TCU: who called it");
    expect(comparison.lede).toContain("picked TCU");
    expect(comparison.lede).toContain("picked North Carolina");
    expect(comparison.disagreement).toContain("picked TCU");
    expect(comparison.disagreement).toContain("picked North Carolina");
    expect(comparison.coverageLine).toMatch(/tracked picks on Pundits\.Pro/);
    expect(comparison.disclaimer).toBe(TRACKED_SUBSET_DISCLAIMER);
    expect(comparison.description).toContain(TRACKED_SUBSET_DISCLAIMER);
    expect(comparison.resultLine).toMatch(/Final:/);
    expect(comparison.entries.length).toBe(comparison.trackedCount);
    expect(comparison.entries.some((entry) => entry.href.includes("/finebaum"))).toBe(true);
    expect(comparison.contextLinks.some((link) => link.href.startsWith("/teams/"))).toBe(true);
    expect(comparison.contextLinks.some((link) => link.href.includes("/week-"))).toBe(true);
  });

  it("keeps an empty side honest on NC State at Virginia", () => {
    const event = loadEvents().find((row) => row.slug === "ncsu-at-uva-2026")!;
    const comparison = gameComparison(event, loadCalls(), loadPundits());
    expect(comparison.lede).toMatch(/Nobody on Virginia yet/i);
    expect(comparison.emptyLine).toMatch(/No verified pick on Virginia/);
    expect(comparison.disagreement).toBeNull();
    expect(comparison.sides.find((side) => side.label === "Virginia")?.empty).toBe(true);
    expect(comparison.entries.every((entry) => entry.sideLabel !== "Virginia")).toBe(true);
  });

  it("does not call a pending one-sided game a complete expert survey", () => {
    const event = fixtureGame("open-empty-2026", {
      awayTeam: "Away",
      homeTeam: "Home",
      awayTeamId: "away",
      homeTeamId: "home",
    });
    const pundit = fixturePundit("voice", { name: "Voice" });
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "no",
    });
    const comparison = gameComparison(event, [call], [pundit]);
    expect(comparison.title).toContain("who picked whom");
    expect(comparison.lede).toBe("Nobody on Away yet. Voice picks Home.");
    expect(comparison.emptyLine).toContain("No verified pick on Away");
    expect(comparison.disclaimer).toBe(TRACKED_SUBSET_DISCLAIMER);
    expect(comparison.resultLine).toBeNull();
  });

  it("does not repeat the empty-shell sentence in coverage or Takes it/Against lines", () => {
    const event = loadEvents().find((row) => row.slug === "chiefs-sb-2026")!;
    const comparison = gameComparison(event, loadCalls(), loadPundits());
    expect(comparison.trackedCount).toBe(0);
    expect(comparison.lede).toBe(`No verified pick on ${event.title} yet.`);
    expect(comparison.coverageLine).toBeNull();
    expect(comparison.emptyLine).toBeNull();
    expect(comparison.description).toBe(
      `No verified pick on ${event.title} yet. ${TRACKED_SUBSET_DISCLAIMER}`
    );
    expect(comparison.description.match(/No verified pick on /g)?.length).toBe(1);
    expect(comparison.contextLinks.find((link) => link.href === "/teams/chiefs")?.label).toBe(
      "Chiefs"
    );
  });
});

describe("receipt contract extras", () => {
  it("names the opposing side instead of a generic also-weighed-in line", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "unc-vs-tcu-2026" && row.pundit.id === "finebaum"
    )!;
    const line = receiptDisagreement(
      take.event,
      take.call,
      take.pundit,
      loadCalls(),
      loadPundits()
    );
    expect(line).toContain("picked TCU");
    expect(line).toContain("picked North Carolina");
    expect(line).toContain("game page");
    expect(line).not.toMatch(/weighed in/i);
  });

  it("links a receipt to the game, profile, teams, and week", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "clemson-at-lsu-2026" && row.pundit.id === "finebaum"
    )!;
    const links = receiptContextLinks(take.event, take.pundit);
    expect(links.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        "/picks/clemson-at-lsu-2026",
        "/pundits/finebaum",
        "/teams/clemson",
        "/teams/lsu",
        "/ncaaf/2026/week-1/",
      ])
    );
    expect(links.find((link) => link.href === "/picks/clemson-at-lsu-2026")?.label).toBe(
      "Game comparison"
    );
  });

  it("labels a futures receipt with Market page and the team name", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "texas-cfp-2026" && row.pundit.id === "fallica"
    )!;
    const links = receiptContextLinks(take.event, take.pundit);
    expect(links.find((link) => link.href === "/picks/texas-cfp-2026")?.label).toBe(
      "Market page"
    );
    expect(links.find((link) => link.href.startsWith("/teams/"))?.label).not.toBe(
      take.event.title
    );
    expect(links.some((link) => link.label === "Game comparison")).toBe(false);
  });
});

describe("profile contract", () => {
  it("splits current mapped picks from past receipts and disclaims career skill", () => {
    const calls = loadCalls();
    const pundit = getPundit("kanell", loadPundits(), calls)!;
    const profile = profileContent(pundit, calls);
    expect(profile.title).toBe("Danny Kanell: current picks and tracked record");
    expect(profile.h1).toBe("Danny Kanell");
    expect(profile.outlet).toBe(pundit.outlet);
    expect(profile.recordLine).toMatch(/2026 tracked record/);
    expect(profile.recordDisclaimer).toBe(TRACKED_RECORD_DISCLAIMER);
    expect(profile.current.every((call) => call.status === "pending")).toBe(true);
    expect(profile.historical.every((call) => call.status === "hit" || call.status === "miss")).toBe(true);
    expect(profile.historical.length).toBeGreaterThan(0);
  });

  it("does not invent a record for an empty shell", () => {
    const pundit = fixturePundit("shell", { name: "Shell", outlet: "Test Desk" });
    const record = {
      ...pundit,
      season2026: { wins: 0, losses: 0, pending: 0 },
      mappedPending: 0,
      totalCalls: 0,
    };
    const profile = profileContent(record, []);
    expect(profile.lede).toContain("No current mapped picks");
    expect(profile.recordLine).toContain("No graded picks in the 2026 tracked sample yet");
    expect(profile.current).toEqual([]);
    expect(profile.historical).toEqual([]);
  });
});
