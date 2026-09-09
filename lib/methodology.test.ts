import { describe, expect, it } from "vitest";
import { METHODOLOGY_FAQ } from "./methodology";
import { faqJsonLd } from "./seo";

describe("public methodology contract", () => {
  it("keeps visible FAQ copy and FAQPage JSON-LD on the same answers", () => {
    const json = faqJsonLd(METHODOLOGY_FAQ);
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity.map((item: { name: string }) => item.name)).toEqual(
      METHODOLOGY_FAQ.map((item) => item.question)
    );
    const answers = json.mainEntity.map(
      (item: { acceptedAnswer: { text: string } }) => item.acceptedAnswer.text
    );
    expect(answers).toEqual(METHODOLOGY_FAQ.map((item) => item.answer));
  });

  it("does not claim capture-time market context or spoken recap labels", () => {
    const blob = METHODOLOGY_FAQ.map((item) => `${item.question} ${item.answer}`).join(" ");
    expect(blob).not.toMatch(/what the market believed at the time/i);
    expect(blob).not.toMatch(/when the pick was captured/i);
    expect(blob).toMatch(/dated, event-level Kalshi snapshot/i);
    expect(blob).toMatch(/not necessarily the market when the original prediction was spoken/i);
    expect(blob).toMatch(/straight-up winner/i);
    expect(blob).toMatch(/reported-selection labels do not qualify as exact spoken quotes/i);
    expect(blob).toMatch(/Unknown historical publication times stay blank/i);
  });
});
