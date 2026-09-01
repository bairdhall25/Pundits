import { describe, expect, it } from "vitest";
import { validateProductionGitState } from "./deploy-guard.mjs";

describe("production deploy guard", () => {
  const clean = { branch: "main", status: "", head: "abc", remoteHead: "abc" };

  it("accepts a clean synchronized main", () => {
    expect(() => validateProductionGitState(clean)).not.toThrow();
  });

  it("rejects dirty, stale, and non-main deploys", () => {
    expect(() => validateProductionGitState({ ...clean, status: " M app/page.tsx" })).toThrow(
      /clean working tree/
    );
    expect(() => validateProductionGitState({ ...clean, remoteHead: "def" })).toThrow(
      /exactly match/
    );
    expect(() => validateProductionGitState({ ...clean, branch: "feature" })).toThrow(
      /from main/
    );
  });
});
