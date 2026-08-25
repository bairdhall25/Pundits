import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadPundits } from "./data";

const CFB_IDS = [
  "herbstreit",
  "mcafee",
  "saban",
  "finebaum",
  "mcfarland",
  "mcelroy",
  "coughlin",
  "thamel",
] as const;

const NFL_IDS = ["skip", "hawk", "butler"] as const;

describe("roster", () => {
  it("keeps the eight CFB voices and adds NFL voices with first-person Super Bowl leans", () => {
    const ids = loadPundits().map((p) => p.id).sort();
    expect(ids).toEqual([...CFB_IDS, ...NFL_IDS].sort());
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
