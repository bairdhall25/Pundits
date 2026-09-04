import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir as fsMkdir, writeFile as fsWriteFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RELEASE_STAMP_RELATIVE = path.join(".agent-artifacts", "release-stamp.json");
export const PRODUCTION_PAGES_PROJECT = "pundits";

export function parseDeployGuardArgs(argv = process.argv.slice(2)) {
  return { requireOut: argv.includes("--require-out") };
}

export function validateProductionGitState({ status, head, remoteHead }) {
  assert.equal(status, "", "production deploys require a clean working tree");
  assert.equal(
    head,
    remoteHead,
    "HEAD must exactly match origin/main before production deployment"
  );
}

export function validateProductionReleaseState({
  status,
  head,
  remoteHead,
  githubPages,
  wranglerProject,
  wranglerAvailable,
  outPresent,
  stamp,
  requireOut = false,
}) {
  validateProductionGitState({ status, head, remoteHead });
  assert.notEqual(
    githubPages,
    "true",
    "GITHUB_PAGES must be unset for production-style deploys"
  );
  assert.equal(
    wranglerProject,
    PRODUCTION_PAGES_PROJECT,
    `production deploys must use Cloudflare Pages project ${PRODUCTION_PAGES_PROJECT}`
  );
  assert.equal(wranglerAvailable, true, "Wrangler is not available");
  if (requireOut) {
    assert.equal(outPresent, true, "generated out/ is required");
    assert.ok(stamp, "release stamp is required");
    assert.equal(stamp.commit, head, "generated output must belong to HEAD");
  }
}

export function parseWranglerProject(toml) {
  const match = String(toml ?? "").match(/^\s*name\s*=\s*"([^"]+)"/m);
  return match ? match[1] : null;
}

export function parseReleaseStamp(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.commit !== "string" || !parsed.commit) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeReleaseStamp({
  cwd,
  commit,
  now = () => Date.now(),
  mkdir = fsMkdir,
  writeFile = fsWriteFile,
}) {
  const stamp = { commit, createdAt: new Date(now()).toISOString() };
  const file = path.join(cwd, RELEASE_STAMP_RELATIVE);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(stamp, null, 2)}\n`);
  return stamp;
}

function git(args, cwd) {
  return execFileSync("git", args, { encoding: "utf8", cwd }).trim();
}

function wranglerBinExists(cwd, exists = existsSync) {
  const bin = path.join(
    cwd,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "wrangler.cmd" : "wrangler"
  );
  return exists(bin);
}

export function collectReleaseFacts({
  cwd = process.cwd(),
  env = process.env,
  requireOut = false,
  exists = existsSync,
  readFile = readFileSync,
  execGit = git,
} = {}) {
  let wranglerProject = null;
  try {
    wranglerProject = parseWranglerProject(readFile(path.join(cwd, "wrangler.toml"), "utf8"));
  } catch {
    wranglerProject = null;
  }
  let stamp = null;
  try {
    stamp = parseReleaseStamp(readFile(path.join(cwd, RELEASE_STAMP_RELATIVE), "utf8"));
  } catch {
    stamp = null;
  }
  return {
    status: execGit(["status", "--porcelain"], cwd),
    head: execGit(["rev-parse", "HEAD"], cwd),
    remoteHead: execGit(["rev-parse", "origin/main"], cwd),
    githubPages: env.GITHUB_PAGES,
    wranglerProject,
    wranglerAvailable: wranglerBinExists(cwd, exists),
    outPresent: exists(path.join(cwd, "out")),
    stamp,
    requireOut,
  };
}

export function runDeployGuard(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  if (options.fetch !== false) {
    git(["fetch", "--quiet", "origin", "main"], cwd);
  }
  const { requireOut } = parseDeployGuardArgs(options.argv ?? process.argv.slice(2));
  const facts = collectReleaseFacts({ ...options, cwd, requireOut });
  validateProductionReleaseState(facts);
  const message = requireOut
    ? "Deploy guard passed (HEAD matches origin/main; generated output belongs to HEAD)."
    : "Deploy guard passed (clean HEAD matches origin/main).";
  (options.stdout ?? process.stdout).write(`${message}\n`);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDeployGuard();
}
