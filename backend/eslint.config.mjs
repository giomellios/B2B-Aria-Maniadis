import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next v16 ships native flat configs, so we consume them
// directly instead of via @eslint/eslintrc's FlatCompat, which crashed with
// "Converting circular structure to JSON" when translating the React plugin.
const storefrontFiles = [
  "apps/storefront/**/*.ts",
  "apps/storefront/**/*.tsx",
  "apps/storefront/**/*.js",
  "apps/storefront/**/*.jsx",
];

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/next-env.d.ts",
    ],
  },
  // Server app + scripts: TypeScript ESLint
  {
    files: ["apps/server/**/*.ts", "apps/server/**/*.tsx", "scripts/**/*.ts", "scripts/**/*.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {},
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  // Storefront: Next.js flat config, scoped to the storefront workspace.
  ...[...nextCoreWebVitals, ...nextTypescript].map((block) => ({
    ...block,
    files: storefrontFiles,
  })),
];
