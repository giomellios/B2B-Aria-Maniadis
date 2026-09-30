import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { storefrontBoundaries } from "./apps/storefront/eslint.boundaries.mjs";

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
  // Storefront: Next.js config
  ...[...nextVitals, ...nextTs].map((block) => ({
    ...block,
    files: [
      "apps/storefront/**/*.ts",
      "apps/storefront/**/*.tsx",
      "apps/storefront/**/*.js",
      "apps/storefront/**/*.jsx",
    ],
  })),
  ...storefrontBoundaries("apps/storefront/src"),
];
