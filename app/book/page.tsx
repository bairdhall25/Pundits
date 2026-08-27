import { BookLedger } from "@/components/BookLedger";
import { TakesViews } from "@/components/TakesViews";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "The Book — every expert take",
  "Every tracked expert comment — locked-in picks and softer takes. Mapped picks carry the market price.",
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
        Every tracked expert comment. Locked-in picks show the market price.
        The feed is the same takes, written for scanning.
      </p>
      <TakesViews current="book" />
      <BookLedger calls={calls} pundits={loadPundits()} events={loadEvents()} />
    </main>
  );
}
