import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCard } from "@/components/CallCard";
import { PunditAvatar } from "@/components/PunditAvatar";
import {
  callsForPundit,
  getPundit,
  impliedOpenDollars,
  isMapped,
  loadCalls,
  loadPundits,
} from "@/lib/data";

export function generateStaticParams() {
  return loadPundits().map((p) => ({ id: p.id }));
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

  const mine = callsForPundit(p.id, calls);
  const implied = mine.filter(isMapped);
  const open = impliedOpenDollars(p.id, calls);

  return (
    <main className="shell">
      <Link
        href="/"
        className="mb-4 inline-block text-xs uppercase tracking-widest text-[var(--green)]"
      >
        ← Bets
      </Link>
      <div className="mb-8 grid items-center gap-6 md:grid-cols-[160px_1fr]">
        <PunditAvatar src={p.photo} alt={p.name} size="hero" />
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {p.outlet}
          </div>
          <h1 className="mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
            {p.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">
                2025 est.
              </div>
              <div className="type-broadcast text-2xl text-[var(--green)]">
                {p.accuracy2025}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">
                2026
              </div>
              <div className="type-broadcast text-2xl">
                {p.season2026.wins}–{p.season2026.losses}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="type-broadcast mb-3 mt-8 border-t border-[#2a2a2a] pt-4 text-[22px] tracking-widest">
        Implied book
      </h2>
      <div className="mb-4 flex gap-7 border border-[#245c18] bg-[#10200c] px-5 py-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Open at risk
          </div>
          <div className="type-broadcast text-2xl text-[var(--green)]">
            ${open}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Settled
          </div>
          <div className="type-broadcast text-2xl">$0</div>
        </div>
      </div>
      {implied.length ? (
        implied.map((c) => <CallCard key={c.id} call={c} />)
      ) : (
        <p className="lede">No clear Kalshi lean yet. Takes still live below.</p>
      )}

      <h2 className="type-broadcast mb-3 mt-8 border-t border-[#2a2a2a] pt-4 text-[22px] tracking-widest">
        The book
      </h2>
      {mine.map((c) => (
        <CallCard key={c.id} call={c} />
      ))}
    </main>
  );
}
