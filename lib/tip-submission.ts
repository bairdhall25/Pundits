export const TIP_SUBMISSION_ENDPOINT = "/api/tips";
export const TIP_RETENTION_SECONDS = 90 * 24 * 60 * 60;

export type TipDiscovery = "website" | "x-dm";
export type TipPlacement = "event" | "footer" | "direct";
export type TipSideHint = "yes" | "no";

export type TipSubmissionInput = {
  sourceUrl: string;
  punditHint?: string;
  eventHint?: string;
  eventSlugHint?: string;
  sideHint?: TipSideHint;
  timestampHint?: string;
  placement?: TipPlacement;
  discovery?: TipDiscovery;
};

export type TipSubmission = {
  id: string;
  receivedAt: string;
  discovery: TipDiscovery;
  sourceUrl: string;
  punditHint?: string;
  eventHint?: string;
  eventSlugHint?: string;
  sideHint?: TipSideHint;
  timestampHint?: string;
  placement: TipPlacement;
};

export type ParsedTip =
  | { kind: "spam" }
  | { kind: "invalid" }
  | { kind: "ok"; payload: TipSubmission };

const PLACEMENTS = new Set<TipPlacement>(["event", "footer", "direct"]);
const DISCOVERY = new Set<TipDiscovery>(["website", "x-dm"]);

function normalizeText(value: string | undefined, max: number): string {
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  return (
    parts[0] === 0 ||
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const embeddedIpv4 = host.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1];
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "::" ||
    host === "::1" ||
    host.startsWith("::ffff:") ||
    (host.includes(":") &&
      (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:"))) ||
    (embeddedIpv4 ? isPrivateIpv4(embeddedIpv4) : false) ||
    isPrivateIpv4(host)
  );
}

export function normalizePublicSourceUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (!new Set(["http:", "https:"]).has(url.protocol)) return null;
    if (url.username || url.password || !url.hostname || isPrivateHostname(url.hostname)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeSlugHint(raw: string | undefined): string | undefined {
  const value = normalizeText(raw, 120).toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : undefined;
}

export function buildTipSubmission(
  input: TipSubmissionInput,
  server: { id: string; receivedAt: string }
): TipSubmission {
  const sourceUrl = normalizePublicSourceUrl(input.sourceUrl);
  const punditHint = normalizeText(input.punditHint, 120);
  if (!sourceUrl) throw new Error("invalid tip");

  const placement = PLACEMENTS.has(input.placement as TipPlacement)
    ? (input.placement as TipPlacement)
    : "direct";
  const discovery = DISCOVERY.has(input.discovery as TipDiscovery)
    ? (input.discovery as TipDiscovery)
    : "website";
  const eventHint = normalizeText(input.eventHint, 160) || undefined;
  const eventSlugHint = normalizeSlugHint(input.eventSlugHint);
  const sideHint = input.sideHint === "yes" || input.sideHint === "no" ? input.sideHint : undefined;
  const timestampHint = normalizeText(input.timestampHint, 160) || undefined;

  return {
    id: normalizeText(server.id, 100),
    receivedAt: server.receivedAt,
    discovery,
    sourceUrl,
    ...(punditHint ? { punditHint } : {}),
    ...(eventHint ? { eventHint } : {}),
    ...(eventSlugHint ? { eventSlugHint } : {}),
    ...(sideHint ? { sideHint } : {}),
    ...(timestampHint ? { timestampHint } : {}),
    placement,
  };
}

export function parseTipFields(
  fields: Record<string, string>,
  server: { id: string; receivedAt: string }
): ParsedTip {
  if ((fields.website ?? "").trim() || (fields._gotcha ?? "").trim()) {
    return { kind: "spam" };
  }
  try {
    return {
      kind: "ok",
      payload: buildTipSubmission(
        {
          sourceUrl: fields.sourceUrl ?? "",
          punditHint: fields.punditHint ?? "",
          eventHint: fields.eventHint,
          eventSlugHint: fields.eventSlugHint,
          sideHint: fields.sideHint as TipSideHint,
          timestampHint: fields.timestampHint,
          placement: fields.placement as TipPlacement,
          discovery: "website",
        },
        server
      ),
    };
  } catch {
    return { kind: "invalid" };
  }
}

export function tipFormBody(input: TipSubmissionInput): URLSearchParams {
  const body = new URLSearchParams();
  body.set("sourceUrl", input.sourceUrl);
  body.set("punditHint", input.punditHint ?? "");
  body.set("eventHint", input.eventHint ?? "");
  body.set("eventSlugHint", input.eventSlugHint ?? "");
  body.set("sideHint", input.sideHint ?? "");
  body.set("timestampHint", input.timestampHint ?? "");
  body.set("placement", input.placement ?? "direct");
  body.set("website", "");
  return body;
}

export function tipQueueKey(tip: Pick<TipSubmission, "id" | "receivedAt">): string {
  return `tip:${tip.receivedAt}:${tip.id}`;
}
