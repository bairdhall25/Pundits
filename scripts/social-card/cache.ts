import { randomBytes } from "node:crypto";
import { rename as fsRename, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

/** PUNDITS_DISABLE_CARD_CACHE=1 skips reuse and writes. PUNDITS_AGENT_CACHE_DIR overrides the shared git cache root. */
export type CacheRootKind = "disabled" | "override" | "shared-git";

export type CardCache = {
  root: string | null;
  kind: CacheRootKind;
};

export function resolveCardCache(
  env: NodeJS.Dict<string> = process.env,
  gitCommonDir?: string | null
): CardCache {
  if (env.PUNDITS_DISABLE_CARD_CACHE === "1") {
    return { root: null, kind: "disabled" };
  }
  if (env.PUNDITS_AGENT_CACHE_DIR) {
    return { root: env.PUNDITS_AGENT_CACHE_DIR, kind: "override" };
  }
  if (!gitCommonDir) {
    return { root: null, kind: "disabled" };
  }
  return {
    root: path.join(gitCommonDir, "pundits-agent-cache", "social-cards"),
    kind: "shared-git",
  };
}

function objectPath(root: string, fingerprint: string) {
  if (!/^[a-f0-9]+$/i.test(fingerprint)) {
    throw new Error(`unsafe cache fingerprint: ${fingerprint}`);
  }
  return path.join(root, `${fingerprint}.png`);
}

export async function readCachedCard(
  root: string | null,
  fingerprint: string
): Promise<Buffer | null> {
  if (!root) return null;
  const filePath = objectPath(root, fingerprint);
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function writeCachedCard({
  root,
  fingerprint,
  bytes,
  validate,
}: {
  root: string | null;
  fingerprint: string;
  bytes: Buffer;
  validate: (bytes: Buffer) => Promise<void>;
}): Promise<void> {
  if (!root) return;
  await validate(bytes);
  await mkdir(root, { recursive: true });
  const dest = objectPath(root, fingerprint);
  const temp = `${dest}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(temp, bytes);
  try {
    await fsRename(temp, dest);
  } catch {
    if (existsSync(dest)) {
      await unlink(temp).catch(() => {});
      return;
    }
    await unlink(dest).catch(() => {});
    await fsRename(temp, dest);
  }
}
