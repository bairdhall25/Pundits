import { describe, expect, it } from "vitest";
import {
  SOCIAL_PAGE_KEYS,
  SOCIAL_PAGE_REGISTRY,
  ogPagePath,
  socialPageRoute,
} from "./registry";
import { resolvePageSocialCard } from "./resolver";

describe("social page registry", () => {
  it("gives every core, collection, sport, trust, and utility route a unique card", () => {
    expect(SOCIAL_PAGE_KEYS).toEqual([
      "home",
      "stories",
      "book",
      "leaderboard",
      "ncaaf",
      "nfl",
      "about",
      "methodology",
      "privacy",
      "terms",
    ]);
    expect(new Set(SOCIAL_PAGE_KEYS.map(socialPageRoute)).size).toBe(SOCIAL_PAGE_KEYS.length);
    expect(new Set(SOCIAL_PAGE_KEYS.map(ogPagePath)).size).toBe(SOCIAL_PAGE_KEYS.length);
    for (const key of SOCIAL_PAGE_KEYS) {
      expect(SOCIAL_PAGE_REGISTRY[key].route).toMatch(/^\//);
      expect(SOCIAL_PAGE_REGISTRY[key].image).toBe(`/og/pages/${key}.png`);
      expect(resolvePageSocialCard(key)).toMatchObject({
        archetype: "editorial",
        mode: "page",
      });
    }
  });
});
