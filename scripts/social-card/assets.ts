import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const imageCache = new Map<string, string>();

export function socialPhotoUri(publicPath: string | null): string | null {
  if (!publicPath) return null;
  const relativePath = publicPath.replace(/^\//, "");
  const absolutePath = path.join(ROOT, "public", relativePath);
  if (!existsSync(absolutePath)) return null;

  const cached = imageCache.get(absolutePath);
  if (cached) return cached;

  const buffer = readFileSync(absolutePath);
  const mime =
    buffer[0] === 0x89 && buffer[1] === 0x50
      ? "image/png"
      : buffer[0] === 0xff && buffer[1] === 0xd8
        ? "image/jpeg"
        : buffer[0] === 0x52 && buffer[1] === 0x49
          ? "image/webp"
          : "image/png";
  const uri = `data:${mime};base64,${buffer.toString("base64")}`;
  imageCache.set(absolutePath, uri);
  return uri;
}
