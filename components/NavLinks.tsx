"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY = [
  {
    href: "/",
    label: "Picks",
    match: (p: string) =>
      p === "/" ||
      p.startsWith("/ncaaf") ||
      p.startsWith("/nfl") ||
      /^\/picks\/[^/]+\/?$/.test(p),
  },
  {
    href: "/stories/",
    label: "Takes",
    match: (p: string) =>
      p.startsWith("/stories") ||
      p.startsWith("/book") ||
      /\/picks\/[^/]+\/[^/]+/.test(p),
  },
  {
    href: "/leaderboard/",
    label: "Pundits",
    match: (p: string) => p.startsWith("/leaderboard") || p.startsWith("/pundits"),
  },
];

const MORE = [
  { href: "/book/", label: "The Book", match: (p: string) => p.startsWith("/book") },
];

function NavLink({
  href,
  label,
  on,
}: {
  href: string;
  label: string;
  on: boolean;
}) {
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={on ? "on" : undefined}>
      {label}
    </Link>
  );
}

export function NavLinks() {
  const path = usePathname() || "/";
  const moreOn = MORE.some((l) => l.match(path));
  return (
    <nav className="site-nav" aria-label="Site">
      {PRIMARY.map((l) => (
        <NavLink key={l.href} href={l.href} label={l.label} on={l.match(path)} />
      ))}
      <div className="nav-rest">
        {MORE.map((l) => (
          <NavLink key={l.href} href={l.href} label={l.label} on={l.match(path)} />
        ))}
      </div>
      <details className="nav-more">
        <summary className={moreOn ? "on" : undefined}>More</summary>
        <div className="nav-more-panel">
          {MORE.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} on={l.match(path)} />
          ))}
        </div>
      </details>
    </nav>
  );
}
