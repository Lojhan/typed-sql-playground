import { join } from "node:path";
import { createRequire } from "node:module";
import { root, run, runtime } from "./process.mjs";
const require = createRequire(join(runtime, "package.json"));
await run(
  process.execPath,
  ["--import", require.resolve("@typed-sql/ts-bridge/sql-register"), "src/demo.ts"],
  join(root, "portable"),
);
