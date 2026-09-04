import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { FingerprintContext } from "./asset-manifest";
import { sha256 } from "./fingerprint";

const LANDSCAPE_SOURCES = [
  "scripts/social-card/tokens.ts",
  "scripts/social-card/primitives.tsx",
  "scripts/social-card/split.tsx",
  "scripts/social-card/quote.tsx",
  "scripts/social-card/editorial.tsx",
  "scripts/social-card/render.tsx",
  "scripts/social-card/assets.ts",
  "scripts/render-og.tsx",
];

const STORY_SOURCES = ["scripts/render-og.tsx", "lib/og.ts"];

const FONT_FILES = [
  { name: "Oswald", file: "node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff" },
  { name: "Inter", file: "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff" },
  { name: "Inter-Bold", file: "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff" },
  { name: "IBM-Plex-Mono", file: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff" },
  {
    name: "IBM-Plex-Mono-Semi",
    file: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff",
  },
];

function hashFile(root: string, relativePath: string): string {
  return sha256(readFileSync(path.join(root, relativePath)));
}

function versionFor(root: string, files: string[]): string {
  return sha256(files.map((file) => `${file}:${hashFile(root, file)}`).join("|"));
}

export function gitCommonDir(root: string): string | null {
  try {
    const raw = execFileSync("git", ["rev-parse", "--git-common-dir"], {
      encoding: "utf8",
      cwd: root,
      windowsHide: true,
    }).trim();
    return path.resolve(root, raw);
  } catch {
    return null;
  }
}

export function productionFingerprintContext(root: string): FingerprintContext {
  return {
    rendererVersions: {
      landscape: versionFor(root, LANDSCAPE_SOURCES),
      story: versionFor(root, STORY_SOURCES),
    },
    fontHashes: FONT_FILES.map((font) => ({
      name: font.name,
      hash: hashFile(root, font.file),
    })),
    portraitHash: (publicPath) => {
      if (!publicPath) return "missing";
      const abs = path.join(root, "public", publicPath.replace(/^\//, ""));
      if (!existsSync(abs)) return "missing";
      return sha256(readFileSync(abs));
    },
    encoding: "png",
  };
}

export function ogConcurrency(env: NodeJS.Dict<string> = process.env): number {
  const raw = Number(env.PUNDITS_OG_CONCURRENCY);
  return Number.isFinite(raw) && raw > 0 ? Math.min(32, Math.floor(raw)) : 4;
}
