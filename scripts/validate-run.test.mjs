import { describe, expect, it } from "vitest";
import { validateRunContents } from "./validate-run.mjs";

const EVENTS = ["clemson-at-lsu-2026"];

function runFile({ reasoning = "A concise source-grounded explanation.", quote = "Give me Clemson.", eventSlug = "clemson-at-lsu-2026", side = "yes", sourceUrl = "https://example.com/episode", pass = "Shows" } = {}) {
  return `## ${pass} pass 2026-09-03 (Scout)

### Intake

| pundit | eventSlug | side | verbatim quote | reasoning | note | source | sourceUrl | sourceDate | hard/soft |
|---|---|---|---|---|---|---|---|---|---|
| kanell | ${eventSlug} | ${side} | ${quote} | ${reasoning} |  | Cover 3 | ${sourceUrl} | 2026-09-03 | hard |
`;
}

describe("run-file validation", () => {
  it("accepts a truthful 10-word capsule because there is no minimum", () => {
    const reasoning = "He expects Clemson's defense to keep the game close throughout.";
    expect(reasoning.trim().split(/\s+/)).toHaveLength(10);
    expect(validateRunContents(runFile({ reasoning }), { eventSlugs: EVENTS })).toEqual([]);
  });

  it("rejects a 61-word capsule and names the row", () => {
    const reasoning = Array.from({ length: 61 }, (_, index) => `word${index + 1}`).join(" ");
    const errors = validateRunContents(runFile({ reasoning }), {
      filePath: "fixture.md",
      eventSlugs: EVENTS,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/fixture\.md:7 Shows.*kanell\/clemson-at-lsu-2026.*61 words/);
  });

  it("moves routing language and Overflow labels out of reader-facing fields", () => {
    const contents = runFile({
      reasoning: "A short capsule. Off-home until the operator asks.",
      quote: "Overflow: Clemson at LSU. Give me Clemson.",
      eventSlug: "",
      side: "",
    });
    const errors = validateRunContents(contents, { eventSlugs: EVENTS });
    expect(errors).toEqual([
      expect.stringMatching(/routing marker "Off-home"/),
      expect.stringMatching(/Overflow label/),
    ]);
  });

  it("checks mappings, dates, URLs, duplicates, and known events", () => {
    const contents = `${runFile({ eventSlug: "missing-2026", side: "home", sourceUrl: "" }).trim()}
| kanell | missing-2026 | yes | Another quote. |  |  | Cover 3 | https://example.com | 2026-09-3 | hard |
`;
    const errors = validateRunContents(contents, { eventSlugs: EVENTS });
    expect(errors.join("\n")).toMatch(/side must be yes or no/);
    expect(errors.join("\n")).toMatch(/does not exist/);
    expect(errors.join("\n")).toMatch(/sourceUrl is required/);
    expect(errors.join("\n")).toMatch(/sourceDate must match/);
    expect(errors.join("\n")).toMatch(/duplicates kanell\/missing-2026/);
  });

  it("requires status URLs in X-pass Intake", () => {
    const errors = validateRunContents(runFile({ pass: "X", sourceUrl: "https://x.com/kanell" }), {
      eventSlugs: EVENTS,
    });
    expect(errors).toEqual([expect.stringMatching(/X row sourceUrl/)]);
  });

  it("allows legacy rows without note while validating their stable fields", () => {
    const contents = runFile({ quote: "Overflow: Clemson at LSU. Give me Clemson.", eventSlug: "", side: "" })
      .replace("| reasoning | note | source |", "| reasoning | source |")
      .replace("|---|---|---|---|---|---|---|---|---|---|", "|---|---|---|---|---|---|---|---|---|")
      .replace("| A concise source-grounded explanation. |  | Cover 3 |", "| A concise source-grounded explanation. | Cover 3 |");
    expect(
      validateRunContents(contents, { eventSlugs: EVENTS, allowLegacySchema: true })
    ).toEqual([]);
  });

  it("requires the note column for the current schema", () => {
    const contents = runFile()
      .replace("| reasoning | note | source |", "| reasoning | source |")
      .replace("|---|---|---|---|---|---|---|---|---|---|", "|---|---|---|---|---|---|---|---|---|")
      .replace("| A concise source-grounded explanation. |  | Cover 3 |", "| A concise source-grounded explanation. | Cover 3 |");
    expect(validateRunContents(contents, { eventSlugs: EVENTS })).toEqual([
      expect.stringMatching(/must include note after reasoning/),
    ]);
  });
});
