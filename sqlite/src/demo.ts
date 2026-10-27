import { typePolicy } from "@typed-sql/sqlite";
import { createNodeSqliteDatabase } from "@typed-sql/sqlite/node-sqlite";
import { databasePath } from "../typed-sql.config.js";
import { accountById, accountProjectSummary, activeAccounts } from "./queries.js";
import { insertAccount, updateAccountStatus, deleteAccount } from "./mutations.js";
import { sql } from "@typed-sql/sqlite";

const db = await createNodeSqliteDatabase({ path: databasePath, typePolicy });
try {
  console.log("SELECT one", await db.maybeOne(accountById(1n)));
  console.log("JOIN + conditional fragments", await db.all(activeAccounts));
  console.log("CTE + aggregate", await db.all(accountProjectSummary));
  await db.execute(sql`DELETE FROM account WHERE id=${99n}`);
  const inserted = await db.one(
    insertAccount({ id: 99n, email: "you@example.com", status: "active" }),
  );
  console.log("INSERT RETURNING", inserted);
  const updated = await db.one(updateAccountStatus(99n, "suspended"));
  console.log("UPDATE RETURNING", updated);
  const deleted = await db.one(deleteAccount(99n));
  console.log("DELETE RETURNING", deleted);
  console.log("Done. The original two accounts remain.");
} finally {
  await db.close();
}
