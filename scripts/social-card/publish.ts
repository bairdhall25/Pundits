import { existsSync } from "node:fs";
import { mkdir, open, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ManifestRow } from "./asset-manifest";
import { readCachedCard, writeCachedCard, type CardCache } from "./cache";

export type PublishResult = {
  expected: number;
  reused: number;
  rendered: number;
  failed: number;
  elapsedMs: number;
  cacheKind: CardCache["kind"];
};

export type PublishOptions = {
  rows: ManifestRow[];
  publicDir: string;
  artifactDir: string;
  reuse: boolean;
  cache: CardCache;
  render: (row: ManifestRow) => Promise<Buffer>;
  validate: (bytes: Buffer, row: ManifestRow) => Promise<void>;
  concurrency?: number;
  now?: () => number;
  onProgress?: (done: number, total: number, reused: number, rendered: number) => void;
  replaceOutput?: (args: { stagingOg: string; outputOg: string; backupOg: string }) => Promise<void>;
};

export function assertSafePublicPath(publicDir: string, publicPath: string): string {
  if (!publicPath.startsWith("/og/") || publicPath.includes("\0") || publicPath.includes("\\")) {
    throw new Error(`output path outside generated directory: ${publicPath}`);
  }
  const ogRoot = path.resolve(publicDir, "og");
  const dest = path.resolve(publicDir, publicPath.replace(/^\//, ""));
  const relative = path.relative(ogRoot, dest);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative.includes("..")) {
    throw new Error(`output path outside generated directory: ${publicPath}`);
  }
  return dest;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  const workers = Math.max(1, Math.min(limit, items.length || 1));
  await Promise.all(Array.from({ length: workers }, run));
  return results;
}

async function defaultReplaceOutput({
  stagingOg,
  outputOg,
  backupOg,
}: {
  stagingOg: string;
  outputOg: string;
  backupOg: string;
}) {
  await rm(backupOg, { recursive: true, force: true });
  if (existsSync(outputOg)) {
    await rename(outputOg, backupOg);
  }
  try {
    await mkdir(path.dirname(outputOg), { recursive: true });
    await rename(stagingOg, outputOg);
  } catch (error) {
    if (existsSync(backupOg) && !existsSync(outputOg)) {
      await rename(backupOg, outputOg);
    }
    throw error;
  }
  await rm(backupOg, { recursive: true, force: true });
}

export async function publishSocialCards(options: PublishOptions): Promise<PublishResult> {
  const {
    rows,
    publicDir,
    artifactDir,
    reuse,
    cache,
    render,
    validate,
    concurrency = 4,
    now = () => Date.now(),
    onProgress,
    replaceOutput = defaultReplaceOutput,
  } = options;
  const started = now();
  const outputOg = path.resolve(publicDir, "og");
  const stagingRoot = path.join(artifactDir, "og-staging");
  const stagingOg = path.join(stagingRoot, "og");
  const backupOg = path.join(artifactDir, "og-previous");
  const lockPath = path.join(artifactDir, "og-render.lock");

  for (const entry of rows) {
    assertSafePublicPath(publicDir, entry.publicPath);
  }

  await mkdir(artifactDir, { recursive: true });
  let lockFile;
  try {
    lockFile = await open(lockPath, "wx");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") {
      throw new Error("another renderer holds the og-render lock");
    }
    throw error;
  }

  let reused = 0;
  let rendered = 0;
  let failed = 0;
  try {
    await rm(stagingRoot, { recursive: true, force: true });
    await mkdir(stagingOg, { recursive: true });

    await mapPool(rows, concurrency, async (entry, index) => {
      try {
        let bytes = reuse ? await readCachedCard(cache.root, entry.fingerprint) : null;
        let fromCache = Boolean(bytes);
        if (bytes) {
          try {
            await validate(bytes, entry);
          } catch {
            bytes = null;
            fromCache = false;
          }
        }
        if (!bytes) {
          bytes = await render(entry);
          await validate(bytes, entry);
          await writeCachedCard({
            root: cache.root,
            fingerprint: entry.fingerprint,
            bytes,
            validate: async (cached) => validate(cached, entry),
          });
          rendered += 1;
        } else {
          reused += 1;
        }
        const dest = path.join(stagingOg, entry.publicPath.replace(/^\/og\//, ""));
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, bytes);
        onProgress?.(reused + rendered, rows.length, reused, rendered);
      } catch (error) {
        failed += 1;
        throw error;
      }
    });

    if (failed > 0) {
      throw new Error(`social card publish failed (${failed} assets)`);
    }

    await replaceOutput({ stagingOg, outputOg, backupOg });
    return {
      expected: rows.length,
      reused,
      rendered,
      failed,
      elapsedMs: Math.max(0, now() - started),
      cacheKind: cache.kind,
    };
  } finally {
    await rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
    await lockFile.close().catch(() => {});
    await rm(lockPath, { force: true }).catch(() => {});
  }
}
