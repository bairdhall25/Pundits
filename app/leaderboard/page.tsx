import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { getActivityBoard, loadCalls, loadPundits } from "@/lib/data";

export default function LeaderboardPage() {
  const board = getActivityBoard(loadPundits(), loadCalls());

  return (
    <main className="shell">
      <div className="eyebrow type-broadcast">The table</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        The table.
      </h1>
      <p className="lede">
        Everyone starts 0–0. The board ranks who’s actually on record this
        week.
      </p>
      <div className="flex flex-col gap-2">
        {board.map((p, i) => (
          <Link
            key={p.id}
            href={`/pundits/${p.id}`}
            className="grid grid-cols-[44px_52px_1fr_auto_auto] items-center gap-3.5 border border-[#2a2a2a] bg-[var(--card)] px-4 py-3.5 hover:border-[var(--green)]"
          >
            <div className="type-broadcast text-2xl text-[var(--green)]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <PunditAvatar src={p.photo} alt={p.name} size="row" />
            <div>
              <div className="type-broadcast text-2xl">{p.name}</div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {p.outlet}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">
                Live picks
              </div>
              <div className="type-broadcast text-2xl text-[var(--green)]">
                {p.mappedPending}
              </div>
            </div>
            <div className="text-right">
              <div className="type-broadcast text-2xl">
                2026 {p.season2026.wins}–{p.season2026.losses}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {p.totalCalls} calls
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
