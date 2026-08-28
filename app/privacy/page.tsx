import type { Metadata } from "next";
import { getEmailSignupConfig } from "@/lib/email-signup";
import { CONTACT_HREF, LEGAL_NAME, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Privacy",
  "How Pundits handles analytics and the early-access email list.",
  "/privacy"
);

export default function PrivacyPage() {
  const config = getEmailSignupConfig();

  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">Legal</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">Privacy</h1>
      <div className="privacy-copy lede" style={{ maxWidth: 720 }}>
        <p>
          {`Pundits is a project of ${LEGAL_NAME}. This page covers how the site handles analytics and the early-access email list.`}
        </p>
        <p>
          We use Google Analytics to see which pages people open. That tool
          collects typical usage data (pages, device, approximate location).
          Our own analytics events for the email form never include your
          address or other personal information.
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
