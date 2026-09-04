import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCheck } from "./check.mjs";

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
    command: ["npm", "run", "deploy:guard"],
    next: "npm run deploy:guard",
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
    command: ["npm", "run", "deploy:guard"],
    next: "npm run deploy:guard",
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

export function runDeploy(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  return runCheck({
    stages: DEPLOY_STAGES,
    gate: "deploy",
    isReleaseGate: true,
    summaryPath: path.join(cwd, ".agent-artifacts", "deploy-summary.json"),
    ...options,
  });
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  runDeploy()
    .then((result) => {
      process.exit(result.exitCode);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
