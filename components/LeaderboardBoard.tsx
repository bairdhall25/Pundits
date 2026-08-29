import Link from "next/link";
import { PunditAvatar } from "@/components/PunditAvatar";
import { hasGradedRecords } from "@/lib/records";
import type { ActivityRecord } from "@/lib/types";

export function LeaderboardBoard({
  board,
  showAll,
  onShowAll,
}: {
  board: ActivityRecord[];
  showAll?: boolean;
  onShowAll?: (next: boolean) => void;
}) {
  const rows = showAll ? board : board.filter((p) => p.totalCalls > 0);
  const hidden = board.length - rows.length;
  const graded = hasGradedRecords(board);

  return (
    <>
      {onShowAll ? (
        <div className="lb-tools">
          <button
            type="button"
            className={`lb-toggle ${showAll ? "on" : ""}`}
            onClick={() => onShowAll(!showAll)}
          >
            {showAll ? "Active only" : `All ${board.length}`}
          </button>
          <span className="when" style={{ margin: 0 }}>
            {rows.length} shown
            {hidden && !showAll ? ` · ${hidden} with no calls yet` : ""}
          </span>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {rows.map((p, i) => (
          <Link key={p.id} href={`/pundits/${p.id}`} className="lb-row">
            <div
              className={`lb-rank type-broadcast ${graded ? "" : "lb-rank-quiet"}`}
              aria-hidden={graded ? undefined : true}
            >
              {graded ? String(i + 1).padStart(2, "0") : ""}
            </div>
            <PunditAvatar src={p.photo} alt={p.name} size="row" />
            <div className="lb-who">
              <div className="type-broadcast lb-name">{p.name}</div>
              <div className="lb-outlet">{p.outlet}</div>
            </div>
            <div className="lb-metrics">
              <div>
                <div className="lb-k">Open picks</div>
                <div className="type-broadcast text-[var(--green)] lb-v">
                  {p.mappedPending}
                </div>
              </div>
              {graded ? (
                <div>
                  <div className="lb-k">2026</div>
                  <div className="type-broadcast lb-v">
                    {p.season2026.wins}–{p.season2026.losses}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="lb-k">Calls</div>
                <div className="type-broadcast lb-v">{p.totalCalls}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
