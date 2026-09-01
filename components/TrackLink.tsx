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
