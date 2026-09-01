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
          Sports media makes plenty of predictions and keeps a lousy memory.
          Pundits.Pro keeps the receipt: who made the call, what they actually
          said, what the market believed at the time, and whether it hit.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Who publishes it
        </h2>
        <p>
          {`Pundits.Pro is a project of ${LEGAL_NAME}. PUNDITS Staff verifies
          and publishes each pick story. The named expert made the call; they
          did not write or endorse our page.`}
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Editorial standards
        </h2>
        <p>
          We start with a named person and their exact words. A mapped pick
          needs a public quote, source and date, real event, clear side, and
          objective grading rule. If the evidence does not clear that bar, the
          side stays empty.
        </p>
        <p>
          The frozen number shows how bold or conventional the call looked when
          we captured it. It is not live odds, a sportsbook line, or a bet the
          pundit placed. Hypothetical $100 is our consistent scoring device,
          not a wager. See the full{" "}
          <a href="/methodology/">verification and grading methodology</a>.
        </p>
        <p>
          We are not affiliated with Kalshi, the pundits, or their outlets. The
          quote, source date, frozen market context, and result stay with the
          receipt.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Corrections
        </h2>
        <p>
          See something wrong? <a href={CONTACT_HREF}>Contact us</a> with the
          Pundits.Pro page and supporting public evidence. We reopen the
          receipt, correct the public record when needed, and keep the permanent
          URL. No quiet deletes.
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
