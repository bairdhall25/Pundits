import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import {
  getEvent,
  loadCalls,
  loadEvents,
  loadPundits,
  sidesForCard,
} from "@/lib/data";
import {
  breadcrumbList,
  eventJsonLd,
  mappedTakes,
  pickLede,
  takeHeadline,
  takePath,
} from "@/lib/seo";
import { formatGameWhen } from "@/lib/format";
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
  const events = loadEvents();
  const event = getEvent(slug, events);
  if (!event) notFound();
  const calls = loadCalls();
  const pundits = loadPundits();
  const slate = event.sport === "nfl" ? "/nfl" : "/ncaaf";
  const sportLabel = event.sport === "nfl" ? "NFL" : "NCAAF";
  const takes = mappedTakes(calls, events, pundits).filter(
    (t) => t.event.slug === event.slug
  );
  const [yes, no] = sidesForCard(event, calls);
  const crumbs = [
    { name: "Picks", href: "/" },
    { name: sportLabel, href: slate },
    { name: event.title },
  ];

  return (
    <main id="main" className="shell">
      <JsonLd data={eventJsonLd(event, calls, pundits)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: sportLabel, path: slate },
          { name: event.title, path: `/picks/${event.slug}` },
        ])}
      />
      <Breadcrumbs items={crumbs} />
      <div className="eyebrow type-broadcast">
        {event.sport === "nfl" ? "NFL" : "NCAAF"}
        {event.season ? ` · ${event.season}` : ""}
      </div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {event.title}
      </h1>
      <p className="when">
        {formatGameWhen(event) ?? (event.season ? `${event.season} season` : "Kalshi market")}
      </p>
      <p className="lede">{pickLede(event, calls, pundits)}</p>
      <EventCard
        event={event}
        calls={calls}
        pundits={pundits}
        permalink={false}
        detail
      />
      {takes.length ? (
        <section className="mt-8">
          <h2 className="type-broadcast mb-3 text-[22px] tracking-widest">
            Expert takes
          </h2>
          <ul className="take-list">
            {takes.map((take) => {
              const side = take.call.side === "yes" ? yes : no;
              return (
                <li key={`${take.pundit.id}-${take.call.id}`}>
                  <Link href={takePath(event.slug, take.pundit.id)}>
                    {takeHeadline(take.pundit, event, take.call)}
                    <span>
                      {side.label} · {take.call.source}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
