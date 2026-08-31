import Link from "next/link";
import { eventStatusLine } from "@/lib/data";
import type { Call, Event } from "@/lib/types";

export function FinalRow({ event, calls }: { event: Event; calls: Call[] }) {
  return (
    <Link href={`/picks/${event.slug}`} className="wait-row final-row">
      <span className="wait-title type-broadcast">{event.title}</span>
      <span className="wait-when">{eventStatusLine(event, calls)}</span>
      <span className="wait-cta">Receipt →</span>
    </Link>
  );
}
