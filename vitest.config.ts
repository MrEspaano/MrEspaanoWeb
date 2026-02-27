import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  cacheDir: ".vite",
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
