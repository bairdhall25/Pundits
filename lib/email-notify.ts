import type { EmailSignupPayload } from "./email-signup";

const CRLF = "\r\n";

function clean(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function notifySubject(payload: EmailSignupPayload): string {
  return `New early-list signup · ${clean(payload.placement)}`;
}

export function buildNotifyMime(
  payload: EmailSignupPayload,
  address: { from: string; to: string }
): string {
  const scopeLine = payload.scopeId
    ? `${clean(payload.scope)} · ${clean(payload.scopeId)}`
    : clean(payload.scope);
  const headers = [
    `From: Pundits <${clean(address.from)}>`,
    `To: ${clean(address.to)}`,
    `Subject: ${notifySubject(payload)}`,
    `Date: ${new Date(payload.submittedAt).toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
  ];
  const body = [
    `Email: ${clean(payload.email)}`,
    `Placement: ${clean(payload.placement)}`,
    `Scope: ${scopeLine}`,
    `Page: ${clean(payload.pagePath)}`,
    `Submitted: ${clean(payload.submittedAt)}`,
    `Consent: ${clean(payload.consentVersion)}`,
  ];
  return headers.join(CRLF) + CRLF + CRLF + body.join(CRLF) + CRLF;
}
