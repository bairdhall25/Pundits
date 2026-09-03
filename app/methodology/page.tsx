import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { socialPageMeta } from "@/lib/social-card/metadata";
import { CONTACT_HREF } from "@/lib/site";

export const metadata: Metadata = socialPageMeta(
  "methodology",
  "Methodology",
  "How Pundits.Pro verifies public picks, freezes Kalshi prices, grades results, and calculates hypothetical records.",
);

const FAQ = [
  {
    question: "What is Pundits.Pro?",
    answer:
      "Pundits.Pro keeps the receipts on college football and NFL picks: who made the call, what they said, where they said it, what the market believed at the time, and whether it hit.",
  },
  {
    question: "What counts as a verified pick?",
    answer:
      "A clear first-person lean from a named pundit, preserved with the public quote, source URL, source date, real event, explicit side, and an objective grading rule.",
  },
  {
    question: "What is a frozen Kalshi price?",
    answer:
      "It is a dated snapshot of the relevant Kalshi market. It shows the market context when the pick was captured; it is not live odds and does not mean the pundit placed a bet.",
  },
  {
    question: "How are picks graded?",
    answer:
      "A mapped hard pick stays pending until the game or contract settles. Then it becomes a hit or miss against the event's objective result. Soft and unmapped takes stay out of the record.",
  },
  {
    question: "What does hypothetical $100 mean?",
    answer:
      "It puts every pick in the same scoring frame using the frozen price of the picked side. Settled net dollars summarize that hypothetical result; no wager is placed for the pundit or reader.",
  },
  {
    question: "How does a pundit join the roster?",
    answer:
      "The site needs a named public sports voice who picks as independent analysis, a verified public pick, and a verified photo. A team beat or homer covering one program is not a pundit. Empty sides stay empty rather than being filled with weak or unattributed claims.",
  },
  {
    question: "Can I submit a pick we missed?",
    answer:
      "Yes. Send the original public source through the submission page. The link is required; the pundit, event, and location hints are optional. A submission is an untrusted lead: Scout independently reopens the link and applies the same speaker, quote, event, side, Audit, and Promote rules before anything can appear on the site.",
  },
];

export default function MethodologyPage() {
  return (
    <main id="main" className="shell">
      <JsonLd data={faqJsonLd(FAQ)} />
      <div className="eyebrow type-broadcast">Trust &amp; grading</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Methodology
      </h1>
      <div className="privacy-copy lede" style={{ maxWidth: 760 }}>
        <p>
          A pick only counts when we can show the receipt. Pundits.Pro preserves
          the named speaker, exact public evidence, frozen market context, and
          objective result. This is not a model, betting recommendation, or
          catch-all archive of sports talk.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          What qualifies
        </h2>
        <p>
          A mapped pick must have a clear first-person lean from a named pundit,
          verbatim public quote, source URL and date, real event, explicit side,
          and objective grading rule. Vague commentary stays an unmapped take —
          and stays out of the record. A pundit is an independent public voice,
          not a team beat or homer. No pundit joins the public roster without
          a verified photo. An empty side stays empty until the evidence clears
          the bar.
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
          secondary report off as the original.
        </p>
        <p>
          Found a pick we missed? <a href="/submit/">Send the public source</a>.
          The link is required; any pundit, event, or location hints are optional.
          A submission only enters Scout as a discovery lead. We independently
          reopen it and apply the same qualification, mapping, Audit, and Promote
          rules before anything can reach the public record.
        </p>
        <p>
          See a problem? <a href={CONTACT_HREF}>Contact us</a> with the
          Pundits.Pro page and supporting public evidence. We reopen the source
          before changing the record. If a correction is warranted, we record
          the decision and keep the permanent receipt URL. No quiet deletes.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Frozen market context
        </h2>
        <p>
          The displayed cents are a dated Kalshi snapshot. They show how bold or
          conventional the call looked when we captured it. They are not live
          odds, a sportsbook line, or proof that the pundit placed a bet. On
          game markets, YES is the away team and NO is the home team.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Grading and records
        </h2>
        <p>
          A hard mapped pick stays pending until the game or contract settles.
          Then it becomes a hit or miss against the objective result. Pundit
          pages show the 2026 record after results land. Soft and unmapped takes
          stay out of that record.
        </p>
        <p>
          Hypothetical $100 puts every frozen price in the same scoring frame.
          Settled net dollars add those hypothetical results across graded
          picks. It is bookkeeping, not betting; no money is wagered for the
          pundit or the reader.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Frequently asked
        </h2>
        {FAQ.map((item) => (
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
