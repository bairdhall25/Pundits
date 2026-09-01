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
  getActivityBoard,
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
  hasGradedRecords,
  punditIndexable,
  settledNetDollars,
} from "@/lib/records";
import { breadcrumbList, personJsonLd } from "@/lib/seo";
import { punditShare, sharePayload } from "@/lib/share";
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

  const implied = callsForPundit(p.id, calls).filter(isMapped);
  const rest = otherTakes(p.id, calls);
  const open = impliedOpenDollars(p.id, calls);
  const events = loadEvents();
  const settled = settledNetDollars(p.id, calls, events);
  const showRecord = hasGradedRecords(getActivityBoard(pundits, calls));

  return (
    <main id="main" className="shell">
      <JsonLd data={personJsonLd(p)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Picks", path: "/" },
          { name: p.name, path: `/pundits/${p.id}` },
        ])}
      />
      <Breadcrumbs
        items={[{ name: "Picks", href: "/" }, { name: p.name }]}
      />
      <div className="mb-8 grid items-center gap-6 md:grid-cols-[160px_1fr]">
        <PunditAvatar src={p.photo} alt={p.name} size="hero" />
        <div>
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
                text: punditShare(p, callsForPundit(p.id, calls)[0]).description,
                path: `/pundits/${p.id}`,
                image: ogPunditPath(p.id),
                story: ogStoryPunditPath(p.id),
                artifactType: "pundit",
              })}
            />
          </div>
          <div className="mt-2 inline-block border border-[#2a2a2a] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {p.sport}
          </div>
          <div className="mt-3 flex flex-wrap gap-6">
            {showRecord ? (
              <div>
                <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  2026
                </div>
                <div className="type-broadcast text-2xl">
                  {p.season2026.wins}–{p.season2026.losses}
                </div>
              </div>
            ) : null}
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
                Hypothetical $100
              </div>
              <div className="type-broadcast text-2xl text-[var(--green)]">
                ${open}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="type-broadcast mb-3 mt-8 border-t border-[#2a2a2a] pt-4 text-[22px] tracking-widest">
        Implied book
      </h2>
      <p className="lede" style={{ marginTop: 0 }}>
        Hypothetical $100 at the frozen Kalshi price — not a bet they placed.
      </p>
      <div className="mb-4 flex gap-7 border border-[#245c18] bg-[#10200c] px-5 py-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Open · hypothetical $100
          </div>
          <div className="type-broadcast text-2xl text-[var(--green)]">
            ${open}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Settled
          </div>
          <div
            className={`type-broadcast text-2xl ${
              settled > 0 ? "text-[var(--green)]" : settled < 0 ? "text-[#ff5c5c]" : ""
            }`}
          >
            {formatNetDollars(settled)}
          </div>
        </div>
      </div>
      {implied.length ? (
        implied.map((c) => <CallCard key={c.id} call={c} events={events} />)
      ) : (
        <p className="lede">No mapped Kalshi lean yet.</p>
      )}

      <h2 className="type-broadcast mb-3 mt-8 border-t border-[#2a2a2a] pt-4 text-[22px] tracking-widest">
        Other takes
      </h2>
      {rest.length ? (
        rest.map((c) => <CallCard key={c.id} call={c} events={events} />)
      ) : (
        <p className="lede">No unmapped takes on file.</p>
      )}

      <EmailInterestForm
        placement="pundit_profile"
        scope="pundit"
        scopeId={p.id}
        subjectName={p.name}
      />
    </main>
  );
}
