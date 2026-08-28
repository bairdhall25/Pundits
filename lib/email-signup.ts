export const EMAIL_SIGNUP_CONSENT_VERSION = "pick-alerts-early-access-v1";

export type EmailSignupPlacement = "home" | "pick_detail" | "pundit_profile";
export type EmailSignupScope = "all" | "event" | "pundit";

export type EmailSignupConfig = {
  endpoint: string;
  provider: string;
  retention: string;
  contact: string;
  active: boolean;
};

export type EmailSignupPayload = {
  email: string;
  placement: EmailSignupPlacement;
  scope: EmailSignupScope;
  scopeId: string;
  pagePath: string;
  consentVersion: string;
  submittedAt: string;
};

export const EMAIL_SIGNUP_ENDPOINT = "/api/email-interest";

export const EMAIL_SIGNUP_PROVIDER = "Pundits on Cloudflare";

export const EMAIL_SIGNUP_RETENTION =
  "We keep early-list addresses in our Cloudflare account until you ask us to delete them or we shut the list down. We are not sending pick-alert emails yet.";

export const EMAIL_SIGNUP_CONTACT =
  "https://github.com/bairdhall25/Pundits/issues";

export function getEmailSignupConfig(): EmailSignupConfig {
  const disabled = (process.env.NEXT_PUBLIC_EMAIL_SIGNUP_DISABLED ?? "").trim() === "true";
  const contact = (process.env.NEXT_PUBLIC_PRIVACY_CONTACT ?? "").trim() || EMAIL_SIGNUP_CONTACT;
  return {
    endpoint: EMAIL_SIGNUP_ENDPOINT,
    provider: EMAIL_SIGNUP_PROVIDER,
    retention: EMAIL_SIGNUP_RETENTION,
    contact,
    active: !disabled,
  };
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildSignupPayload(input: {
  email: string;
  placement: EmailSignupPlacement;
  scope: EmailSignupScope;
  scopeId?: string;
  pagePath: string;
  submittedAt?: string;
}): EmailSignupPayload {
  return {
    email: normalizeEmail(input.email),
    placement: input.placement,
    scope: input.scope,
    scopeId: input.scopeId ?? "",
    pagePath: input.pagePath,
    consentVersion: EMAIL_SIGNUP_CONSENT_VERSION,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  };
}

export type ParsedSignup =
  | { kind: "spam" }
  | { kind: "invalid" }
  | { kind: "ok"; payload: EmailSignupPayload };

export function parseSignupFields(fields: Record<string, string>): ParsedSignup {
  if ((fields._gotcha ?? "").trim() || (fields.website ?? "").trim()) {
    return { kind: "spam" };
  }
  const placements = new Set(["home", "pick_detail", "pundit_profile"]);
  const scopes = new Set(["all", "event", "pundit"]);
  const email = normalizeEmail(fields.email ?? "");
  const placement = fields.placement ?? "";
  const scope = fields.scope ?? "";
  if (!isPlausibleEmail(email) || !placements.has(placement) || !scopes.has(scope)) {
    return { kind: "invalid" };
  }
  return {
    kind: "ok",
    payload: buildSignupPayload({
      email,
      placement: placement as EmailSignupPlacement,
      scope: scope as EmailSignupScope,
      scopeId: fields.scopeId,
      pagePath: (fields.pagePath ?? "/").slice(0, 200),
      submittedAt: fields.submittedAt,
    }),
  };
}

export function signupFormBody(payload: EmailSignupPayload): URLSearchParams {
  const body = new URLSearchParams();
  body.set("email", payload.email);
  body.set("placement", payload.placement);
  body.set("scope", payload.scope);
  body.set("scopeId", payload.scopeId);
  body.set("pagePath", payload.pagePath);
  body.set("consentVersion", payload.consentVersion);
  body.set("submittedAt", payload.submittedAt);
  body.set("_gotcha", "");
  return body;
}

export function copyForPlacement(
  placement: EmailSignupPlacement,
  subjectName?: string
): { kicker: string; heading: string; body: string; button: string } {
  const kicker = "PICK ALERTS · EARLY ACCESS";
  const button = "Join the early list";
  if (placement === "pundit_profile") {
    return {
      kicker,
      heading: `Get new ${subjectName ?? "pundit"} picks.`,
      body: "Tell us you want pundit-specific email alerts. Alerts are not live yet.",
      button,
    };
  }
  if (placement === "pick_detail") {
    return {
      kicker,
      heading: "Get the next verified pick.",
      body: "Join the early list for future Pundits email alerts. Alerts are not live yet.",
      button,
    };
  }
  return {
    kicker,
    heading: "Get new picks — with the receipt.",
    body: "Join the early list for email alerts when new pundit picks are published. Alerts are not live yet.",
    button,
  };
}
