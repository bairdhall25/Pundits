import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createScheduledWorktree,
  plannedCreatePath,
  removeScheduledWorktree,
  resolveScheduledTarget,
} from "./scheduled-worktree.mjs";

const repoRoot = path.resolve("/repo");

describe("scheduled worktree path safety", () => {
  it("accepts a unique worktree root under .worktrees/scheduled/", () => {
    const target = resolveScheduledTarget({
      repoRoot,
      requestedPath: ".worktrees/scheduled/promote-pate-smu",
    });
    expect(target.name).toBe("promote-pate-smu");
    expect(target.worktreePath).toBe(path.resolve(repoRoot, ".worktrees/scheduled/promote-pate-smu"));
  });

  it("refuses the repo root, scheduled parent, and nested or escaped paths", () => {
    expect(() => resolveScheduledTarget({ repoRoot, requestedPath: "." })).toThrow(
      /inside \.worktrees\/scheduled/
    );
    expect(() =>
      resolveScheduledTarget({ repoRoot, requestedPath: ".worktrees/scheduled" })
    ).toThrow(/itself/);
    expect(() =>
      resolveScheduledTarget({
        repoRoot,
        requestedPath: ".worktrees/scheduled/promote-pate-smu/node_modules",
      })
    ).toThrow(/worktree root/);
    expect(() =>
      resolveScheduledTarget({ repoRoot, requestedPath: "../outside" })
    ).toThrow(/inside \.worktrees\/scheduled/);
    expect(() =>
      resolveScheduledTarget({ repoRoot, requestedPath: path.join(repoRoot, "node_modules") })
    ).toThrow(/inside \.worktrees\/scheduled/);
  });

  it("refuses shared git cache and operator checkout paths", () => {
    expect(() =>
      resolveScheduledTarget({
        repoRoot,
        requestedPath: path.join(repoRoot, ".git", "pundits-agent-cache"),
      })
    ).toThrow(/inside \.worktrees\/scheduled/);
    expect(() =>
      resolveScheduledTarget({ repoRoot, requestedPath: repoRoot })
    ).toThrow(/inside \.worktrees\/scheduled/);
  });

  it("plans a unique create path from a sanitized name", () => {
    const planned = plannedCreatePath({ repoRoot, name: "promote pate/smu" });
    expect(planned.name).toBe("promote-pate-smu");
    expect(planned.worktreePath).toBe(
      path.resolve(repoRoot, ".worktrees/scheduled/promote-pate-smu")
    );
    expect(planned.branch).toBe("codex/promote-pate-smu");
  });

  it("creates and removes through git worktree rather than deleting arbitrary paths", () => {
    const calls = [];
    const git = (args) => {
      calls.push(args);
    };
    createScheduledWorktree({ repoRoot, name: "promote-pate-smu", git });
    expect(calls[0]).toEqual(["fetch", "origin"]);
    expect(calls[1][0]).toBe("worktree");
    expect(calls[1][1]).toBe("add");
    expect(calls[1]).toContain("origin/main");
    calls.length = 0;
    removeScheduledWorktree({
      repoRoot,
      requestedPath: ".worktrees/scheduled/promote-pate-smu",
      git,
    });
    expect(calls).toEqual([
      [
        "worktree",
        "remove",
        "--force",
        path.resolve(repoRoot, ".worktrees/scheduled/promote-pate-smu"),
      ],
    ]);
  });
});
