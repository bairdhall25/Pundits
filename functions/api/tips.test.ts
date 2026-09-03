import { describe, expect, it } from "vitest";
import { TIP_RETENTION_SECONDS, type TipSubmission } from "../../lib/tip-submission";
import { onRequest, onRequestPost } from "./tips";

function fakeKV() {
  const puts: Array<{ key: string; value: string; options?: KVNamespacePutOptions }> = [];
  return {
    puts,
    put: async (key: string, value: string, options?: KVNamespacePutOptions) => {
      puts.push({ key, value, options });
    },
  };
}

function tipRequest(fields: Record<string, string> = {}) {
  const body = new URLSearchParams({
    sourceUrl: "https://x.com/georgewrighster/status/2094593200447177117",
    punditHint: "George Wrighster",
    eventHint: "Clemson at LSU",
    eventSlugHint: "clemson-at-lsu-2026",
    sideHint: "yes",
    placement: "event",
    website: "",
    ...fields,
  });
  return new Request("https://pundits.pro/api/tips", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://pundits.pro",
    },
    body: body.toString(),
  });
}

function context(store: ReturnType<typeof fakeKV> | undefined, request: Request) {
  return { env: { PUNDITS_TIPS: store }, request };
}

describe("tip Pages Function", () => {
  it("stores a server-stamped anonymous lead with expiry", async () => {
    const store = fakeKV();
    const response = await onRequestPost(context(store, tipRequest()) as never);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(store.puts).toHaveLength(1);
    expect(store.puts[0].key.startsWith("tip:")).toBe(true);
    expect(store.puts[0].options?.expirationTtl).toBe(TIP_RETENTION_SECONDS);
    const saved = JSON.parse(store.puts[0].value) as TipSubmission;
    expect(saved.sourceUrl).toContain("x.com/georgewrighster/status/");
    expect(saved.discovery).toBe("website");
    expect(saved.receivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(saved.id).toBeTruthy();
    expect(JSON.stringify(saved)).not.toMatch(/email|sender|ipAddress/i);
  });

  it("stores a source even when no pundit hint is provided", async () => {
    const store = fakeKV();
    const response = await onRequestPost(
      context(store, tipRequest({ punditHint: "" })) as never
    );
    expect(response.status).toBe(200);
    const saved = JSON.parse(store.puts[0].value) as TipSubmission;
    expect(saved.sourceUrl).toContain("x.com/georgewrighster/status/");
    expect(saved).not.toHaveProperty("punditHint");
  });

  it("accepts honeypot spam without storing it", async () => {
    const store = fakeKV();
    const response = await onRequestPost(context(store, tipRequest({ website: "spam" })) as never);
    expect(response.status).toBe(200);
    expect(store.puts).toHaveLength(0);
  });

  it("rejects invalid and private URLs without echoing input", async () => {
    const store = fakeKV();
    const response = await onRequestPost(
      context(store, tipRequest({ sourceUrl: "http://127.0.0.1/private" })) as never
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "validation" });
    expect(store.puts).toHaveLength(0);
  });

  it("rejects a cross-origin form post", async () => {
    const store = fakeKV();
    const request = tipRequest();
    const foreign = new Request(request, { headers: { ...Object.fromEntries(request.headers), origin: "https://evil.example" } });
    const response = await onRequestPost(context(store, foreign) as never);
    expect(response.status).toBe(403);
    expect(store.puts).toHaveLength(0);
  });

  it("has no public read endpoint", async () => {
    const response = await onRequest({
      env: { PUNDITS_TIPS: fakeKV() },
      request: new Request("https://pundits.pro/api/tips"),
    } as never);
    expect(response.status).toBe(405);
  });

  it("reports unavailable storage without accepting the lead", async () => {
    const response = await onRequestPost(context(undefined, tipRequest()) as never);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "configuration" });
  });

  it("rejects an oversized body even without a content-length header", async () => {
    const store = fakeKV();
    const request = new Request("https://pundits.pro/api/tips", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://pundits.pro",
      },
      body: `sourceUrl=https%3A%2F%2Fexample.com%2Fpick&punditHint=${"a".repeat(17_000)}`,
    });
    const response = await onRequestPost(context(store, request) as never);
    expect(response.status).toBe(413);
    expect(store.puts).toHaveLength(0);
  });
});
