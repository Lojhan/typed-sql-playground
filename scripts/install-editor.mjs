import { join } from "node:path";
import { root, run, runtime } from "./process.mjs";
if (process.platform === "win32") {
  throw new Error(
    "On Windows, install TypeScriptTeam.native-preview@1.0.1 with code --install-extension, then use VS Code's Extensions: Install from VSIX command with .runtime/typed-sql-vscode.vsix. See README.md.",
  );
}
await run("code", ["--install-extension", "TypeScriptTeam.native-preview@1.0.1"]);
await run("code", ["--install-extension", join(runtime, "typed-sql-vscode.vsix")]);
console.log(`Open ${join(root, ".runtime/playground.code-workspace")} in VS Code.`);
