import type { Metadata } from "next";
import { getEmailSignupConfig } from "@/lib/email-signup";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Privacy",
  "How Pundits handles early-access email signups for pick alerts.",
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
          Pundits is testing interest in email alerts when new verified pundit
          picks are published. Those alerts are not live yet.
        </p>
        <p>
          If you join the early list, we collect your email address, the page
          you signed up from (homepage, a pick, or a pundit), and a timestamp.
          We use that only to measure interest and to contact you about Pundits
          pick-alert updates. We do not sell the address or add it to unrelated
          marketing lists.
        </p>
        {config.active ? (
          <>
            <p>
              Submissions are stored by {config.provider}. {config.retention}
            </p>
            <p>
              To request deletion, open an issue at {config.contact}
              {config.contact.includes("@") ? ` or email ${config.contact}` : ""}.
            </p>
          </>
        ) : (
          <p>
            Email collection is not active on this site right now.
          </p>
        )}
      </div>
    </main>
  );
}
