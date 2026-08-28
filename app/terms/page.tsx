import type { Metadata } from "next";
import { CONTACT_HREF, LEGAL_NAME, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Terms",
  "Pundits is not a sportsbook and not gambling advice. Quotes are sourced public comments.",
  "/terms"
);

export default function TermsPage() {
  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">Legal</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">Terms</h1>
      <div className="privacy-copy lede" style={{ maxWidth: 720 }}>
        <p>
          {`Pundits is operated by ${LEGAL_NAME}. The site is for information and entertainment. It is not a sportsbook, not a prediction-market exchange, and not gambling advice.`}
        </p>
        <p>
          Picks on this site are public comments from named experts, mapped to
          a Kalshi contract when we can verify a first-person winner. They are
          not bets those people placed. The displayed price is a freeze, not a
          live quote. Hypothetical $100 is our scoring device.
        </p>
        <p>
          We are not affiliated with Kalshi, ESPN, FOX, CBS, or the talent
          pictured. We can be wrong. We can miss a pick. Empty sides stay
          empty until a quote verifies.
        </p>
        <p>
          If something is wrong, <a href={CONTACT_HREF}>contact us</a>. Using
          the site means you accept these terms.
        </p>
      </div>
    </main>
  );
}
