import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Methodology",
  "How Pundits.Pro verifies public picks, freezes Kalshi prices, grades results, and calculates hypothetical records.",
  "/methodology"
);

const FAQ = [
  {
    question: "What is Pundits.Pro?",
    answer: SITE_DESCRIPTION,
  },
  {
    question: "What counts as a verified pick?",
    answer:
      "A clear first-person lean from a named pundit, preserved with the public quote, source URL, source date, real event, explicit side, and an objective grading rule.",
  },
  {
    question: "What is a frozen Kalshi price?",
    answer:
      "It is a dated snapshot of the relevant Kalshi market used to show the market context when the pick was captured. It is not live odds and does not mean the pundit placed a bet.",
  },
  {
    question: "How are picks graded?",
    answer:
      "Mapped hard picks remain pending until the game or contract settles, then grade hit or miss against the event's objective result. Soft or unmapped takes do not enter the record.",
  },
  {
    question: "What does hypothetical $100 mean?",
    answer:
      "It is a consistent scoring device using the frozen price of the picked side. Settled net dollars summarize that hypothetical result; no wager is placed for the pundit or reader.",
  },
  {
    question: "How does a pundit join the roster?",
    answer:
      "The site needs a named public sports voice, a verified public pick, and a verified photo. Empty sides stay empty rather than being filled with weak or unattributed claims.",
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
          Pundits.Pro records public sports predictions from named people, preserves
          the original evidence and market context, and closes the loop with a
          result. The core object is a verifiable pick, not an article, model
          output, or betting recommendation.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          What qualifies
        </h2>
        <p>
          A mapped pick needs a clear first-person lean, named pundit, verbatim
          public quote, source URL, source date, real event, explicit side, and
          objective grading rule. Vague commentary stays an unmapped take. No
          pundit joins the public roster without a verified photo, and an empty
          side remains empty until the evidence is good enough.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Frozen market context
        </h2>
        <p>
          The displayed cents are a dated Kalshi snapshot captured for the
          relevant market. They are not live odds, a sportsbook line, or proof
          that the pundit placed a bet. On game markets, YES is the away team
          and NO is the home team.
        </p>

        <h2 className="type-broadcast mt-8 text-[24px] tracking-widest">
          Grading and records
        </h2>
        <p>
          Hard mapped picks remain pending until the game or contract settles,
          then grade hit or miss against the objective result. Pundit pages show
          the 2026 record after results land. Soft and unmapped takes remain
          outside that record.
        </p>
        <p>
          Hypothetical $100 at the frozen price is a consistent scoring device.
          Settled net dollars add those hypothetical results across graded picks;
          no money is wagered for the pundit or the reader.
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
