"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";

export function HowItWorks({ children }: { children: ReactNode }) {
  return (
    <Collapsible.Root className="how">
      <Collapsible.Trigger className="how-trigger">
        <span>How it works</span>
        <span className="market-details-icon" aria-hidden="true" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="how-panel" hiddenUntilFound>
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
