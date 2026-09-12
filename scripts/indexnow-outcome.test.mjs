import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

describe("IndexNow outcome reporting", () => {
  it.each([[200, "accepted"], [500, "failed"], [null, "no-changes"]])(
    "records %s without mistaking a non-blocking failure for acceptance",
    (status, expected) => {
      const cwd = mkdtempSync(path.join(tmpdir(), "pundits-indexnow-"));
      try {
        const cache = path.join(cwd, "node_modules/.cache/pundits");
        mkdirSync(cache, { recursive: true });
        writeFileSync(path.join(cache, "indexnow-pending.json"), JSON.stringify({ urlList: status === null ? [] : ["https://pundits.pro/"] }));
        const preload = path.join(cwd, "fetch.mjs");
        writeFileSync(preload, `globalThis.fetch = async (url, options) => options?.method === "POST"
          ? new Response("test outcome", { status: ${status ?? 200} })
          : new Response(new URL(url).pathname.slice(1, -4));`);
        execFileSync(process.execPath, ["--import", pathToFileURL(preload).href, path.resolve("scripts/indexnow.mjs")], { cwd });
        const report = JSON.parse(readFileSync(path.join(cwd, ".agent-artifacts/indexnow-submit.json"), "utf8"));
        expect(report.status).toBe(expected);
        if (status === 200) expect(report).toMatchObject({ httpStatus: 200, urlCount: 1 });
        if (status === 500) expect(report.error).toContain("HTTP 500");
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    }
  );
});
