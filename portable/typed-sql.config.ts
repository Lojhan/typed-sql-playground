import { sqlite } from "@typed-sql/sqlite";
import { nodeSqlite } from "@typed-sql/sqlite/node-sqlite";
import { fileURLToPath } from "node:url";
import { typePolicy } from "./policy.ts";
export const databasePath = fileURLToPath(new URL("../sqlite/playground.sqlite", import.meta.url));
export default {
  dialect: sqlite({ typePolicy }),
  typePolicy,
  schema: {
    file: "generated/db/schema.json",
    provider: nodeSqlite({ path: databasePath, typePolicy }),
  },
  outDir: "generated/db",
  projects: ["tsconfig.json"],
};
