import { describe, expect, it } from "vitest";
import {
  engagementParams,
  eventDetailOpenParams,
  filterUseParams,
  leaguePageOpenParams,
  pickStoryOpenParams,
  punditProfileOpenParams,
  shareIntentParams,
  sourceOpenParams,
  teamPageOpenParams,
  tipAnalyticsParams,
  weekArchiveOpenParams,
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
      page_type: "game",
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
      page_type: "receipt",
    });
  });

  it("emits pundit_profile_open with page_type", () => {
    expect(punditProfileOpenParams({ punditId: "kanell" })).toEqual({
      pundit_id: "kanell",
      surface: "profile",
      page_type: "profile",
    });
  });

  it("emits team, league, and week page types", () => {
    expect(teamPageOpenParams({ teamId: "49ers", sport: "nfl" })).toEqual({
      team_id: "49ers",
      sport: "nfl",
      surface: "team",
      page_type: "team",
    });
    expect(leaguePageOpenParams({ sport: "ncaaf" })).toEqual({
      sport: "ncaaf",
      surface: "ncaaf",
      page_type: "league",
    });
    expect(
      weekArchiveOpenParams({ sport: "ncaaf", season: 2026, week: 0 })
    ).toEqual({
      sport: "ncaaf",
      season: "2026",
      week: "0",
      surface: "week",
      page_type: "week",
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
      page_type: "game",
      share_channel: "native",
    });
    expect(params).not.toHaveProperty("pundit_id");
  });

  it("tracks native profile share without requiring an event slug", () => {
    expect(
      shareIntentParams({
        artifactType: "pundit",
        punditId: "kanell",
      })
    ).toEqual({
      artifact_type: "pundit",
      pundit_id: "kanell",
      page_type: "profile",
      share_channel: "native",
    });
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

  it("records tip context without source URLs, names, or free text", () => {
    const params = tipAnalyticsParams({
      placement: "event",
      eventSlug: "clemson-at-lsu-2026",
      sideHint: "no",
      pagePath: "/submit/",
      errorType: "validation",
    });
    expect(params).toEqual({
      placement: "event",
      event_slug: "clemson-at-lsu-2026",
      side_hint: "no",
      page_path: "/submit/",
      error_type: "validation",
    });
    expect(JSON.stringify(params)).not.toMatch(/https?:|Wrighster|quote/i);
  });
});
