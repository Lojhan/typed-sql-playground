import { join } from "node:path";
import { root, run, runtime } from "./process.mjs";
await run(
  process.execPath,
  [join(runtime, "node_modules/vite/bin/vite.js"), "build", "--config", "vite.config.ts"],
  join(root, "portable"),
);
