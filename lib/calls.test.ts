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

  it("is almost all pending for the preseason snapshot", () => {
    const calls = loadCalls();
    const pending = calls.filter((c) => c.status === "pending").length;
    expect(pending).toBe(calls.length);
  });

  it("does not use placeholder claim text", () => {
    for (const c of loadCalls()) {
      expect(c.claim.toLowerCase()).not.toMatch(/lorem|placeholder|todo|tbd/);
      expect(c.claim.length).toBeGreaterThan(20);
      expect(c.paysOn.length).toBeGreaterThan(3);
    }
  });
});
