import { CONTACT_HREF } from "@/lib/site";

/** Fixed public contact copy; preserve mailto through Cloudflare's HTML rewrite. */
export function ContactLink({ label = "Contact" }: { label?: "Contact" | "Contact us" | "contact us" }) {
  return (
    <span dangerouslySetInnerHTML={{
      __html: `<!--email_off--><a href="${CONTACT_HREF}">${label}</a><!--/email_off-->`,
    }} />
  );
}
