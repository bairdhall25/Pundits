import { canonicalUrl } from "./site";

export const CAMPAIGN_STORAGE_KEY = "pundits.acq";

export const CAMPAIGN_SOURCES = ["x"] as const;
export const CAMPAIGN_MEDIUMS = ["social", "paid"] as const;
export const CAMPAIGN_NAMES = ["organic-original", "organic-reply", "paid"] as const;
export const CAMPAIGN_CONTENTS = ["game", "receipt", "profile"] as const;

export type CampaignSource = (typeof CAMPAIGN_SOURCES)[number];
export type CampaignMedium = (typeof CAMPAIGN_MEDIUMS)[number];
export type CampaignName = (typeof CAMPAIGN_NAMES)[number];
export type CampaignContent = (typeof CAMPAIGN_CONTENTS)[number];

export type CampaignParams = {
  source: CampaignSource;
  medium: CampaignMedium;
  campaign: CampaignName;
  content: CampaignContent;
};

export type CampaignStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const SOURCE_SET = new Set<string>(CAMPAIGN_SOURCES);
const MEDIUM_SET = new Set<string>(CAMPAIGN_MEDIUMS);
const NAME_SET = new Set<string>(CAMPAIGN_NAMES);
const CONTENT_SET = new Set<string>(CAMPAIGN_CONTENTS);

function withTrailingSlashPath(pathname: string): string {
  if (!pathname.endsWith("/")) return `${pathname}/`;
  return pathname;
}

/** Canonical destination: origin + path, no query, no hash. */
export function canonicalFromHref(href: string): string {
  const parsed = new URL(href);
  parsed.search = "";
  parsed.hash = "";
  parsed.pathname = withTrailingSlashPath(parsed.pathname || "/");
  return parsed.toString();
}

export function parseCampaignParams(
  search: string | URLSearchParams
): Partial<CampaignParams> {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: Partial<CampaignParams> = {};
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  const content = params.get("utm_content");
  if (source && SOURCE_SET.has(source)) out.source = source as CampaignSource;
  if (medium && MEDIUM_SET.has(medium)) out.medium = medium as CampaignMedium;
  if (campaign && NAME_SET.has(campaign)) out.campaign = campaign as CampaignName;
  if (content && CONTENT_SET.has(content)) out.content = content as CampaignContent;
  return out;
}

export function applyCampaignParams(canonical: string, campaign: CampaignParams): string {
  const url = new URL(canonicalFromHref(canonical));
  url.searchParams.set("utm_source", campaign.source);
  url.searchParams.set("utm_medium", campaign.medium);
  url.searchParams.set("utm_campaign", campaign.campaign);
  url.searchParams.set("utm_content", campaign.content);
  return url.toString();
}

/** Bot-distributed outbound link. Never used for native site share or canonicals. */
export function botDistributedUrl(
  canonical: string,
  input: { kind: "original" | "reply"; pageType: CampaignContent }
): string {
  return applyCampaignParams(canonical, {
    source: "x",
    medium: "social",
    campaign: input.kind === "reply" ? "organic-reply" : "organic-original",
    content: input.pageType,
  });
}

/** Native on-site share URL. Canonical only — no campaign query. */
export function nativeShareUrl(path: string): string {
  return canonicalUrl(path);
}

export function campaignEventParams(
  search: string = "",
  stored: Partial<CampaignParams> | null = null
): Record<string, string> {
  const parsed = parseCampaignParams(search);
  const merged: Partial<CampaignParams> = { ...(stored ?? {}), ...parsed };
  const out: Record<string, string> = {};
  if (merged.source) out.acq_source = merged.source;
  if (merged.medium) out.acq_medium = merged.medium;
  if (merged.campaign) out.acq_campaign = merged.campaign;
  if (merged.content) out.acq_content = merged.content;
  return out;
}

export function readPersistedCampaign(
  store: CampaignStore | null | undefined
): Partial<CampaignParams> | null {
  if (!store) return null;
  const raw = store.getItem(CAMPAIGN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const search = new URLSearchParams();
    if (typeof parsed.source === "string") search.set("utm_source", parsed.source);
    if (typeof parsed.medium === "string") search.set("utm_medium", parsed.medium);
    if (typeof parsed.campaign === "string") search.set("utm_campaign", parsed.campaign);
    if (typeof parsed.content === "string") search.set("utm_content", parsed.content);
    const allowed = parseCampaignParams(search);
    return Object.keys(allowed).length ? allowed : null;
  } catch {
    return null;
  }
}

export function persistCampaignParams(
  params: Partial<CampaignParams>,
  store: CampaignStore | null | undefined
): Partial<CampaignParams> | null {
  if (!store) return null;
  if (!params.source && !params.medium && !params.campaign && !params.content) {
    return readPersistedCampaign(store);
  }
  const current = readPersistedCampaign(store) ?? {};
  const next = { ...current, ...params };
  store.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function persistCampaignFromSearch(
  search: string,
  store: CampaignStore | null | undefined
): Partial<CampaignParams> | null {
  return persistCampaignParams(parseCampaignParams(search), store);
}

function browserStore(): CampaignStore | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function browserCampaignEventParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return campaignEventParams(window.location.search, readPersistedCampaign(browserStore()));
}

export function persistBrowserCampaign(): void {
  if (typeof window === "undefined") return;
  persistCampaignFromSearch(window.location.search, browserStore());
}
