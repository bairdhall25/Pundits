import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { getEvent, loadCalls, loadEvents, loadPundits } from "@/lib/data";

export function generateStaticParams() {
  return loadEvents().map((e) => ({ slug: e.slug }));
}

export default async function PickPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug, loadEvents());
  if (!event) notFound();
  const slate = event.sport === "nfl" ? "/nfl" : "/ncaaf";

  return (
    <main className="shell">
      <Link
        href={slate}
        className="mb-4 inline-block text-xs uppercase tracking-widest text-[var(--green)]"
      >
        ← {event.sport === "nfl" ? "NFL" : "NCAAF"} slate
      </Link>
      <div className="eyebrow type-broadcast">Kalshi market</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {event.title}
      </h1>
      <EventCard
        event={event}
        calls={loadCalls()}
        pundits={loadPundits()}
        permalink={false}
        detail
      />
    </main>
  );
}
