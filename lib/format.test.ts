import { describe, expect, it } from "vitest";
import { americanOdds, kickoffTag, statusChipText, statusLabel, verdictClass } from "./format";

describe("statusLabel", () => {
  it("calls unresolved picks open without implying the event is live", () => {
    expect(statusLabel("pending")).toBe("Open");
    expect(statusLabel("hit")).toBe("Hit");
    expect(statusLabel("miss")).toBe("Miss");
  });
});

describe("verdicts", () => {
  it("pairs every verdict color with a glyph or word", () => {
    expect(statusChipText("hit")).toBe("✓ Hit");
    expect(statusChipText("miss")).toBe("✗ Miss");
    expect(statusChipText("pending")).toBe("Open");
  });

  it("maps status to a css verdict class", () => {
    expect(verdictClass("hit")).toBe("hit");
    expect(verdictClass("miss")).toBe("miss");
    expect(verdictClass("pending")).toBe("open");
  });
});

describe("americanOdds", () => {
  it("converts favorite prices to negative odds", () => {
    expect(americanOdds(75)).toBe("-300");
    expect(americanOdds(93)).toBe("-1329");
  });

  it("converts underdog prices to positive odds", () => {
    expect(americanOdds(26)).toBe("+285");
    expect(americanOdds(8)).toBe("+1150");
  });

  it("treats a coin flip as +100", () => {
    expect(americanOdds(50)).toBe("+100");
  });

  it("returns null when there is no meaningful price", () => {
    expect(americanOdds(null)).toBeNull();
    expect(americanOdds(undefined)).toBeNull();
    expect(americanOdds(0)).toBeNull();
    expect(americanOdds(100)).toBeNull();
  });
});

describe("kickoffTag", () => {
  it("tags a game on the current ET date as Today", () => {
    // 2026-08-30T02:00Z is still Aug 29, 10:00pm in New York
    const lateSaturdayEt = new Date("2026-08-30T02:00:00Z");
    expect(kickoffTag("2026-08-29", lateSaturdayEt)).toBe("Today");
  });

  it("tags the next ET date as Tomorrow", () => {
    const friday = new Date("2026-08-28T15:00:00Z");
    expect(kickoffTag("2026-08-29", friday)).toBe("Tomorrow");
  });

  it("leaves later games and missing dates untagged", () => {
    const friday = new Date("2026-08-28T15:00:00Z");
    expect(kickoffTag("2026-09-05", friday)).toBeNull();
    expect(kickoffTag(undefined, friday)).toBeNull();
    expect(kickoffTag(null, friday)).toBeNull();
  });

  it("leaves past games untagged", () => {
    const sunday = new Date("2026-08-30T15:00:00Z");
    expect(kickoffTag("2026-08-29", sunday)).toBeNull();
  });
});
