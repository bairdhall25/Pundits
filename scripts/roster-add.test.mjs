import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { applyRosterAdd, checkRosterPipeline } from "./roster-add.mjs";

const SCOUT_X = `# X

**Roster (Intake if it is them):**

| id | Name | handle |
|---|---|---|
| cowherd | Colin Cowherd | colincowherd |

If a lookup disagrees, prefer the verified account.
`;

const PICK_SHOWS = `# Pick shows

| Show | Voices (roster id) | Drop | Jump | Notes |
|---|---|---|---|---|
| The Herd / Sharp or Square | \`cowherd\`; guests (Duck, etc.) | weekday | bold predictions | Guest ≠ Cowherd |
| Andy & Ari On3 | \`staples\`, \`wasserman\` | episode | PICKING \`DCFInXgbMtY\` | |
`;

function fixture(photoName = "jmac.jpg") {
  const root = mkdtempSync(path.join(tmpdir(), "roster-add-"));
  mkdirSync(path.join(root, "data"));
  mkdirSync(path.join(root, "docs"));
  mkdirSync(path.join(root, "bots"));
  mkdirSync(path.join(root, "public", "photos"), { recursive: true });
  writeFileSync(path.join(root, "data", "pundits.json"), "[]\n");
  writeFileSync(path.join(root, "data", "calls.json"), "[]\n");
  writeFileSync(path.join(root, "docs", "roster-pipeline.json"), "[]\n");
  writeFileSync(path.join(root, "bots", "scout-x.md"), SCOUT_X);
  writeFileSync(path.join(root, "docs", "pick-shows.md"), PICK_SHOWS);
  writeFileSync(path.join(root, "public", "photos", photoName), "fake-photo");
  return root;
}

function manifest(patch = {}) {
  return {
    id: "jmac",
    name: "Jason McIntyre",
    outlet: "The Herd / FOX Sports",
    sport: "both",
    photo: "/photos/jmac.jpg",
    photoSource: "https://example.com/still",
    xHandle: "jasonrmcintyre",
    factory: "The Herd",
    eligibility: "association",
    calls: [
      {
        eventSlug: "49ers-vs-rams-2026",
        side: "no",
        claim: "So this is a pick. I'm going with the Rams here.",
        source: "The Herd",
        sourceUrl: "https://example.com/herd",
        sourceDate: "2026-09-01",
        subject: "Rams",
        paysOn: "49ers at Rams (Week 1, Melbourne)",
      },
    ],
    ...patch,
  };
}

describe("roster-add helper", () => {
  it("refuses a missing photo file", () => {
    const root = fixture("other.jpg");
    expect(() => applyRosterAdd(manifest(), root)).toThrow(/photo/i);
  });

  it("refuses team-analyst eligibility", () => {
    const root = fixture();
    expect(() =>
      applyRosterAdd(manifest({ eligibility: "team-analyst" }), root)
    ).toThrow(/association/);
  });

  it("writes a complete association add", () => {
    const root = fixture();
    applyRosterAdd(manifest(), root);

    const pundits = JSON.parse(readFileSync(path.join(root, "data", "pundits.json"), "utf8"));
    expect(pundits).toEqual([
      {
        id: "jmac",
        name: "Jason McIntyre",
        outlet: "The Herd / FOX Sports",
        photo: "/photos/jmac.jpg",
        sport: "both",
      },
    ]);

    const calls = JSON.parse(readFileSync(path.join(root, "data", "calls.json"), "utf8"));
    expect(calls).toHaveLength(1);
    expect(calls[0].punditId).toBe("jmac");
    expect(calls[0].eventSlug).toBe("49ers-vs-rams-2026");
    expect(calls[0].side).toBe("no");
    expect(calls[0].kind).toBe("hard");
    expect(calls[0].status).toBe("pending");
    expect(calls[0].id).toMatch(/^jmac-/);

    const scoutX = readFileSync(path.join(root, "bots", "scout-x.md"), "utf8");
    expect(scoutX).toMatch(/\| jmac \| Jason McIntyre \| jasonrmcintyre \|/);

    const pickShows = readFileSync(path.join(root, "docs", "pick-shows.md"), "utf8");
    expect(pickShows).toMatch(/`jmac`/);
    expect(pickShows).toMatch(/The Herd/);

    const ledger = JSON.parse(
      readFileSync(path.join(root, "docs", "roster-pipeline.json"), "utf8")
    );
    expect(ledger.map((row) => row.id)).toEqual(["jmac"]);

    expect(checkRosterPipeline(root)).toEqual({ ok: true, ids: ["jmac"] });
  });

  it("appends a voice without eating a YouTube id in the hunt cell", () => {
    const root = fixture();
    applyRosterAdd(manifest({ factory: "Andy & Ari On3" }), root);
    const pickShows = readFileSync(path.join(root, "docs", "pick-shows.md"), "utf8");
    expect(pickShows).toMatch(/`staples`, `wasserman`, `jmac`/);
    expect(pickShows).toContain("DCFInXgbMtY");
  });

  it("skips a duplicate pundit+event call", () => {
    const root = fixture();
    applyRosterAdd(manifest(), root);
    applyRosterAdd(manifest(), root);
    const calls = JSON.parse(readFileSync(path.join(root, "data", "calls.json"), "utf8"));
    expect(calls).toHaveLength(1);
  });

  it("fails check when a ledger id is missing from the X table", () => {
    const root = fixture();
    applyRosterAdd(manifest(), root);
    writeFileSync(path.join(root, "bots", "scout-x.md"), SCOUT_X);
    expect(() => checkRosterPipeline(root)).toThrow(/scout-x/);
  });

  it("appends a compact one-line pundits.json row without reformatting the file", () => {
    const root = fixture();
    const compact = `[
  { "id": "cowherd", "name": "Colin Cowherd", "outlet": "The Herd", "photo": "/photos/c.jpg", "sport": "nfl" }
]
`;
    writeFileSync(path.join(root, "data", "pundits.json"), compact);
    applyRosterAdd(manifest(), root);
    const raw = readFileSync(path.join(root, "data", "pundits.json"), "utf8");
    expect(raw).toContain('{ "id": "cowherd"');
    expect(raw).toContain('{ "id": "jmac"');
    expect(raw.split("\n").filter((line) => line.includes("{ \"id\":")).length).toBe(2);
  });

  it("does not require historic roster ids on the ledger", () => {
    const root = fixture();
    writeFileSync(
      path.join(root, "data", "pundits.json"),
      JSON.stringify([{ id: "cowherd", name: "Colin", outlet: "Herd", photo: "/photos/x.jpg", sport: "nfl" }])
    );
    expect(checkRosterPipeline(root)).toEqual({ ok: true, ids: [] });
  });
});
