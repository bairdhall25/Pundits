import { describe, expect, it } from "vitest";
import { mappedStakeLine, publicSideLabel } from "./public-side";
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

  it("prints a team and hypothetical stake without internal market language", () => {
    const event = {
      ...game,
      title: "North Carolina at TCU",
    } as Event;
    const row = mappedStakeLine(event, "no", 75);
    expect(row).toEqual({
      label: "TCU",
      line: "North Carolina at TCU · TCU @ 75¢ · hypothetical $100",
    });
    expect(row.line).not.toMatch(/\bYES\b|\bNO\b|at risk/i);
  });

  it("uses fan-facing future labels in a hypothetical stake line", () => {
    const event = {
      kind: "future",
      title: "Indiana wins the national title",
    } as Event;
    expect(mappedStakeLine(event, "no", 91).line).toBe(
      "Indiana wins the national title · Against @ 91¢ · hypothetical $100"
    );
  });
});
