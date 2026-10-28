import { defineConfig } from "vite";
import { typedSql } from "@typed-sql/ts-bridge/vite";
export default defineConfig({
  plugins: [typedSql()],
  build: {
    lib: { entry: "src/worker.ts", formats: ["es"], fileName: () => "worker.js" },
    target: "es2024",
  },
});
