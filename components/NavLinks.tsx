"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY = [
  {
    href: "/",
    label: "Picks",
    ariaLabel: "Picks — browse by game",
    match: (p: string) =>
      p === "/" ||
      p.startsWith("/ncaaf") ||
      p.startsWith("/nfl") ||
      /^\/picks\/[^/]+\/?$/.test(p),
  },
  {
    href: "/stories/",
    label: "Takes",
    ariaLabel: "Takes — quote feed",
    match: (p: string) =>
      p.startsWith("/stories") ||
      p.startsWith("/book") ||
      /\/picks\/[^/]+\/[^/]+/.test(p),
  },
  {
    href: "/leaderboard/",
    label: "Pundits",
    ariaLabel: "Pundits — profiles and records",
    match: (p: string) => p.startsWith("/leaderboard") || p.startsWith("/pundits"),
  },
];

function NavLink({
  href,
  label,
  ariaLabel,
  on,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={on ? "page" : undefined}
      className={on ? "on" : undefined}
    >
      {label}
    </Link>
  );
}

export function NavLinks() {
  const path = usePathname() || "/";
  return (
    <nav className="site-nav" aria-label="Site">
      {PRIMARY.map((l) => (
        <NavLink key={l.href} href={l.href} label={l.label} ariaLabel={l.ariaLabel} on={l.match(path)} />
      ))}
    </nav>
  );
}
