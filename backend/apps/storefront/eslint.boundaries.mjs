/**
 * Import boundaries for the feature-based layout (see README "Architecture").
 * Shared by apps/storefront/eslint.config.mjs and the workspace-root eslint.config.mjs,
 * so `prefix` is the path from the config file to `src/`.
 *
 * `no-restricted-imports` options are replaced (not merged) by later config blocks, so every
 * block below lists the complete set of patterns for the files it matches.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const featuresDir = join(dirname(fileURLToPath(import.meta.url)), "src/features");
const features = readdirSync(featuresDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const noParentImports = {
  group: ["../*"],
  message: 'Use the "@/..." alias instead of parent-relative imports.',
};
const noDesignSystemInternals = {
  regex: "^@/design-system/(?!icons$).+",
  message:
    'Import primitives from the design system\'s public API: "@/design-system" (icons: "@/design-system/icons").',
};
/** Icons come only from "@/design-system/icons" (Phosphor); lucide is the Vendure Dashboard's set. */
const noIconPackages = {
  regex: "^(lucide-react|@phosphor-icons/react)(/|$)",
  message: 'Import icons from "@/design-system/icons".',
};
const noLucide = {
  regex: "^lucide-react(/|$)",
  message: "The storefront uses Phosphor icons (see design-system/icons.ts), not lucide.",
};
/** Deep imports into a feature, except the feature itself (`own`) and its public entry points. */
const noFeatureInternals = (own) => ({
  regex: own ? `^@/features/(?!${own}/)[^/]+/(?!server$).+` : "^@/features/[^/]+/(?!server$).+",
  message:
    'Import other features through their public API: "@/features/<name>" (client-safe) or "@/features/<name>/server".',
});
const noRoutes = {
  regex: "^@/app/",
  message: "Nothing imports from app/ (routes); move shared code into a feature or lib/.",
};
const noFeatures = {
  regex: "^@/features(/|$)",
  message: "Shared layers (design-system, components/shared, lib) cannot depend on features.",
};
const noAppShell = {
  regex: "^@/components/(layout|providers)/",
  message: "Shared layers cannot depend on the app shell.",
};
const noComponents = {
  regex: "^@/components/",
  message: "The design system only depends on lib/ and third-party packages.",
};

const restrict = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns: [noParentImports, ...patterns] }],
});

export function storefrontBoundaries(prefix = "src") {
  const ts = (glob) => `${prefix}/${glob}/**/*.{ts,tsx}`;
  return [
    {
      // Routes and the app shell compose features through their public APIs.
      files: [ts("app"), ts("components/layout"), ts("components/providers")],
      rules: restrict(noDesignSystemInternals, noIconPackages, noFeatureInternals(), noRoutes),
    },
    ...features.map((feature) => ({
      files: [ts(`features/${feature}`)],
      rules: restrict(
        noDesignSystemInternals,
        noIconPackages,
        noFeatureInternals(feature),
        noRoutes
      ),
    })),
    {
      files: [ts("components/shared"), ts("lib")],
      rules: restrict(noDesignSystemInternals, noIconPackages, noFeatures, noRoutes, noAppShell),
    },
    {
      // Inside the design system, primitives import each other by direct path (no barrel cycles).
      files: [ts("design-system")],
      rules: restrict(noFeatures, noRoutes, noComponents, noLucide),
    },
  ];
}
