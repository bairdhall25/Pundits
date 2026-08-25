import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadPundits } from "./data";

const IDS = [
  "herbstreit",
  "mcafee",
  "saban",
  "finebaum",
  "mcfarland",
  "mcelroy",
  "coughlin",
  "thamel",
] as const;

describe("roster", () => {
  it("has exactly the eight spec ids", () => {
    const ids = loadPundits().map((p) => p.id).sort();
    expect(ids).toEqual([...IDS].sort());
  });

  it("has a photo file for every pundit", () => {
    for (const p of loadPundits()) {
      const rel = p.photo.replace(/^\//, "");
      expect(existsSync(path.join(process.cwd(), "public", rel.replace(/^photos\//, "photos/"))) || existsSync(path.join(process.cwd(), "public", rel))).toBe(true);
      expect(p.photo).toMatch(/^\/photos\/[a-z]+\.(jpg|png)$/);
    }
  });

  it("has invented 2025 W-L so accuracy is not zero", () => {
    for (const p of loadPundits()) {
      expect(p.estimated2025.wins + p.estimated2025.losses).toBeGreaterThan(0);
    }
  });
});
