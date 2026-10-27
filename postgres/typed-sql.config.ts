import { postgres } from "@typed-sql/postgres";
export default {
  dialect: postgres(),
  schema: { file: "generated/db/schema.json" },
  outDir: "generated/db",
  projects: ["tsconfig.json"],
};
