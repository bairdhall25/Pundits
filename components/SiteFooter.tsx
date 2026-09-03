import Link from "next/link";
import { COPYRIGHT_YEAR, LEGAL_NAME } from "@/lib/site";
import { FOOTER_NAV_GROUPS, type SiteDestination } from "@/lib/site-navigation";

function FooterLink({ item }: { item: SiteDestination }) {
  if (item.external) return <a href={item.href}>{item.label}</a>;
  return <Link href={item.href}>{item.label}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <div className="type-broadcast site-footer-mark">
              PUNDITS<span>.</span>
            </div>
            <p>{`Created by ${LEGAL_NAME}. © ${COPYRIGHT_YEAR} ${LEGAL_NAME}.`}</p>
          </div>
          <div className="site-footer-groups">
            {FOOTER_NAV_GROUPS.map((group) => {
              const headingId = `footer-${group.id}`;
              return (
                <nav key={group.id} className="site-footer-nav" aria-labelledby={headingId}>
                  <h2 id={headingId} className="site-footer-heading type-broadcast">
                    {group.label}
                  </h2>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <FooterLink item={item} />
                      </li>
                    ))}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>
        <p className="site-footer-legal">
          Expert picks for fans and anyone tracking the number. Hypothetical $100
          at a frozen Kalshi price — not live odds, not a bet they placed. Not
          affiliated with Kalshi or these pundits.
        </p>
      </div>
    </footer>
  );
}
