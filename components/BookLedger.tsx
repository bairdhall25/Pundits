"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CallCard } from "@/components/CallCard";
import { PunditAvatar } from "@/components/PunditAvatar";
import { emptyBookFilter, filterBook } from "@/lib/data";
import type { BookFilter } from "@/lib/data";
import type { Call, Pundit } from "@/lib/types";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="book-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BookLedger({
  calls,
  pundits,
}: {
  calls: Call[];
  pundits: Pundit[];
}) {
  const [f, setF] = useState<BookFilter>(emptyBookFilter);
  const byId = useMemo(
    () => Object.fromEntries(pundits.map((p) => [p.id, p])),
    [pundits]
  );
  const shown = useMemo(() => filterBook(calls, pundits, f), [calls, pundits, f]);
  const active =
    f.q.trim() !== "" || f.sport !== "all" || f.kind !== "all" || f.mapping !== "all";

  return (
    <>
      <div className="book-filters">
        <label className="book-field book-search">
          <span>Search</span>
          <input
            type="search"
            value={f.q}
            onChange={(e) => setF({ ...f, q: e.target.value })}
            placeholder="Quote, pundit, source"
          />
        </label>
        <Select
          label="Sport"
          value={f.sport}
          onChange={(v) => setF({ ...f, sport: v as BookFilter["sport"] })}
          options={[
            { value: "all", label: "All" },
            { value: "ncaaf", label: "NCAAF" },
            { value: "nfl", label: "NFL" },
          ]}
        />
        <Select
          label="Kind"
          value={f.kind}
          onChange={(v) => setF({ ...f, kind: v as BookFilter["kind"] })}
          options={[
            { value: "all", label: "All" },
            { value: "hard", label: "Hard" },
            { value: "soft", label: "Soft" },
          ]}
        />
        <Select
          label="Mapping"
          value={f.mapping}
          onChange={(v) => setF({ ...f, mapping: v as BookFilter["mapping"] })}
          options={[
            { value: "all", label: "All" },
            { value: "mapped", label: "Mapped" },
            { value: "unmapped", label: "Unmapped" },
          ]}
        />
        {active ? (
          <button type="button" className="lb-toggle" onClick={() => setF(emptyBookFilter)}>
            Reset
          </button>
        ) : null}
      </div>
      <p className="when">{shown.length} take{shown.length === 1 ? "" : "s"}</p>
      {shown.length === 0 ? (
        <p className="lede">No takes match those filters.</p>
      ) : (
        shown.map((c) => {
          const p = byId[c.punditId];
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
                  <div className="lb-outlet">{p.outlet}</div>
                </div>
              </Link>
              <CallCard call={c} />
            </div>
          );
        })
      )}
    </>
  );
}
