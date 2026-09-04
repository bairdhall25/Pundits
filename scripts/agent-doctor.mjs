import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED_NODE_MAJOR = 22;
const REQUIRED_LOCKFILE_VERSION = 3;
const REPO_PACKAGE_NAME = "pundits";
const REQUIRED_PATHS = [
  "package.json",
  "package-lock.json",
  "wrangler.toml",
  "next.config.ts",
  "data/calls.json",
  "data/events.json",
  "data/pundits.json",
  "app/page.tsx",
  "scripts",
  "lib/types.ts",
  "public/_redirects",
  "AGENTS.md",
];

function nodeMajor(version) {
  const match = String(version ?? "").match(/^v?(\d+)/);
  return match ? Number(match[1]) : 0;
}

function finding(id, level, message) {
  return { id, level, message };
}

export function evaluateDoctorReport(facts, { release = false } = {}) {
  const findings = [];
  const mode = release ? "release" : "development";
  const releaseLevel = release ? "fail" : "warn";

  if (!facts.node?.available || nodeMajor(facts.node.version) < SUPPORTED_NODE_MAJOR) {
    findings.push(
      finding(
        "node",
        "fail",
        `Node ${SUPPORTED_NODE_MAJOR}+ required; found ${facts.node?.version ?? "missing"}`
      )
    );
  } else {
    findings.push(finding("node", "pass", `Node ${facts.node.version}`));
  }

  if (!facts.npm?.available) {
    findings.push(finding("npm", "fail", "npm is required"));
  } else {
    findings.push(finding("npm", "pass", `npm ${facts.npm.version}`));
  }

  if (!facts.git?.available || !facts.git.insideRepo || facts.git.packageName !== REPO_PACKAGE_NAME) {
    findings.push(finding("git", "fail", "Git must be available inside the pundits repository"));
  } else {
    findings.push(finding("git", "pass", "Git repository is pundits"));
  }

  if (
    !facts.lockfile?.present ||
    facts.lockfile.lockfileVersion !== REQUIRED_LOCKFILE_VERSION ||
    facts.lockfile.packageManager !== "npm"
  ) {
    findings.push(finding("lockfile", "fail", "package-lock.json must be npm lockfileVersion 3"));
  } else {
    findings.push(finding("lockfile", "pass", "package-lock.json matches npm lockfileVersion 3"));
  }

  if (facts.requiredPaths?.missing?.length) {
    findings.push(
      finding("paths", "fail", `Missing required paths: ${facts.requiredPaths.missing.join(", ")}`)
    );
  } else {
    findings.push(finding("paths", "pass", "Required source directories and configuration files exist"));
  }

  const state = facts.gitState ?? {};
  findings.push(
    finding(
      "git-state",
      "pass",
      `branch=${state.branch ?? "unknown"} clean=${Boolean(state.clean)} HEAD=${state.head ?? "unknown"} origin/main=${state.originMain ?? "unknown"}`
    )
  );

  if (!facts.network?.available) {
    findings.push(finding("network", releaseLevel, "Could not reach origin/main"));
  } else {
    findings.push(finding("network", "pass", `origin/main remote=${facts.network.originMainRemote}`));
  }

  if (facts.githubPages === "true") {
    findings.push(
      finding(
        "github-pages",
        releaseLevel,
        "GITHUB_PAGES=true would prefix production paths; unset it for production-style builds"
      )
    );
  } else {
    findings.push(finding("github-pages", "pass", "GITHUB_PAGES is unset"));
  }

  if (!facts.release?.wranglerAvailable) {
    findings.push(finding("wrangler", releaseLevel, "Wrangler is not available"));
  } else {
    findings.push(finding("wrangler", "pass", "Wrangler is available"));
  }

  if (!facts.release?.cloudflareCredentials) {
    findings.push(finding("cloudflare", releaseLevel, "Cloudflare credentials are not available"));
  } else {
    findings.push(finding("cloudflare", "pass", "Cloudflare credentials are present"));
  }

  const ok = findings.every((item) => item.level !== "fail");
  return { ok, exitCode: ok ? 0 : 1, mode, findings };
}

function runCapture(execFile, command, args, cwd, extra = {}) {
  try {
    return execFile(command, args, {
      encoding: "utf8",
      cwd,
      timeout: 15_000,
      windowsHide: true,
      ...extra,
    }).trim();
  } catch {
    return null;
  }
}

function npmVersionFromEnv(env) {
  const agent = env?.npm_config_user_agent;
  const match = typeof agent === "string" ? agent.match(/\bnpm\/(\d+\.\d+\.\d+)/) : null;
  return match?.[1] ?? null;
}

function detectNpm(execFile, cwd, env) {
  const fromAgent = npmVersionFromEnv(env);
  if (fromAgent) {
    return { available: true, version: fromAgent };
  }

  if (env?.npm_execpath) {
    const fromExecPath = runCapture(execFile, process.execPath, [env.npm_execpath, "--version"], cwd);
    if (fromExecPath) {
      return { available: true, version: fromExecPath };
    }
  }

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const fromPath = runCapture(execFile, npm, ["--version"], cwd, {
    shell: process.platform === "win32",
  });
  if (fromPath) {
    return { available: true, version: fromPath };
  }

  return { available: false, version: null };
}

export function collectDoctorFacts({
  cwd = process.cwd(),
  env = process.env,
  execFile = execFileSync,
  exists = existsSync,
  readFile = readFileSync,
} = {}) {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const npmInfo = detectNpm(execFile, cwd, env);
  const gitVersion = runCapture(execFile, "git", ["--version"], cwd);
  const inside = runCapture(execFile, "git", ["rev-parse", "--is-inside-work-tree"], cwd);

  let packageName = null;
  try {
    packageName = JSON.parse(readFile(path.join(cwd, "package.json"), "utf8")).name;
  } catch {
    packageName = null;
  }

  let lockfile = { present: false, lockfileVersion: null, packageManager: "npm" };
  const lockPath = path.join(cwd, "package-lock.json");
  const mixedLock = exists(path.join(cwd, "pnpm-lock.yaml")) || exists(path.join(cwd, "yarn.lock"));
  try {
    const lock = JSON.parse(readFile(lockPath, "utf8"));
    lockfile = {
      present: true,
      lockfileVersion: lock.lockfileVersion ?? null,
      packageManager: mixedLock ? "mixed" : "npm",
    };
  } catch {
    lockfile = {
      present: exists(lockPath),
      lockfileVersion: null,
      packageManager: mixedLock ? "mixed" : "npm",
    };
  }

  const remote = runCapture(execFile, "git", ["ls-remote", "origin", "refs/heads/main"], cwd);
  const wranglerBin = exists(
    path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "wrangler.cmd" : "wrangler")
  );
  const wranglerVersion = runCapture(execFile, npx, ["--no-install", "wrangler", "--version"], cwd);

  return {
    node: { available: true, version: process.versions.node },
    npm: npmInfo,
    git: {
      available: Boolean(gitVersion),
      insideRepo: inside === "true",
      packageName,
    },
    lockfile,
    requiredPaths: {
      missing: REQUIRED_PATHS.filter((relative) => !exists(path.join(cwd, relative))),
    },
    gitState: {
      branch: runCapture(execFile, "git", ["branch", "--show-current"], cwd),
      clean: runCapture(execFile, "git", ["status", "--porcelain"], cwd) === "",
      head: runCapture(execFile, "git", ["rev-parse", "HEAD"], cwd),
      originMain: runCapture(execFile, "git", ["rev-parse", "origin/main"], cwd),
    },
    network: {
      available: Boolean(remote),
      originMainRemote: remote ? remote.split(/\s+/)[0] : null,
    },
    githubPages: env.GITHUB_PAGES,
    release: {
      wranglerAvailable: Boolean(wranglerBin || wranglerVersion),
      cloudflareCredentials: Boolean(env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_KEY),
    },
  };
}

export function formatDoctorReport(report) {
  const lines = [`doctor: ${report.mode}`];
  for (const item of report.findings) {
    lines.push(`${item.level.padEnd(4)} ${item.id}  ${item.message}`);
  }
  lines.push(report.ok ? "ok    ready" : "fail  doctor found blocking issues");
  return `${lines.join("\n")}\n`;
}

export async function runDoctor(options = {}) {
  const release = Boolean(options.release);
  const stdout = options.stdout ?? process.stdout;
  const facts = options.facts ?? collectDoctorFacts(options);
  const report = evaluateDoctorReport(facts, { release });
  stdout.write(formatDoctorReport(report));
  return report;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  runDoctor({ release: process.argv.includes("--release") })
    .then((report) => {
      process.exit(report.exitCode);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
