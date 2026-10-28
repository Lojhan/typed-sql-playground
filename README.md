# typed-sql playground

Explore SQL inference and editor feedback with SQLite, PostgreSQL, and MySQL examples. SQLite also runs real queries against a disposable local database.

Application dependencies are pinned to **2.3.0-rc.1 from npm**, including JSON codecs and portable adapters. `release.json` also pins [the matching source commit](https://github.com/Lojhan/typed-sql/commit/0875667b09275f3113484ca75d291557d532ded2) for building the local editor extension. The editor and SQL-file integration use the experimental TypeScript **7.1.0-beta** backend; the ordinary compile-time checker uses TypeScript 7.0.2.

## Requirements

- Node.js **24.11.1** is the tested version (`.nvmrc`). SQL-file imports require Node 24.11.1+ or 25.1+. The SQLite catalog must also support the SQLite version bundled with Node; SQLite 3.54 remains outside this release’s reviewed range.
- pnpm 10.32.1, Git, and Go 1.27.3 (the upstream module declares that Go toolchain).
- VS Code 1.140.0 is the version exercised by the upstream host tests.
- Internet access for the pinned source and dependency downloads.

## Start

```sh
git clone https://github.com/Lojhan/typed-sql-playground.git
cd typed-sql-playground
pnpm install --frozen-lockfile
pnpm run setup
pnpm check
pnpm demo
pnpm editor:install
pnpm open
```

`pnpm run setup` creates ignored `.upstream/` and `.runtime/` directories, builds the editor SDK and VSIX for the current machine, installs the pinned npm packages, generates declarations, and resets the local SQLite database to its two seeded accounts. Rerunning setup resets that disposable database. It does not connect to PostgreSQL or MySQL.

`pnpm editor:install` explicitly installs Microsoft's `TypeScriptTeam.native-preview@1.0.1` and the locally built typed-sql VSIX into your usual VS Code profile. The generated `.runtime/playground.code-workspace` selects Microsoft's client with the typed-sql SDK as its backend. Keep VS Code's built-in TypeScript extension enabled; it coordinates with the native extension. Trust the workspace so its local configuration can run. Then run **TypeScript: Select TypeScript Version** from the command palette and choose **Use Workspace Version** to allow the workspace SDK. Microsoft requires this extra choice for a workspace-provided executable.

On Windows, install the native extension with:

```sh
code --install-extension TypeScriptTeam.native-preview@1.0.1
```

Then run **Extensions: Install from VSIX…** inside VS Code and choose `.runtime/typed-sql-vscode.vsix`. Open `.runtime/playground.code-workspace`. This manual step avoids shell-specific `.cmd` launching in the installer script.

The root `typed-sql.code-workspace` is the portable template; use `pnpm open` to open the generated workspace that contains your platform's SDK path. Make sure `node` on VS Code's PATH is the same supported Node version used during setup.

## Try the developer experience

Start with `sqlite/src/00-playground.ts`. Hover `query`, inspect the return type of `inspectRows`, and try member completion on a row. Change a selected column and watch the downstream type change. Follow a SQL column to its generated schema definition.

Each grammar folder includes:

| File                                | Cases                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `src/00-playground.ts`              | SELECT, nullable LEFT JOIN, INSERT, UPDATE, DELETE                         |
| `src/queries.ts`                    | Conditional fragments, joins, parameters, CTE and aggregation              |
| `src/mutations.ts`                  | Inserts, updates, deletes and dialect-specific returning behavior          |
| `src/transactions.ts`               | Transaction boundary examples                                              |
| `src/cardinality.ts`                | One, maybe-one and many results                                            |
| `src/prepared.ts`                   | Prepared query examples                                                    |
| `src/batches.ts`                    | Batch construction                                                         |
| `experiments/intentional-errors.ts` | Deliberate misspelled SQL column, invalid assignment, missing row property |

The `00-playground.ts` files use a mock execution boundary to inspect inference. They do not execute those example statements. PostgreSQL and MySQL use committed schema snapshots and require no database server.

`sqlite/src/demo.ts` executes SELECT, JOIN, CTE, INSERT RETURNING, UPDATE RETURNING and DELETE RETURNING against a real local SQLite database. Run `pnpm demo`, or **Cmd+Shift+B** / **Ctrl+Shift+B** with a SQLite file active. The demo creates and deletes its temporary account, preserving the two seeds. `pnpm reset` restores the database if you experiment with writes.

The intentional-error files are included in the editor project so you can fix their diagnostics. They are excluded from `tsconfig.valid.json`; the checked examples use typed-sql's compiler because ordinary TypeScript alone does not transform SQL query types.

## JSON, SQL files, and portable adapters

Open `postgres/src/json.ts` or `mysql/src/json.ts` for JSON constructors, aggregates, paths, mutations, and explicit JSON null parameters. These are checked against the committed snapshots without connecting to a server.

The `portable/` workspace uses the same local SQLite database with a parsed JSON policy. Hover the imported factories and their results in `portable/src/00-playground.ts`. SQL files export typed query factories and runtime value plans; the plans validate and decode JSON results.

```sh
pnpm demo:portable
pnpm build:worker
```

The portable demo executes `account.sql` through both Node SQLite and a local libSQL client. It also checks structured JSON parameters and the distinction between JSON null and SQL NULL. `src/worker.ts` reuses that factory with a D1 binding and includes an inline query transformed by Vite. The worker build is local; it does not create or deploy a Cloudflare resource. The application policy uses numeric integers and parsed JSON. D1 uses a safe-number wire profile; libSQL uses its required bigint transport and a lossless wire profile. Runtime plans apply the shared application policy to both.

Dynamic repeated fragments that can alter result shape remain conservatively typed. These examples do not imply precision for every mapped projection.

## Checks and formatting

```sh
pnpm check
pnpm demo
pnpm demo:portable
pnpm build:worker
pnpm format
pnpm format:check
```

`pnpm check` checks each grammar’s curated `00-playground.ts` and PostgreSQL/MySQL JSON examples through the typed-sql compiler, and checks the portable project through the native TypeScript content mapper. Generated declarations are committed for browsing and regenerated by setup. Biome formats all supported source and configuration files; installed dependencies and build caches are ignored. No database file, dependency tree, platform executable, credential, or local editor profile is committed.

## License

MIT. The SQL API examples are adapted from the [typed-sql](https://github.com/Lojhan/typed-sql) repository, also MIT licensed.
