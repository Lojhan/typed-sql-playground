import { join } from "node:path";
import { cli, grammars, root, run } from "./process.mjs";
for (const grammar of grammars) {
  console.log(`Checking ${grammar} query inference`);
  if (grammar === "portable") {
    const { createRequire } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    const require = createRequire(join(root, ".runtime/package.json"));
    const { typescriptPreviewCliPath } = await import(
      pathToFileURL(require.resolve("@typed-sql/ts-bridge/native-lsp")).href
    );
    await run(
      process.execPath,
      [
        typescriptPreviewCliPath(),
        "--project",
        "tsconfig.valid.json",
        "--runExternalCode",
        "--pretty",
        "false",
      ],
      join(root, grammar),
    );
    continue;
  }
  for (const file of ["src/00-playground.ts", ...(grammar === "sqlite" ? [] : ["src/json.ts"])])
    await run(
      process.execPath,
      [cli, "check", "--file", file, "--project", "tsconfig.valid.json"],
      join(root, grammar),
    );
}
