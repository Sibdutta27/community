import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // `src/config/env.ts` throws at import time when this is unset, which is
    // the behaviour we want in a real build — but it means any module that
    // transitively imports it cannot be tested without a value here.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://api.test",
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
