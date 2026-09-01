"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackLink({
  href,
  className,
  ariaLabel,
  event,
  params,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  event: string;
  params: Record<string, string>;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event, params)}
    >
      {children}
    </Link>
  );
}

export function TrackAnchor({
  href,
  className,
  event,
  params,
  children,
}: {
  href: string;
  className?: string;
  event: string;
  params: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent(event, params)}
    >
      {children}
    </a>
  );
}
