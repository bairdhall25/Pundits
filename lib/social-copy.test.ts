import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCalls, loadEvents, loadPundits } from "./data";
import { draftStory, reviewCopy, classifyTimelineItem, metricCell, parseApprovedHandleRegistry, APPROVED_PUNDIT_HANDLES } from "./social-copy";
import { rankStories } from "./social-select";
import { socialIndex } from "./social";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";

const brandt = fixturePundit("brandt", { name: "Kyle Brandt" });
const cowherd = fixturePundit("cowherd", { name: "Colin Cowherd" });
const eisen = fixturePundit("eisen", { name: "Rich Eisen" });
const patterson = fixturePundit("patterson", { name: "Chip Patterson" });
const finebaum = fixturePundit("finebaum", { name: "Paul Finebaum" });
const saban = fixturePundit("saban", { name: "Nick Saban" });
const kanell = fixturePundit("kanell", { name: "Danny Kanell" });

const rams = fixtureGame("49ers-vs-rams-2026", {
  title: "49ers vs Rams",
  awayTeam: "49ers",
  homeTeam: "Rams",
  kickoffDate: "2026-09-10",
  kickoff: "2026-09-10T20:15:00-04:00",
  yesCents: 36,
  noCents: 65,
  sourcedAt: "2026-09-08",
});

const unc = fixtureGame("unc-vs-tcu-2026", {
  title: "North Carolina vs TCU",
  awayTeam: "North Carolina",
  homeTeam: "TCU",
  kickoffDate: "2026-08-29",
  yesCents: 26,
  noCents: 75,
  sourcedAt: "2026-08-28",
  awayScore: 15,
  homeScore: 10,
});

const lsu = fixtureGame("clemson-at-lsu-2026", {
  title: "Clemson at LSU",
  awayTeam: "Clemson",
  homeTeam: "LSU",
  kickoffDate: "2026-09-05",
  yesCents: 23,
  noCents: 78,
  sourcedAt: "2026-09-03",
  awayScore: 10,
  homeScore: 51,
});

describe("draft copy", () => {
  it("leads with people and teams, dates the snapshot, and keeps the existing event card", () => {
    const index = socialIndex(
      [
        fixturePick({
          eventSlug: rams.slug,
          punditId: "brandt",
          side: "yes",
          claim: "The niners will beat the Rams in the opener.",
        }),
        fixturePick({
          eventSlug: rams.slug,
          punditId: "cowherd",
          side: "no",
          claim: "Lean Los Angeles.",
        }),
        fixturePick({
          eventSlug: rams.slug,
          punditId: "eisen",
          side: "no",
          claim: "Rams.",
        }),
      ],
      [rams],
      [brandt, cowherd, eisen]
    );
    const story = rankStories(index, new Date("2026-09-09T12:00:00-04:00"))[0];
    const draft = draftStory(index, story);
    expect(draft.cardUrl).toBe(index.events[0].ogCard);
    expect(draft.body).toContain("Kyle Brandt picks");
    expect(draft.body).toContain("49ers");
    expect(draft.body).toContain("Rams");
    expect(draft.body).toMatch(/Kalshi snapshot:.*as of Sep 8, 2026/);
    expect(draft.body).not.toMatch(/took .+ at/i);
    expect(draft.selfReply).toBe(index.events[0].pageUrl);
    expect(
      reviewCopy(draft.body, {
        bothSides: true,
        usesPrice: draft.usesPrice,
        snapshotAt: draft.snapshotAt,
        gradingScope: "straight-up-winner",
      }).ok
    ).toBe(true);
  });

  it("writes a result version without cover language and without quoting a reported selection", () => {
    const index = socialIndex(
      [
        fixturePick({
          eventSlug: lsu.slug,
          punditId: "saban",
          side: "no",
          status: "hit",
          claim: "LSU over Clemson",
          evidenceKind: "reported-selection",
          sourceUrl: "https://gamedaycole.com/example",
        }),
        fixturePick({
          eventSlug: lsu.slug,
          punditId: "kanell",
          side: "yes",
          status: "miss",
          claim: "Clemson in a low-scoring game.",
        }),
      ],
      [lsu],
      [saban, kanell]
    );
    const story = rankStories(index, new Date("2026-09-06T12:00:00-04:00"))[0];
    const draft = draftStory(index, story);
    expect(draft.body).toContain("LSU 51, Clemson 10");
    expect(draft.body).toMatch(/straight-up winner/i);
    expect(draft.body).not.toMatch(/\bcover crushed\b/i);
    expect(draft.cardUrl).toBe(index.events[0].ogCard);
    expect(
      reviewCopy(draft.body, {
        bothSides: true,
        gradingScope: "straight-up-winner",
        evidenceKind: "reported-selection",
      }).ok
    ).toBe(true);
  });

  it("does not wrap a reported-selection notable call in quotation marks", () => {
    const oneSided = fixtureGame("miami-at-stanford-2026", {
      awayTeam: "Miami",
      homeTeam: "Stanford",
      kickoffDate: "2026-09-04",
      yesCents: 24,
      noCents: 76,
      sourcedAt: "2026-09-03",
      awayScore: 45,
      homeScore: 6,
    });
    const index = socialIndex(
      [
        fixturePick({
          eventSlug: oneSided.slug,
          punditId: "saban",
          side: "yes",
          status: "hit",
          claim: "Miami over Stanford",
          evidenceKind: "reported-selection",
        }),
      ],
      [oneSided],
      [saban]
    );
    const story = rankStories(index, new Date("2026-09-05T12:00:00-04:00")).find(
      (row) => row.archetype === "notable-call" && !row.skipReason
    );
    expect(story).toBeTruthy();
    const draft = draftStory(index, story!);
    expect(draft.body).toContain("Reported selection: Miami over Stanford");
    expect(draft.body).not.toMatch(/[“”"]Miami over Stanford/);
    expect(draft.evidenceKind).toBe("reported-selection");
  });
});

describe("copy review gates", () => {
  it("fails contradictory empty-side language on a two-sided board", () => {
    const review = reviewCopy("Kanell and Wrighster back Clemson. Empty side.", {
      bothSides: true,
    });
    expect(review.ok).toBe(false);
    expect(review.failures).toContain("empty-side-contradiction");
  });

  it("fails unsupported cover claims on winner-only grades", () => {
    const review = reviewCopy("Fornelli hit. Cover crushed.", {
      gradingScope: "straight-up-winner",
    });
    expect(review.ok).toBe(false);
    expect(review.failures).toContain("unsupported-cover");
  });

  it("fails false quotation and missing snapshot time", () => {
    expect(
      reviewCopy('Nick Saban said: "LSU over Clemson."', {
        evidenceKind: "reported-selection",
      }).failures
    ).toContain("false-quotation");
    expect(
      reviewCopy("Brandt picked the 49ers at 36¢.", {
        usesPrice: true,
        snapshotAt: null,
      }).failures
    ).toContain("missing-price-time");
    expect(
      reviewCopy("Finebaum took LSU at 78¢.", {
        gradingScope: "straight-up-winner",
      }).failures
    ).toContain("took-at-price");
  });

  it("accepts only handles with approved provenance", () => {
    const markdown = readFileSync(path.join(process.cwd(), "docs/social/tagging.md"), "utf8");
    const registry = parseApprovedHandleRegistry(markdown);
    expect(registry.pundits.map((row) => row.handle)).toEqual(
      expect.arrayContaining(Object.values(APPROVED_PUNDIT_HANDLES))
    );
    const approved = new Set(registry.pundits.map((row) => row.handle));
    expect(
      reviewCopy("Give @Chip_Patterson the flowers.", {
        tags: ["@Chip_Patterson"],
        approvedHandles: approved,
      }).ok
    ).toBe(true);
    expect(
      reviewCopy("Ask @randomfan what they think.", {
        tags: ["@randomfan"],
        approvedHandles: approved,
      }).failures
    ).toContain("unapproved-tag");
  });
});

describe("reviewer classification", () => {
  it("separates originals, outside-thread replies, self-link replies, paid reach, and unavailable metrics", () => {
    const original = classifyTimelineItem({
      id: "1",
      text: "Brandt picks the 49ers.",
      createdAt: "2026-09-09T12:00:00Z",
      isPaid: false,
      metrics: { views: 32, likes: 0 },
    });
    expect(original.kind).toBe("original");
    expect(original.reach).toBe("organic");
    expect(metricCell(original.publicMetrics.views)).toBe(32);
    expect(metricCell(original.privateMetrics.urlClicks)).toBe("n/a");

    const selfLink = classifyTimelineItem({
      id: "2",
      text: "full ledger → https://pundits.pro/picks/49ers-vs-rams-2026/",
      createdAt: "2026-09-09T12:00:10Z",
      inReplyToId: "1",
      inReplyToAuthorIsUs: true,
      containsOwnPermalink: true,
      isPaid: false,
    });
    expect(selfLink.kind).toBe("self-link-reply");

    const outside = classifyTimelineItem({
      id: "3",
      text: "For the record: Brandt is on the 49ers.",
      createdAt: "2026-09-09T13:00:00Z",
      inReplyToId: "99",
      inReplyToAuthorIsUs: false,
      isPaid: false,
    });
    expect(outside.kind).toBe("outside-thread-reply");

    const paid = classifyTimelineItem({
      id: "4",
      text: "Ledger move.",
      createdAt: "2026-09-01T00:00:00Z",
      isPaid: true,
      metrics: { views: 6911 },
    });
    expect(paid.reach).toBe("paid");

    const unknown = classifyTimelineItem({
      id: "5",
      text: "Receipt.",
      createdAt: "2026-09-09T15:00:00Z",
      isPaid: null,
    });
    expect(unknown.reach).toBe("unavailable");
    expect(metricCell(unknown.privateMetrics.profileClicks)).toBe("n/a");
  });
});

describe("live evidence-backed matchup drafts", () => {
  const index = socialIndex(
    loadCalls(),
    loadEvents(),
    loadPundits(),
    "2026-09-08T16:00:00.000Z"
  );

  function draftFor(slug: string, now: string) {
    const story = rankStories(index, new Date(now)).find((row) => row.eventSlug === slug);
    expect(story, slug).toBeTruthy();
    const event = index.events.find((row) => row.slug === slug)!;
    const draft = draftStory(index, story!);
    const review = reviewCopy(draft.body, {
      bothSides: event.bothSides,
      usesPrice: draft.usesPrice,
      snapshotAt: draft.snapshotAt,
      gradingScope: event.gradingScope,
      evidenceKind: draft.evidenceKind,
    });
    expect(review, draft.body).toEqual({ ok: true, failures: [] });
    return { story: story!, draft, event };
  }

  it("drafts 49ers-Rams pregame disagreement on the existing event card", () => {
    const { story, draft, event } = draftFor(
      "49ers-vs-rams-2026",
      "2026-09-09T12:00:00-04:00"
    );
    expect(story.priority).toBe("pregame-disagreement");
    expect(draft.cardUrl).toBe(event.ogCard);
    expect(draft.body).toContain("Kyle Brandt");
    expect(draft.body).toContain("49ers");
    expect(draft.body).toContain("Rams");
    expect(draft.body).toMatch(/Kalshi snapshot:.*as of Sep 8, 2026/);
    expect(draft.body).not.toMatch(/[“”]/);
  });

  it("drafts Clemson-LSU, UNC-TCU, and SMU-FSU result versions without cover or empty-side language", () => {
    const lsu = draftFor("clemson-at-lsu-2026", "2026-09-06T12:00:00-04:00");
    expect(lsu.story.priority).toBe("postgame-resolution");
    expect(lsu.draft.cardUrl).toBe(lsu.event.ogCard);
    expect(lsu.draft.body).toContain("LSU 51, Clemson 10");
    expect(lsu.draft.body).toMatch(/straight-up winner/i);
    expect(lsu.draft.body).not.toMatch(/\bempty side\b/i);
    expect(lsu.draft.body).not.toMatch(/\bcover crushed\b/i);

    const smu = draftFor("smu-at-fsu-2026", "2026-09-08T12:00:00-04:00");
    expect(smu.story.priority).toBe("postgame-resolution");
    expect(smu.draft.cardUrl).toBe(smu.event.ogCard);
    expect(smu.draft.body).toContain("SMU 27, Florida State 24");

    const uncEvent = index.events.find((row) => row.slug === "unc-vs-tcu-2026")!;
    const uncDraft = draftStory(index, {
      priority: "postgame-resolution",
      rank: 2,
      archetype: "resolution",
      eventSlug: uncEvent.slug,
      pageUrl: uncEvent.pageUrl,
      cardUrl: uncEvent.ogCard,
      state: "result",
      reason: "historical sample",
    });
    expect(uncDraft.cardUrl).toBe(uncEvent.ogCard);
    expect(uncDraft.body).toContain("North Carolina 15, TCU 10");
    expect(uncDraft.body).toContain("Chip Patterson");
    expect(uncDraft.body).toContain("Paul Finebaum");
  });

  it("can reconstruct a pregame disagreement draft for a now-settled matchup without changing the card URL", () => {
    for (const slug of ["clemson-at-lsu-2026", "unc-vs-tcu-2026", "smu-at-fsu-2026"]) {
      const event = index.events.find((row) => row.slug === slug)!;
      const draft = draftStory(index, {
        priority: "pregame-disagreement",
        rank: 1,
        archetype: "disagreement",
        eventSlug: slug,
        pageUrl: event.pageUrl,
        cardUrl: event.ogCard,
        state: "pregame",
        reason: "historical reconstruction for review",
      });
      expect(draft.cardUrl).toBe(event.ogCard);
      expect(draft.body).not.toMatch(/\bempty side\b/i);
      expect(draft.body).not.toMatch(/took .+ at/i);
      expect(
        reviewCopy(draft.body, {
          bothSides: true,
          usesPrice: draft.usesPrice,
          snapshotAt: draft.snapshotAt,
          gradingScope: event.gradingScope,
        }).ok
      ).toBe(true);
    }
  });
});

describe("before/after samples keep the same card", () => {
  it("does not change image URLs when copy changes", () => {
    const index = socialIndex(
      [
        fixturePick({
          eventSlug: unc.slug,
          punditId: "patterson",
          side: "yes",
          status: "hit",
          claim: "I'll go Tarheels to come back with the win.",
        }),
        fixturePick({
          eventSlug: unc.slug,
          punditId: "finebaum",
          side: "no",
          status: "miss",
          claim: "I don't believe they'll win this game in Ireland.",
        }),
      ],
      [unc],
      [patterson, finebaum]
    );
    const before = "Finebaum took TCU at 75¢. Cover crushed.";
    const story = rankStories(index, new Date("2026-08-30T12:00:00-04:00"))[0];
    const after = draftStory(index, story);
    expect(after.cardUrl).toBe("https://pundits.pro/og/events/unc-vs-tcu-2026.png");
    expect(reviewCopy(before, { gradingScope: "straight-up-winner", bothSides: true }).ok).toBe(
      false
    );
    expect(
      reviewCopy(after.body, {
        bothSides: true,
        gradingScope: "straight-up-winner",
        usesPrice: after.usesPrice,
        snapshotAt: after.snapshotAt,
      }).ok
    ).toBe(true);
  });
});
