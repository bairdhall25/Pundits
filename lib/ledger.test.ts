import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits, isMapped } from "./data";

describe("ledger integrity", () => {
  const calls = loadCalls();
  const events = loadEvents();
  const pundits = loadPundits();
  const slugs = new Set(events.map((e) => e.slug));
  const punditIds = new Set(pundits.map((p) => p.id));

  it("every call belongs to a roster pundit", () => {
    for (const c of calls) expect(punditIds.has(c.punditId), c.id).toBe(true);
  });

  it("mapped calls point at real events with a valid side", () => {
    for (const c of calls.filter(isMapped)) {
      expect(slugs.has(c.eventSlug!), c.id).toBe(true);
      expect(["yes", "no"]).toContain(c.side);
    }
  });

  it("only hard calls are mapped", () => {
    for (const c of calls.filter(isMapped)) expect(c.kind, c.id).toBe("hard");
  });

  it("every call is sourced and real", () => {
    for (const c of calls) {
      expect(c.claim.toLowerCase(), c.id).not.toMatch(/lorem|placeholder|todo|tbd|illustrative/);
      expect(c.claim.length, c.id).toBeGreaterThan(20);
      expect(c.sourceDate, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("mapped calls always carry a source url", () => {
    for (const c of calls.filter(isMapped)) {
      expect(c.sourceUrl, c.id).toMatch(/^https?:\/\//);
    }
  });

  it("has unique call ids", () => {
    const ids = calls.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps at most one hard row per pundit and event", () => {
    const keys = calls.filter(isMapped).map((c) => `${c.punditId}|${c.eventSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
