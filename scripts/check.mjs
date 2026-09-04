import { spawn } from "node:child_process";
import { mkdir as fsMkdir, writeFile as fsWriteFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  runCommand = defaultRunCommand,
  mkdir = fsMkdir,
  writeFile = fsWriteFile,
  stdout = process.stdout,
  stderr = process.stderr,
  now = () => Date.now(),
  env = process.env,
  cwd = process.cwd(),
  summaryPath = path.join(cwd, ".agent-artifacts", "check-summary.json"),
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

  const summary = {
    ok: exitCode === 0,
    exitCode,
    elapsedMs: Math.max(0, now() - started),
    failedStage: failedStage?.id ?? null,
    next: failedStage?.next ?? null,
    stages: results,
  };

  try {
    await mkdir(path.dirname(summaryPath), { recursive: true });
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  } catch (error) {
    stderr.write(`check: could not write summary: ${error.message}\n`);
  }

  return { ...summary, summary };
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  runCheck()
    .then((result) => {
      process.exit(result.exitCode);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
