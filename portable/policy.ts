import type { SqliteTypePolicy } from "@typed-sql/sqlite";

// One portable policy is shared by generation, local execution and the Worker.
// Number integers are required by the D1 JavaScript binding.
export const typePolicy = {
  integer: "number",
  flexible: "union",
  unknown: "unknown",
  json: "parsed",
} as const satisfies SqliteTypePolicy;
