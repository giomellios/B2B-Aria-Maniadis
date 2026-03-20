import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

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
  ...compat.extends("next/core-web-vitals", "next/typescript").map((block) => ({
    ...block,
    files: [
      "apps/storefront/**/*.ts",
      "apps/storefront/**/*.tsx",
      "apps/storefront/**/*.js",
      "apps/storefront/**/*.jsx",
    ],
  })),
];
