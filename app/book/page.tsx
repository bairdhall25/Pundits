import { BookLedger } from "@/components/BookLedger";
import { TakesViews } from "@/components/TakesViews";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "The Book",
  "Every mapped and unmapped pundit take. Hard calls carry the Kalshi freeze.",
  "/book"
);

export default function BookPage() {
  const calls = [...loadCalls()].sort((a, b) =>
    a.sourceDate < b.sourceDate ? 1 : a.sourceDate > b.sourceDate ? -1 : 0
  );

  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">The Book — every tracked take</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Every
        <br />
        take.
      </h1>
      <p className="lede">
        Hard and soft. Mapped calls carry the Kalshi strip. Feed is the
        fan view of the same objects.
      </p>
      <TakesViews current="book" />
      <BookLedger calls={calls} pundits={loadPundits()} events={loadEvents()} />
    </main>
  );
}
