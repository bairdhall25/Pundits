import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SCHEDULED_RELATIVE = path.join(".worktrees", "scheduled");

function assertInsideScheduled(repoRoot, resolved) {
  const scheduledRoot = path.resolve(repoRoot, SCHEDULED_RELATIVE);
  const relative = path.relative(scheduledRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("worktree path must be inside .worktrees/scheduled/");
  }
  return { scheduledRoot, relative };
}

export function resolveScheduledTarget({ repoRoot, requestedPath, cwd }) {
  const resolved = path.resolve(cwd ?? repoRoot, requestedPath);
  const { scheduledRoot, relative } = assertInsideScheduled(repoRoot, resolved);
  if (relative === "") {
    throw new Error("refusing to operate on .worktrees/scheduled itself");
  }
  const parts = relative.split(path.sep).filter(Boolean);
  if (parts.length !== 1) {
    throw new Error("remove the worktree root, not a nested path");
  }
  if (parts[0] === "node_modules" || parts[0] === ".git") {
    throw new Error("refusing to remove shared or nested dependency path");
  }
  return {
    scheduledRoot,
    worktreePath: path.join(scheduledRoot, parts[0]),
    name: parts[0],
  };
}

export function sanitizeWorktreeName(name) {
  const safe = String(name ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!safe) throw new Error("worktree name is required");
  return safe;
}

export function plannedCreatePath({ repoRoot, name }) {
  const safe = sanitizeWorktreeName(name);
  return {
    name: safe,
    worktreePath: path.resolve(repoRoot, SCHEDULED_RELATIVE, safe),
    branch: `codex/${safe}`,
  };
}

export function createScheduledWorktree({ repoRoot, name, git }) {
  const planned = plannedCreatePath({ repoRoot, name });
  git(["fetch", "origin"]);
  git(["worktree", "add", "-b", planned.branch, planned.worktreePath, "origin/main"]);
  return planned;
}

export function removeScheduledWorktree({ repoRoot, requestedPath, git }) {
  const target = resolveScheduledTarget({ repoRoot, requestedPath });
  git(["worktree", "remove", "--force", target.worktreePath]);
  return target;
}

function flag(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] ?? null : null;
}

function git(args, cwd) {
  return execFileSync("git", args, { encoding: "utf8", cwd }).trim();
}

function print(value, stdout = process.stdout) {
  stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function runScheduledWorktree(argv = process.argv.slice(2), options = {}) {
  const command = argv[0];
  const rest = argv.slice(1);
  const cwd = options.cwd ?? process.cwd();
  const repoRoot = options.repoRoot ?? git(["rev-parse", "--show-toplevel"], cwd);
  const runGit = options.git ?? ((args) => git(args, repoRoot));
  if (command === "create") {
    const name = flag(rest, "--name") ?? `job-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 15)}`;
    const created = createScheduledWorktree({ repoRoot, name, git: runGit });
    print({ ...created, nodeModules: "worktree-local", cache: "shared-git" }, options.stdout);
    return created;
  }
  if (command === "remove") {
    const requestedPath = flag(rest, "--path");
    if (!requestedPath) throw new Error("remove requires --path");
    const removed = removeScheduledWorktree({ repoRoot, requestedPath, git: runGit });
    print(removed, options.stdout);
    return removed;
  }
  throw new Error("usage: node scripts/scheduled-worktree.mjs create --name <slug> | remove --path <path>");
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  try {
    runScheduledWorktree();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
