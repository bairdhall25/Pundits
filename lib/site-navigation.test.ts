import { describe, expect, it } from "vitest";
import {
  activeSiteSection,
  FOOTER_NAV_GROUPS,
  isExactNavigationPath,
  normalizeNavigationPath,
  PICKS_NAV,
  PRIMARY_NAV,
} from "./site-navigation";

describe("site navigation", () => {
  it("normalizes trailing slashes without changing the home route", () => {
    expect(normalizeNavigationPath("/")).toBe("/");
    expect(normalizeNavigationPath("/ncaaf/")).toBe("/ncaaf");
    expect(normalizeNavigationPath("/book///")).toBe("/book");
  });

  it("maps public routes to their primary product section", () => {
    expect(activeSiteSection("/")).toBe("home");
    expect(activeSiteSection("/picks/")).toBe("picks");
    expect(activeSiteSection("/ncaaf/2026/week-0/")).toBe("picks");
    expect(activeSiteSection("/teams/tcu/")).toBe("picks");
    expect(activeSiteSection("/picks/clemson-at-lsu-2026/")).toBe("picks");
    expect(activeSiteSection("/stories/")).toBe("takes");
    expect(activeSiteSection("/book/")).toBe("takes");
    expect(activeSiteSection("/picks/clemson-at-lsu-2026/pate/")).toBe("takes");
    expect(activeSiteSection("/leaderboard/")).toBe("pundits");
    expect(activeSiteSection("/pundits/pate/")).toBe("pundits");
    expect(activeSiteSection("/methodology/")).toBeUndefined();
  });

  it("marks only the destination URL as the exact current page", () => {
    expect(isExactNavigationPath("/stories", "/stories/")).toBe(true);
    expect(isExactNavigationPath("/book/", "/stories/")).toBe(false);
    expect(isExactNavigationPath("/ncaaf/", "/")).toBe(false);
    expect(isExactNavigationPath("/methodology/", "mailto:test@example.com")).toBe(false);
  });

  it("keeps distinct home and product sections with a complete footer destination set", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Home",
      "Picks",
      "Takes",
      "Pundits",
    ]);
    expect(PICKS_NAV).toEqual([
      { href: "/picks/", label: "All picks" },
      { href: "/ncaaf/", label: "NCAAF" },
      { href: "/nfl/", label: "NFL" },
    ]);
    const footerHrefs = FOOTER_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href)
    );
    for (const href of [
      "/",
      "/picks/",
      "/ncaaf/",
      "/nfl/",
      "/stories/",
      "/book/",
      "/leaderboard/",
      "/submit/",
      "/about/",
      "/methodology/",
      "/privacy/",
      "/terms/",
    ]) {
      expect(footerHrefs).toContain(href);
    }
  });
});
