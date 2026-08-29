import { describe, expect, it } from "vitest";
import { formatNetDollars, settledNetDollars } from "./records";
import type { Call, Event } from "./types";

const events = [
  { slug: "unc-vs-tcu-2026", yesCents: 26, noCents: 75 },
  { slug: "clemson-at-lsu-2026", yesCents: 24, noCents: 78 },
] as Event[];

function call(over: Partial<Call>): Call {
  return {
    id: "c",
    punditId: "finebaum",
    kind: "hard",
    status: "pending",
    ...over,
  } as Call;
}

describe("settledNetDollars", () => {
  it("pays a hit at the frozen price of the picked side", () => {
    // $100 on NO at 75¢ returns 100/0.75 → +$33 profit
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "no", status: "hit" }),
    ];
    expect(settledNetDollars("finebaum", calls, events)).toBe(33);
  });

  it("loses the $100 stake on a miss", () => {
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "yes", status: "miss" }),
    ];
    expect(settledNetDollars("finebaum", calls, events)).toBe(-100);
  });

  it("ignores pending, unmapped, and other pundits' calls", () => {
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "no", status: "pending" }),
      call({ status: "hit" }), // unmapped
      call({
        punditId: "herbstreit",
        eventSlug: "unc-vs-tcu-2026",
        side: "no",
        status: "hit",
      }),
    ];
    expect(settledNetDollars("finebaum", calls, events)).toBe(0);
  });

  it("nets hits and misses together", () => {
    const calls = [
      call({ eventSlug: "unc-vs-tcu-2026", side: "no", status: "hit" }),
      call({ eventSlug: "clemson-at-lsu-2026", side: "yes", status: "miss" }),
    ];
    expect(settledNetDollars("finebaum", calls, events)).toBe(-67);
  });
});

describe("formatNetDollars", () => {
  it("signs the amount", () => {
    expect(formatNetDollars(33)).toBe("+$33");
    expect(formatNetDollars(-100)).toBe("−$100");
    expect(formatNetDollars(0)).toBe("$0");
  });
});
