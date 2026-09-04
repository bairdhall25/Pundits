import { describe, expect, it } from "vitest";
import type { Call, Event, Pundit, Team } from "../../lib/types";
import { ogEventPath, ogPunditPath, ogTakePath, ogTeamPath, ogWeekPath } from "../../lib/og";
import { ogPagePath } from "../../lib/social-card";
import {
  buildAssetManifest,
  type FingerprintContext,
} from "./asset-manifest";

function game(overrides: Partial<Event> = {}): Event {
  return {
    slug: "away-at-home-2026",
    title: "Away at Home",
    contractName: "Away at Home winner",
    yesCents: 45,
    noCents: 55,
    sourceUrl: "https://example.com/market",
    sourcedAt: "2026-09-01T12:00:00Z",
    onHome: true,
    sport: "ncaaf",
    homeRank: 1,
    kind: "game",
    awayTeam: "Away",
    homeTeam: "Home",
    awayTeamId: "away",
    homeTeamId: "home",
    season: 2026,
    week: 1,
    ...overrides,
  };
}

function pundit(id: string, name = id): Pundit {
  return {
    id,
    name,
    outlet: "Fixture Network",
    photo: `/photos/${id}.jpg`,
    sport: "ncaaf",
  };
}

function call(
  id: string,
  punditId: string,
  eventSlug: string,
  side: "yes" | "no",
  overrides: Partial<Call> = {}
): Call {
  return {
    id,
    punditId,
    claim: `${punditId} takes ${side}`,
    source: "Fixture Network",
    sourceUrl: "https://example.com/source",
    sourceDate: "2026-09-01",
    kind: "hard",
    subject: "Fixture",
    paysOn: "Fixture result",
    status: "pending",
    eventSlug,
    side,
    ...overrides,
  };
}

const teams: Team[] = [
  {
    id: "away",
    name: "Away",
    abbr: "AWAY",
    primary: "#ff4d4f",
    ink: "#ffffff",
    sport: "ncaaf",
  },
  {
    id: "home",
    name: "Home",
    abbr: "HOME",
    primary: "#39ff14",
    ink: "#0a0a0a",
    sport: "ncaaf",
  },
];

const alice = pundit("alice", "Alice");
const bob = pundit("bob", "Bob");
const cara = pundit("cara", "Cara");
const dens = ["d1", "d2", "d3", "d4", "d5", "d6"].map((id) => pundit(id, id.toUpperCase()));

function world() {
  const events = [
    game(),
    game({
      slug: "empty-at-nowhere-2026",
      title: "Empty at Nowhere",
      awayTeamId: "away",
      homeTeamId: "home",
    }),
    game({
      slug: "dense-at-big-2026",
      title: "Dense at Big",
      awayTeamId: "away",
      homeTeamId: "home",
    }),
  ];
  const pundits = [alice, bob, cara, ...dens];
  const calls: Call[] = [
    call("alice-away", "alice", "away-at-home-2026", "yes"),
    call("bob-home", "bob", "away-at-home-2026", "no"),
    ...dens.map((person, index) =>
      call(`${person.id}-dense`, person.id, "dense-at-big-2026", "yes", {
        sourceDate: `2026-09-0${(index % 9) + 1}`,
      })
    ),
  ];
  return { events, pundits, calls, teams };
}

function context(overrides: Partial<FingerprintContext> = {}): FingerprintContext {
  return {
    rendererVersions: { landscape: "land-v1", story: "story-v1" },
    fontHashes: [{ name: "Oswald", hash: "font-oswald" }],
    portraitHash: (publicPath) => (publicPath ? `hash:${publicPath}` : "missing"),
    encoding: "png",
    ...overrides,
  };
}

function row(
  manifest: ReturnType<typeof buildAssetManifest>,
  publicPath: string
) {
  const found = manifest.find((entry) => entry.publicPath === publicPath);
  expect(found, publicPath).toBeDefined();
  return found!;
}

describe("asset manifest", () => {
  it("resolves the complete expected asset set before rendering", () => {
    const manifest = buildAssetManifest(world(), context());
    const takes = 2 + 6;
    const events = 3;
    const pundits = 3 + 6;
    const teamCount = 2;
    const weeks = 1;
    const pages = 11;
    expect(manifest).toHaveLength(
      (takes + events + pundits) * 2 + teamCount + weeks + pages
    );
    expect(row(manifest, ogTakePath("away-at-home-2026", "alice")).kind).toBe("take");
    expect(row(manifest, ogEventPath("empty-at-nowhere-2026")).kind).toBe("event");
    expect(row(manifest, ogPunditPath("cara")).kind).toBe("pundit");
    expect(row(manifest, ogTeamPath("away")).kind).toBe("team");
    expect(row(manifest, ogWeekPath("ncaaf", 2026, 1)).kind).toBe("week");
    expect(row(manifest, ogPagePath("home")).kind).toBe("page");
  });

  it("fingerprints a mapped take, an empty-side event, and a dense overflow event separately", () => {
    const manifest = buildAssetManifest(world(), context());
    const take = row(manifest, ogTakePath("away-at-home-2026", "alice"));
    const empty = row(manifest, ogEventPath("empty-at-nowhere-2026"));
    const dense = row(manifest, ogEventPath("dense-at-big-2026"));
    expect(take.fingerprint).not.toBe(empty.fingerprint);
    expect(dense.fingerprint).not.toBe(empty.fingerprint);
    expect(empty.dependencies.portraits).toEqual([]);
    expect(dense.dependencies.portraits.length).toBeGreaterThan(0);
    expect(dense.dependencies.portraits.length).toBeLessThan(6);
  });

  it("changes take fingerprints across pending, hit, and miss of the same call", () => {
    const pending = world();
    const hit = world();
    const miss = world();
    hit.calls = hit.calls.map((entry) =>
      entry.id === "alice-away" ? { ...entry, status: "hit" as const } : entry
    );
    miss.calls = miss.calls.map((entry) =>
      entry.id === "alice-away" ? { ...entry, status: "miss" as const } : entry
    );
    const path = ogTakePath("away-at-home-2026", "alice");
    const pendingFp = row(buildAssetManifest(pending, context()), path).fingerprint;
    const hitFp = row(buildAssetManifest(hit, context()), path).fingerprint;
    const missFp = row(buildAssetManifest(miss, context()), path).fingerprint;
    expect(new Set([pendingFp, hitFp, missFp]).size).toBe(3);
  });

  it("distinguishes a pundit with no calls from one with a graded record", () => {
    const graded = world();
    graded.calls = graded.calls.map((entry) =>
      entry.id === "alice-away" ? { ...entry, status: "hit" as const } : entry
    );
    const pendingAlice = row(buildAssetManifest(world(), context()), ogPunditPath("alice")).fingerprint;
    const gradedAlice = row(buildAssetManifest(graded, context()), ogPunditPath("alice")).fingerprint;
    const emptyCara = row(buildAssetManifest(world(), context()), ogPunditPath("cara")).fingerprint;
    expect(gradedAlice).not.toBe(pendingAlice);
    expect(emptyCara).not.toBe(pendingAlice);
  });

  it("does not change an unrelated take when another call changes", () => {
    const baseline = world();
    const mutated = world();
    mutated.calls = [
      ...mutated.calls,
      call("cara-dense", "cara", "dense-at-big-2026", "no", { sourceDate: "2026-09-02" }),
    ];
    const path = ogTakePath("away-at-home-2026", "alice");
    expect(row(buildAssetManifest(baseline, context()), path).fingerprint).toBe(
      row(buildAssetManifest(mutated, context()), path).fingerprint
    );
  });

  it("changes take, event, pundit, team, week, and affected collection fingerprints when a grade lands", () => {
    const pending = world();
    const graded = world();
    graded.calls = graded.calls.map((entry) =>
      entry.id === "alice-away" ? { ...entry, status: "hit" as const } : entry
    );
    graded.events = graded.events.map((event) =>
      event.slug === "away-at-home-2026"
        ? { ...event, awayScore: 31, homeScore: 24, resultUrl: "https://example.com/box" }
        : event
    );
    const pendingManifest = buildAssetManifest(pending, context());
    const gradedManifest = buildAssetManifest(graded, context());
    const paths = [
      ogTakePath("away-at-home-2026", "alice"),
      ogEventPath("away-at-home-2026"),
      ogPunditPath("alice"),
      ogTeamPath("away"),
      ogWeekPath("ncaaf", 2026, 1),
      ogPagePath("leaderboard"),
    ];
    for (const publicPath of paths) {
      expect(row(gradedManifest, publicPath).fingerprint).not.toBe(
        row(pendingManifest, publicPath).fingerprint
      );
    }
    expect(row(gradedManifest, ogTakePath("dense-at-big-2026", "d1")).fingerprint).toBe(
      row(pendingManifest, ogTakePath("dense-at-big-2026", "d1")).fingerprint
    );
  });

  it("invalidates every landscape asset when the landscape renderer version changes", () => {
    const baseline = buildAssetManifest(world(), context());
    const bumped = buildAssetManifest(
      world(),
      context({ rendererVersions: { landscape: "land-v2", story: "story-v1" } })
    );
    const landscape = baseline.filter((entry) => entry.format === "landscape");
    expect(landscape.length).toBeGreaterThan(0);
    for (const entry of landscape) {
      expect(row(bumped, entry.publicPath).fingerprint).not.toBe(entry.fingerprint);
    }
    const story = baseline.filter((entry) => entry.format === "story");
    for (const entry of story) {
      expect(row(bumped, entry.publicPath).fingerprint).toBe(entry.fingerprint);
    }
  });

  it("changes only cards that consume a portrait when that portrait hash changes", () => {
    const baseline = buildAssetManifest(world(), context());
    const bumped = buildAssetManifest(
      world(),
      context({
        portraitHash: (publicPath) =>
          publicPath === "/photos/alice.jpg" ? "hash:/photos/alice.jpg#v2" : `hash:${publicPath}`,
      })
    );
    const aliceTake = ogTakePath("away-at-home-2026", "alice");
    const alicePundit = ogPunditPath("alice");
    const event = ogEventPath("away-at-home-2026");
    expect(row(bumped, aliceTake).fingerprint).not.toBe(row(baseline, aliceTake).fingerprint);
    expect(row(bumped, alicePundit).fingerprint).not.toBe(row(baseline, alicePundit).fingerprint);
    expect(row(bumped, event).fingerprint).not.toBe(row(baseline, event).fingerprint);
    expect(row(bumped, ogPunditPath("bob")).fingerprint).toBe(
      row(baseline, ogPunditPath("bob")).fingerprint
    );
    expect(row(bumped, ogEventPath("empty-at-nowhere-2026")).fingerprint).toBe(
      row(baseline, ogEventPath("empty-at-nowhere-2026")).fingerprint
    );
  });
});
