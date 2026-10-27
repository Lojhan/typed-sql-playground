import { mysql } from "@typed-sql/mysql";
export default {
  dialect: mysql(),
  schema: { file: "generated/db/schema.json" },
  outDir: "generated/db",
  projects: ["tsconfig.json"],
};
