"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Picks", match: (p: string) => p === "/" || p.startsWith("/picks") },
  { href: "/ncaaf/", label: "NCAAF", match: (p: string) => p === "/ncaaf" || p.startsWith("/ncaaf/") },
  { href: "/nfl/", label: "NFL", match: (p: string) => p === "/nfl" || p.startsWith("/nfl/") },
  { href: "/leaderboard/", label: "Leaderboard", match: (p: string) => p.startsWith("/leaderboard") },
  { href: "/book/", label: "The Book", match: (p: string) => p.startsWith("/book") },
];

export function NavLinks() {
  const path = usePathname() || "/";
  return (
    <nav className="site-nav">
      {LINKS.map((l) => {
        const on = l.match(path);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={on ? "on" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
