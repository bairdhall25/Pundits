import { describe, expect, it } from "vitest";
import {
  TIP_RETENTION_SECONDS,
  buildTipSubmission,
  normalizePublicSourceUrl,
  parseTipFields,
  tipFormBody,
  tipQueueKey,
} from "./tip-submission";

describe("tip submission contract", () => {
  it("normalizes a valid anonymous website tip", () => {
    const tip = buildTipSubmission(
      {
        sourceUrl: " https://x.com/georgewrighster/status/2094593200447177117 ",
        punditHint: "  George   Wrighster  ",
        eventHint: " Clemson at LSU ",
        eventSlugHint: "clemson-at-lsu-2026",
        sideHint: "yes",
        timestampHint: " 0:42 ",
        placement: "event",
        discovery: "website",
      },
      { id: "tip-1", receivedAt: "2026-09-03T12:00:00.000Z" }
    );

    expect(tip).toEqual({
      id: "tip-1",
      receivedAt: "2026-09-03T12:00:00.000Z",
      discovery: "website",
      sourceUrl: "https://x.com/georgewrighster/status/2094593200447177117",
      punditHint: "George Wrighster",
      eventHint: "Clemson at LSU",
      eventSlugHint: "clemson-at-lsu-2026",
      sideHint: "yes",
      timestampHint: "0:42",
      placement: "event",
    });
    expect(TIP_RETENTION_SECONDS).toBe(90 * 24 * 60 * 60);
  });

  it.each([
    "javascript:alert(1)",
    "file:///etc/passwd",
    "http://localhost:3000/private",
    "http://127.0.0.1/private",
    "http://10.0.0.4/private",
    "http://192.168.1.2/private",
    "http://[::ffff:127.0.0.1]/private",
    "https://user:pass@example.com/source",
  ])("rejects non-public source URL %s", (value) => {
    expect(normalizePublicSourceUrl(value)).toBeNull();
  });

  it("does not confuse a public hostname beginning with fc for private IPv6", () => {
    expect(normalizePublicSourceUrl("https://fca.example/pick")).toBe("https://fca.example/pick");
  });

  it("treats honeypot content as spam without retaining fields", () => {
    expect(
      parseTipFields(
        {
          sourceUrl: "https://example.com/pick",
          punditHint: "Someone",
          website: "spam.example",
        },
        { id: "tip-1", receivedAt: "2026-09-03T12:00:00.000Z" }
      )
    ).toEqual({ kind: "spam" });
  });

  it("accepts a public source without a pundit hint", () => {
    expect(
      parseTipFields(
        { sourceUrl: "https://example.com/pick", punditHint: "" },
        { id: "tip-1", receivedAt: "2026-09-03T12:00:00.000Z" }
      )
    ).toEqual({
      kind: "ok",
      payload: {
        id: "tip-1",
        receivedAt: "2026-09-03T12:00:00.000Z",
        discovery: "website",
        sourceUrl: "https://example.com/pick",
        placement: "direct",
      },
    });
  });

  it("serializes only the public-source form fields", () => {
    const body = tipFormBody({
      sourceUrl: "https://example.com/pick",
      punditHint: "Example Pundit",
      eventHint: "Example at Test",
      eventSlugHint: "example-at-test-2026",
      sideHint: "no",
      timestampHint: "12:30",
      placement: "footer",
    });
    expect(Object.fromEntries(body.entries())).toEqual({
      sourceUrl: "https://example.com/pick",
      punditHint: "Example Pundit",
      eventHint: "Example at Test",
      eventSlugHint: "example-at-test-2026",
      sideHint: "no",
      timestampHint: "12:30",
      placement: "footer",
      website: "",
    });
    expect(body.has("email")).toBe(false);
    expect(body.has("name")).toBe(false);
  });

  it("uses a time-sortable queue key", () => {
    expect(
      tipQueueKey({ id: "abc", receivedAt: "2026-09-03T12:00:00.000Z" })
    ).toBe("tip:2026-09-03T12:00:00.000Z:abc");
  });
});
