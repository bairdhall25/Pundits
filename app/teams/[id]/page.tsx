import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { TeamChip } from "@/components/TeamChip";
import { takesOnTeam, teamEvents, teamHasTakes } from "@/lib/archive";
import { getTeam, loadCalls, loadEvents, loadPundits, loadTeams } from "@/lib/data";
import { ogImageFor, teamOgCard } from "@/lib/og";
import { breadcrumbList, teamJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return loadTeams().map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = getTeam(id, loadTeams());
  if (!team) return pageMeta("Team picks", "Expert picks by team.");
  const events = loadEvents();
  const calls = loadCalls();
  const takes = takesOnTeam(id, events, calls);
  const card = teamOgCard(team, events, calls, loadPundits());
  const meta = pageMeta(
    `${team.name} expert picks`,
    `Who the TV voices are taking on ${team.name}: ${takes.for.length} with them, ${takes.against.length} against, each with the quote and the frozen market price.`,
    `/teams/${id}`,
    ogImageFor(card.file, `${team.name} expert picks`, card)
  );
  if (!teamHasTakes(id, events, calls)) {
    // Thin until a take involves this team; flips to indexable with content.
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(id, loadTeams());
  if (!team) notFound();
  const events = loadEvents();
  const calls = loadCalls();
  const pundits = loadPundits();
  const involved = teamEvents(id, events);
  const takes = takesOnTeam(id, events, calls);

  return (
    <main id="main" className="shell">
      <JsonLd data={teamJsonLd(team)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: team.name, path: `/teams/${team.id}` },
        ])}
      />
      <Breadcrumbs items={[{ name: "Picks", href: "/" }, { name: team.name }]} />
      <div className="eyebrow type-broadcast">
        {team.sport === "nfl" ? "NFL" : "College football"}
      </div>
      <div className="team-head">
        <TeamChip team={team} />
        <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
          {team.name}
        </h1>
      </div>
      <p className="lede">
        {takes.for.length + takes.against.length
          ? `Every verified expert take on ${team.name}: ${takes.for.length} with them, ${takes.against.length} against. Quotes, frozen Kalshi prices, and results as they grade.`
          : `No verified expert take on ${team.name} yet. Their markets are below; picks land here as experts go on the record.`}
      </p>

      {takes.for.length || takes.against.length ? (
        <div className="team-split">
          <div>
            <div className="board-kicker type-broadcast">With {team.name}</div>
            {takes.for.length ? (
              <ul>
                {takes.for.map((c) => {
                  const p = pundits.find((x) => x.id === c.punditId);
                  const event = events.find((e) => e.slug === c.eventSlug);
                  if (!p) return null;
                  return (
                    <li key={c.id}>
                      <Link href={`/pundits/${p.id}`}>{p.name}</Link>
                      {event ? <span className="wait-when"> · {event.title}</span> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty">Nobody yet</p>
            )}
          </div>
          <div>
            <div className="board-kicker type-broadcast">Against</div>
            {takes.against.length ? (
              <ul>
                {takes.against.map((c) => {
                  const p = pundits.find((x) => x.id === c.punditId);
                  const event = events.find((e) => e.slug === c.eventSlug);
                  if (!p) return null;
                  return (
                    <li key={c.id}>
                      <Link href={`/pundits/${p.id}`}>{p.name}</Link>
                      {event ? <span className="wait-when"> · {event.title}</span> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty">Nobody yet</p>
            )}
          </div>
        </div>
      ) : null}

      <section className="board">
        <div className="board-kicker type-broadcast">Markets</div>
        <h2 className="board-title type-broadcast">{team.name} on the board</h2>
        {involved.map((event) => (
          <EventCard key={event.slug} event={event} calls={calls} pundits={pundits} />
        ))}
      </section>
    </main>
  );
}
