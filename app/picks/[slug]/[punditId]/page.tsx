import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { PunditAvatar } from "@/components/PunditAvatar";
import { getEvent, loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { formatAsOf, formatCents } from "@/lib/format";
import {
  articleJsonLd,
  breadcrumbList,
  mappedTakes,
  takeDescription,
  takeHeadline,
  takePath,
} from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return mappedTakes(loadCalls(), loadEvents(), loadPundits()).map((take) => ({
    slug: take.event.slug,
    punditId: take.pundit.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; punditId: string }>;
}): Promise<Metadata> {
  const { slug, punditId } = await params;
  const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
    (t) => t.event.slug === slug && t.pundit.id === punditId
  );
  if (!take) return pageMeta("Take", "Mapped pundit pick.");
  return pageMeta(
    takeHeadline(take.pundit, take.event, take.call),
    takeDescription(take.pundit, take.event, take.call),
    takePath(slug, punditId)
  );
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ slug: string; punditId: string }>;
}) {
  const { slug, punditId } = await params;
  const events = loadEvents();
  const event = getEvent(slug, events);
  const take = mappedTakes(loadCalls(), events, loadPundits()).find(
    (t) => t.event.slug === slug && t.pundit.id === punditId
  );
  if (!event || !take) notFound();

  const slate = event.sport === "nfl" ? "/nfl" : "/ncaaf";
  const sportLabel = event.sport === "nfl" ? "NFL" : "NCAAF";
  const headline = takeHeadline(take.pundit, event, take.call);
  const sideLabel =
    take.call.side === "yes"
      ? (event.awayTeam ?? "YES")
      : (event.homeTeam ?? "NO");
  const cents =
    take.call.side === "yes" ? event.yesCents : event.noCents;
  const asOf = formatAsOf(event.sourcedAt);

  return (
    <main id="main" className="shell">
      <JsonLd data={articleJsonLd(take)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: sportLabel, path: slate },
          { name: event.title, path: `/picks/${event.slug}` },
          { name: take.pundit.name, path: takePath(event.slug, take.pundit.id) },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Picks", href: "/" },
          { name: sportLabel, href: slate },
          { name: event.title, href: `/picks/${event.slug}` },
          { name: take.pundit.name },
        ]}
      />
      <div className="eyebrow type-broadcast">
        {take.call.source}
        {take.call.sourceDate ? ` · ${take.call.sourceDate}` : ""}
      </div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {headline}
      </h1>
      <p className="lede">
        {take.pundit.name} is on {sideLabel} at {formatCents(cents)}
        {asOf ? ` ${asOf}` : ""}. Hypothetical $100 at the Kalshi freeze.
      </p>

      <article className="take-quote">
        <Link href={`/pundits/${take.pundit.id}`} className="person person-hit">
          <PunditAvatar
            src={take.pundit.photo}
            alt={take.pundit.name}
            size="row"
          />
          <div>
            <div className="nm type-broadcast">{take.pundit.name}</div>
            <div className="qt">“{take.call.claim}”</div>
          </div>
        </Link>
        <div className="src-meta">
          {take.pundit.outlet}
          {take.call.sourceUrl ? (
            <>
              {" · "}
              <a href={take.call.sourceUrl} target="_blank" rel="noreferrer">
                Open source →
              </a>
            </>
          ) : null}
        </div>
      </article>

      <h2 className="type-broadcast mb-3 mt-8 text-[22px] tracking-widest">
        The market
      </h2>
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
