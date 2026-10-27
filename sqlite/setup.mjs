import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
const database = new DatabaseSync(fileURLToPath(new URL("./playground.sqlite", import.meta.url)));
try {
  database.exec(
    "PRAGMA foreign_keys=ON; DROP TABLE IF EXISTS project; DROP TABLE IF EXISTS account;",
  );
  database.exec(readFileSync(new URL("./schema/001-schema.sql", import.meta.url), "utf8"));
} finally {
  database.close();
}
