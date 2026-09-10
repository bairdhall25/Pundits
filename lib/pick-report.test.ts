import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { buildPickReport, publishedPickReport, pickReportMeta } from "./pick-report";
import { resolveWeekSocialCard } from "./social-card/resolver";

const events = loadEvents(), calls = loadCalls(), pundits = loadPundits();
const build = (es = events, cs = calls) => buildPickReport("ncaaf", 2026, 1, es, cs, pundits);
const slug = "clemson-at-lsu-2026";

describe("weekly pick report", () => {
  it("keeps repeated selections separate from unique game outcomes", () => {
    const r = build()!;
    expect([r.picks.length, r.punditCount, r.games.length, r.hits, r.misses]).toEqual([39, 17, 11, 28, 11]);
    expect([r.favorites.hits, r.favorites.misses, r.favorites.games]).toEqual([27, 0, 8]);
    expect([r.underdogs.hits, r.underdogs.misses, r.underdogs.games]).toEqual([1, 11, 7]);
    expect(r.favoriteGames.filter(g => g.hit)).toHaveLength(10);
    expect(r.dogGames.find(g => g.hit)?.label).toBe("Tulsa");
  });
  it("excludes other sports, weeks, futures and soft commentary", () => {
    const withNoise = [...calls, { ...calls.find(c => c.eventSlug === slug)!, id: "soft-noise", kind: "soft" as const }];
    expect(build(events, withNoise)?.picks.length).toBe(39);
  });
  it("does not turn pending picks or conflicting grades into final results", () => {
    for (const status of ["pending", "miss"] as const) {
      expect(build(events, calls.map(c => c.eventSlug === slug && c.side === "no" ? { ...c, status } : c))).toBeNull();
    }
  });
  it("rejects duplicates rather than inflating the record", () => {
    expect(build(events, [...calls, { ...calls.find(c => c.eventSlug === slug)!, id: "duplicate" }])).toBeNull();
  });
  it("requires known, unambiguous prices and authoritative final scores", () => {
    for (const change of [{ yesCents: null }, { yesCents: 50 }, { yesCents: 78 }, { awayScore: undefined }, { resultUrl: undefined }]) {
      expect(build(events.map(e => e.slug === slug ? { ...e, ...change } : e))).toBeNull();
    }
  });
  it("does not auto-publish unreviewed issues", () => {
    expect(publishedPickReport("ncaaf", 2026, 0, events, calls, pundits)).toBeNull();
    expect(publishedPickReport("nfl", 2026, 1, events, calls, pundits)).toBeNull();
    expect(publishedPickReport("ncaaf", 2026, 1, events, calls, pundits)).not.toBeNull();
  });
  it("keeps SEO copy and the share image consistent with the report", () => {
    const r = build()!;
    expect(pickReportMeta(r).description).toContain("favorites 27–0, underdogs 1–11");
    const card = resolveWeekSocialCard("ncaaf", 2026, 1, events, calls, pundits);
    expect(card.feature?.headline).toBe("12 underdog picks. One winner.");
    expect(card.metrics.map(m => m.value)).toEqual(["27–0", "1–11"]);
    expect(card.context).toContain("11 games");
  });
});
