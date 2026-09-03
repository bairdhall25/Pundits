"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CallCard } from "@/components/CallCard";
import { PunditAvatar } from "@/components/PunditAvatar";
import { filterUseParams, trackEvent } from "@/lib/analytics";
import { emptyBookFilter, filterBook } from "@/lib/book-filter";
import type { BookFilter } from "@/lib/book-filter";
import type { Call, Event, Pundit } from "@/lib/types";

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

function FilterControls({
  filter,
  active,
  onChange,
  onReset,
}: {
  filter: BookFilter;
  active: boolean;
  onChange: (name: "sport" | "kind" | "mapping", value: string) => void;
  onReset: () => void;
}) {
  return (
    <>
      <Select
        label="Sport"
        value={filter.sport}
        onChange={(value) => onChange("sport", value)}
        options={[
          { value: "all", label: "All" },
          { value: "ncaaf", label: "NCAAF" },
          { value: "nfl", label: "NFL" },
        ]}
      />
      <Select
        label="Kind"
        value={filter.kind}
        onChange={(value) => onChange("kind", value)}
        options={[
          { value: "all", label: "All" },
          { value: "hard", label: "Hard" },
          { value: "soft", label: "Soft" },
        ]}
      />
      <Select
        label="Mapping"
        value={filter.mapping}
        onChange={(value) => onChange("mapping", value)}
        options={[
          { value: "all", label: "All" },
          { value: "mapped", label: "Mapped" },
          { value: "unmapped", label: "Unmapped" },
        ]}
      />
      {active ? (
        <button type="button" className="lb-toggle" onClick={onReset}>
          Reset
        </button>
      ) : null}
    </>
  );
}

export function BookLedger({
  calls,
  pundits,
  events,
}: {
  calls: Call[];
  pundits: Pundit[];
  events: Event[];
}) {
  const [f, setF] = useState<BookFilter>(emptyBookFilter);
  const byId = useMemo(
    () => Object.fromEntries(pundits.map((p) => [p.id, p])),
    [pundits]
  );
  const shown = useMemo(() => filterBook(calls, pundits, f), [calls, pundits, f]);
  const active =
    f.q.trim() !== "" || f.sport !== "all" || f.kind !== "all" || f.mapping !== "all";
  const secondaryActive = f.sport !== "all" || f.kind !== "all" || f.mapping !== "all";
  const secondaryCount = [f.sport, f.kind, f.mapping].filter((value) => value !== "all").length;

  function changeFilter(name: "sport" | "kind" | "mapping", value: string) {
    trackEvent(
      "filter_use",
      filterUseParams({ surface: "book", filterName: name, filterValue: value })
    );
    setF({ ...f, [name]: value });
  }

  function resetFilters() {
    trackEvent(
      "filter_use",
      filterUseParams({ surface: "book", filterName: "reset", filterValue: "all" })
    );
    setF(emptyBookFilter);
  }

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
        <div className="book-filter-desktop book-more-panel">
          <FilterControls
            filter={f}
            active={active}
            onChange={changeFilter}
            onReset={resetFilters}
          />
        </div>
        <div className="book-filter-mobile">
          <Drawer.Root swipeDirection="down">
            <Drawer.Trigger
              className={`book-filter-trigger lb-toggle ${secondaryActive ? "on" : ""}`}
            >
              Filter &amp; sort
              {secondaryCount ? (
                <span className="book-filter-count" aria-label={`${secondaryCount} active filters`}>
                  {secondaryCount}
                </span>
              ) : null}
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop className="book-drawer-backdrop" />
              <Drawer.Viewport className="book-drawer-viewport">
                <Drawer.Popup className="book-drawer-popup">
                  <div className="book-drawer-handle" aria-hidden="true" />
                  <Drawer.Content className="book-drawer-content">
                    <Drawer.Close
                      className="book-drawer-close type-broadcast"
                      aria-label="Close filters"
                    >
                      Close
                    </Drawer.Close>
                    <Drawer.Title className="book-drawer-title type-broadcast">
                      Filter &amp; sort
                    </Drawer.Title>
                    <Drawer.Description className="book-drawer-description">
                      Narrow the ledger by sport, take type, or event mapping.
                    </Drawer.Description>
                    <div className="book-drawer-fields">
                      <FilterControls
                        filter={f}
                        active={active}
                        onChange={changeFilter}
                        onReset={resetFilters}
                      />
                    </div>
                    <Drawer.Close className="book-drawer-apply type-broadcast">
                      Show {shown.length} take{shown.length === 1 ? "" : "s"}
                    </Drawer.Close>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
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
              <CallCard call={c} events={events} />
            </div>
          );
        })
      )}
    </>
  );
}
