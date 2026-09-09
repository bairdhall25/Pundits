import type { Call, EvidenceKind, SourceLocator } from "./types";

/**
 * Operational or mixed capsules from the 2026-09-08 inventory.
 * Omit from public copy until Audit/Promote removes or approves the field.
 * Matching these IDs is intentional: a fuzzy heuristic could hide good rationale.
 */
export const OMIT_PUBLIC_RATIONALE_CALL_IDS = new Set<string>([
  "patterson-smu-at-fsu-20260903",
  "kanell-ucla-at-cal-20260903",
  "patterson-toledo-at-michigan-state-20260903",
  "elliott-fiu-at-usf-20260903",
  "fornelli-ucla-at-cal-20260903",
  "brandt-49ers-vs-rams-20260908",
  "kanell-western-michigan-at-michigan-20260903",
  "kanell-fiu-at-usf-20260903",
  "patterson-oklahoma-state-at-tulsa-20260903",
]);

export function isLegacyReportedSelection(call: Pick<Call, "sourceUrl" | "evidenceKind">): boolean {
  if (call.evidenceKind) return call.evidenceKind === "reported-selection";
  return Boolean(call.sourceUrl?.includes("gamedaycole.com"));
}

export function evidenceKindFor(call: Pick<Call, "sourceUrl" | "evidenceKind">): EvidenceKind {
  if (call.evidenceKind === "spoken-quote" || call.evidenceKind === "reported-selection") {
    return call.evidenceKind;
  }
  return isLegacyReportedSelection(call) ? "reported-selection" : "spoken-quote";
}

export function isSpokenQuote(call: Pick<Call, "sourceUrl" | "evidenceKind">): boolean {
  return evidenceKindFor(call) === "spoken-quote";
}

/** Claim text as it should appear to a reader. Does not invent wording. */
export function quotedEvidenceText(call: Pick<Call, "claim" | "sourceUrl" | "evidenceKind">): string {
  return isSpokenQuote(call) ? `“${call.claim}”` : call.claim;
}

export function publicRationale(call: Pick<Call, "id" | "reasoning">): string | null {
  const text = call.reasoning?.trim();
  if (!text) return null;
  if (OMIT_PUBLIC_RATIONALE_CALL_IDS.has(call.id)) return null;
  return text;
}

export function formatSourceLocator(locator: SourceLocator | undefined): string | null {
  if (!locator) return null;
  const bits = [
    locator.section?.trim() || null,
    locator.timestamp?.trim() ? `at ${locator.timestamp.trim()}` : null,
  ].filter(Boolean);
  const line = bits.join(" ");
  return line || null;
}

export function sourceLocatorUrl(locator: SourceLocator | undefined): string | null {
  const url = locator?.transcriptUrl?.trim();
  return url || null;
}

export type EvidencePresentation = {
  kind: EvidenceKind;
  claim: string;
  displayText: string;
  isQuotedSpeech: boolean;
  evidenceLine: string;
  locatorLine: string | null;
  transcriptUrl: string | null;
  correctionNote: string | null;
  rationale: string | null;
};

export function presentEvidence(
  call: Call,
  punditName: string,
  sourceDay?: string | null
): EvidencePresentation {
  const kind = evidenceKindFor(call);
  const locatorLine = formatSourceLocator(call.sourceLocator);
  const transcriptUrl = sourceLocatorUrl(call.sourceLocator);
  const rationale = publicRationale(call);
  const from = sourceDay
    ? `${call.source} on ${sourceDay}`
    : call.source;

  if (kind === "reported-selection") {
    return {
      kind,
      claim: call.claim,
      displayText: call.claim,
      isQuotedSpeech: false,
      evidenceLine: `${from} lists ${punditName} as selecting ${call.claim}. That is a reported selection from the named source, not a verified spoken quotation.`,
      locatorLine,
      transcriptUrl,
      correctionNote:
        "This published receipt is under evidence review. The original recorded label is preserved. We are seeking the original clip or transcript and will not invent spoken wording.",
      rationale,
    };
  }

  return {
    kind,
    claim: call.claim,
    displayText: `“${call.claim}”`,
    isQuotedSpeech: true,
    evidenceLine: `The receipt comes from ${from}. ${punditName} said: “${call.claim}”`,
    locatorLine,
    transcriptUrl,
    correctionNote: null,
    rationale,
  };
}

/** Spread numbers or cover language in the stored claim — still graded winner-only. */
export function looksLikeSpreadOrigin(call: Pick<Call, "claim">): boolean {
  return /(?:^|[^0-9])[+-]\d+(?:\.\d+)?|\b(?:minus|plus)\s+\d+(?:\.\d+)?|\bcover(?:ed|ing)?\b|\bATS\b|\bspread\b/i.test(
    call.claim
  );
}

export function winnerOnlyLine(call: Pick<Call, "claim">, isGame: boolean): string | null {
  if (!isGame) return null;
  if (looksLikeSpreadOrigin(call)) {
    return "The original evidence names a point spread. The tracked result on Pundits.Pro is the straight-up winner, not whether a spread covered.";
  }
  return "The tracked result is the straight-up winner, not a spread cover.";
}
