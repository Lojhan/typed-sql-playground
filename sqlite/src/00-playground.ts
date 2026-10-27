/**
 * SQLITE PLAYGROUND — hover query, rows, email and budget below.
 *
 * Cmd+click a SQL column to follow its schema definition.
 * Try changing SELECT columns and then inspect the downstream row type.
 * Open queries.ts for fragments, joins and a CTE; mutations.ts for writes;
 * transactions.ts, prepared.ts and batches.ts for the corresponding APIs.
 * experiments/intentional-errors.ts contains deliberate diagnostics to fix.
 * Run the SQLite: Run CRUD demo task to execute everything against a local database.
 */
import { createDatabase } from "@typed-sql/core";
import { sql } from "@typed-sql/sqlite";

// A lightweight execution boundary for inspecting inferred return types.
// Real SQLite execution is demonstrated separately in src/demo.ts.
const database = createDatabase(
  {
    async execute(): Promise<readonly unknown[]> {
      return [];
    },
  },
  {
    placeholder: (index) => "?",
    quoteIdentifier: (name) => '"' + name.replaceAll('"', '""') + '"',
  },
);

export const accountId = 1n;
export const query = sql`SELECT id,email,status FROM account WHERE id=${accountId}`;
export async function inspectRows() {
  const rows = await database.all(query);
  for (const row of rows) {
    row.email.toUpperCase();
    row.id;
    row.status;
  }
  return rows;
}

export const joined = sql`
 SELECT a.id,a.email,p.name,p.budget
 FROM account AS a
 LEFT JOIN project AS p ON p.owner_id=a.id
 WHERE a.id=${accountId}
`;
export async function inspectJoin() {
  const rows = await database.all(joined);
  for (const row of rows) {
    // LEFT JOIN makes project columns nullable. Try removing this guard.
    if (row.name !== null) row.name.toUpperCase();
    row.budget;
  }
  return rows;
}

export const email = "new@example.com";
export const inserted = sql`INSERT INTO account(id,email,status) VALUES(${42n},${email},'active') RETURNING id,email,status`;
export const updated = sql`UPDATE account SET status='suspended' WHERE id=${42n} RETURNING id,email,status`;
export const deleted = sql`DELETE FROM account WHERE id=${42n} RETURNING id,email,status`;
