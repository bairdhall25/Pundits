import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { collectDoctorFacts, evaluateDoctorReport } from "./agent-doctor.mjs";

const healthy = {
  node: { available: true, version: "22.14.0" },
  npm: { available: true, version: "10.9.2" },
  git: { available: true, insideRepo: true, packageName: "pundits" },
  lockfile: { present: true, lockfileVersion: 3, packageManager: "npm" },
  requiredPaths: { missing: [] },
  gitState: {
    branch: "main",
    clean: true,
    head: "abc123",
    originMain: "abc123",
  },
  network: { available: true, originMainRemote: "abc123" },
  githubPages: undefined,
  release: { wranglerAvailable: true, cloudflareCredentials: true },
};

describe("agent doctor", () => {
  it("passes a healthy development check even when release credentials are missing", () => {
    const report = evaluateDoctorReport(
      {
        ...healthy,
        release: { wranglerAvailable: false, cloudflareCredentials: false },
        network: { available: false, originMainRemote: null },
      },
      { release: false }
    );

    expect(report.ok).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(report.mode).toBe("development");
    expect(report.findings.some((finding) => finding.id === "network" && finding.level === "warn")).toBe(
      true
    );
    expect(
      report.findings.some((finding) => finding.id === "cloudflare" && finding.level === "warn")
    ).toBe(true);
  });

  it("fails closed in release mode when release capabilities are missing", () => {
    const report = evaluateDoctorReport(
      {
        ...healthy,
        release: { wranglerAvailable: false, cloudflareCredentials: false },
        network: { available: false, originMainRemote: null },
      },
      { release: true }
    );

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(1);
    expect(report.mode).toBe("release");
    expect(report.findings.some((finding) => finding.id === "wrangler" && finding.level === "fail")).toBe(
      true
    );
    expect(
      report.findings.some((finding) => finding.id === "cloudflare" && finding.level === "fail")
    ).toBe(true);
    expect(report.findings.some((finding) => finding.id === "network" && finding.level === "fail")).toBe(
      true
    );
  });

  it("rejects GITHUB_PAGES=true for a release check and only warns in development", () => {
    const facts = { ...healthy, githubPages: "true" };

    const development = evaluateDoctorReport(facts, { release: false });
    expect(development.ok).toBe(true);
    expect(development.exitCode).toBe(0);
    expect(
      development.findings.some((finding) => finding.id === "github-pages" && finding.level === "warn")
    ).toBe(true);

    const release = evaluateDoctorReport(facts, { release: true });
    expect(release.ok).toBe(false);
    expect(release.exitCode).toBe(1);
    expect(
      release.findings.some((finding) => finding.id === "github-pages" && finding.level === "fail")
    ).toBe(true);
    expect(release.findings.find((finding) => finding.id === "github-pages").message).toMatch(
      /GITHUB_PAGES=true/
    );
  });

  it("fails local development when Node, git, or the lockfile is unusable", () => {
    const report = evaluateDoctorReport(
      {
        ...healthy,
        node: { available: true, version: "20.11.0" },
        git: { available: false, insideRepo: false, packageName: null },
        lockfile: { present: false, lockfileVersion: null, packageManager: "npm" },
      },
      { release: false }
    );

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(1);
    expect(report.findings.some((finding) => finding.id === "node" && finding.level === "fail")).toBe(
      true
    );
    expect(report.findings.some((finding) => finding.id === "git" && finding.level === "fail")).toBe(
      true
    );
    expect(report.findings.some((finding) => finding.id === "lockfile" && finding.level === "fail")).toBe(
      true
    );
  });

  it("finds npm from the npm lifecycle environment when PATH lookup throws", () => {
    const facts = collectDoctorFacts({
      cwd: process.cwd(),
      env: {
        npm_execpath: "/usr/lib/node_modules/npm/bin/npm-cli.js",
        npm_config_user_agent: "npm/10.9.2 node/v22.14.0 win32 x64 workspaces/false",
      },
      execFile: (command, args) => {
        if (command === "git") {
          if (args.includes("--is-inside-work-tree")) return "true\n";
          if (args.includes("--version")) return "git version 2.40.0\n";
          if (args.includes("--show-current")) return "main\n";
          if (args.includes("--porcelain")) return "";
          if (args.includes("HEAD")) return "abc\n";
          if (args.includes("origin/main")) return "abc\n";
          if (args.includes("ls-remote")) return "abc\trefs/heads/main\n";
        }
        throw new Error("npm is not on PATH");
      },
      exists: (filePath) => !String(filePath).includes("pnpm") && !String(filePath).includes("yarn.lock") && existsSync(filePath),
      readFile: readFileSync,
    });

    expect(facts.npm.available).toBe(true);
    expect(facts.npm.version).toBe("10.9.2");
  });
});
