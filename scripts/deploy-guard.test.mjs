import { describe, expect, it } from "vitest";
import {
  parseDeployGuardArgs,
  validateProductionGitState,
  validateProductionReleaseState,
} from "./deploy-guard.mjs";

describe("production deploy guard", () => {
  const clean = { branch: "main", status: "", head: "abc", remoteHead: "abc" };
  const release = {
    status: "",
    head: "abc",
    remoteHead: "abc",
    githubPages: undefined,
    wranglerProject: "pundits",
    wranglerAvailable: true,
    outPresent: false,
    stamp: null,
    requireOut: false,
  };

  it("accepts a clean synchronized main", () => {
    expect(() => validateProductionGitState(clean)).not.toThrow();
  });

  it("accepts a clean isolated worktree whose HEAD equals origin/main", () => {
    expect(() =>
      validateProductionGitState({ ...clean, branch: "codex/promote-pate-smu" })
    ).not.toThrow();
    expect(() => validateProductionGitState({ ...clean, branch: "" })).not.toThrow();
  });

  it("rejects dirty, stale, and advanced checkouts regardless of branch name", () => {
    expect(() => validateProductionGitState({ ...clean, status: " M app/page.tsx" })).toThrow(
      /clean working tree/
    );
    expect(() => validateProductionGitState({ ...clean, remoteHead: "def" })).toThrow(
      /exactly match origin\/main/
    );
    expect(() =>
      validateProductionGitState({
        ...clean,
        branch: "codex/promote-pate-smu",
        head: "aaa",
        remoteHead: "bbb",
      })
    ).toThrow(/exactly match origin\/main/);
  });

  it("rejects GITHUB_PAGES=true and a non-production Wrangler project", () => {
    expect(() =>
      validateProductionReleaseState({ ...release, githubPages: "true" })
    ).toThrow(/GITHUB_PAGES must be unset/);
    expect(() =>
      validateProductionReleaseState({ ...release, wranglerProject: "preview" })
    ).toThrow(/project pundits/);
    expect(() =>
      validateProductionReleaseState({ ...release, wranglerAvailable: false })
    ).toThrow(/Wrangler is not available/);
  });

  it("accepts a clean identity match without generated output before check", () => {
    expect(() => validateProductionReleaseState(release)).not.toThrow();
  });

  it("requires generated output to belong to HEAD when --require-out is set", () => {
    expect(() =>
      validateProductionReleaseState({ ...release, requireOut: true })
    ).toThrow(/generated out\/ is required/);
    expect(() =>
      validateProductionReleaseState({
        ...release,
        requireOut: true,
        outPresent: true,
        stamp: null,
      })
    ).toThrow(/release stamp is required/);
    expect(() =>
      validateProductionReleaseState({
        ...release,
        requireOut: true,
        outPresent: true,
        stamp: { commit: "zzz" },
      })
    ).toThrow(/generated output must belong to HEAD/);
    expect(() =>
      validateProductionReleaseState({
        ...release,
        requireOut: true,
        outPresent: true,
        stamp: { commit: "abc" },
      })
    ).not.toThrow();
  });

  it("parses the require-out flag", () => {
    expect(parseDeployGuardArgs([])).toEqual({ requireOut: false });
    expect(parseDeployGuardArgs(["--require-out"])).toEqual({ requireOut: true });
  });
});
