import Link from "next/link";
import { statusLabel } from "@/lib/format";
import { mappedStakeLine } from "@/lib/public-side";
import { takePath } from "@/lib/site";
import type { Call, Event } from "@/lib/types";

export function CallCard({
  call,
  events = [],
  showKind = true,
}: {
  call: Call;
  events?: Event[];
  showKind?: boolean;
}) {
  const event = call.eventSlug
    ? events.find((e) => e.slug === call.eventSlug) ?? null
    : null;
  const cents =
    event && call.side
      ? call.side === "yes"
        ? event.yesCents
        : event.noCents
      : null;
  const stake = event && call.side ? mappedStakeLine(event, call.side, cents) : null;
  const badgeLabel = [showKind ? call.kind : null, statusLabel(call.status)]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="call-card mb-2 border border-[#2a2a2a] bg-[var(--card)] p-4">
      <div
        className="call-card-badges mb-2"
        role="group"
        aria-label={badgeLabel}
      >
        {showKind ? (
          <span
            aria-hidden="true"
            className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              call.kind === "hard"
                ? "border-[var(--green)] text-[var(--green)]"
                : "border-[#6b6b6b] text-[var(--muted)]"
            }`}
          >
            {call.kind}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="bg-[#12380c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--green)]"
        >
          {statusLabel(call.status)}
        </span>
      </div>
      <p className="mb-2 text-base leading-relaxed">{call.claim}</p>
      <div className="call-card-meta">
        <span>
          {call.source}
          {call.sourceDate ? ` · ${call.sourceDate}` : ""}
        </span>
        {call.sourceUrl ? (
          <a
            href={call.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="call-card-source"
          >
            Open source →
          </a>
        ) : null}
      </div>
      {event && stake ? (
        <Link
          className="call-card-receipt"
          href={takePath(event.slug, call.punditId)}
        >
          <span>{stake.line}</span>
          <span className="call-card-receipt-action">View receipt →</span>
        </Link>
      ) : null}
    </article>
  );
}
