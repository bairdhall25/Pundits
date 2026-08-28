import { describe, expect, it } from "vitest";
import { onRequestPost } from "./email-interest";

type Row = { email: string; placement: string };

function fakeKV(existing: Record<string, string> = {}) {
  const puts: Array<{ key: string; value: string }> = [];
  return {
    puts,
    get: async (key: string) => existing[key] ?? null,
    put: async (key: string, value: string) => {
      puts.push({ key, value });
    },
  };
}

function fakeNotify(impl?: () => Promise<Response>) {
  const calls: Array<{ url: string; body: string }> = [];
  return {
    calls,
    fetch: async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: String(init?.body ?? "") });
      if (impl) return impl();
      return new Response("ok");
    },
  };
}

function signupRequest(email = "fan@example.com") {
  const body = new URLSearchParams({
    email,
    placement: "home",
    scope: "all",
    pagePath: "/",
  });
  return new Request("https://pundits.pro/api/email-interest", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

function makeContext(env: Record<string, unknown>, request: Request) {
  const background: Promise<unknown>[] = [];
  return {
    context: {
      env,
      request,
      waitUntil: (p: Promise<unknown>) => background.push(p),
    },
    background,
  };
}

describe("email-interest function notifications", () => {
  it("stores a new signup and notifies the email worker with the payload", async () => {
    const store = fakeKV();
    const notify = fakeNotify();
    const { context, background } = makeContext(
      { PUNDITS_EMAIL: store, EMAIL_NOTIFY: notify },
      signupRequest()
    );
    const res = await onRequestPost(context as never);
    await Promise.all(background);
    expect(res.status).toBe(200);
    expect(store.puts).toHaveLength(1);
    expect(notify.calls).toHaveLength(1);
    const sent = JSON.parse(notify.calls[0].body) as Row;
    expect(sent.email).toBe("fan@example.com");
    expect(sent.placement).toBe("home");
  });

  it("does not notify on a duplicate signup", async () => {
    const store = fakeKV({ "fan@example.com": "{}" });
    const notify = fakeNotify();
    const { context, background } = makeContext(
      { PUNDITS_EMAIL: store, EMAIL_NOTIFY: notify },
      signupRequest()
    );
    const res = await onRequestPost(context as never);
    await Promise.all(background);
    expect(res.status).toBe(200);
    expect(store.puts).toHaveLength(0);
    expect(notify.calls).toHaveLength(0);
  });

  it("still accepts the signup when the notify binding is absent", async () => {
    const store = fakeKV();
    const { context, background } = makeContext(
      { PUNDITS_EMAIL: store },
      signupRequest()
    );
    const res = await onRequestPost(context as never);
    await Promise.all(background);
    expect(res.status).toBe(200);
    expect(store.puts).toHaveLength(1);
  });

  it("still accepts the signup when the notify call fails", async () => {
    const store = fakeKV();
    const notify = fakeNotify(() => Promise.reject(new Error("worker down")));
    const { context, background } = makeContext(
      { PUNDITS_EMAIL: store, EMAIL_NOTIFY: notify },
      signupRequest()
    );
    const res = await onRequestPost(context as never);
    // must not reject even though the notify fetch failed
    await Promise.all(background);
    expect(res.status).toBe(200);
    expect(store.puts).toHaveLength(1);
  });
});
