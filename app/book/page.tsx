import Link from "next/link";
import { CallCard } from "@/components/CallCard";
import { PunditAvatar } from "@/components/PunditAvatar";
import { loadCalls, loadPundits } from "@/lib/data";

export default function BookPage() {
  const pundits = Object.fromEntries(loadPundits().map((p) => [p.id, p]));
  const calls = [...loadCalls()].sort((a, b) =>
    a.sourceDate < b.sourceDate ? 1 : a.sourceDate > b.sourceDate ? -1 : 0
  );

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">The Book</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Every
        <br />
        take.
      </h1>
      <p className="lede">
        Hard and soft. Mapped calls carry the Kalshi strip. This is the detail
        behind the picks.
      </p>
      {calls.map((c) => {
        const p = pundits[c.punditId];
        if (!p) return null;
        return (
          <div key={c.id} className="mb-2">
            <Link
              href={`/pundits/${p.id}`}
              className="mb-1 flex items-center gap-3 px-1"
            >
              <PunditAvatar src={p.photo} alt="" size="row" />
              <div>
                <div className="type-broadcast text-xl">{p.name}</div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  {p.outlet}
                </div>
              </div>
            </Link>
            <CallCard call={c} />
          </div>
        );
      })}
    </main>
  );
}
