import { describe, expect, it } from "vitest";
import { getPundit, getTeam, loadCalls, loadEvents, loadPundits, loadTeams } from "./data";
import {
  TRACKED_RECORD_DISCLAIMER,
  TRACKED_SUBSET_DISCLAIMER,
  gameComparison,
  leagueContent,
  profileContent,
  receiptContextLinks,
  receiptDisagreement,
  teamContent,
  weekArchiveContent,
} from "./page-content";
import { mappedTakes } from "./seo";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";
import type { Team } from "./types";

function testTeam(id: string, patch: Partial<Team> = {}): Team {
  return {
    id,
    name: id
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    abbr: id.slice(0, 3).toUpperCase(),
    primary: "#000000",
    ink: "#ffffff",
    sport: "ncaaf",
    ...patch,
  };
}

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

describe("team page contract", () => {
  it("keeps the Melbourne result after 49ers-Rams grades", () => {
    const team = getTeam("49ers", loadTeams())!;
    const content = teamContent(team, loadEvents(), loadCalls(), loadPundits());
    expect(content.h1).toBe("49ers");
    expect(content.title).toBe("49ers: tracked picks and results");
    expect(content.noScheduledGame).toBe(true);
    expect(content.nextMatchup).toBeNull();
    expect(content.lede).toContain("No scheduled game on the board for 49ers");
    expect(content.lede).toContain("49ers beat Rams");
    expect(content.disclaimer).toBe(TRACKED_SUBSET_DISCLAIMER);
    expect(content.description).toContain(TRACKED_SUBSET_DISCLAIMER);
    expect(content.title).not.toMatch(/best experts|expert picks/i);
    expect(content.contextLinks.some((link) => link.href === "/nfl/")).toBe(true);
    expect(content.contextLinks.some((link) => link.href === "/picks/49ers-vs-rams-2026")).toBe(
      true
    );
    expect(content.historical[0]?.event.slug).toBe("49ers-vs-rams-2026");
  });

  it("says no scheduled game on TCU and keeps the Dublin result", () => {
    const team = getTeam("tcu", loadTeams())!;
    const content = teamContent(team, loadEvents(), loadCalls(), loadPundits());
    expect(content.noScheduledGame).toBe(true);
    expect(content.nextMatchup).toBeNull();
    expect(content.title).toBe("TCU: tracked picks and results");
    expect(content.lede).toContain("No scheduled game on the board for TCU");
    expect(content.lede).toContain("North Carolina beat TCU");
    expect(content.lede).not.toContain("No captured pick yet.");
    expect(content.historical[0]?.event.slug).toBe("unc-vs-tcu-2026");
    expect(content.historical[0]?.noCapturedPick).toBe(false);
  });

  it("keeps Virginia's empty side distinct from a missing game", () => {
    const team = getTeam("virginia", loadTeams())!;
    const content = teamContent(team, loadEvents(), loadCalls(), loadPundits());
    expect(content.noScheduledGame).toBe(true);
    expect(content.lede).toContain("No scheduled game on the board for Virginia");
    expect(content.lede).toContain("Virginia beat NC State");
    expect(content.lede).toContain("No captured pick on Virginia");
    expect(content.historical[0]?.noCapturedPick).toBe(true);
    expect(content.historical[0]?.noCapturedPickOnGame).toBe(false);
    expect(content.historical[0]?.emptyFor).toBe("No captured pick on Virginia.");
    expect(content.historical[0]?.emptyFor).not.toContain("Kanell");
    expect(content.historical[0]?.emptyFor).not.toContain("Patterson");
  });

  it("does not say yet on a graded empty against side", () => {
    const team = testTeam("away", { name: "Away" });
    const event = fixtureGame("graded-empty-2026", {
      awayTeam: "Away",
      homeTeam: "Home",
      awayTeamId: "away",
      homeTeamId: "home",
      awayScore: 21,
      homeScore: 14,
    });
    const pundit = fixturePundit("voice", { name: "Voice" });
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      status: "hit",
    });
    const content = teamContent(team, [event], [call], [pundit]);
    const matchup = content.historical[0];
    expect(matchup?.lede).toBe("Voice picked Away. Nobody on Home.");
    expect(matchup?.lede).not.toMatch(/yet/);
    expect(matchup?.emptyAgainst).toBe("Nobody on Home.");
    expect(matchup?.emptyAgainst).not.toMatch(/yet/);

    const ncsu = teamContent(
      getTeam("nc-state", loadTeams())!,
      loadEvents(),
      loadCalls(),
      loadPundits()
    ).historical[0];
    expect(ncsu?.lede).toMatch(/Nobody on Virginia\./);
    expect(ncsu?.lede).not.toMatch(/Nobody on Virginia yet/);
    expect(ncsu?.emptyAgainst).toBe("Nobody on Virginia.");
  });

  it("distinguishes no captured pick on a scheduled game from no scheduled game", () => {
    const team = testTeam("home", { name: "Home", sport: "ncaaf" });
    const event = fixtureGame("open-empty-2026", {
      awayTeam: "Away",
      homeTeam: "Home",
      awayTeamId: "away",
      homeTeamId: "home",
    });
    const scheduled = teamContent(team, [event], [], []);
    expect(scheduled.noScheduledGame).toBe(false);
    expect(scheduled.nextMatchup?.noCapturedPickOnGame).toBe(true);
    expect(scheduled.lede).toContain("Next covered matchup: Away at Home");
    expect(scheduled.lede).toContain("No captured pick on Away at Home yet");
    expect(scheduled.nextMatchup?.emptyFor).toBe("No captured pick on Home yet.");
    expect(scheduled.nextMatchup?.emptyAgainst).toBe("Nobody on Away yet.");
    expect(scheduled.lede).not.toContain("No scheduled game");

    const idle = teamContent(testTeam("ghost", { name: "Ghost" }), [], [], []);
    expect(idle.noScheduledGame).toBe(true);
    expect(idle.noCapturedPick).toBe(true);
    expect(idle.lede).toContain("No scheduled game on the board for Ghost");
    expect(idle.lede).toContain("No captured pick yet");
    expect(idle.lede).not.toContain("Next covered matchup");
  });
});

describe("league page contract", () => {
  it("keeps the NFL live week and points at the permanent archive", () => {
    const content = leagueContent("nfl", loadEvents(), loadCalls(), loadPundits());
    expect(content.h1).toBe("NFL");
    expect(content.title).toBe("NFL Week 1: who picked whom");
    expect(content.currentWeek?.week).toBe(1);
    expect(content.currentWeek?.href).toBe("/nfl/2026/week-1/");
    expect(content.lede).toContain("Week 1");
    expect(content.lede).toMatch(/archive is the permanent record/);
    expect(content.title).not.toMatch(/best experts|expert picks/i);
    expect(content.description).toContain(TRACKED_SUBSET_DISCLAIMER);
  });

  it("treats a settled college live week as results and still links the archive", () => {
    const content = leagueContent("ncaaf", loadEvents(), loadCalls(), loadPundits());
    expect(content.h1).toBe("College football");
    expect(content.title).toBe("College football Week 1: who called it");
    expect(content.currentWeek?.href).toBe("/ncaaf/2026/week-1/");
    expect(content.lede).toContain("Week 1 is final");
    expect(content.previous?.href).toBe("/ncaaf/2026/week-0/");
    expect(content.title).not.toMatch(/best experts|expert picks/i);
  });

  it("does not pin every open game to week 1 when a later live week is also open", () => {
    const week1 = fixtureGame("slate-w1-2026", {
      week: 1,
      season: 2026,
      kickoffDate: "2026-09-05",
      sport: "ncaaf",
    });
    const week2 = fixtureGame("slate-w2-2026", {
      week: 2,
      season: 2026,
      kickoffDate: "2026-09-12",
      sport: "ncaaf",
    });
    const first = fixturePundit("face-1");
    const second = fixturePundit("face-2");
    const content = leagueContent(
      "ncaaf",
      [week1, week2],
      [
        fixturePick({ eventSlug: week1.slug, punditId: first.id, side: "no" }),
        fixturePick({ eventSlug: week2.slug, punditId: second.id, side: "yes" }),
      ],
      [first, second]
    );
    expect(content.weekLinks.map((week) => week.week)).toEqual([1, 2]);
    expect(content.lede).toContain("Week 1 has 1 open game");
    expect(content.lede).toContain("Week 2 has 1 open game");
    expect(content.lede).not.toMatch(/2 open games in Week 1/);
    expect(content.lede).toContain("the Week 1 archive is the permanent record");
  });
});

describe("weekly archive contract", () => {
  it("progresses a graded week to results and highlights disagreement receipts", () => {
    const content = weekArchiveContent(
      "ncaaf",
      2026,
      0,
      loadEvents(),
      loadCalls(),
      loadPundits()
    );
    expect(content.h1).toBe("College football Week 0");
    expect(content.title).toBe("College football Week 0: who got them right (2026)");
    expect(content.graded).toBe(true);
    expect(content.lede).toMatch(/Tracked Week 0 record: 2–4/);
    expect(content.recap).toContain("North Carolina beat TCU");
    expect(content.disagreements[0]?.href).toBe("/picks/unc-vs-tcu-2026");
    expect(content.disagreements[0]?.receipts.some((row) => row.href.includes("/finebaum"))).toBe(
      true
    );
    expect(content.title).not.toMatch(/best experts|expert picks/i);
    expect(content.description).toContain(TRACKED_SUBSET_DISCLAIMER);
  });

  it("progresses NFL week 1 once the opener grades and keeps later games on the same URL", () => {
    const content = weekArchiveContent(
      "nfl",
      2026,
      1,
      loadEvents(),
      loadCalls(),
      loadPundits()
    );
    expect(content.title).toBe("NFL Week 1: who got them right (2026)");
    expect(content.graded).toBe(true);
    expect(content.lede).toMatch(/Tracked Week 1 record: 4–5 on 9 graded picks, with 8 still open/);
    expect(content.recap).toContain("Patriots at Seahawks");
    expect(content.recap).toContain("Seahawks beat Patriots");
    expect(content.recap).toContain("49ers vs Rams");
    expect(content.recap).toContain("49ers beat Rams");
    expect(content.disagreements.some((row) => row.event.slug === "49ers-vs-rams-2026")).toBe(
      true
    );
  });
});
