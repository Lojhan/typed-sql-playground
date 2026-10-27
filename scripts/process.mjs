import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const runtime = join(root, ".runtime");
export const upstream = join(root, ".upstream");
export const cli = join(runtime, "node_modules/@typed-sql/cli/dist/packages/cli/src/cli.js");
export const grammars = ["sqlite", "postgres", "mysql"];

export function run(command, args, cwd = root, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

export function pnpm(args, cwd = root) {
  const executable = process.env.npm_execpath;
  if (!executable) throw new Error("Run this script with pnpm so its invocation is portable.");
  return /\.(?:c|m)?js$/u.test(executable)
    ? run(process.execPath, [executable, ...args], cwd)
    : run(executable, args, cwd);
}
