import { access, copyFile, mkdir, readFile, realpath, symlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { cli, grammars, pnpm, root, run, runtime, upstream } from "./process.mjs";

// Pin the audited upstream implementation, including its experimental editor SDK.
const release = JSON.parse(await readFile(join(root, "release.json"), "utf8"));
const revision = release.sourceCommit;
const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (
  !(
    major > 25 ||
    (major === 25 && minor >= 1) ||
    (major === 24 && (minor > 11 || (minor === 11 && patch >= 1)))
  )
)
  throw new Error(
    "Use Node.js 24.11.1 or a newer supported SQL-file runtime, then run setup again.",
  );
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

await mkdir(runtime, { recursive: true });
const dependencies = {
  typescript: "7.0.2",
  tsx: "4.23.15",
  "@types/node": "24.19.2",
  "@libsql/client": "0.18.0",
  vite: "6.4.5",
};
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
  "adapters",
  "ts-bridge",
  "language-server",
  "cli",
]) {
  dependencies[`@typed-sql/${name}`] = release.version;
}
await writeFile(
  join(runtime, "package.json"),
  JSON.stringify(
    { private: true, type: "module", dependencies, pnpm: { overrides: dependencies } },
    null,
    2,
  ) + "\n",
);
// Application dependencies come from npm; the pinned checkout supplies the local editor VSIX.
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
      ...(["sqlite", "portable"].includes(grammar)
        ? []
        : ["--snapshot", "schema/catalog.snapshot.json"]),
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
