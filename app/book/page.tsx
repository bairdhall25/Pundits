import { BookLedger } from "@/components/BookLedger";
import { JsonLd } from "@/components/JsonLd";
import { TakesViews } from "@/components/TakesViews";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { collectionPageJsonLd } from "@/lib/seo";
import { socialPageMeta } from "@/lib/social-card/metadata";
import type { Call, Event } from "@/lib/types";

export const metadata = socialPageMeta(
  "book",
  "The Book — every expert take",
  "Every tracked expert comment — locked-in picks and softer takes. Mapped picks carry the market price.",
);

export default function BookPage() {
  // BookLedger is a client component, so every prop is serialized into the
  // page payload. Ship only the call fields the ledger, its search, and
  // CallCard read; only the events the ledger links to, with the fields
  // CallCard reads; to keep /book/ under Apple's 1 MB preview limit.
  const calls = [...loadCalls()]
    .sort((a, b) =>
      a.sourceDate < b.sourceDate ? 1 : a.sourceDate > b.sourceDate ? -1 : 0
    )
    .map(
      (c) =>
        ({
          id: c.id,
          punditId: c.punditId,
          claim: c.claim,
          // subject only feeds search; when the claim already contains it,
          // the claim matches the same queries.
          ...(c.subject &&
          !c.claim.toLowerCase().includes(c.subject.toLowerCase())
            ? { subject: c.subject }
            : {}),
          source: c.source,
          sourceUrl: c.sourceUrl,
          sourceDate: c.sourceDate,
          kind: c.kind,
          status: c.status,
          // Omit unset keys: an explicit undefined still costs bytes.
          ...(c.eventSlug ? { eventSlug: c.eventSlug } : {}),
          ...(c.side ? { side: c.side } : {}),
        }) as Call
    );
  const linked = new Set(calls.map((c) => c.eventSlug).filter(Boolean));
  const events = loadEvents()
    .filter((e) => linked.has(e.slug))
    .map(
      (e) =>
        ({
          slug: e.slug,
          kind: e.kind,
          title: e.title,
          awayTeam: e.awayTeam,
          homeTeam: e.homeTeam,
          yesCents: e.yesCents,
          noCents: e.noCents,
        }) as Event
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
      <BookLedger calls={calls} pundits={loadPundits()} events={events} />
    </main>
  );
}
