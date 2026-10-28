import { createD1Database, type D1Binding } from "@typed-sql/adapters/d1";
import { sqliteRenderer, sql } from "@typed-sql/sqlite/query";
import account, { valuePlan } from "./account.sql";

export default {
  async fetch(request: Request, env: { DB: D1Binding }) {
    const database = createD1Database(env.DB, {
      renderer: sqliteRenderer,
      profile: {
        id: "playground-d1",
        dialect: "sqlite",
        integer: "safe-number",
        jsonWire: "text",
        typePolicyHash: valuePlan.typePolicyHash,
      },
    });
    const id = Number(new URL(request.url).searchParams.get("id") ?? "1");
    if (!Number.isSafeInteger(id) || id < 1)
      return Response.json({ error: "id must be a positive safe integer" }, { status: 400 });
    const selected = await database.maybeOne(account(id));
    // Vite attaches runtime plans to inline queries as well as SQL-file imports.
    const inline = sql`SELECT email FROM account WHERE id = ${id}`;
    return Response.json({ selected, inline: await database.all(inline) });
  },
};
