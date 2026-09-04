import { createHash } from "node:crypto";

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function sortValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortValue);
  const object = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(object).sort()) {
    sorted[key] = sortValue(object[key]);
  }
  return sorted;
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export type FingerprintPortrait = { id: string; hash: string };
export type FingerprintFont = { name: string; hash: string };

export type FingerprintParts = {
  model: unknown;
  rendererVersion: string;
  portraits: FingerprintPortrait[];
  fonts: FingerprintFont[];
  width: number;
  height: number;
  encoding: string;
};

export function cardFingerprint(parts: FingerprintParts): string {
  const portraits = [...parts.portraits].sort((left, right) => left.id.localeCompare(right.id));
  const fonts = [...parts.fonts].sort((left, right) => left.name.localeCompare(right.name));
  return sha256(
    stableSerialize({
      encoding: parts.encoding,
      fonts,
      height: parts.height,
      model: parts.model,
      portraits,
      rendererVersion: parts.rendererVersion,
      width: parts.width,
    })
  );
}
