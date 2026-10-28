import { sql } from "@typed-sql/postgres";

// Hover the query: nested JSON fields follow PostgreSQL's JSON serialization,
// so a SQL bigint inside a JSON document becomes a JavaScript number.
export const accountDocument = sql`
  SELECT jsonb_build_object(
    'id', id, 'email', email, 'status', status,
    'labels', jsonb_build_array('playground', 'rc')
  ) AS account
  FROM users WHERE id = ${1n}
`;

export const groupedAccounts = sql`
  SELECT jsonb_agg(jsonb_build_object('id', id, 'email', email)) AS accounts FROM users
`;

export const selectedJsonPath = sql`
  SELECT jsonb_build_object('name', email, 'labels', jsonb_build_array('example'))->>'name' AS name
  FROM users WHERE id = ${1n}
`;

// JSON null is explicit; ordinary interpolated null remains SQL NULL.
export const explicitJsonNull = sql`SELECT ${sql.json(null)}::jsonb AS document`;
