import { describe, expect, it } from "vitest";
import {
  callsForEvent,
  eventHasFight,
  getBoard,
  getHomeEvents,
  impliedOpenDollars,
  loadCalls,
  loadEvents,
  mappedCalls,
} from "./data";

describe("v1 mapped book", () => {
  it("maps the Indiana title fight both ways", () => {
    const calls = loadCalls();
    expect(eventHasFight("indiana-title", calls)).toBe(true);
    expect(callsForEvent("indiana-title", calls, "yes").map((c) => c.punditId)).toContain(
      "thamel"
    );
    expect(callsForEvent("indiana-title", calls, "no").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["finebaum", "herbstreit"])
    );
  });

  it("does not map weasels onto the board", () => {
    const slugs = new Set(mappedCalls(loadCalls()).map((c) => c.id));
    expect(slugs.has("herbstreit-nd-title-lean")).toBe(false);
    expect(slugs.has("herbstreit-michigan-b1g")).toBe(false);
    expect(slugs.has("saban-uga-texas-cfp")).toBe(false);
    expect(slugs.has("mcelroy-oklahoma-title")).toBe(false);
    expect(slugs.has("thamel-usc-binary")).toBe(false);
    expect(slugs.has("mcafee-wvu-title")).toBe(false);
  });

  it("puts fights first on the home list", () => {
    const home = getHomeEvents(loadEvents(), loadCalls());
    expect(home[0].slug).toBe("indiana-title");
    expect(home.every((e) => e.onHome)).toBe(true);
  });

  it("counts Finebaum open $100 per mapped pending call", () => {
    const n = mappedCalls(loadCalls()).filter(
      (c) => c.punditId === "finebaum" && c.status === "pending"
    ).length;
    expect(impliedOpenDollars("finebaum", loadCalls())).toBe(n * 100);
    expect(n).toBeGreaterThanOrEqual(4);
  });
});

describe("Top 10 boards", () => {
  it("exposes 10 NCAAF home events and 10 NFL home events", () => {
    const events = loadEvents();
    const calls = loadCalls();
    const ncaaf = getBoard("ncaaf", events, calls);
    const nfl = getBoard("nfl", events, calls);
    expect(ncaaf).toHaveLength(10);
    expect(nfl).toHaveLength(10);
    expect(ncaaf.every((e) => e.sport === "ncaaf" && e.onHome)).toBe(true);
    expect(nfl.every((e) => e.sport === "nfl" && e.onHome)).toBe(true);
  });

  it("maps Herbstreit's Nonstop title bracket as clear leans", () => {
    const calls = loadCalls();
    expect(callsForEvent("nd-title", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["coughlin", "herbstreit"])
    );
    expect(callsForEvent("osu-title", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-title", calls, "no").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("osu-cfp", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
    expect(callsForEvent("georgia-cfp", calls, "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });

  it("maps first-person NFL Super Bowl leans, not McAfee-show guests as Pat", () => {
    const calls = loadCalls();
    expect(eventHasFight("rams-sb", calls)).toBe(true);
    expect(callsForEvent("rams-sb", calls, "yes").map((c) => c.punditId)).toContain(
      "butler"
    );
    expect(callsForEvent("rams-sb", calls, "no").map((c) => c.punditId)).toContain("hawk");
    expect(callsForEvent("bills-sb", calls, "yes").map((c) => c.punditId)).toEqual(
      expect.arrayContaining(["skip", "hawk"])
    );
    expect(
      mappedCalls(calls).filter((c) => c.punditId === "mcafee" && c.eventSlug?.endsWith("-sb"))
    ).toHaveLength(0);
  });

  it("keeps LSU title and Tech CFP off the Top 10 even when mapped", () => {
    const ncaaf = getBoard("ncaaf", loadEvents(), loadCalls());
    expect(ncaaf.map((e) => e.slug)).not.toContain("lsu-title");
    expect(ncaaf.map((e) => e.slug)).not.toContain("tech-cfp");
    expect(callsForEvent("lsu-title", loadCalls(), "no").map((c) => c.punditId)).toContain(
      "finebaum"
    );
    expect(callsForEvent("tech-cfp", loadCalls(), "yes").map((c) => c.punditId)).toContain(
      "herbstreit"
    );
  });
});
