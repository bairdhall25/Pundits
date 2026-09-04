import { describe, expect, it } from "vitest";
import {
  DEPLOY_STAGES,
  classifyDeployFailure,
  parseDeployArgs,
  resolveDeployStages,
  runDeploy,
} from "./deploy.mjs";
import { runCheck } from "./check.mjs";

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

describe("timed deploy runner", () => {
  it("runs guard, check, URL, IndexNow, upload, and live verification stages in order", () => {
    expect(DEPLOY_STAGES.map((stage) => stage.id)).toEqual([
      "deploy:guard",
      "check",
      "deploy:guard:post-check",
      "verify:production-urls",
      "indexnow:prepare",
      "deploy:guard:pre-upload",
      "deploy:upload",
      "verify:deployed",
      "indexnow:submit",
    ]);
    expect(DEPLOY_STAGES.find((stage) => stage.id === "check").command).toEqual([
      "npm",
      "run",
      "check",
    ]);
    expect(DEPLOY_STAGES.some((stage) => stage.id === "check:fast")).toBe(false);
  });

  it("records per-stage timings and stops after the first failure", async () => {
    const order = [];
    const stdout = io();
    const { files, mkdir, writeFile } = silentFs();
    const result = await runCheck({
      stages: DEPLOY_STAGES,
      gate: "deploy",
      isReleaseGate: true,
      stdout,
      stderr: io(),
      mkdir,
      writeFile,
      summaryPath: "/tmp/deploy-summary.json",
      now: (() => {
        let tick = 1_000;
        return () => {
          tick += 25;
          return tick;
        };
      })(),
      runCommand: async (stage) => {
        order.push(stage.id);
        if (stage.id === "verify:production-urls") return { exitCode: 4 };
        return { exitCode: 0 };
      },
    });

    expect(order).toEqual([
      "deploy:guard",
      "check",
      "deploy:guard:post-check",
      "verify:production-urls",
    ]);
    expect(result.ok).toBe(false);
    expect(result.gate).toBe("deploy");
    expect(result.failedStage).toBe("verify:production-urls");
    expect(stdout.text).toMatch(/fail: verify:production-urls/);
    expect(stdout.text).toMatch(/next: npm run verify:production-urls/);
    expect(stdout.text).not.toMatch(/start: deploy:upload/);
    const summary = JSON.parse(files.get("/tmp/deploy-summary.json"));
    expect(summary.gate).toBe("deploy");
    expect(summary.stages.every((stage) => typeof stage.elapsedMs === "number")).toBe(true);
  });

  it("binds post-check output to the release commit before upload", () => {
    expect(DEPLOY_STAGES.find((stage) => stage.id === "deploy:guard:post-check").command).toEqual([
      "npm",
      "run",
      "deploy:guard",
      "--",
      "--require-out",
    ]);
    expect(DEPLOY_STAGES.find((stage) => stage.id === "deploy:guard:pre-upload").command).toEqual([
      "npm",
      "run",
      "deploy:guard",
      "--",
      "--require-out",
    ]);
  });

  it("classifies rebuild versus retryable distribution work", () => {
    expect(classifyDeployFailure("check")).toMatchObject({
      kind: "rebuild",
      rebuild: true,
      retryFrom: "check",
    });
    expect(classifyDeployFailure("deploy:upload")).toMatchObject({
      kind: "retry-distribution",
      rebuild: false,
      retryFrom: "deploy:upload",
    });
    expect(classifyDeployFailure("verify:deployed")).toMatchObject({
      kind: "report-and-retry-verify",
      rebuild: false,
      retryFrom: "verify:deployed",
    });
    expect(classifyDeployFailure("indexnow:submit")).toMatchObject({
      kind: "retry-indexnow",
      rebuild: false,
      blocking: false,
      retryFrom: "indexnow:submit",
    });
    expect(classifyDeployFailure("deploy:guard")).toMatchObject({
      kind: "fix-git-state",
      rebuild: false,
      operatorReview: true,
    });
  });

  it("resumes from a later stage and still prepends an output-bound guard", () => {
    expect(parseDeployArgs(["--from", "deploy:upload"])).toEqual({ from: "deploy:upload" });
    const stages = resolveDeployStages("deploy:upload");
    expect(stages.map((stage) => stage.id)).toEqual([
      "deploy:guard:pre-upload",
      "deploy:upload",
      "verify:deployed",
      "indexnow:submit",
    ]);
  });

  it("resumes deploy without rerunning a successful check", async () => {
    const order = [];
    const result = await runDeploy({
      stdout: io(),
      stderr: io(),
      mkdir: async () => {},
      writeFile: async () => {},
      from: "verify:production-urls",
      runCommand: async (stage) => {
        order.push(stage.id);
        return { exitCode: 0 };
      },
    });
    expect(result.ok).toBe(true);
    expect(order[0]).toBe("deploy:guard:pre-upload");
    expect(order).toContain("verify:production-urls");
    expect(order).not.toContain("check");
  });
});
