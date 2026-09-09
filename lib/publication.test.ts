import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { newsSitemap, recentNewsTakes, rssFeed } from "./feeds";
import {
  firstPublishedAt,
  isNewsEligible,
  materialUpdatedAt,
  parsePublicationInstant,
  rssPublicationDate,
} from "./publication";
import { articleJsonLd, mappedTakes, pickStory } from "./seo";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

describe("publication stamps", () => {
  it("does not invent Finebaum's Pundits publication from the June source date", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "clemson-at-lsu-2026" && row.pundit.id === "finebaum"
    )!;
    expect(take.call.sourceDate).toBe("2026-06-23");
    expect(firstPublishedAt(take.call)).toBeUndefined();
    const json = articleJsonLd(take);
    expect(json).not.toHaveProperty("datePublished");
    expect(json.dateModified).toBe("2026-09-06");
    expect(pickStory(take).paragraphs.join(" ")).toContain("Jun 23, 2026");
    expect(pickStory(take).paragraphs.join(" ")).toContain("as of Sep 3, 2026");
  });

  it("keeps a grade from minting a new publication", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("away-at-home-2026", { sourcedAt: "2026-09-03" });
    const published = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "no",
      sourceDate: "2026-06-23",
      firstPublishedAt: "2026-08-26",
      status: "hit",
      gradedAt: "2026-09-06",
    });
    const json = articleJsonLd({ pundit, event, call: published });
    expect(json.datePublished).toBe("2026-08-26");
    expect(json.dateModified).toBe("2026-09-06");
    expect(materialUpdatedAt(published, event)).toBe("2026-09-06");
    expect(firstPublishedAt(published)).toBe("2026-08-26");
  });

  it("preserves date-only precision instead of inventing noon", () => {
    expect(rssPublicationDate("2026-09-08")).toBe(
      new Date("2026-09-08T00:00:00Z").toUTCString()
    );
    expect(parsePublicationInstant("2026-09-08")?.toISOString()).toBe(
      "2026-09-08T00:00:00.000Z"
    );
  });

  it("labels a refreshed event snapshot as sourcedAt, not speech time", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "49ers-vs-rams-2026" && row.pundit.id === "cowherd"
    );
    const brandt = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (row) => row.event.slug === "49ers-vs-rams-2026" && row.pundit.id === "brandt"
    );
    expect(take).toBeTruthy();
    expect(brandt).toBeTruthy();
    expect(take!.event.sourcedAt).toBe("2026-09-08");
    expect(take!.call.sourceDate < take!.event.sourcedAt!).toBe(true);
    const story = pickStory(take!);
    expect(story.paragraphs.join(" ")).toContain("as of Sep 8, 2026");
    expect(story.paragraphs.join(" ")).toContain("dated event-level Kalshi snapshot");
    expect(story.dek).not.toMatch(/\btook\b/);
  });
});

describe("news eligibility", () => {
  const now = new Date("2026-09-08T18:00:00Z");

  it("excludes unknown and future firstPublishedAt", () => {
    expect(isNewsEligible(undefined, now)).toBe(false);
    expect(isNewsEligible("2026-09-09", now)).toBe(false);
    expect(isNewsEligible("2026-09-08T20:00:00Z", now)).toBe(false);
    expect(isNewsEligible("2026-09-08", now)).toBe(true);
    expect(isNewsEligible("2026-09-07", now)).toBe(true);
    expect(isNewsEligible("2026-09-06", now)).toBe(false);
  });

  it("does not use sourceDate as a news publication fallback", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const older = fixtureGame("older-2026", { awayTeam: "A", homeTeam: "B" });
    const newer = fixtureGame("newer-2026", { awayTeam: "C", homeTeam: "D" });
    const calls = [
      fixturePick({
        eventSlug: older.slug,
        punditId: pundit.id,
        side: "yes",
        sourceDate: "2026-09-08",
      }),
      fixturePick({
        eventSlug: newer.slug,
        punditId: pundit.id,
        side: "no",
        sourceDate: "2026-06-23",
        firstPublishedAt: "2026-09-08",
      }),
    ];
    const takes = mappedTakes(calls, [older, newer], [pundit]);
    const recent = recentNewsTakes(takes, 2, now);
    expect(recent.map((take) => take.event.slug)).toEqual(["newer-2026"]);
    const xml = newsSitemap(calls, [older, newer], [pundit], now);
    expect(xml).toContain("/picks/newer-2026/voice/");
    expect(xml).toContain("<news:publication_date>2026-09-08</news:publication_date>");
    expect(xml).not.toContain("/picks/older-2026/voice/");
  });

  it("emits an empty news sitemap in a quiet period", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("quiet-2026");
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      sourceDate: "2026-09-01",
      firstPublishedAt: "2026-09-01",
    });
    const xml = newsSitemap([call], [event], [pundit], new Date("2026-09-08T12:00:00Z"));
    expect(xml).toContain("xmlns:news=");
    expect(xml).not.toContain("<url>");
    expect(xml).not.toContain("/picks/quiet-2026/");
  });

  it("omits RSS pubDate when firstPublishedAt is unknown", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("rss-2026");
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      sourceDate: "2026-06-23",
    });
    const xml = rssFeed([call], [event], [pundit]);
    expect(xml).toContain("/picks/rss-2026/voice/");
    expect(xml).not.toContain("<pubDate>");
  });

  it("omits RSS pubDate when firstPublishedAt is unparsable", () => {
    expect(rssPublicationDate("not-a-date")).toBeNull();
    expect(rssPublicationDate("2026-13-99")).toBeNull();
    expect(rssPublicationDate("2026-02-30")).toBeNull();
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("bad-pub-2026");
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      sourceDate: "2026-06-23",
      firstPublishedAt: "not-a-date",
    });
    const xml = rssFeed([call], [event], [pundit]);
    expect(xml).toContain("/picks/bad-pub-2026/voice/");
    expect(xml).not.toContain("<pubDate>");
    expect(xml).not.toContain("1970");
  });
});
