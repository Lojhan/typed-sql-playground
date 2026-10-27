import { join } from "node:path";
import { root, run, runtime } from "./process.mjs";
await run(
  process.execPath,
  ["--import", join(runtime, "node_modules/tsx/dist/loader.mjs"), "src/demo.ts"],
  join(root, "sqlite"),
);
