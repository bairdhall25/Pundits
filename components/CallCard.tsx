import Link from "next/link";
import { formatCents } from "@/lib/format";
import { takePath } from "@/lib/site";
import type { Call, Event } from "@/lib/types";

export function CallCard({
  call,
  events = [],
}: {
  call: Call;
  events?: Event[];
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

  return (
    <article className="mb-2 border border-[#2a2a2a] bg-[var(--card)] p-4">
      <div className="mb-2">
        <span
          className={`mr-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            call.kind === "hard"
              ? "border-[var(--green)] text-[var(--green)]"
              : "border-[#6b6b6b] text-[var(--muted)]"
          }`}
        >
          {call.kind}
        </span>
        <span className="bg-[#12380c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--green)]">
          {call.status}
        </span>
      </div>
      <p className="mb-2 text-base leading-relaxed">{call.claim}</p>
      <div className="text-xs text-[var(--muted)]">
        {call.source}
        {call.sourceDate ? ` · ${call.sourceDate}` : ""}
        {call.sourceUrl ? (
          <>
            {" · "}
            <a
              href={call.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-extrabold uppercase tracking-wider text-[var(--green)]"
            >
              Source →
            </a>
          </>
        ) : null}
      </div>
      {event && call.side ? (
        <div className="mt-2.5 border-l-[3px] border-[var(--green)] bg-[#111] px-3.5 py-3 text-[13px]">
          <Link href={takePath(event.slug, call.punditId)}>
            {event.title} ·{" "}
            <b className="text-[var(--green)]">{call.side.toUpperCase()}</b> @{" "}
            {formatCents(cents)} · $100 at risk
          </Link>
        </div>
      ) : null}
    </article>
  );
}
