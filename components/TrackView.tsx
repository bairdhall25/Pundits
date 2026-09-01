"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackView({
  event,
  params,
}: {
  event: string;
  params: Record<string, string>;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(event, params);
  }, [event, params]);

  return null;
}
