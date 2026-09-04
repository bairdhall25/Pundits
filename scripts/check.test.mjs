import { describe, expect, it } from "vitest";
import { CHECK_STAGES, npmProcessSpec, runCheck } from "./check.mjs";

function io() {
  let text = "";
  return {
    write(chunk) {
      text += String(chunk);
      return true;
    },
    get text() {
      return text;
    },
  };
}

function silentFs() {
  const files = new Map();
  return {
    files,
    mkdir: async () => {},
    writeFile: async (filePath, data) => {
      files.set(filePath, String(data));
    },
  };
}

describe("staged check runner", () => {
  it("runs the existing stages in order", async () => {
    const order = [];
    const { mkdir, writeFile } = silentFs();
    const result = await runCheck({
      stdout: io(),
      stderr: io(),
      mkdir,
      writeFile,
      runCommand: async (stage) => {
        order.push(stage.id);
        return { exitCode: 0 };
      },
    });

    expect(CHECK_STAGES.map((stage) => stage.id)).toEqual([
      "tests",
      "validate:runs",
      "build",
      "verify:static",
    ]);
    expect(order).toEqual(["tests", "validate:runs", "build", "verify:static"]);
    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it("stops later stages after the first failure", async () => {
    const order = [];
    const stdout = io();
    const { mkdir, writeFile } = silentFs();
    const result = await runCheck({
      stdout,
      stderr: io(),
      mkdir,
      writeFile,
      runCommand: async (stage) => {
        order.push(stage.id);
        if (stage.id === "validate:runs") return { exitCode: 2 };
        return { exitCode: 0 };
      },
    });

    expect(order).toEqual(["tests", "validate:runs"]);
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(2);
    expect(result.failedStage).toBe("validate:runs");
    expect(stdout.text).toMatch(/fail: validate:runs/i);
    expect(stdout.text).toMatch(/command: npm run validate:runs/);
    expect(stdout.text).toMatch(/next: npm run validate:runs/);
    expect(stdout.text).not.toMatch(/start: build/);
  });

  it("streams child output before the stage completion line", async () => {
    const stdout = io();
    const { mkdir, writeFile } = silentFs();
    await runCheck({
      stdout,
      stderr: io(),
      mkdir,
      writeFile,
      runCommand: async (_stage, { stdout: childOut }) => {
        childOut.write("child-chunk\n");
        return { exitCode: 0 };
      },
    });

    const start = stdout.text.indexOf("start: tests");
    const child = stdout.text.indexOf("child-chunk");
    const done = stdout.text.indexOf("ok: tests");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(child).toBeGreaterThan(start);
    expect(done).toBeGreaterThan(child);
  });

  it("writes a summary that omits environment values and secrets", async () => {
    const { files, mkdir, writeFile } = silentFs();
    const result = await runCheck({
      stdout: io(),
      stderr: io(),
      mkdir,
      writeFile,
      env: {
        GITHUB_PAGES: "true",
        CLOUDFLARE_API_TOKEN: "super-secret-token",
        PATH: "/secret/bin",
      },
      summaryPath: "/tmp/check-summary.json",
      runCommand: async () => ({ exitCode: 0 }),
    });

    const raw = files.get("/tmp/check-summary.json");
    expect(raw).toEqual(expect.any(String));
    expect(raw).not.toMatch(/super-secret-token|GITHUB_PAGES|CLOUDFLARE_API_TOKEN|\/secret\/bin/);
    const summary = JSON.parse(raw);
    expect(summary.ok).toBe(true);
    expect(summary.exitCode).toBe(0);
    expect(summary.stages).toHaveLength(4);
    expect(summary.env).toBeUndefined();
    expect(result.summary).toEqual(summary);
  });

  it("propagates the failed child exit code", async () => {
    const { mkdir, writeFile } = silentFs();
    const result = await runCheck({
      stdout: io(),
      stderr: io(),
      mkdir,
      writeFile,
      runCommand: async (stage) => {
        if (stage.id === "tests") return { exitCode: 17 };
        throw new Error(`later stage ${stage.id} should not run`);
      },
    });

    expect(result.exitCode).toBe(17);
    expect(result.failedStage).toBe("tests");
  });

  it("unsets GITHUB_PAGES for the production build stage", async () => {
    const seen = [];
    const { mkdir, writeFile } = silentFs();
    await runCheck({
      stdout: io(),
      stderr: io(),
      mkdir,
      writeFile,
      env: { GITHUB_PAGES: "true", FOO: "bar" },
      runCommand: async (stage, { env }) => {
        seen.push({ id: stage.id, githubPages: env.GITHUB_PAGES, foo: env.FOO });
        return { exitCode: 0 };
      },
    });

    const build = seen.find((stage) => stage.id === "build");
    expect(build.githubPages).toBeUndefined();
    expect(build.foo).toBe("bar");
    expect(seen.find((stage) => stage.id === "tests").githubPages).toBe("true");
  });

  it("spawns npm through node and npm_execpath without a shell", () => {
    const spec = npmProcessSpec(["npm", "run", "build"], {
      npm_execpath: "C:\\nodejs\\node_modules\\npm\\bin\\npm-cli.js",
    });
    expect(spec.shell).toBe(false);
    expect(spec.command).toBe(process.execPath);
    expect(spec.args).toEqual(["C:\\nodejs\\node_modules\\npm\\bin\\npm-cli.js", "run", "build"]);
  });
});
