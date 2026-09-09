import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import {
  evidenceKindFor,
  formatAttributedText,
  looksLikeSpreadOrigin,
  OMIT_PUBLIC_RATIONALE_CALL_IDS,
  presentEvidence,
  publicRationale,
  quotedEvidenceText,
  REPORTED_SELECTION_LABEL,
  winnerOnlyLine,
} from "./evidence";
import { articleJsonLd, mappedTakes, pickStory } from "./seo";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

function liveTake(eventSlug: string, punditId: string) {
  const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
    (row) => row.event.slug === eventSlug && row.pundit.id === punditId
  );
  expect(take, `${eventSlug}/${punditId}`).toBeTruthy();
  return take!;
}

describe("evidence presentation", () => {
  it("does not give unknown or reported evidence stronger quotation attribution", () => {
    expect(formatAttributedText("LSU over Clemson", undefined)).toBe("LSU over Clemson");
    expect(formatAttributedText("LSU over Clemson", null)).toBe("LSU over Clemson");
    expect(formatAttributedText("LSU over Clemson", "reported-selection")).toBe(
      "LSU over Clemson"
    );
    expect(formatAttributedText("LSU over Clemson", "spoken-quote")).toBe(
      "“LSU over Clemson”"
    );
    expect(REPORTED_SELECTION_LABEL).toBe("Reported selection");
  });

  it("treats Brandt's GMFB claim as spoken quotation", () => {
    const take = liveTake("49ers-vs-rams-2026", "brandt");
    expect(evidenceKindFor(take.call)).toBe("spoken-quote");
    expect(quotedEvidenceText(take.call)).toBe(`“${take.call.claim}”`);
    const story = pickStory(take);
    expect(story.paragraphs.join(" ")).toContain("Kyle Brandt said:");
    expect(story.paragraphs.join(" ")).toContain(take.call.claim);
    expect(story.paragraphs.join(" ")).not.toContain("helmet props");
    expect(publicRationale(take.call)).toBeNull();
  });

  it("treats unresolved GameDay Cole rows as reported selections, not speech", () => {
    const take = liveTake("clemson-at-lsu-2026", "saban");
    expect(take.call.sourceUrl).toContain("gamedaycole.com");
    expect(evidenceKindFor(take.call)).toBe("reported-selection");
    expect(quotedEvidenceText(take.call)).toBe("LSU over Clemson");
    const evidence = presentEvidence(take.call, take.pundit.name, "Sep 5, 2026");
    expect(evidence.isQuotedSpeech).toBe(false);
    expect(evidence.correctionNote).toMatch(/evidence review/i);
    const story = pickStory(take);
    expect(story.paragraphs.join(" ")).not.toContain("Nick Saban said:");
    expect(story.paragraphs.join(" ")).toContain("reported selection");
    expect(story.paragraphs.join(" ")).toContain("LSU over Clemson");
  });

  it("omits a rationale section for winner-only Finebaum LSU", () => {
    const take = liveTake("clemson-at-lsu-2026", "finebaum");
    expect(take.call.reasoning).toBeUndefined();
    expect(publicRationale(take.call)).toBeNull();
    expect(pickStory(take).paragraphs.join(" ")).not.toContain("Why Paul Finebaum picked them");
  });

  it("renders a keep+render Pollack capsule", () => {
    const take = liveTake("clemson-at-lsu-2026", "pollack");
    expect(publicRationale(take.call)).toContain("old-school Dabo");
    expect(pickStory(take).paragraphs.join(" ")).toContain("Why David Pollack picked them:");
    expect(pickStory(take).paragraphs.join(" ")).toContain("old-school Dabo");
  });

  it("omits inventory operational and mixed capsules by call id", () => {
    expect(OMIT_PUBLIC_RATIONALE_CALL_IDS.has("brandt-49ers-vs-rams-20260908")).toBe(true);
    expect(OMIT_PUBLIC_RATIONALE_CALL_IDS.has("kanell-fiu-at-usf-20260903")).toBe(true);
    const brandt = liveTake("49ers-vs-rams-2026", "brandt");
    const kanell = loadCalls().find((call) => call.id === "kanell-fiu-at-usf-20260903")!;
    expect(kanell.reasoning).toBeTruthy();
    expect(publicRationale(brandt.call)).toBeNull();
    expect(publicRationale(kanell)).toBeNull();
    expect(articleJsonLd(brandt).articleBody).not.toContain("helmet props");
  });

  it("does not guess locators when none are stored", () => {
    const take = liveTake("49ers-vs-rams-2026", "brandt");
    const evidence = presentEvidence(take.call, take.pundit.name);
    expect(evidence.locatorLine).toBeNull();
    expect(evidence.transcriptUrl).toBeNull();
  });

  it("shows a verified locator when Promote stored one", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("away-at-home-2026");
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      claim: "Away wins it.",
      sourceLocator: {
        timestamp: "09:40",
        section: "Predictions hour",
        transcriptUrl: "https://example.com/transcript",
      },
    });
    const evidence = presentEvidence(call, pundit.name, "Sep 8, 2026");
    expect(evidence.locatorLine).toBe("Predictions hour at 09:40");
    expect(evidence.transcriptUrl).toBe("https://example.com/transcript");
  });
});

describe("winner-only grading language", () => {
  it("does not treat a 24-20 score as spread-origin evidence", () => {
    expect(looksLikeSpreadOrigin({ claim: "I'm taking this really close, 24-20 type game" })).toBe(
      false
    );
    expect(looksLikeSpreadOrigin({ claim: "Give me LSU minus 10." })).toBe(true);
  });

  it("names Compton's stored spread as winner-only, not a cover", () => {
    const take = liveTake("unc-vs-tcu-2026", "compton");
    expect(looksLikeSpreadOrigin(take.call)).toBe(true);
    expect(winnerOnlyLine(take.call, true)).toMatch(/straight-up winner/i);
    expect(winnerOnlyLine(take.call, true)).toMatch(/not whether a spread covered/i);
    const story = pickStory(take);
    expect(story.paragraphs.join(" ")).toMatch(/straight-up winner/);
    expect(story.paragraphs.join(" ")).not.toMatch(/covered the spread/i);
    expect(story.dek).not.toMatch(/\btook\b/);
  });
});
