export type EmailInterestEvent =
  | "email_interest_view"
  | "email_interest_submit"
  | "email_interest_success"
  | "email_interest_error";

export type EmailInterestErrorType = "validation" | "network" | "provider" | "configuration";

export type TipEvent =
  | "tip_form_view"
  | "tip_submit"
  | "tip_success"
  | "tip_error";

export type TipErrorType = "validation" | "network" | "provider" | "configuration";

export type EngagementSurface =
  | "home"
  | "ncaaf"
  | "nfl"
  | "event"
  | "stories"
  | "take"
  | "book";

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

export function engagementParams(
  params: Record<string, string | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) out[key] = value;
  }
  return out;
}

export function trackEvent(
  event: string,
  params: Record<string, string | undefined>
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, engagementParams(params));
}

export function eventDetailOpenParams(input: {
  eventSlug: string;
  sport: string;
  surface: EngagementSurface;
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    sport: input.sport,
    surface: input.surface,
  });
}

export function pickStoryOpenParams(input: {
  eventSlug: string;
  punditId: string;
  status: string;
  surface: EngagementSurface;
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    status: input.status,
    surface: input.surface,
  });
}

export function sourceOpenParams(input: {
  eventSlug: string;
  punditId: string;
  sourceType: "evidence" | "kalshi";
}) {
  return engagementParams({
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    source_type: input.sourceType,
  });
}

export function shareIntentParams(input: {
  artifactType: "event" | "take" | "pundit";
  eventSlug: string;
  punditId?: string;
  status?: string;
}) {
  return engagementParams({
    artifact_type: input.artifactType,
    event_slug: input.eventSlug,
    pundit_id: input.punditId,
    status: input.status,
  });
}

export function filterUseParams(input: {
  surface: "stories" | "book";
  filterName: string;
  filterValue: string;
}) {
  return engagementParams({
    surface: input.surface,
    filter_name: input.filterName,
    filter_value: input.filterValue,
  });
}

export function trackEmailInterest(event: EmailInterestEvent, params: EmailInterestParams): void {
  trackEvent(event, analyticsParams(params));
}

export function tipAnalyticsParams(input: {
  placement: string;
  eventSlug?: string;
  sideHint?: string;
  pagePath: string;
  errorType?: TipErrorType;
}) {
  return engagementParams({
    placement: input.placement,
    event_slug: input.eventSlug,
    side_hint: input.sideHint,
    page_path: input.pagePath,
    error_type: input.errorType,
  });
}

export function trackTip(event: TipEvent, params: Record<string, string>): void {
  trackEvent(event, params);
}
