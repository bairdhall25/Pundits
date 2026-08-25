import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { getEvent, loadCalls, loadEvents, loadPundits } from "@/lib/data";

export function generateStaticParams() {
  return loadEvents().map((e) => ({ slug: e.slug }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug, loadEvents());
  if (!event) notFound();

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">Event</div>
      <h1 className="mb-6 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {event.title}
      </h1>
      <EventCard
        event={event}
        calls={loadCalls()}
        pundits={loadPundits()}
        permalink={false}
      />
    </main>
  );
}
