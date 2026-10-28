import assert from "node:assert/strict";
import { createNodeSqliteDatabase } from "@typed-sql/sqlite/node-sqlite";
import { createClient } from "@libsql/client";
import { createLibsqlDatabase } from "@typed-sql/adapters/libsql";
import { sqliteRenderer } from "@typed-sql/sqlite/query";
import { jsonValue } from "@typed-sql/core";
import { pathToFileURL } from "node:url";
import account, { valuePlan } from "./account.sql";
import document from "./document.sql";
import jsonKind from "./json-kind.sql";
import { databasePath } from "../typed-sql.config.ts";
import { typePolicy } from "../policy.ts";

const native = await createNodeSqliteDatabase({ path: databasePath, typePolicy });
try {
  const row = await native.one(account(1));
  assert.equal(row.account.email, "alice@example.com");
  assert.deepEqual(row.account.labels, ["playground", "rc"]);
  console.log("Typed SQL-file JSON", row);
  assert.deepEqual(await native.one(jsonKind(jsonValue(null))), { kind: "null" });
  assert.deepEqual(await native.one(jsonKind(null)), { kind: null });
  console.log("JSON null and SQL NULL remain separate");
  const payload = { message: "hello", tags: ["json", "portable"] };
  assert.deepEqual(await native.one(document(jsonValue(payload))), { document: payload });
} finally {
  await native.close();
}

const client = createClient({ url: pathToFileURL(databasePath).href, intMode: "bigint" });
try {
  const database = createLibsqlDatabase(client, {
    renderer: sqliteRenderer,
    profile: {
      id: "playground-libsql",
      dialect: "sqlite",
      integer: "lossless",
      jsonWire: "text",
      typePolicyHash: valuePlan.typePolicyHash,
    },
  });
  console.log("Same factory through libSQL", await database.one(account(1)));
} finally {
  client.close();
}
