import { EmailMessage } from "cloudflare:email";
import { buildNotifyMime } from "../../../lib/email-notify";
import { isPlausibleEmail, type EmailSignupPayload } from "../../../lib/email-signup";

type Env = {
  SEND_EMAIL: { send(message: EmailMessage): Promise<void> };
  NOTIFY_FROM: string;
  NOTIFY_TO: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("method", { status: 405 });
    }
    if (!env.NOTIFY_FROM || !env.NOTIFY_TO) {
      return new Response("configuration", { status: 503 });
    }
    let payload: EmailSignupPayload;
    try {
      payload = (await request.json()) as EmailSignupPayload;
    } catch {
      return new Response("validation", { status: 400 });
    }
    if (!payload || typeof payload.email !== "string" || !isPlausibleEmail(payload.email)) {
      return new Response("validation", { status: 400 });
    }
    const mime = buildNotifyMime(payload, {
      from: env.NOTIFY_FROM,
      to: env.NOTIFY_TO,
    });
    try {
      await env.SEND_EMAIL.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, mime));
    } catch (err) {
      const detail = err instanceof Error ? err.message : "error";
      return new Response(`send: ${detail}`, { status: 502 });
    }
    return new Response("ok");
  },
};
