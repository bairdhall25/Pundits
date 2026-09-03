import Link from "next/link";
import type { TipSideHint } from "@/lib/tip-submission";

export function TipPrompt({
  eventSlug,
  eventTitle,
  sideHint,
  sideLabel,
}: {
  eventSlug: string;
  eventTitle: string;
  sideHint?: TipSideHint;
  sideLabel?: string;
}) {
  const params = new URLSearchParams({
    placement: "event",
    event: eventSlug,
    eventTitle,
  });
  if (sideHint) params.set("side", sideHint);

  return (
    <aside className="tip-prompt" aria-label="Submit a public pick source">
      <span className="tip-prompt-copy type-broadcast">
        {sideLabel ? `Know a public ${sideLabel} pick?` : "Know another public pick we missed?"}
      </span>
      <Link className="tip-prompt-link type-broadcast" href={`/submit/?${params.toString()}`}>
        Send the source →
      </Link>
    </aside>
  );
}
