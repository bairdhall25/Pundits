"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";

export function MarketDetails({ children }: { children: ReactNode }) {
  return (
    <Collapsible.Root className="market-details">
      <Collapsible.Trigger className="market-details-trigger">
        <span>Market details</span>
        <span className="market-details-icon" aria-hidden="true" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="market-details-panel" hiddenUntilFound>
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
