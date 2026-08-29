"use client";

import { useEffect, useState } from "react";
import { kickoffTag } from "@/lib/format";

/** Today/Tomorrow from the viewer's Eastern calendar, not build time. */
export function KickoffTag({ date }: { date?: string | null }) {
  const [label, setLabel] = useState<"Today" | "Tomorrow" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLabel(kickoffTag(date, new Date()));
    setReady(true);
  }, [date]);

  if (!date) return null;
  if (ready && !label) return null;

  return (
    <span
      className={label ? "kick-tag type-broadcast" : undefined}
      data-kickoff={date}
    >
      {label}
    </span>
  );
}
