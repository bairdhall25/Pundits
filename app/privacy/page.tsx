import type { Metadata } from "next";
import { getEmailSignupConfig } from "@/lib/email-signup";
import { socialPageMeta } from "@/lib/social-card/metadata";
import { CONTACT_HREF, LEGAL_NAME } from "@/lib/site";

export const metadata: Metadata = socialPageMeta(
  "privacy",
  "Privacy",
  "How Pundits handles analytics, public-source tips, and the early-access email list.",
);

export default function PrivacyPage() {
  const config = getEmailSignupConfig();

  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">Legal</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">Privacy</h1>
      <div className="privacy-copy lede" style={{ maxWidth: 720 }}>
        <p>
          {`Pundits is a project of ${LEGAL_NAME}. This page covers how the site handles analytics, public-source tips, and the early-access email list.`}
        </p>
        <p>
          We use Google Analytics to see which pages people open and which
          product events they trigger (event opens, take opens, source clicks,
          shares, and filters). Those events use object IDs, never email
          addresses or quote text. Our email-form events also never include
          your address.
        </p>
        <p>
          If you submit a public pick source, we collect the public URL, the
          optional pundit and event hints you enter, an optional timestamp or location
          hint, and the time received. We do not ask for or store your name,
          email address, X handle, or other submitter identity with the tip.
          Website tips are held in a Cloudflare KV queue for up to 90 days,
          then expire. Sanitized operational rows may remain in the private Git
          run record so Scout, Audit, and Promote can document what happened.
        </p>
        <p>
          Tip-form analytics include placement, event and side context, and
          error type. They never include the submitted URL, pundit name,
          timestamp hint, or other free text. Do not submit private messages,
          copied paywalled material, or personal information.
        </p>
        {config.active ? (
          <>
            <p>
              If you join the early list, we collect your email address, the
              page you signed up from (homepage, a pick, or a pundit), and a
              timestamp. Submissions are stored by {config.provider}.{" "}
              {config.retention} We do not sell the address or add it to
              unrelated marketing lists. Pick alerts are not live yet.
            </p>
            <p>
              To request deletion of an early-list address,{" "}
              <a href={CONTACT_HREF}>contact us</a>.
            </p>
          </>
        ) : (
          <p>Email collection is not active on this site right now.</p>
        )}
        <p>
          Questions: <a href={CONTACT_HREF}>Contact</a>.
        </p>
      </div>
    </main>
  );
}
