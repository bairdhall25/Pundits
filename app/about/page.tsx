import type { Metadata } from "next";
import {
  CONTACT_HREF,
  LEGAL_NAME,
  SITE_DESCRIPTION,
  pageMeta,
} from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "About",
  SITE_DESCRIPTION,
  "/about"
);

export default function AboutPage() {
  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">Indie Labs</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">About</h1>
      <div className="privacy-copy lede" style={{ maxWidth: 720 }}>
        <p>
          {`${SITE_DESCRIPTION} It is a project of ${LEGAL_NAME}.`}
        </p>
        <p>
          The number is a snapshot, not a live sportsbook line. Hypothetical
          $100 at that freeze is how we keep score — not a bet the pundit
          placed, and not a bet we placed for you. See the full{" "}
          <a href="/methodology/">verification and grading methodology</a>.
        </p>
        <p>
          We are not affiliated with Kalshi or with the experts on the site.
          Quotes are public comments we verified. Empty sides mean we have not
          captured a verified pick yet.
        </p>
        <p>
          Every pick story links to its source and separates the expert&apos;s
          words from our market context. PUNDITS Staff writes the page; the
          named expert is the quoted subject, not the author. We update records
          when games settle and correct the ledger when a source changes.
        </p>
        <p>
          <a href={CONTACT_HREF}>Contact</a>
          {" · "}
          <a href="/privacy/">Privacy</a>
          {" · "}
          <a href="/terms/">Terms</a>
        </p>
      </div>
    </main>
  );
}
