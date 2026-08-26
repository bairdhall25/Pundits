import { describe, expect, it } from "vitest";
import { loadEvents } from "./data";

describe("kalshi freeze", () => {
  it("prices and sources every home event, and sources every priced event", () => {
    for (const e of loadEvents().filter((e) => e.onHome)) {
      expect(e.yesCents, e.slug).not.toBeNull();
      expect(e.noCents, e.slug).not.toBeNull();
    }
    for (const e of loadEvents().filter((e) => e.yesCents != null)) {
      expect(e.sourceUrl, e.slug).toMatch(/^https?:\/\//);
      expect(e.sourcedAt, e.slug).toMatch(/^2026-\d{2}-\d{2}/);
    }
  });

  it("has sane cents on every priced event", () => {
    for (const e of loadEvents()) {
      if (e.yesCents == null || e.noCents == null) continue;
      expect(e.yesCents, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.yesCents, e.slug).toBeLessThanOrEqual(99);
      expect(e.noCents, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.noCents, e.slug).toBeLessThanOrEqual(99);
      const sum = e.yesCents + e.noCents;
      expect(sum, e.slug).toBeGreaterThanOrEqual(95);
      expect(sum, e.slug).toBeLessThanOrEqual(105);
    }
  });

  it("has unique slugs", () => {
    const slugs = loadEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
