import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { PunditAvatar } from "@/components/PunditAvatar";
import { getEvent, loadCalls, loadEvents, loadPundits } from "@/lib/data";
import {
  articleJsonLd,
  breadcrumbList,
  mappedTakes,
  pickStory,
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
  if (!take) return pageMeta("Pick story", "Mapped pundit pick.");
  const story = pickStory(take);
  return pageMeta(story.headline, story.dek, takePath(slug, punditId));
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ slug: string; punditId: string }>;
}) {
  const { slug, punditId } = await params;
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const event = getEvent(slug, events);
  const take = mappedTakes(calls, events, pundits).find(
    (t) => t.event.slug === slug && t.pundit.id === punditId
  );
  if (!event || !take) notFound();

  const slate = event.sport === "nfl" ? "/nfl" : "/ncaaf";
  const sportLabel = event.sport === "nfl" ? "NFL" : "NCAAF";
  const story = pickStory(take, calls, pundits);

  return (
    <main id="main" className="shell">
      <JsonLd data={articleJsonLd(take, calls, pundits)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Stories", path: "/stories" },
          { name: sportLabel, path: slate },
          { name: event.title, path: `/picks/${event.slug}` },
          { name: story.headline, path: takePath(event.slug, take.pundit.id) },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Stories", href: "/stories" },
          { name: sportLabel, href: slate },
          { name: event.title, href: `/picks/${event.slug}` },
          { name: take.pundit.name },
        ]}
      />
      <div className="eyebrow type-broadcast">Pick story</div>
      <h1 className="mb-4 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        {story.headline}
      </h1>
      <div className="story">
        {story.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

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
        calls={calls}
        pundits={pundits}
        permalink={false}
        detail
      />
    </main>
  );
}
