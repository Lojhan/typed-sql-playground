// Deliberately broken. Fix these to watch diagnostics update live.
import { createDatabase } from "@typed-sql/core";
import { sql } from "@typed-sql/sqlite";
const database = createDatabase(
  {
    async execute(): Promise<readonly unknown[]> {
      return [];
    },
  },
  { placeholder: () => "?", quoteIdentifier: (name) => name },
);
const misspelled = sql`SELECT emial FROM account`;
const valid = sql`SELECT id,email FROM account`;
async function tryThis() {
  const rows = await database.all(valid);
  for (const row of rows) {
    const wrong: number = row.email;
    row.missingColumn;
    void wrong;
  }
}
void misspelled;
void tryThis;
