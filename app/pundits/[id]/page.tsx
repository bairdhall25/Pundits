import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallCard } from "@/components/CallCard";
import { EmailInterestForm } from "@/components/EmailInterestForm";
import { JsonLd } from "@/components/JsonLd";
import { PunditAvatar } from "@/components/PunditAvatar";
import { ShareButton } from "@/components/ShareButton";
import {
  callsForPundit,
  getPundit,
  impliedOpenDollars,
  isMapped,
  loadCalls,
  loadEvents,
  loadPundits,
  otherTakes,
} from "@/lib/data";
import {
  formatNetDollars,
  punditIndexable,
  settledNetDollars,
} from "@/lib/records";
import { breadcrumbList, personJsonLd } from "@/lib/seo";
import { punditShare, sharePayload } from "@/lib/share";
import { sportChip } from "@/lib/format";
import { pageMeta } from "@/lib/site";
import { ogImageFor, ogPunditPath, ogStoryPunditPath } from "@/lib/og";

export function generateStaticParams() {
  return loadPundits().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const calls = loadCalls();
  const p = getPundit(id, loadPundits(), calls);
  if (!p) return pageMeta("Expert picks", "Named expert on PUNDITS.");
  const latest = callsForPundit(p.id, calls)[0];
  const share = punditShare(p, latest);
  const meta = pageMeta(
    share.title,
    share.description,
    `/pundits/${id}`,
    ogImageFor(ogPunditPath(id), `${p.name} expert picks and record`)
  );
  if (!punditIndexable(p.id, calls)) {
    // Thin shell until the first take lands; flips to indexable with content.
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

export default async function PunditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pundits = loadPundits();
  const calls = loadCalls();
  const p = getPundit(id, pundits, calls);
  if (!p) notFound();

  const punditCalls = callsForPundit(p.id, calls);
  const mapped = punditCalls.filter(isMapped);
  const rest = otherTakes(p.id, calls);
  const open = impliedOpenDollars(p.id, calls);
  const events = loadEvents();
  const settled = settledNetDollars(p.id, calls, events);
  const gradedCount = p.season2026.wins + p.season2026.losses;

  return (
    <main id="main" className="shell">
      <JsonLd data={personJsonLd(p)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Pundits", path: "/leaderboard" },
          { name: p.name, path: `/pundits/${p.id}` },
        ])}
      />
      <Breadcrumbs
        items={[{ name: "Pundits", href: "/leaderboard" }, { name: p.name }]}
      />
      <div className="pundit-profile-hero">
        <PunditAvatar src={p.photo} alt={p.name} size="hero" />
        <div className="pundit-profile-copy">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {p.outlet}
          </div>
          <div className="share-head">
            <h1 className="mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
              {p.name}
            </h1>
            <ShareButton
              share={sharePayload({
                title: `${p.name} picks`,
                text: punditShare(p, punditCalls[0]).description,
                path: `/pundits/${p.id}`,
                image: ogPunditPath(p.id),
                story: ogStoryPunditPath(p.id),
                artifactType: "pundit",
              })}
            />
          </div>
          <div className="mt-2 inline-block border border-[#2a2a2a] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {sportChip(p.sport)}
          </div>
          <div className="pundit-profile-stats">
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                Open picks
              </div>
              <div className="type-broadcast text-2xl text-[var(--green)]">
                {p.mappedPending}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                2026 record
              </div>
              {gradedCount ? (
                <div className="pundit-profile-record">
                  <span className="type-broadcast text-2xl">
                    {p.season2026.wins}–{p.season2026.losses}
                  </span>
                  <span>{gradedCount} graded</span>
                </div>
              ) : (
                <div className="pundit-profile-record-empty">No graded picks yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="tracked-picks">
        <h2 id="tracked-picks" className="pundit-profile-section-title">
          Tracked picks
        </h2>
        {mapped.length ? (
          mapped.map((c) => (
            <CallCard key={c.id} call={c} events={events} showKind={false} />
          ))
        ) : (
          <p className="lede">No tracked picks yet.</p>
        )}
      </section>

      {mapped.length ? (
        <section aria-labelledby="hypothetical-record">
          <h2 id="hypothetical-record" className="pundit-profile-section-title">
            Hypothetical record
          </h2>
          <p className="lede" style={{ marginTop: 0 }}>
            Hypothetical $100 at the frozen Kalshi price — not a bet they placed.
          </p>
          <div className="pundit-profile-book">
            {open > 0 ? (
              <div>
                <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  Open · hypothetical $100
                </div>
                <div className="type-broadcast text-2xl text-[var(--green)]">
                  ${open}
                </div>
              </div>
            ) : null}
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                {gradedCount ? `Settled · ${gradedCount} graded` : "Settled"}
              </div>
              {gradedCount ? (
                <div
                  className={`type-broadcast text-2xl ${
                    settled > 0
                      ? "text-[var(--green)]"
                      : settled < 0
                        ? "text-[#ff5c5c]"
                        : ""
                  }`}
                >
                  {formatNetDollars(settled)}
                </div>
              ) : (
                <div className="pundit-profile-settled-empty">
                  No settled picks yet
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {rest.length ? (
        <section aria-labelledby="more-takes">
          <h2 id="more-takes" className="pundit-profile-section-title">
            More takes
          </h2>
          {rest.map((c) => <CallCard key={c.id} call={c} events={events} />)}
        </section>
      ) : null}

      <EmailInterestForm
        placement="pundit_profile"
        scope="pundit"
        scopeId={p.id}
        subjectName={p.name}
      />
    </main>
  );
}
