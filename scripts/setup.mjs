import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  realpath,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, relative } from "node:path";
import { cli, grammars, pnpm, root, run, runtime, upstream } from "./process.mjs";

// Pin the audited upstream implementation, including its experimental editor SDK.
const revision = "44eb94c03a51b1050b662839bb0848ef217e91ec";
if (Number(process.versions.node.split(".")[0]) < 24)
  throw new Error("Use Node.js 24.10 or newer, then run pnpm run setup again.");
await mkdir(upstream, { recursive: true });
try {
  await access(join(upstream, ".git"));
} catch {
  await run("git", ["init"], upstream);
  await run(
    "git",
    ["remote", "add", "origin", "https://github.com/Lojhan/typed-sql.git"],
    upstream,
  );
}
await run("git", ["fetch", "--depth", "1", "origin", revision], upstream);
await run("git", ["checkout", "--detach", revision], upstream);
await pnpm(["install", "--frozen-lockfile"], upstream);
await run(process.execPath, ["scripts/clean-build.mjs"], upstream);
await pnpm(["exec", "tsc", "-b"], upstream);
// Only build this machine's SDK. No platform binaries are committed here.
await run(process.execPath, ["scripts/build-editor-sdk.mjs"], upstream);
await pnpm(["--filter", "./editors/vscode", "package:vsix"], upstream);

const tarballs = join(runtime, "tarballs");
await mkdir(tarballs, { recursive: true });
const dependencies = { typescript: "7.0.2", tsx: "4.23.15", "@types/node": "24.19.2" };
for (const name of [
  "ast",
  "core",
  "config",
  "schema",
  "compiler",
  "conformance",
  "postgres",
  "mysql",
  "sqlite",
  "ts-bridge",
  "language-server",
  "cli",
]) {
  const directory = join(upstream, "packages", name);
  const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  const archive = `${manifest.name.replace(/^@/u, "").replaceAll("/", "-")}-${manifest.version}.tgz`;
  await pnpm(["pack", "--pack-destination", tarballs], directory);
  if (!(await readdir(tarballs)).includes(archive)) throw new Error(`Missing archive ${archive}`);
  dependencies[manifest.name] = `file:tarballs/${archive}`;
}
await writeFile(
  join(runtime, "package.json"),
  JSON.stringify(
    { private: true, type: "module", dependencies, pnpm: { overrides: dependencies } },
    null,
    2,
  ) + "\n",
);
await pnpm(["install", "--ignore-workspace", "--ignore-scripts", "--no-frozen-lockfile"], runtime);
await copyFile(
  join(upstream, "artifacts/typed-sql-vscode.vsix"),
  join(runtime, "typed-sql-vscode.vsix"),
);

for (const grammar of grammars) {
  const app = join(root, grammar);
  const modules = join(app, "node_modules");
  const destination = join(runtime, "node_modules");
  try {
    const current = await realpath(modules);
    if (current !== (await realpath(destination)))
      throw new Error(
        `Unexpected node_modules at ${modules}; preserve it and move it manually before setup.`,
      );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await symlink(
      process.platform === "win32" ? destination : relative(app, destination),
      modules,
      "junction",
    );
  }
  if (grammar === "sqlite") await run(process.execPath, ["setup.mjs"], app);
  await run(
    process.execPath,
    [
      cli,
      "generate",
      ...(grammar === "sqlite" ? [] : ["--snapshot", "schema/catalog.snapshot.json"]),
    ],
    app,
  );
}
const sdk = `.runtime/node_modules/@typed-sql/language-server/sdk/${process.platform}-${process.arch}`;
const workspace = JSON.parse(await readFile(join(root, "typed-sql.code-workspace"), "utf8"));
workspace.settings["js/ts.tsdk.path"] = sdk;
await writeFile(
  join(root, ".runtime/playground.code-workspace"),
  JSON.stringify(
    {
      ...workspace,
      folders: workspace.folders.map((folder) => ({ ...folder, path: `../${folder.path}` })),
      settings: { ...workspace.settings, "js/ts.tsdk.path": `../${sdk}` },
    },
    null,
    2,
  ) + "\n",
);
console.log("Setup complete. Run pnpm check, pnpm demo, then pnpm editor:install.");
