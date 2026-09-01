import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EmailInterestForm } from "@/components/EmailInterestForm";
import { EventCard } from "@/components/EventCard";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";
import {
  eventHasTakes,
  getEvent,
  loadCalls,
  loadEvents,
  loadPundits,
  loadTeams,
} from "@/lib/data";
import {
  breadcrumbList,
  eventJsonLd,
  pickLede,
} from "@/lib/seo";
import { formatGameWhen, seasonLabel, seasonSpan } from "@/lib/format";
import { eventOgCard, ogEventPath, ogImageFor, ogStoryEventPath } from "@/lib/og";
import { pageMeta } from "@/lib/site";
import { eventShare, sharePayload } from "@/lib/share";

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
  if (!event) return pageMeta("Expert picks", "Who the experts are taking.");
  const calls = loadCalls();
  const pundits = loadPundits();
  const share = eventShare(event, calls, pundits);
  const card = eventOgCard(event, calls, pundits, loadTeams());
  const meta = pageMeta(
    share.title,
    share.description,
    `/picks/${slug}`,
    ogImageFor(card.file, share.title)
  );
  if (!eventHasTakes(slug, calls)) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
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
        {event.season ? ` · ${seasonSpan(event.season)}` : ""}
      </div>
      <div className="share-head mb-2 mt-1">
        <h1 className="text-[clamp(36px,6vw,64px)] leading-[0.92]">
          {event.title}
        </h1>
        <ShareButton
          share={sharePayload({
            title: event.title,
            text: pickLede(event, calls, pundits),
            path: `/picks/${event.slug}`,
            image: ogEventPath(event.slug),
            story: ogStoryEventPath(event.slug),
          })}
        />
      </div>
      <p className="when">
        {formatGameWhen(event) ?? seasonLabel(event.season) ?? "Kalshi market"}
      </p>
      <p className="lede">{pickLede(event, calls, pundits)}</p>
      <EventCard
        event={event}
        calls={calls}
        pundits={pundits}
        permalink={false}
        detail
      />
      <EmailInterestForm
        placement="pick_detail"
        scope="event"
        scopeId={event.slug}
        subjectName={event.title}
      />
    </main>
  );
}
