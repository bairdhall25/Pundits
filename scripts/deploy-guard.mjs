import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function validateProductionGitState({ branch, status, head, remoteHead }) {
  assert.equal(branch, "main", "production deploys must run from main");
  assert.equal(status, "", "production deploys require a clean working tree");
  assert.equal(
    head,
    remoteHead,
    "main must exactly match origin/main before production deployment"
  );
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

export function runDeployGuard() {
  git(["fetch", "--quiet", "origin", "main"]);
  validateProductionGitState({
    branch: git(["branch", "--show-current"]),
    status: git(["status", "--porcelain"]),
    head: git(["rev-parse", "HEAD"]),
    remoteHead: git(["rev-parse", "origin/main"]),
  });
  console.log("Deploy guard passed (clean main matches origin/main).");
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDeployGuard();
}
