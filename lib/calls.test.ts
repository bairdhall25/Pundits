import { describe, expect, it } from "vitest";
import { loadCalls } from "./data";

describe("2026 book", () => {
  it("gives each NFL voice at least one mapped Super Bowl lean", () => {
    const calls = loadCalls();
    for (const id of ["skip", "hawk", "butler"]) {
      const mapped = calls.filter(
        (c) => c.punditId === id && c.kind === "hard" && c.eventSlug
      );
      expect(mapped.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has both hard and soft takes", () => {
    const calls = loadCalls();
    expect(calls.some((c) => c.kind === "hard")).toBe(true);
    expect(calls.some((c) => c.kind === "soft")).toBe(true);
  });

  it("only uses live statuses, and keeps speech ungraded", () => {
    const calls = loadCalls();
    for (const c of calls) {
      expect(["pending", "hit", "miss"], c.id).toContain(c.status);
      if (c.kind !== "hard" || !c.eventSlug) {
        expect(c.status, c.id).toBe("pending");
      }
    }
  });

  it("does not use placeholder claim text", () => {
    for (const c of loadCalls()) {
      expect(c.claim.toLowerCase()).not.toMatch(/lorem|placeholder|todo|tbd/);
      expect(c.claim.length).toBeGreaterThan(20);
      expect(c.paysOn.length).toBeGreaterThan(3);
    }
  });

  it("keeps optional reasoning capsules concise and single-paragraph", () => {
    for (const c of loadCalls()) {
      if (!c.reasoning) continue;
      const words = c.reasoning.trim().split(/\s+/);
      expect(words.length, c.id).toBeGreaterThanOrEqual(25);
      expect(words.length, c.id).toBeLessThanOrEqual(60);
      expect(c.reasoning, c.id).not.toMatch(/[\r\n]/);
    }
  });
});
