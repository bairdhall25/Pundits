import type { Metadata } from "next";

export const SITE_NAME = "PUNDITS";

export const SITE_TITLE = "PUNDITS — Expert CFB and NFL picks";

export const SITE_DESCRIPTION =
  "See which teams the TV experts are picking in college football and the NFL. Quote, source, and the market price. Hypothetical $100 — not a bet they placed.";

export const OG_ALT = "PUNDITS. Expert CFB and NFL picks.";

export const LEGAL_NAME = "Indie Labs LLC";

export const CONTACT_HREF = "mailto:bairdhall25@gmail.com";

export const TWITTER_URL = "https://x.com/Pundits_";

export const COPYRIGHT_YEAR = 2026;

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pundits.pro";
  return raw.replace(/\/+$/, "");
}

export function canonicalOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_CANONICAL_URL ?? "https://pundits.pro";
  return raw.replace(/\/+$/, "");
}

function withTrailingSlash(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (/\.[a-z0-9]+$/i.test(normalized)) return normalized;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function canonicalUrl(path = "/"): string {
  return `${canonicalOrigin()}${withTrailingSlash(path)}`;
}

export function takePath(eventSlug: string, punditId: string): string {
  return `/picks/${eventSlug}/${punditId}`;
}

export function siteBasePath(): string {
  if (process.env.NEXT_PUBLIC_BASE_PATH) return process.env.NEXT_PUBLIC_BASE_PATH;
  return process.env.GITHUB_PAGES === "true" ? "/Pundits" : "";
}

export function publicPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteBasePath()}${normalized}`;
}

export function absoluteUrl(path = "/"): string {
  return `${siteOrigin()}${siteBasePath()}${withTrailingSlash(path)}`;
}

export function ogImage() {
  return {
    url: canonicalUrl("/og.png"),
    width: 1200,
    height: 630,
    alt: OG_ALT,
    type: "image/png" as const,
  };
}

export type OgImage = ReturnType<typeof ogImage>;

export function pageMeta(
  title: string,
  description: string,
  path?: string,
  image: OgImage = ogImage()
): Metadata {
  const url = path ? canonicalUrl(path) : undefined;
  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [image.url],
    },
  };
}
