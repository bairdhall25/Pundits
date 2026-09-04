import { describe, expect, it } from "vitest";
import {
  fixtureCall,
  fixtureFuture,
  fixtureGame,
  fixturePick,
  fixturePundit,
} from "./test-fixtures";

describe("test fixtures", () => {
  it("builds a mapped pending pick without reading the live ledger", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("away-at-home-2026", {
      awayTeam: "Away",
      homeTeam: "Home",
    });
    const pick = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "no",
    });
    expect(pick.eventSlug).toBe("away-at-home-2026");
    expect(pick.status).toBe("pending");
    expect(pick.kind).toBe("hard");
    expect(fixtureFuture("team-title-2026").kind).toBe("future");
    expect(fixtureCall({ id: "soft-1", punditId: "voice", claim: "lean", kind: "soft" }).eventSlug).toBeUndefined();
  });
});
