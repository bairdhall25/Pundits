import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextLinks } from "@/components/ContextLinks";
import { EmailInterestForm } from "@/components/EmailInterestForm";
import { EventCard } from "@/components/EventCard";
import { ShareButton } from "@/components/ShareButton";
import { TrackView } from "@/components/TrackView";
import { TipPrompt } from "@/components/TipPrompt";
import { JsonLd } from "@/components/JsonLd";
import { eventDetailOpenParams } from "@/lib/analytics";
import {
  eventHasTakes,
  eventKind,
  eventScanStatus,
  getEvent,
  loadCalls,
  loadEvents,
  loadPundits,
  loadTeams,
  sidesForCard,
} from "@/lib/data";
import { gameComparison } from "@/lib/page-content";
import {
  breadcrumbList,
  eventJsonLd,
} from "@/lib/seo";
import { formatGameWhen, seasonLabel, seasonSpan } from "@/lib/format";
import { eventOgCard, ogEventPath, ogImageFor, ogStoryEventPath } from "@/lib/og";
import { pageMeta } from "@/lib/site";
import { sharePayload } from "@/lib/share";

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
  const comparison = gameComparison(event, calls, pundits);
  const card = eventOgCard(event, calls, pundits, loadTeams());
  const meta = pageMeta(
    comparison.title,
    comparison.description,
    `/picks/${slug}`,
    ogImageFor(card.file, comparison.title, card)
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
  const sides = sidesForCard(event, calls);
  const missingSides = sides.filter((side) => side.calls.length === 0);
  const missingSide = eventKind(event) === "game" && missingSides.length === 1 ? missingSides[0] : undefined;
  const comparison = gameComparison(event, calls, pundits);
  const crumbs = [
    { name: "Picks", href: "/" },
    { name: sportLabel, href: slate },
    { name: event.title },
  ];

  return (
    <main id="main" className="shell" data-page-type="game">
      <TrackView
        event="event_detail_open"
        params={eventDetailOpenParams({
          eventSlug: event.slug,
          sport: event.sport,
          surface: "event",
        })}
      />
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
          {comparison.h1}
        </h1>
        <ShareButton
          share={sharePayload({
            title: event.title,
            text: comparison.lede,
            path: `/picks/${event.slug}`,
            image: ogEventPath(event.slug),
            story: ogStoryEventPath(event.slug),
            artifactType: "event",
            eventSlug: event.slug,
            status: eventScanStatus(event, calls),
          })}
        />
      </div>
      <p className="when">
        {comparison.when ?? formatGameWhen(event) ?? seasonLabel(event.season) ?? "Kalshi market"}
      </p>
      {comparison.resultLine ? <p className="lede">{comparison.resultLine}</p> : null}
      <p className="lede">{comparison.lede}</p>
      <p className="coverage-note">
        {comparison.coverageLine} {comparison.disclaimer}
        {comparison.emptyLine ? ` ${comparison.emptyLine}` : ""}
      </p>
      <EventCard
        event={event}
        calls={calls}
        pundits={pundits}
        permalink={false}
        detail
      />
      {comparison.entries.length ? (
        <section className="mt-8" aria-labelledby="who-picked">
          <h2 id="who-picked" className="type-broadcast mb-3 text-[22px] tracking-widest">
            {comparison.isGame ? "Who picked this game" : "Who is on this market"}
          </h2>
          <ul className="take-list">
            {comparison.entries.map((entry) => (
              <li key={entry.href}>
                <Link href={entry.href}>
                  {entry.name} → {entry.sideLabel}
                  <span>
                    {entry.source}
                    {entry.sourceDate ? ` · ${entry.sourceDate}` : ""}
                    {" · Receipt"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ContextLinks links={comparison.contextLinks} label="Teams and week" />
      {eventScanStatus(event, calls) === "open" ? (
        <TipPrompt
          eventSlug={event.slug}
          eventTitle={event.title}
          sideHint={missingSide?.side}
          sideLabel={missingSide?.label}
        />
      ) : null}
      {eventHasTakes(event.slug, calls) ? (
        <EmailInterestForm
          placement="pick_detail"
          scope="event"
          scopeId={event.slug}
          subjectName={event.title}
        />
      ) : null}
    </main>
  );
}
