import { describe, expect, it } from "vitest";
import { loadEvents } from "./data";
import { formatGameWhen, seasonLabel, seasonSpan, statusLabel } from "./format";

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

  it("has unique slugs that end in the season", () => {
    const slugs = loadEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const e of loadEvents()) {
      expect(e.slug, e.title).toMatch(new RegExp(`-${e.season}$`));
    }
  });

  it("dates every game and seasons every event", () => {
    for (const e of loadEvents()) {
      expect(e.season, e.slug).toBe(2026);
      if (e.kind === "game") {
        expect(e.kickoffDate, e.slug).toMatch(/^2026-\d{2}-\d{2}$/);
      }
    }
    const clemson = loadEvents().find((e) => e.slug === "clemson-at-lsu-2026")!;
    expect(formatGameWhen(clemson)).toContain("Sep 5, 2026");
    expect(formatGameWhen(clemson)).toContain("7:30 ET");
  });

  it("uses the regular-season start year, not kickoff or Kalshi champion year", () => {
    expect(seasonSpan(2026)).toBe("2026–27");
    expect(seasonLabel(2026)).toBe("2026–27 season");
    // A 2026-season playoff game in January 2027 still belongs on the 2026 slug.
    expect(
      formatGameWhen({
        season: 2026,
        kickoffDate: "2027-01-10",
        kickoff: "Sun 1:00 ET",
        network: "CBS",
      })
    ).toBe("Sun Jan 10, 2027 · 1:00 ET · CBS");
    const rams = loadEvents().find((e) => e.slug === "rams-sb-2026")!;
    expect(rams.season).toBe(2026);
    expect(rams.contractName).toMatch(/2027/);
    expect(formatGameWhen(rams)).toBe("2026–27 season");
    expect(statusLabel("pending")).toBe("Live");
    expect(statusLabel("hit")).toBe("Hit");
    expect(statusLabel("miss")).toBe("Miss");
  });
});
