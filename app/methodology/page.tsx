import { ContactLink } from "@/components/ContactLink";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { METHODOLOGY_FAQ } from "@/lib/methodology";
import { faqJsonLd } from "@/lib/seo";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata: Metadata = socialPageMeta(
  "methodology",
  "Methodology",
  "How Pundits.Pro verifies public picks, displays dated Kalshi snapshots, grades straight-up winners, and calculates hypothetical records.",
);

export default function MethodologyPage() {
  return (
    <main id="main" className="shell">
      <JsonLd data={faqJsonLd(METHODOLOGY_FAQ)} />
      <div className="eyebrow type-broadcast">Trust &amp; grading</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Methodology
      </h1>
      <div className="privacy-copy lede" style={{ maxWidth: 760 }}>
        <p>
          A pick only counts when we can show the receipt. Pundits.Pro preserves
          the named speaker, public evidence, a dated market snapshot, and an
          objective result. This is not a model, betting recommendation, or
          catch-all archive of sports talk.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          What qualifies
        </h2>
        <p>
          A mapped pick must have a clear first-person lean from a named pundit,
          public evidence, source URL and date, real event, explicit side, and
          objective grading rule. The qualification bar for new picks is a
          verified spoken or written quotation from that person. A reported
          selection label in a recap table is not an exact spoken quote and does
          not newly qualify a pick. Vague commentary stays an unmapped take —
          and stays out of the record. A pundit is an independent public voice,
          not a team beat or homer. No pundit joins the public roster without
          a verified photo. An empty side stays empty until the evidence clears
          the bar.
        </p>
        <p>
          A few already-published receipts were captured from third-party recap
          tables. Those permanent URLs stay up. They are labeled as reported
          selections, not as invented spoken quotations, while we seek the
          original clip or transcript. That display correction does not change
          a grade or record by itself.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Sources and corrections
        </h2>
        <p>
          We want the original video, audio, transcript, article, newsletter, or
          social post containing the prediction. When it is unavailable, we may
          use an official outlet clip or transcript, or a reputable secondary
          source that preserves the quote and clearly identifies where it was
          made. We label the source we actually reviewed. We never pass a
          secondary report off as the original. When a verified timestamp,
          section, or transcript URL is known, we show it. We do not guess a
          locator.
        </p>
        <p>
          Found a pick we missed? <a href="/submit/">Send the public source</a>.
          The link is required; any pundit, event, or location hints are optional.
          A submission only enters Scout as a discovery lead. We independently
          reopen it and apply the same qualification, mapping, Audit, and Promote
          rules before anything can reach the public record.
        </p>
        <p>
          See a problem? <ContactLink label="Contact us" /> with the
          Pundits.Pro page and supporting public evidence. We reopen the source
          before changing the record. If a correction is warranted, we record
          the decision and keep the permanent receipt URL. No quiet deletes.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Dated Kalshi snapshot
        </h2>
        <p>
          The displayed cents are a dated, event-level Kalshi snapshot. They
          show the market as of the snapshot date on that event. Adding a later
          mapped face can refresh the shared event snapshot for every receipt
          on that game. The number is not live odds, a sportsbook line, proof
          that the pundit placed a bet, or a reconstruction of the market when
          the original prediction was spoken or first captured. On game
          markets, YES is the away team and NO is the home team.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Grading and records
        </h2>
        <p>
          A hard mapped pick stays pending until the game or contract settles.
          Then it becomes a hit or miss against the objective result. On games,
          that tracked result is the straight-up winner. If the original
          evidence named a spread, the stored pick is still graded winner-only.
          A hit is not a cover. Pundit pages show the 2026 record after results
          land. Soft and unmapped takes stay out of that record. Bets and ATS
          scoring are not part of this product.
        </p>
        <p>
          Hypothetical $100 puts every displayed snapshot price in the same
          scoring frame. Settled net dollars add those hypothetical results
          across graded picks. It is bookkeeping, not betting; no money is
          wagered for the pundit or the reader.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Publication dates
        </h2>
        <p>
          The source date is when the original public evidence appeared. The
          Pundits publication date is when this site first published the
          receipt, and only when that time is known. Unknown historical
          publication times stay blank; we do not substitute the source date
          or the current build time. A later grade or material update changes
          the updated date without creating a new publication. Pundits.Pro
          publishes the page; the named expert is the subject of the pick, not
          the author of the article.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Frequently asked
        </h2>
        {METHODOLOGY_FAQ.map((item) => (
          <section key={item.question}>
            <h3 className="type-broadcast mt-5 text-[18px] tracking-wider">
              {item.question}
            </h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
