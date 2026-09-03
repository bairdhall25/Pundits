import {
  TIP_RETENTION_SECONDS,
  parseTipFields,
  tipQueueKey,
} from "../../lib/tip-submission";

type Env = {
  PUNDITS_TIPS?: KVNamespace;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function readFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? "";
  const text = await request.text();
  if (text.length > 16_384) throw new Error("request too large");
  if (contentType.includes("application/json")) {
    const data = JSON.parse(text) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(data).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
  }
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries());
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!sameOrigin(context.request)) return json({ ok: false, error: "origin" }, 403);
  const contentLength = Number(context.request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return json({ ok: false, error: "validation" }, 413);
  }

  const store = context.env.PUNDITS_TIPS;
  if (!store) return json({ ok: false, error: "configuration" }, 503);

  let fields: Record<string, string>;
  try {
    fields = await readFields(context.request);
  } catch (error) {
    const status = error instanceof Error && error.message === "request too large" ? 413 : 400;
    return json({ ok: false, error: "validation" }, status);
  }

  const parsed = parseTipFields(fields, {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  });
  if (parsed.kind === "spam") return json({ ok: true });
  if (parsed.kind === "invalid") return json({ ok: false, error: "validation" }, 400);

  const tip = parsed.payload;
  try {
    await store.put(tipQueueKey(tip), JSON.stringify(tip), {
      expirationTtl: TIP_RETENTION_SECONDS,
      metadata: {
        id: tip.id,
        receivedAt: tip.receivedAt,
        discovery: tip.discovery,
        placement: tip.placement,
      },
    });
  } catch {
    return json({ ok: false, error: "provider" }, 500);
  }

  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204 });
  return json({ ok: false, error: "method" }, 405);
};
