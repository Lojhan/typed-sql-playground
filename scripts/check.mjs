import { join } from "node:path";
import { cli, grammars, root, run } from "./process.mjs";
for (const grammar of grammars) {
  console.log(`Checking ${grammar} query inference`);
  await run(
    process.execPath,
    [cli, "check", "--file", "src/00-playground.ts", "--project", "tsconfig.valid.json"],
    join(root, grammar),
  );
}
