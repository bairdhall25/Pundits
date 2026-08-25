import { describe, expect, it } from "vitest";
import {
  callsForEvent,
  eventHasFight,
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
    expect(callsForEvent("indiana-title", calls, "no").map((c) => c.punditId)).toContain(
      "finebaum"
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
