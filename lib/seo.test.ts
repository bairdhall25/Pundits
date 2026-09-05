import { describe, expect, it } from "vitest";
import { getActivityBoard, loadCalls, loadEvents, loadPundits, loadTeams } from "./data";
import type { Call, Event } from "./types";
import { fixtureGame, fixturePick, fixturePundit } from "./test-fixtures";
import {
  gradeSheet,
  mappedTakes,
  pickLede,
  pickStory,
  sideChip,
  takeHeadline,
  takePath,
  toStoryCard,
  organizationGraph,
  articleJsonLd,
  eventJsonLd,
  eventLastModified,
  faqJsonLd,
  takeLastModified,
  callsLastModified,
  teamLastModified,
  teamJsonLd,
  collectionPageJsonLd,
} from "./seo";
import {
  SITE_DESCRIPTION,
  SITE_ENTITY_NAME,
  SITE_NAME,
  canonicalUrl,
} from "./site";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("canonical URLs", () => {
  it("always points at pundits.pro", () => {
    expect(canonicalUrl("/")).toBe("https://pundits.pro/");
    expect(canonicalUrl("/picks/unc-vs-tcu-2026")).toBe(
      "https://pundits.pro/picks/unc-vs-tcu-2026/"
    );
    expect(canonicalUrl("/og.png")).toBe("https://pundits.pro/og.png");
  });

  it("301s pre-season pick URLs onto the 2026 slug", () => {
    const redirects = readFileSync(
      path.join(process.cwd(), "public", "_redirects"),
      "utf8"
    );
    expect(redirects).toContain(
      "/picks/clemson-at-lsu /picks/clemson-at-lsu-2026/ 301"
    );
    expect(redirects).toContain(
      "/picks/clemson-at-lsu/* /picks/clemson-at-lsu-2026/:splat 301"
    );
    expect(redirects).toContain(
      "/picks/texas-cfp /picks/texas-cfp-2026/ 301"
    );
    for (const e of loadEvents()) {
      expect(e.slug.endsWith(`-${e.season}`), e.slug).toBe(true);
    }
  });
});

describe("mapped takes", () => {
  it("includes Finebaum on Dublin as a unique take", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const dublin = takes.find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(dublin).toBeTruthy();
    expect(takeHeadline(dublin!.pundit, dublin!.event, dublin!.call)).toBe(
      "Paul Finebaum picked TCU over North Carolina — and missed (North Carolina won)"
    );
    expect(takePath("unc-vs-tcu-2026", "finebaum")).toBe(
      "/picks/unc-vs-tcu-2026/finebaum"
    );
  });

  it("includes Kanell on NC State at Virginia", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const ncsu = takes.find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(ncsu).toBeTruthy();
    expect(takeHeadline(ncsu!.pundit, ncsu!.event, ncsu!.call)).toBe(
      "Danny Kanell picked NC State over Virginia — and missed (Virginia won)"
    );
    expect(takePath("ncsu-at-uva-2026", "kanell")).toBe(
      "/picks/ncsu-at-uva-2026/kanell"
    );
  });

  it("is unique per event and pundit", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const keys = takes.map((t) => `${t.event.slug}/${t.pundit.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("mints an over/under headline for every mapped game take", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const games = takes.filter((t) => t.event.awayTeam && t.event.homeTeam);
    expect(games.length).toBeGreaterThan(0);
    for (const take of games) {
      const h = takeHeadline(take.pundit, take.event, take.call);
      expect(h, take.call.id).toMatch(/ pick(?:s|ed) .+ over /);
      const story = pickStory(take);
      expect(story.paragraphs.join(" "), take.call.id).toContain(take.call.claim);
    }
  });
});

describe("grade sheet", () => {
  it("lays out the graded take as labeled rows", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "patterson"
    )!;
    const rows = gradeSheet(take, loadCalls(), loadPundits());
    expect(rows.map((r) => r.label)).toEqual(["Result", "The call", "The price", "Record"]);
    expect(rows[0].value).toBe("Virginia won 34–8.");
    expect(rows[1].value).toBe("NC State over Virginia — called the upset.");
    expect(rows[2].value).toBe("34¢ at the freeze (≈ +194), as of Aug 28, 2026.");
    expect(rows[3].value).toContain("1–2");
    expect(rows[3]).toMatchObject({ href: "/pundits/patterson", hrefLabel: "Full record →" });
  });

  it("keeps open picks and futures on the sheet without a result row", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const event = fixtureGame("open-game-2026", {
      awayTeam: "Away",
      homeTeam: "Home",
      yesCents: 24,
      noCents: 76,
    });
    const call = fixturePick({
      eventSlug: event.slug,
      punditId: pundit.id,
      side: "yes",
      claim: "Away wins the night.",
    });
    const take = mappedTakes([call], [event], [pundit])[0];
    const rows = gradeSheet(take, [call], [pundit]);
    expect(rows[0].label).not.toBe("Result");
    expect(rows.map((r) => r.label)).toContain("The price");
    expect(rows.map((r) => r.label)).toContain("Record");
  });

  it("reports the same open count as the pundit profile", () => {
    const pundit = fixturePundit("voice", { name: "Voice" });
    const hitEvent = fixtureGame("hit-game-2026", { awayTeam: "Away", homeTeam: "Home" });
    const openA = fixtureGame("open-a-2026", { awayTeam: "A", homeTeam: "B" });
    const openB = fixtureGame("open-b-2026", { awayTeam: "C", homeTeam: "D" });
    const fixtureCalls = [
      fixturePick({ eventSlug: hitEvent.slug, punditId: pundit.id, side: "yes", status: "hit" }),
      fixturePick({ eventSlug: openA.slug, punditId: pundit.id, side: "no" }),
      fixturePick({ eventSlug: openB.slug, punditId: pundit.id, side: "yes" }),
    ];
    const take = mappedTakes(fixtureCalls, [hitEvent, openA, openB], [pundit]).find(
      (row) => row.event.slug === hitEvent.slug
    )!;
    const rows = gradeSheet(take, fixtureCalls, [pundit]);
    const record = rows.find((r) => r.label === "Record")!;
    const board = getActivityBoard([pundit], fixtureCalls);
    expect(board[0].mappedPending).toBe(2);
    expect(record.value).toContain("1–0");
    expect(record.value).toMatch(/with 2 open/);
  });
});

describe("pick stories", () => {
  it("adds a concise source-grounded reasoning capsule when present", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(take).toBeTruthy();
    const reasoning =
      "He treated NC State as a live road underdog and made the moneyline, rather than the spread, the clearest expression of his position on the matchup.";
    const enriched = { ...take!, call: { ...take!.call, reasoning } };
    const story = pickStory(enriched);
    expect(story.paragraphs).toContain(
      `The reasoning Danny Kanell gave: ${reasoning}`
    );
    expect(articleJsonLd(enriched).articleBody).toContain(reasoning);
  });

  it("does not pad stories when the source contains no reasoning", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "patterson"
    );
    expect(take).toBeTruthy();
    expect(pickStory(take!).paragraphs.join(" ")).not.toContain("The reasoning");
  });

  it("announces Finebaum on Dublin from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe(
      "Paul Finebaum picked TCU over North Carolina — and missed (North Carolina won)"
    );
    expect(story.dek).toContain("North Carolina as the underdog at 26¢");
    expect(story.paragraphs.join(" ")).toContain("mass chaos in Chapel Hill");
    expect(story.paragraphs.join(" ")).not.toMatch(/McAfee|SMU/i);
  });

  it("announces Kanell on NC State from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "ncsu-at-uva-2026" && t.pundit.id === "kanell"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe(
      "Danny Kanell picked NC State over Virginia — and missed (Virginia won)"
    );
    expect(story.dek).toContain("Result: Virginia won — this pick missed");
    expect(story.dek).toContain("NC State as the underdog at 34¢");
    expect(story.paragraphs.join(" ")).toContain("give me the Wolfpack");
    expect(story.paragraphs.join(" ")).toContain(
      "Chip Patterson has also weighed in on this game"
    );
    expect(story.paragraphs.join(" ")).not.toMatch(/Tarheels/i);
  });

  it("announces Patterson on UNC from the ledger only", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "patterson"
    );
    expect(take).toBeTruthy();
    const story = pickStory(take!, loadCalls(), loadPundits());
    expect(story.headline).toBe(
      "Chip Patterson picked North Carolina over TCU — and hit"
    );
    expect(story.dek).toContain("North Carolina as the underdog at 26¢");
    expect(story.paragraphs.join(" ")).toContain("Tarheels to come back with the win");
    expect(story.paragraphs.join(" ")).not.toMatch(/Wolfpack|Kanell/i);
  });

  it("does not print YES · YES on futures chips", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "texas-cfp-2026" && t.pundit.id === "fallica"
    );
    expect(take).toBeTruthy();
    expect(sideChip(take!.event, "no")).toBe("Against");
    expect(toStoryCard(take!).sideChip).toBe("Against");
    const dublinNo = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    )!;
    expect(toStoryCard(dublinNo).sideChip).toBe("TCU");
    const dublinYes = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "patterson"
    )!;
    expect(toStoryCard(dublinYes).sideChip).toBe("North Carolina");
  });
});

describe("pick copy", () => {
  it("says so when a market has no mapped face", () => {
    const event: Event = {
      slug: "faceless-game-2026",
      kind: "game",
      title: "A vs B",
      contractName: "A vs B — moneyline",
      awayTeam: "A",
      homeTeam: "B",
      yesCents: 40,
      noCents: 60,
      sourceUrl: "https://example.com",
      sourcedAt: "2026-08-28",
      onHome: true,
      sport: "ncaaf",
      homeRank: 9,
    };
    expect(pickLede(event, [], [])).toMatch(/no verified expert pick/i);
  });
});

describe("json-ld", () => {
  it("publishes Organization and WebSite", () => {
    const graph = organizationGraph();
    const types = graph["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    const org = graph["@graph"].find((n: { "@type": string }) => n["@type"] === "Organization") as {
      name: string;
      alternateName: string;
      description: string;
      legalName: string;
      sameAs: string[];
    };
    const website = graph["@graph"].find(
      (n: { "@type": string }) => n["@type"] === "WebSite"
    ) as {
      name: string;
      alternateName: string;
      description: string;
      about: { name: string };
    };
    expect(org.name).toBe(SITE_ENTITY_NAME);
    expect(org.alternateName).toBe(SITE_NAME);
    expect(org.description).toBe(SITE_DESCRIPTION);
    expect(org.legalName).toBe("Indie Labs LLC");
    expect(org.sameAs).toContain("https://x.com/Pundits_");
    expect(website).toMatchObject({
      name: SITE_ENTITY_NAME,
      alternateName: SITE_NAME,
      description: SITE_DESCRIPTION,
      about: { name: "Named college football and NFL pundit picks" },
    });
    expect(SITE_DESCRIPTION).toMatch(/^Pundits\.Pro tracks named pundits/i);
    expect(SITE_DESCRIPTION).toMatch(/frozen.not live.Kalshi snapshots/i);
    expect(SITE_DESCRIPTION).toMatch(/graded results/i);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("marks a take as a staff-written NewsArticle about the pundit", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    );
    expect(take).toBeTruthy();
    const json = articleJsonLd(take!);
    expect(json["@type"]).toBe("NewsArticle");
    expect(json.headline).toBe(
      "Paul Finebaum picked TCU over North Carolina — and missed (North Carolina won)"
    );
    expect(json.author).toMatchObject({ name: "PUNDITS Staff" });
    expect(json.mentions).toMatchObject({ name: "Paul Finebaum" });
    expect(json.about).toMatchObject({
      "@type": "Thing",
      name: "North Carolina vs TCU",
    });
    expect(json.image).toContain(
      "https://pundits.pro/og/takes/unc-vs-tcu-2026--finebaum.png"
    );
  });

  it("moves article and sitemap freshness forward when a pick is graded", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits()).find(
      (t) => t.event.slug === "unc-vs-tcu-2026" && t.pundit.id === "finebaum"
    )!;
    const gradedAt = "2026-09-03";
    const graded = { ...take, call: { ...take.call, status: "hit", gradedAt } } as typeof take;

    expect(articleJsonLd(graded).datePublished).toBe(take.call.sourceDate);
    expect(articleJsonLd(graded).dateModified).toBe(gradedAt);
    expect(takeLastModified(graded.call)).toBe(gradedAt);
    expect(eventLastModified(graded.event, [graded.call])).toBe(gradedAt);
  });

  it("keeps ungraded freshness tied to the existing source dates", () => {
    const take = mappedTakes(loadCalls(), loadEvents(), loadPundits())[0];
    expect(takeLastModified(take.call)).toBe(take.call.sourceDate);
    expect(eventLastModified(take.event, [take.call])).toBe(
      [take.event.sourcedAt, take.call.sourceDate].filter(Boolean).sort().at(-1)
    );
  });

  it("moves team and hub freshness with the latest grade", () => {
    const events = loadEvents();
    const calls = loadCalls();
    expect(teamLastModified("tcu", events, calls)).toBe("2026-08-29");
    expect(teamLastModified("north-carolina", events, calls)).toBe("2026-08-29");
    expect(callsLastModified(calls, "2026-08-26")).toBe("2026-09-05");
  });

  it("publishes methodology questions as FAQPage schema", () => {
    const json = faqJsonLd([
      { question: "What is a verified pick?", answer: "A named, sourced public lean." },
      { question: "Is the price live?", answer: "No. It is a frozen snapshot." },
    ]);
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity).toEqual([
      expect.objectContaining({ "@type": "Question", name: "What is a verified pick?" }),
      expect.objectContaining({ "@type": "Question", name: "Is the price live?" }),
    ]);
  });

  it("describes a team page as a SportsTeam with its pick archive URL", () => {
    const team = loadTeams().find((candidate) => candidate.id === "tcu")!;
    const json = teamJsonLd(team);
    expect(json["@type"]).toBe("SportsTeam");
    expect(json.name).toBe("TCU");
    expect(json.url).toBe("https://pundits.pro/teams/tcu/");
    expect(json.sport).toBe("American Football");
  });

  it("describes hub and week archives as collection pages, not news articles", () => {
    const week = collectionPageJsonLd(
      "College football Week 0 expert picks (2026)",
      "/ncaaf/2026/week-0/",
      "Experts went 2–4 on verified Week 0 picks."
    );
    expect(week["@type"]).toBe("CollectionPage");
    expect(week.url).toBe("https://pundits.pro/ncaaf/2026/week-0/");
    expect(week.name).toBe("College football Week 0 expert picks (2026)");
    const stories = collectionPageJsonLd(
      "Expert picks",
      "/stories/",
      "Verified expert CFB and NFL picks."
    );
    expect(stories.url).toBe("https://pundits.pro/stories/");
    expect(JSON.stringify(week)).not.toMatch(/NewsArticle/);
  });

  it("describes pick pages without claiming Google Event rich-result eligibility", () => {
    const event = loadEvents().find((candidate) => candidate.slug === "unc-vs-tcu-2026")!;
    const call = loadCalls().find((candidate) => candidate.eventSlug === event.slug)!;
    const pending = eventJsonLd(event, [call], loadPundits());
    const graded = eventJsonLd(
      event,
      [{ ...call, status: "hit" } as Call],
      loadPundits()
    );
    expect(pending["@type"]).toBe("WebPage");
    expect(pending).not.toHaveProperty("startDate");
    expect(pending).not.toHaveProperty("eventStatus");
    expect(JSON.stringify(pending)).not.toMatch(/SportsEvent|\"@type\":\"Event\"/);
    expect(graded["@type"]).toBe("WebPage");
    expect(graded).not.toHaveProperty("eventStatus");
    expect(JSON.stringify(graded)).not.toMatch(/SportsEvent|\"@type\":\"Event\"/);
  });

  it("writes grammatical futures headlines", () => {
    const takes = mappedTakes(loadCalls(), loadEvents(), loadPundits());
    const yes = takes.find(
      (t) => t.event.slug === "nd-title-2026" && t.pundit.id === "herbstreit"
    )!;
    const no = takes.find(
      (t) => t.event.slug === "indiana-title-2026" && t.pundit.id === "finebaum"
    )!;
    expect(takeHeadline(yes.pundit, yes.event, yes.call)).toBe(
      "Kirk Herbstreit picks Notre Dame to win the national title"
    );
    expect(takeHeadline(no.pundit, no.event, no.call)).toBe(
      "Paul Finebaum does not see Indiana winning the national title"
    );
  });
});

describe("graded take headlines", () => {
  const pundit = {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "ESPN",
    photo: "/photos/finebaum.jpg",
    sport: "ncaaf",
  } as never;
  const game = {
    slug: "unc-vs-tcu-2026",
    title: "North Carolina vs TCU",
    awayTeam: "North Carolina",
    homeTeam: "TCU",
    yesCents: 26,
    noCents: 75,
    sport: "ncaaf",
    kind: "game",
  } as Event;
  const future = {
    slug: "indiana-title-2026",
    title: "Indiana wins the national title",
    yesCents: 9,
    noCents: 91,
    sport: "ncaaf",
    kind: "future",
  } as Event;
  const call = (over: object) =>
    ({
      id: "c",
      punditId: "finebaum",
      claim: "quote",
      source: "First Take",
      sourceDate: "2026-08-25",
      kind: "hard",
      status: "pending",
      ...over,
    }) as never;

  it("keeps present tense while the pick is live", () => {
    expect(takeHeadline(pundit, game, call({ side: "no", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picks TCU over North Carolina"
    );
  });

  it("marks a graded game pick with the verdict", () => {
    expect(takeHeadline(pundit, game, call({ side: "no", status: "hit", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picked TCU over North Carolina — and hit"
    );
    expect(takeHeadline(pundit, game, call({ side: "yes", status: "miss", eventSlug: game.slug }))).toBe(
      "Paul Finebaum picked North Carolina over TCU — and missed (TCU won)"
    );
  });

  it("marks graded future takes with the verdict", () => {
    expect(takeHeadline(pundit, future, call({ side: "yes", status: "hit", eventSlug: future.slug }))).toBe(
      "Paul Finebaum picked Indiana to win the national title — and hit"
    );
    expect(takeHeadline(pundit, future, call({ side: "no", status: "miss", eventSlug: future.slug }))).toBe(
      "Paul Finebaum did not see Indiana winning the national title — and missed"
    );
  });

  it("leads the graded story with the result", () => {
    const story = pickStory({
      pundit,
      event: game,
      call: call({ side: "no", status: "hit", eventSlug: game.slug }),
    });
    expect(story.paragraphs[0]).toContain("TCU won");
    expect(story.paragraphs[0]).toContain("hit");
  });
});
