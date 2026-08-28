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

export function getEmailSignupConfig(): EmailSignupConfig {
  const endpoint = (process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENDPOINT ?? "").trim();
  const provider = (process.env.NEXT_PUBLIC_EMAIL_SIGNUP_PROVIDER ?? "").trim();
  const retention = (process.env.NEXT_PUBLIC_EMAIL_SIGNUP_RETENTION ?? "").trim();
  const contact = (process.env.NEXT_PUBLIC_PRIVACY_CONTACT ?? "").trim();
  const active = Boolean(
    endpoint.startsWith("https://") && provider && retention && contact.includes("@")
  );
  return { endpoint, provider, retention, contact, active };
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
    heading: "Never miss a verified pick.",
    body: "Join the early list for email alerts when new pundit picks are published. Alerts are not live yet.",
    button,
  };
}
