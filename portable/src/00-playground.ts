import account from "./account.sql";
import document from "./document.sql";
import jsonKind from "./json-kind.sql";
import { jsonValue } from "@typed-sql/core";

// Hover these factories and queries. The .sql frontend supplies both inferred
// TypeScript declarations and the runtime value plans consumed by adapters.
export const selected = account(1);
export const structuredInput = document(
  jsonValue({ message: "hello", tags: ["json", "portable"] }),
);
export const jsonNull = jsonKind(jsonValue(null));
export const sqlNull = jsonKind(null);
