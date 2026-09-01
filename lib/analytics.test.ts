import { describe, expect, it } from "vitest";
import {
  engagementParams,
  eventDetailOpenParams,
  filterUseParams,
  pickStoryOpenParams,
  shareIntentParams,
  sourceOpenParams,
} from "./analytics";

describe("engagement params", () => {
  it("emits event_detail_open ids without names or quotes", () => {
    const params = eventDetailOpenParams({
      eventSlug: "clemson-at-lsu-2026",
      sport: "ncaaf",
      surface: "home",
    });
    expect(params).toEqual({
      event_slug: "clemson-at-lsu-2026",
      sport: "ncaaf",
      surface: "home",
    });
    expect(JSON.stringify(params)).not.toMatch(/Pate|quote|"@/i);
  });

  it("emits pick_story_open ids", () => {
    expect(
      pickStoryOpenParams({
        eventSlug: "unc-vs-tcu-2026",
        punditId: "finebaum",
        status: "miss",
        surface: "take",
      })
    ).toEqual({
      event_slug: "unc-vs-tcu-2026",
      pundit_id: "finebaum",
      status: "miss",
      surface: "take",
    });
  });

  it("emits source_open with evidence or kalshi only", () => {
    expect(
      sourceOpenParams({
        eventSlug: "unc-vs-tcu-2026",
        punditId: "finebaum",
        sourceType: "evidence",
      }).source_type
    ).toBe("evidence");
  });

  it("omits empty optional share fields", () => {
    const params = shareIntentParams({
      artifactType: "event",
      eventSlug: "clemson-at-lsu-2026",
    });
    expect(params).toEqual({
      artifact_type: "event",
      event_slug: "clemson-at-lsu-2026",
    });
    expect(params).not.toHaveProperty("pundit_id");
  });

  it("drops blank values from the gtag payload", () => {
    expect(engagementParams({ event_slug: "x", pundit_id: undefined })).toEqual({
      event_slug: "x",
    });
  });

  it("records filter_use without the search box", () => {
    expect(
      filterUseParams({
        surface: "stories",
        filterName: "kind",
        filterValue: "game",
      })
    ).toEqual({
      surface: "stories",
      filter_name: "kind",
      filter_value: "game",
    });
  });
});
