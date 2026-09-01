import { describe, expect, it } from "vitest";
import {
  isVsGame,
  mappedStakeLine,
  matchupSentence,
  publicSideLabel,
} from "./public-side";
import type { Event } from "./types";

const game = {
  kind: "game",
  awayTeam: "North Carolina",
  homeTeam: "TCU",
} as Event;
const future = {} as Event;

describe("publicSideLabel", () => {
  it("maps game sides to away and home teams", () => {
    expect(publicSideLabel(game, "yes")).toBe("North Carolina");
    expect(publicSideLabel(game, "no")).toBe("TCU");
  });

  it("maps future sides to fan-facing language", () => {
    expect(publicSideLabel(future, "yes")).toBe("Takes it");
    expect(publicSideLabel(future, "no")).toBe("Against");
  });
});

describe("mappedStakeLine", () => {
  it("prints the team, not YES/NO, on a game stake line", () => {
    const event = {
      kind: "game",
      title: "Clemson at LSU",
      awayTeam: "Clemson",
      homeTeam: "LSU",
    } as Event;
    const row = mappedStakeLine(event, "no", 78);
    expect(row.label).toBe("LSU");
    expect(row.line).toBe("Clemson at LSU · LSU @ 78¢ · hypothetical $100");
    expect(row.line).not.toMatch(/\bYES\b|\bNO\b|at risk/i);
  });

  it("prints Takes it / Against on a future stake line", () => {
    const event = {
      kind: "future",
      title: "Indiana wins the national title",
    } as Event;
    expect(mappedStakeLine(event, "no", 91).line).toBe(
      "Indiana wins the national title · Against @ 91¢ · hypothetical $100"
    );
  });
});

describe("neutral-site matchup copy", () => {
  it("treats vs titles as neutral-site copy", () => {
    const lambeau = {
      kind: "game",
      title: "Wisconsin vs Notre Dame",
      awayTeam: "Wisconsin",
      homeTeam: "Notre Dame",
      network: "NBC · Lambeau",
    } as Event;
    expect(isVsGame(lambeau)).toBe(true);
    expect(matchupSentence(lambeau)).toBe("Wisconsin vs Notre Dame.");
    expect(matchupSentence(lambeau)).not.toMatch(/at Notre Dame/);
  });

  it("keeps at titles as at", () => {
    const lsu = {
      kind: "game",
      title: "Clemson at LSU",
      awayTeam: "Clemson",
      homeTeam: "LSU",
    } as Event;
    expect(isVsGame(lsu)).toBe(false);
    expect(matchupSentence(lsu)).toBe("Clemson at LSU.");
  });
});
