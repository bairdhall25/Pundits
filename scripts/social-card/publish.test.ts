import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { ManifestRow } from "./asset-manifest";
import { publishSocialCards, assertSafePublicPath } from "./publish";

async function tempRoot() {
  return mkdtemp(path.join(os.tmpdir(), "pundits-og-publish-"));
}

function row(overrides: Partial<ManifestRow> = {}): ManifestRow {
  return {
    publicPath: "/og/takes/away--alice.png",
    width: 1200,
    height: 630,
    kind: "take",
    format: "landscape",
    objectId: "away--alice",
    model: { headline: "Away" },
    fingerprint: "aa".repeat(32),
    dependencies: { portraits: [], renderer: "land-v1", fonts: ["Oswald"] },
    ...overrides,
  };
}

function png(label: string) {
  return Buffer.from(`png:${label}`);
}

describe("assertSafePublicPath", () => {
  it("rejects an output path outside the generated directory", () => {
    const publicDir = path.join("/repo", "public");
    expect(() =>
      assertSafePublicPath(publicDir, "/og/../secrets.png")
    ).toThrow(/outside/);
    expect(() =>
      assertSafePublicPath(publicDir, "/tmp/escape.png")
    ).toThrow(/outside/);
    expect(assertSafePublicPath(publicDir, "/og/takes/a.png")).toMatch(
      /og[/\\]takes[/\\]a\.png$/
    );
  });
});

describe("publishSocialCards", () => {
  it("replaces public/og only after the staged set passes", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const outputDir = path.join(publicDir, "og");
    await mkdir(path.join(outputDir, "takes"), { recursive: true });
    await writeFile(path.join(outputDir, "takes", "stale.png"), "stale");
    const artifactDir = path.join(root, ".agent-artifacts");
    const rows = [row()];
    const result = await publishSocialCards({
      rows,
      publicDir,
      artifactDir,
      reuse: false,
      cache: { root: null, kind: "disabled" },
      render: async (entry) => png(entry.objectId),
      validate: async () => {},
      concurrency: 2,
    });
    expect(result.rendered).toBe(1);
    expect(result.reused).toBe(0);
    expect(existsSync(path.join(outputDir, "takes", "stale.png"))).toBe(false);
    expect(await readFile(path.join(outputDir, "takes", "away--alice.png"), "utf8")).toBe(
      "png:away--alice"
    );
  });

  it("leaves the last complete public tree intact if the renderer throws before output", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const outputDir = path.join(publicDir, "og");
    await mkdir(path.join(outputDir, "takes"), { recursive: true });
    await writeFile(path.join(outputDir, "takes", "kept.png"), "kept");
    await expect(
      publishSocialCards({
        rows: [row()],
        publicDir,
        artifactDir: path.join(root, ".agent-artifacts"),
        reuse: true,
        cache: { root: null, kind: "disabled" },
        render: async () => {
          throw new Error("renderer boom");
        },
        validate: async () => {},
      })
    ).rejects.toThrow(/renderer boom/);
    expect(await readFile(path.join(outputDir, "takes", "kept.png"), "utf8")).toBe("kept");
  });

  it("leaves the last complete public tree intact if the renderer throws halfway", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const outputDir = path.join(publicDir, "og");
    await mkdir(path.join(outputDir, "takes"), { recursive: true });
    await writeFile(path.join(outputDir, "takes", "kept.png"), "kept");
    let calls = 0;
    await expect(
      publishSocialCards({
        rows: [
          row({ publicPath: "/og/takes/one.png", objectId: "one", fingerprint: "11".repeat(32) }),
          row({ publicPath: "/og/takes/two.png", objectId: "two", fingerprint: "22".repeat(32) }),
        ],
        publicDir,
        artifactDir: path.join(root, ".agent-artifacts"),
        reuse: false,
        cache: { root: null, kind: "disabled" },
        concurrency: 1,
        render: async (entry) => {
          calls += 1;
          if (entry.objectId === "two") throw new Error("halfway");
          return png(entry.objectId);
        },
        validate: async () => {},
      })
    ).rejects.toThrow(/halfway/);
    expect(calls).toBe(2);
    expect(await readFile(path.join(outputDir, "takes", "kept.png"), "utf8")).toBe("kept");
    expect(existsSync(path.join(outputDir, "takes", "one.png"))).toBe(false);
  });

  it("re-renders when a cached object is corrupt", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const cacheRoot = path.join(root, "cache");
    await mkdir(cacheRoot, { recursive: true });
    const fingerprint = "aa".repeat(32);
    await writeFile(path.join(cacheRoot, `${fingerprint}.png`), "corrupt");
    const result = await publishSocialCards({
      rows: [row({ fingerprint })],
      publicDir,
      artifactDir: path.join(root, ".agent-artifacts"),
      reuse: true,
      cache: { root: cacheRoot, kind: "override" },
      render: async () => png("fresh"),
      validate: async (bytes) => {
        if (bytes.toString() === "corrupt") throw new Error("cached object is corrupt");
      },
    });
    expect(result.rendered).toBe(1);
    expect(result.reused).toBe(0);
    expect(
      await readFile(path.join(publicDir, "og", "takes", "away--alice.png"), "utf8")
    ).toBe("png:fresh");
  });

  it("refuses a second renderer while the lock is held", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const artifactDir = path.join(root, ".agent-artifacts");
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = publishSocialCards({
      rows: [row()],
      publicDir,
      artifactDir,
      reuse: false,
      cache: { root: null, kind: "disabled" },
      render: async () => {
        await held;
        return png("one");
      },
      validate: async () => {},
    });
    await new Promise((resolve) => setTimeout(resolve, 30));
    await expect(
      publishSocialCards({
        rows: [row()],
        publicDir,
        artifactDir,
        reuse: false,
        cache: { root: null, kind: "disabled" },
        render: async () => png("two"),
        validate: async () => {},
      })
    ).rejects.toThrow(/lock/);
    release();
    await first;
  });

  it("restores the previous complete set if publication rename fails", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const outputDir = path.join(publicDir, "og");
    await mkdir(path.join(outputDir, "takes"), { recursive: true });
    await writeFile(path.join(outputDir, "takes", "kept.png"), "kept");
    await expect(
      publishSocialCards({
        rows: [row()],
        publicDir,
        artifactDir: path.join(root, ".agent-artifacts"),
        reuse: false,
        cache: { root: null, kind: "disabled" },
        render: async () => png("new"),
        validate: async () => {},
        replaceOutput: async () => {
          throw new Error("rename failed");
        },
      })
    ).rejects.toThrow(/rename failed/);
    expect(await readFile(path.join(outputDir, "takes", "kept.png"), "utf8")).toBe("kept");
  });

  it("reuses a complete warm cache without rendering", async () => {
    const root = await tempRoot();
    const publicDir = path.join(root, "public");
    const cacheRoot = path.join(root, "cache");
    const fingerprint = "aa".repeat(32);
    await mkdir(cacheRoot, { recursive: true });
    await writeFile(path.join(cacheRoot, `${fingerprint}.png`), png("cached"));
    let rendered = 0;
    const result = await publishSocialCards({
      rows: [row({ fingerprint })],
      publicDir,
      artifactDir: path.join(root, ".agent-artifacts"),
      reuse: true,
      cache: { root: cacheRoot, kind: "override" },
      render: async () => {
        rendered += 1;
        return png("new");
      },
      validate: async () => {},
    });
    expect(result.reused).toBe(1);
    expect(result.rendered).toBe(0);
    expect(rendered).toBe(0);
  });

  it("renders every asset on a cold cache", async () => {
    const root = await tempRoot();
    const result = await publishSocialCards({
      rows: [
        row({ publicPath: "/og/takes/one.png", objectId: "one", fingerprint: "11".repeat(32) }),
        row({ publicPath: "/og/pages/home.png", objectId: "home", fingerprint: "22".repeat(32) }),
      ],
      publicDir: path.join(root, "public"),
      artifactDir: path.join(root, ".agent-artifacts"),
      reuse: true,
      cache: { root: path.join(root, "cache"), kind: "override" },
      render: async (entry) => png(entry.objectId),
      validate: async () => {},
    });
    expect(result.rendered).toBe(2);
    expect(result.reused).toBe(0);
  });
});
