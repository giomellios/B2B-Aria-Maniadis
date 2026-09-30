import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { storefrontBoundaries } from "./eslint.boundaries.mjs";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  ...storefrontBoundaries("src"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
