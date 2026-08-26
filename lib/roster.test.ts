import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadPundits } from "./data";

const SPORTS = new Set(["ncaaf", "nfl", "both"]);

describe("roster", () => {
  it("tags every pundit with a sport and carries no invented records", () => {
    for (const p of loadPundits()) {
      expect(SPORTS.has(p.sport), p.id).toBe(true);
      expect((p as Record<string, unknown>).estimated2025, p.id).toBeUndefined();
    }
  });

  it("has a real photo file for every pundit", () => {
    for (const p of loadPundits()) {
      expect(p.photo, p.id).toMatch(/^\/photos\/[a-z0-9-]+\.(jpg|png)$/);
      const rel = p.photo.replace(/^\//, "");
      expect(existsSync(path.join(process.cwd(), "public", rel)), p.id).toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = loadPundits().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
