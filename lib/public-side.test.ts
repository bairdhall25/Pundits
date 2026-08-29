import { describe, expect, it } from "vitest";
import { publicSideLabel } from "./public-side";
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
