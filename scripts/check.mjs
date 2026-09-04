import { execFileSync, spawn } from "node:child_process";
import { mkdir as fsMkdir, writeFile as fsWriteFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeReleaseStamp } from "./deploy-guard.mjs";

export const CHECK_STAGES = [
  {
    id: "tests",
    name: "tests",
    command: ["npm", "test"],
    next: "npm test",
  },
  {
    id: "validate:runs",
    name: "run-file validation",
    command: ["npm", "run", "validate:runs"],
    next: "npm run validate:runs",
  },
  {
    id: "build",
    name: "production build",
    command: ["npm", "run", "build"],
    next: "npm run build",
    unsetEnv: ["GITHUB_PAGES"],
  },
  {
    id: "verify:static",
    name: "static verification",
    command: ["npm", "run", "verify:static"],
    next: "npm run verify:static",
  },
];

export const FAST_CHECK_NOTE =
  "check:fast is not a release gate. Run npm run check before deploy or release-affecting completion.";

export const FAST_CHECK_STAGES = [
  {
    id: "tests:fast",
    name: "inexpensive tests",
    command: ["npm", "run", "test:fast"],
    next: "npm run test:fast",
  },
  {
    id: "validate:runs",
    name: "run-file validation",
    command: ["npm", "run", "validate:runs"],
    next: "npm run validate:runs",
  },
];

export function parseCheckArgs(argv = process.argv.slice(2)) {
  return { fast: argv.includes("--fast") };
}

export function resolveCheckOptions({ fast = false, cwd = process.cwd() } = {}) {
  if (fast) {
    return {
      stages: FAST_CHECK_STAGES,
      gate: "fast",
      isReleaseGate: false,
      successNote: FAST_CHECK_NOTE,
      summaryPath: path.join(cwd, ".agent-artifacts", "check-fast-summary.json"),
    };
  }
  return {
    stages: CHECK_STAGES,
    gate: "release",
    isReleaseGate: true,
    successNote: null,
    summaryPath: path.join(cwd, ".agent-artifacts", "check-summary.json"),
  };
}

export function npmProcessSpec(command, env = {}) {
  const args = command.slice(1);
  if (env.npm_execpath) {
    return { command: process.execPath, args: [env.npm_execpath, ...args], shell: false };
  }
  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    shell: false,
  };
}

export function defaultReadHead({ cwd }) {
  return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", cwd }).trim();
}

export function defaultRunCommand(stage, { cwd, env, stdout, stderr }) {
  const spec = npmProcessSpec(stage.command, env);
  return new Promise((resolve, reject) => {
    const child = spawn(spec.command, spec.args, {
      cwd,
      env,
      shell: spec.shell,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => {
      stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (exitCode, signal) => {
      resolve({ exitCode: exitCode ?? (signal ? 1 : 0) });
    });
  });
}

function stageEnv(stage, env) {
  const next = { ...env };
  for (const key of stage.unsetEnv ?? []) {
    delete next[key];
  }
  return next;
}

export async function runCheck({
  stages = CHECK_STAGES,
  gate = "release",
  isReleaseGate = true,
  successNote = null,
  runCommand = defaultRunCommand,
  mkdir = fsMkdir,
  writeFile = fsWriteFile,
  stdout = process.stdout,
  stderr = process.stderr,
  now = () => Date.now(),
  env = process.env,
  cwd = process.cwd(),
  summaryPath = path.join(cwd, ".agent-artifacts", "check-summary.json"),
  readHead = defaultReadHead,
} = {}) {
  const started = now();
  const results = [];
  let failedStage = null;
  let exitCode = 0;

  for (const stage of stages) {
    const commandText = stage.command.join(" ");
    stdout.write(`start: ${stage.id}\n`);
    stdout.write(`command: ${commandText}\n`);
    const stageStarted = now();
    const { exitCode: childExit } = await runCommand(stage, {
      cwd,
      env: stageEnv(stage, env),
      stdout,
      stderr,
    });
    const elapsedMs = Math.max(0, now() - stageStarted);
    const ok = childExit === 0;
    results.push({
      id: stage.id,
      name: stage.name,
      command: [...stage.command],
      status: ok ? "ok" : "fail",
      exitCode: childExit,
      elapsedMs,
    });
    if (ok) {
      stdout.write(`ok: ${stage.id} (${elapsedMs}ms) exit ${childExit}\n`);
      continue;
    }
    stdout.write(`fail: ${stage.id} (${elapsedMs}ms) exit ${childExit}\n`);
    stdout.write(`command: ${commandText}\n`);
    stdout.write(`next: ${stage.next}\n`);
    failedStage = stage;
    exitCode = childExit;
    break;
  }

  if (exitCode === 0 && successNote) {
    stdout.write(`note: ${successNote}\n`);
  }

  const summary = {
    ok: exitCode === 0,
    exitCode,
    elapsedMs: Math.max(0, now() - started),
    failedStage: failedStage?.id ?? null,
    next: failedStage?.next ?? null,
    gate,
    isReleaseGate,
    stages: results,
  };

  try {
    await mkdir(path.dirname(summaryPath), { recursive: true });
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  } catch (error) {
    stderr.write(`check: could not write summary: ${error.message}\n`);
  }

  if (exitCode === 0 && isReleaseGate) {
    try {
      const commit = readHead({ cwd });
      if (commit) {
        await writeReleaseStamp({ cwd, commit, mkdir, writeFile, now });
      }
    } catch (error) {
      stderr.write(`check: could not write release stamp: ${error.message}\n`);
    }
  }

  return { ...summary, summary };
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  const { fast } = parseCheckArgs();
  const options = resolveCheckOptions({ fast });
  runCheck(options)
    .then((result) => {
      process.exit(result.exitCode);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
