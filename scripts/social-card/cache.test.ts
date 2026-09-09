import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readCachedCard,
  resolveCardCache,
  writeCachedCard,
} from "./cache";
import { cardFingerprint } from "./fingerprint";

async function tempDir(prefix: string) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("social card cache", () => {
  it("resolves override, shared-git, and disabled roots without using a home path kind", () => {
    expect(
      resolveCardCache({ PUNDITS_DISABLE_CARD_CACHE: "1" }, "/repo/.git")
    ).toEqual({ root: null, kind: "disabled" });
    expect(
      resolveCardCache({ PUNDITS_AGENT_CACHE_DIR: "/tmp/cards" }, "/repo/.git")
    ).toEqual({ root: "/tmp/cards", kind: "override" });
    expect(resolveCardCache({}, "/repo/.git")).toEqual({
      root: path.join("/repo/.git", "pundits-agent-cache", "social-cards"),
      kind: "shared-git",
    });
  });

  it("stores immutable objects by fingerprint after validation", async () => {
    const root = await tempDir("pundits-og-cache-");
    const bytes = Buffer.from("png-bytes");
    await writeCachedCard({
      root,
      fingerprint: "abc123",
      bytes,
      validate: async () => {},
    });
    await expect(readCachedCard(root, "abc123")).resolves.toEqual(bytes);
  });

  it("does not cache a file when validation fails", async () => {
    const root = await tempDir("pundits-og-cache-");
    await expect(
      writeCachedCard({
        root,
        fingerprint: "bad",
        bytes: Buffer.from("nope"),
        validate: async () => {
          throw new Error("corrupt");
        },
      })
    ).rejects.toThrow(/corrupt/);
    await expect(readCachedCard(root, "bad")).resolves.toBeNull();
  });

  it("converges concurrent writers of the same fingerprint on identical bytes", async () => {
    const root = await tempDir("pundits-og-cache-");
    const bytes = Buffer.from("same-png");
    await Promise.all([
      writeCachedCard({ root, fingerprint: "ab".repeat(32), bytes, validate: async () => {} }),
      writeCachedCard({ root, fingerprint: "ab".repeat(32), bytes, validate: async () => {} }),
    ]);
    await expect(readCachedCard(root, "ab".repeat(32))).resolves.toEqual(bytes);
  });

  it("returns null for a missing fingerprint", async () => {
    const root = await tempDir("pundits-og-cache-");
    await mkdir(root, { recursive: true });
    await expect(readCachedCard(root, "ff".repeat(32))).resolves.toBeNull();
  });

  it("misses the warm cache after an evidence-only model change and hits on the second identical build", async () => {
    const root = await tempDir("pundits-og-evidence-");
    const parts = {
      rendererVersion: "renderer-a",
      portraits: [{ id: "saban", hash: "portrait-saban" }],
      fonts: [{ name: "Oswald", hash: "font-oswald" }],
      width: 1200,
      height: 630,
      encoding: "png",
    };
    const spokenFp = cardFingerprint({
      ...parts,
      model: { quote: "LSU over Clemson", evidenceKind: "spoken-quote" },
    });
    const reportedFp = cardFingerprint({
      ...parts,
      model: { quote: "LSU over Clemson", evidenceKind: "reported-selection" },
    });
    expect(reportedFp).not.toBe(spokenFp);

    await writeCachedCard({
      root,
      fingerprint: spokenFp,
      bytes: Buffer.from("spoken-png"),
      validate: async () => {},
    });
    await expect(readCachedCard(root, reportedFp)).resolves.toBeNull();

    await writeCachedCard({
      root,
      fingerprint: reportedFp,
      bytes: Buffer.from("reported-png"),
      validate: async () => {},
    });
    await expect(readCachedCard(root, reportedFp)).resolves.toEqual(
      Buffer.from("reported-png")
    );
    await expect(readCachedCard(root, reportedFp)).resolves.toEqual(
      Buffer.from("reported-png")
    );
    await expect(readCachedCard(root, spokenFp)).resolves.toEqual(
      Buffer.from("spoken-png")
    );
  });

  it("treats a corrupt cached object as a miss after the caller rejects it", async () => {
    const root = await tempDir("pundits-og-cache-");
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "deadbeef.png"), "not-a-png");
    const cached = await readCachedCard(root, "deadbeef");
    expect(cached?.toString()).toBe("not-a-png");
  });
});
