import type { PortraitFocus, PortraitPresentation } from "./model";

/**
 * Renderer-owned crop metadata. These values are presentation only and must
 * not be copied into the editorial ledgers under data/.
 */
export const PORTRAIT_PRESENTATIONS = {
  pate: {
    punditId: "pate",
    focus: { x: 0.5, y: 0.53 },
  },
  finebaum: {
    punditId: "finebaum",
    focus: { x: 0.5, y: 0.24 },
  },
  staples: {
    punditId: "staples",
    focus: { x: 0.5, y: 0.18 },
  },
  mcelroy: {
    punditId: "mcelroy",
    focus: { x: 0.5, y: 0.22 },
  },
  wrighster: {
    punditId: "wrighster",
    focus: { x: 0.5, y: 0.22 },
  },
} as const satisfies Record<string, PortraitPresentation>;

export function isNormalizedPortraitFocus(
  focus: PortraitFocus | undefined
): boolean {
  return (
    focus == null ||
    (Number.isFinite(focus.x) &&
      Number.isFinite(focus.y) &&
      focus.x >= 0 &&
      focus.x <= 1 &&
      focus.y >= 0 &&
      focus.y <= 1)
  );
}

export function portraitPresentationFor(
  punditId: string
): PortraitPresentation {
  return (
    PORTRAIT_PRESENTATIONS[
      punditId as keyof typeof PORTRAIT_PRESENTATIONS
    ] ?? { punditId }
  );
}
