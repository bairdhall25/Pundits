import { BookLedger } from "@/components/BookLedger";
import { JsonLd } from "@/components/JsonLd";
import { TakesViews } from "@/components/TakesViews";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { collectionPageJsonLd } from "@/lib/seo";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata = socialPageMeta(
  "book",
  "The Book — every expert take",
  "Every tracked expert comment — locked-in picks and softer takes. Mapped picks carry the market price.",
);

export default function BookPage() {
  const calls = [...loadCalls()].sort((a, b) =>
    a.sourceDate < b.sourceDate ? 1 : a.sourceDate > b.sourceDate ? -1 : 0
  );

  return (
    <main id="main" className="shell">
      <JsonLd
        data={collectionPageJsonLd(
          "The Book — every expert take",
          "/book/",
          "Every tracked expert comment — locked-in picks and softer takes. Mapped picks carry the market price."
        )}
      />
      <div className="eyebrow type-broadcast">Takes · Compact ledger</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Every
        <br />
        take.
      </h1>
      <p className="lede">
        Every tracked expert comment. Locked-in picks show the market price.
        The feed is the same takes, written for scanning.
      </p>
      <TakesViews current="book" />
      <BookLedger calls={calls} pundits={loadPundits()} events={loadEvents()} />
    </main>
  );
}
