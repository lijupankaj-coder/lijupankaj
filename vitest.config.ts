import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: { reporter: ["text", "json-summary"] }
  },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname, "server-only": new URL("./tests/server-only.ts", import.meta.url).pathname } }
});
