export type EmailInterestEvent =
  | "email_interest_view"
  | "email_interest_submit"
  | "email_interest_success"
  | "email_interest_error";

export type EmailInterestErrorType = "validation" | "network" | "provider" | "configuration";

export type EmailInterestParams = {
  placement: string;
  scope: string;
  scope_id?: string;
  page_path: string;
  consent_version: string;
  error_type?: EmailInterestErrorType;
};

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      eventName: string,
      params?: Record<string, string>
    ) => void;
  }
}

export function analyticsParams(params: EmailInterestParams): Record<string, string> {
  const out: Record<string, string> = {
    placement: params.placement,
    scope: params.scope,
    page_path: params.page_path,
    consent_version: params.consent_version,
  };
  if (params.scope_id) out.scope_id = params.scope_id;
  if (params.error_type) out.error_type = params.error_type;
  return out;
}

export function trackEmailInterest(event: EmailInterestEvent, params: EmailInterestParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, analyticsParams(params));
}
