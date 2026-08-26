import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { getEvent, loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { eventShare } from "@/lib/share";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return loadEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug, loadEvents());
  if (!event) return pageMeta("Pick", "Kalshi market.");
  const share = eventShare(event, loadCalls(), loadPundits());
  return pageMeta(share.title, share.description, `/picks/${slug}`);
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
    <main id="main" className="shell">
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
