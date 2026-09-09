"use client";

import { useEffect } from "react";
import { persistBrowserCampaign } from "@/lib/campaign";

/** Persist landing campaign params for later events. Does not send a page_view. */
export function CampaignAttribution() {
  useEffect(() => {
    persistBrowserCampaign();
  }, []);
  return null;
}
