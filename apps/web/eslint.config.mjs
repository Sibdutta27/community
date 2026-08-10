import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `public/` is shipped static assets, never source. It also holds the
    // pre-built admin SPA bundle, and linting ~1MB of minified output blows
    // up the formatter with `RangeError: Invalid string length`, taking the
    // whole lint run (and the pre-commit hook) down with it.
    "public/**",
  ]),
]);

export default eslintConfig;
