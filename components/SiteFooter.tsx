export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <div className="type-broadcast site-footer-mark">
              PUNDITS<span>.</span>
            </div>
            <p>Created by Indie Labs LLC.</p>
          </div>
          <nav className="site-footer-nav" aria-label="Footer">
            <a href="/privacy/">Privacy</a>
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
