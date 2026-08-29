import { CONTACT_HREF, COPYRIGHT_YEAR, LEGAL_NAME } from "@/lib/site";

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
          <nav className="site-footer-nav" aria-label="Footer">
            <a href="/about/">About</a>
            <a href="/methodology/">Methodology</a>
            <a href={CONTACT_HREF}>Contact</a>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
          </nav>
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
