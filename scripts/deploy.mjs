import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCheck } from "./check.mjs";

const REQUIRE_OUT = ["--", "--require-out"];

export const DEPLOY_STAGES = [
  {
    id: "deploy:guard",
    name: "deploy guard",
    command: ["npm", "run", "deploy:guard"],
    next: "npm run deploy:guard",
  },
  {
    id: "check",
    name: "release check",
    command: ["npm", "run", "check"],
    next: "npm run check",
  },
  {
    id: "deploy:guard:post-check",
    name: "deploy guard after check",
    command: ["npm", "run", "deploy:guard", ...REQUIRE_OUT],
    next: "npm run deploy:guard -- --require-out",
  },
  {
    id: "verify:production-urls",
    name: "production URL verification",
    command: ["npm", "run", "verify:production-urls"],
    next: "npm run verify:production-urls",
  },
  {
    id: "indexnow:prepare",
    name: "IndexNow prepare",
    command: ["npm", "run", "indexnow:prepare"],
    next: "npm run indexnow:prepare",
  },
  {
    id: "deploy:guard:pre-upload",
    name: "deploy guard before upload",
    command: ["npm", "run", "deploy:guard", ...REQUIRE_OUT],
    next: "npm run deploy:guard -- --require-out",
  },
  {
    id: "deploy:upload",
    name: "Cloudflare upload",
    command: ["npm", "run", "deploy:upload"],
    next: "npm run deploy:upload",
  },
  {
    id: "verify:deployed",
    name: "live verification",
    command: ["npm", "run", "verify:deployed"],
    next: "npm run verify:deployed",
  },
  {
    id: "indexnow:submit",
    name: "IndexNow submit",
    command: ["npm", "run", "indexnow:submit"],
    next: "npm run indexnow:submit",
  },
];

const DISTRIBUTION_STAGES = new Set([
  "deploy:guard:post-check",
  "verify:production-urls",
  "indexnow:prepare",
  "deploy:guard:pre-upload",
  "deploy:upload",
]);

export function parseDeployArgs(argv = process.argv.slice(2)) {
  const fromIndex = argv.indexOf("--from");
  if (fromIndex < 0) return { from: null };
  const from = argv[fromIndex + 1];
  if (!from) throw new Error("--from requires a stage id");
  return { from };
}

export function classifyDeployFailure(failedStage) {
  if (failedStage === "indexnow:submit") {
    return {
      kind: "retry-indexnow",
      rebuild: false,
      blocking: false,
      retryFrom: "indexnow:submit",
      operatorReview: false,
    };
  }
  if (failedStage === "verify:deployed") {
    return {
      kind: "report-and-retry-verify",
      rebuild: false,
      blocking: true,
      retryFrom: "verify:deployed",
      operatorReview: true,
    };
  }
  if (failedStage === "deploy:guard") {
    return {
      kind: "fix-git-state",
      rebuild: false,
      blocking: true,
      retryFrom: "deploy:guard",
      operatorReview: true,
    };
  }
  if (DISTRIBUTION_STAGES.has(failedStage)) {
    return {
      kind: "retry-distribution",
      rebuild: false,
      blocking: true,
      retryFrom: failedStage,
      operatorReview: false,
    };
  }
  if (failedStage === "check") {
    return {
      kind: "rebuild",
      rebuild: true,
      blocking: true,
      retryFrom: "check",
      operatorReview: false,
    };
  }
  return {
    kind: "rebuild",
    rebuild: true,
    blocking: true,
    retryFrom: "deploy:guard",
    operatorReview: true,
  };
}

export function resolveDeployStages(from, stages = DEPLOY_STAGES) {
  if (!from) return stages;
  const index = stages.findIndex((stage) => stage.id === from);
  if (index < 0) throw new Error(`unknown deploy stage: ${from}`);
  const remaining = stages.slice(index);
  if (remaining[0]?.id === "deploy:guard" || remaining[0]?.id?.startsWith("deploy:guard")) {
    return remaining;
  }
  const checkIndex = stages.findIndex((stage) => stage.id === "check");
  const guard =
    index > checkIndex
      ? stages.find((stage) => stage.id === "deploy:guard:pre-upload")
      : stages.find((stage) => stage.id === "deploy:guard");
  return [guard, ...remaining.filter((stage) => stage.id !== guard.id)];
}

export function runDeploy({ from, argv, cwd = process.cwd(), ...options } = {}) {
  const resume = from ?? parseDeployArgs(argv ?? []).from;
  return runCheck({
    stages: resolveDeployStages(resume),
    gate: "deploy",
    isReleaseGate: true,
    summaryPath: path.join(cwd, ".agent-artifacts", "deploy-summary.json"),
    cwd,
    ...options,
  });
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  runDeploy({ argv: process.argv.slice(2) })
    .then((result) => {
      if (!result.ok) {
        const recovery = classifyDeployFailure(result.failedStage);
        const resume = recovery.rebuild
          ? "npm run check && npm run deploy"
          : `npm run deploy -- --from ${recovery.retryFrom}`;
        console.error(`recovery: ${recovery.kind} rebuild=${recovery.rebuild} next=${resume}`);
      }
      process.exit(result.exitCode);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
