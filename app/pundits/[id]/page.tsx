import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallCard } from "@/components/CallCard";
import { EmailInterestForm } from "@/components/EmailInterestForm";
import { JsonLd } from "@/components/JsonLd";
import { PunditAvatar } from "@/components/PunditAvatar";
import { ShareButton } from "@/components/ShareButton";
import { TrackView } from "@/components/TrackView";
import { punditProfileOpenParams } from "@/lib/analytics";
import {
  callsForPundit,
  getPundit,
  impliedOpenDollars,
  loadCalls,
  loadEvents,
  loadPundits,
} from "@/lib/data";
import { profileContent } from "@/lib/page-content";
import {
  formatNetDollars,
  punditIndexable,
  settledNetDollars,
} from "@/lib/records";
import { breadcrumbList, personJsonLd, profilePageJsonLd } from "@/lib/seo";
import { punditShare, sharePayload } from "@/lib/share";
import { sportChip } from "@/lib/format";
import { pageMeta } from "@/lib/site";
import {
  ogImageFor,
  ogPunditPath,
  ogStoryPunditPath,
  punditOgCard,
} from "@/lib/og";

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
  const profile = profileContent(p, calls);
  const card = punditOgCard(p, latest);
  const meta = pageMeta(
    profile.title,
    profile.description,
    `/pundits/${id}`,
    ogImageFor(ogPunditPath(id), profile.title, card)
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
  const profile = profileContent(p, calls);
  const mappedCount = profile.current.length + profile.historical.length;
  const open = impliedOpenDollars(p.id, calls);
  const events = loadEvents();
  const settled = settledNetDollars(p.id, calls, events);
  const gradedCount = profile.gradedSample;

  return (
    <main id="main" className="shell" data-page-type="profile">
      <TrackView
        event="pundit_profile_open"
        params={punditProfileOpenParams({ punditId: p.id })}
      />
      <JsonLd data={profilePageJsonLd(p, profile.description)} />
      <JsonLd data={personJsonLd(p, profile.description)} />
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
            {profile.outlet}
          </div>
          <div className="share-head">
            <h1 className="mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
              {profile.h1}
            </h1>
            <ShareButton
              share={sharePayload({
                title: profile.title,
                text: punditShare(p, punditCalls[0]).description,
                path: `/pundits/${p.id}`,
                image: ogPunditPath(p.id),
                story: ogStoryPunditPath(p.id),
                artifactType: "pundit",
                punditId: p.id,
              })}
            />
          </div>
          <div className="mt-2 inline-block border border-[#2a2a2a] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {sportChip(p.sport)}
          </div>
          <p className="lede" style={{ marginTop: 12, marginBottom: 0 }}>
            {profile.lede}
          </p>
          <p className="profile-note">{profile.recordDisclaimer}</p>
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
                2026 tracked record
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

      <section aria-labelledby="current-picks">
        <h2 id="current-picks" className="pundit-profile-section-title">
          Current mapped picks
        </h2>
        {profile.current.length ? (
          profile.current.map((c) => (
            <CallCard key={c.id} call={c} events={events} showKind={false} surface="profile" />
          ))
        ) : (
          <p className="lede">No current mapped picks.</p>
        )}
      </section>

      {profile.historical.length ? (
        <section aria-labelledby="past-receipts">
          <h2 id="past-receipts" className="pundit-profile-section-title">
            Past receipts
          </h2>
          {profile.historical.map((c) => (
            <CallCard key={c.id} call={c} events={events} showKind={false} surface="profile" />
          ))}
        </section>
      ) : null}

      {mappedCount ? (
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

      {profile.unmapped.length ? (
        <section aria-labelledby="more-takes">
          <h2 id="more-takes" className="pundit-profile-section-title">
            More takes
          </h2>
          {profile.unmapped.map((c) => (
            <CallCard key={c.id} call={c} events={events} surface="profile" />
          ))}
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
