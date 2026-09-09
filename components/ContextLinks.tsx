import Link from "next/link";
import type { ContextLink } from "@/lib/page-content";

export function ContextLinks({
  links,
  label = "Related",
}: {
  links: ContextLink[];
  label?: string;
}) {
  if (!links.length) return null;
  return (
    <nav className="context-links" aria-label={label}>
      {links.map((link) => (
        <Link key={`${link.href}:${link.label}`} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
