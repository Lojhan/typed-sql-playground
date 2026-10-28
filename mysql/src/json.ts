import { sql } from "@typed-sql/mysql";

export const accountDocument = sql`
  SELECT JSON_OBJECT(
    'id', id, 'email', email, 'status', status,
    'labels', JSON_ARRAY('playground', 'rc')
  ) AS account
  FROM users WHERE id = ${1n}
`;

export const groupedAccounts = sql`
  SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'email', email)) AS accounts FROM users
`;

export const updatedDocument = sql`
  SELECT JSON_SET(JSON_OBJECT('email', email), '$.source', 'playground') AS document
  FROM users WHERE id = ${1n}
`;

export const explicitJsonNull = sql`SELECT CAST(${sql.json(null)} AS JSON) AS document`;
