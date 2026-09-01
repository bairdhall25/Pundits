import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { missingProductionUrls } from "./verify-production-permalinks.mjs";

describe("production URL protection", () => {
  it("accepts generated files and redirects but reports missing live URLs", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "pundits-permalinks-"));
    await mkdir(path.join(outDir, "picks", "kept"), { recursive: true });
    await writeFile(path.join(outDir, "picks", "kept", "index.html"), "kept");
    const urls = [
      "https://pundits.pro/picks/kept/",
      "https://pundits.pro/picks/redirected/",
      "https://pundits.pro/picks/missing/",
    ];
    await expect(
      missingProductionUrls({
        urls,
        outDir,
        redirects: "/picks/redirected/ /picks/kept/ 301\n",
      })
    ).resolves.toEqual(["https://pundits.pro/picks/missing/"]);
  });
});
