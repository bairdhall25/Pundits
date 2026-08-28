import { parseSignupFields } from "../../lib/email-signup";

type Env = {
  PUNDITS_EMAIL: KVNamespace;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function readFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  for (const [key, value] of params.entries()) out[key] = value;
  return out;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const store = context.env.PUNDITS_EMAIL;
  if (!store) return json({ ok: false, error: "configuration" }, 503);

  let fields: Record<string, string>;
  try {
    fields = await readFields(context.request);
  } catch {
    return json({ ok: false, error: "validation" }, 400);
  }

  const parsed = parseSignupFields(fields);
  if (parsed.kind === "spam") return json({ ok: true });
  if (parsed.kind === "invalid") return json({ ok: false, error: "validation" }, 400);

  const row = parsed.payload;
  try {
    const existing = await store.get(row.email);
    if (!existing) {
      await store.put(row.email, JSON.stringify(row), {
        metadata: {
          placement: row.placement,
          submittedAt: row.submittedAt,
        },
      });
    }
  } catch {
    return json({ ok: false, error: "provider" }, 500);
  }

  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  return json({ ok: false, error: "method" }, 405);
};
