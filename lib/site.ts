import type { Metadata } from "next";

export const SITE_NAME = "PUNDITS";

export const SITE_TITLE = "PUNDITS — Who’s picking what";

export const SITE_DESCRIPTION =
  "Each card is a Kalshi market. Faces are pundits on that side. Hypothetical $100 at the freeze.";

export const OG_ALT = "PUNDITS. Who’s picking what.";

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bairdhall25.github.io";
  return raw.replace(/\/+$/, "");
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
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${siteBasePath()}${normalized}`;
}

export function ogImage() {
  return {
    url: absoluteUrl("/og.png"),
    width: 1200,
    height: 630,
    alt: OG_ALT,
    type: "image/png" as const,
  };
}

export function pageMeta(
  title: string,
  description: string,
  path?: string
): Metadata {
  const image = ogImage();
  const url = path ? absoluteUrl(path.endsWith("/") ? path : `${path}/`) : undefined;
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
