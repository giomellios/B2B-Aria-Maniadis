import { vendureDashboardPlugin } from "@vendure/dashboard/vite";
import { LanguageCode } from "@vendure/core";
import { createRequire } from "module";
import { join, resolve } from "path";
import { pathToFileURL } from "url";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

/**
 * Every public entry point of a package (e.g. "@base-ui/react/menu"), read from its exports map.
 * Skips `internals/*`: private building blocks nobody imports directly, some of which need optional
 * peers we don't install (e.g. `internals/temporal-adapter-luxon` → `luxon`). One unresolvable entry
 * makes Vite's whole dependency pre-bundling fail, and every Dashboard request then hangs.
 */
function packageEntryPoints(pkg: string): string[] {
  const exportsMap: Record<string, unknown> = require(`${pkg}/package.json`).exports ?? {};
  return Object.keys(exportsMap)
    .filter(
      (key) => !key.includes("*") && !key.endsWith(".json") && !key.startsWith("./internals/")
    )
    .map((key) => (key === "." ? pkg : `${pkg}/${key.replace(/^\.\//, "")}`));
}

/**
 * Dev-only fix for the Dashboard intermittently loading as a white page.
 *
 * The Dashboard's own source is excluded from Vite's dependency pre-bundling (by
 * vendureDashboardPlugin), so the libraries it imports were served one file at a time: ~2,100 of
 * the ~2,700 requests of a page load (@base-ui/react alone is 631 files, date-fns 539). Each request
 * through Vendure's /dashboard proxy opens two fresh TCP connections to Vite (a liveness probe and
 * the proxied request, no keep-alive), so a few quick reloads exhausted macOS's ~16k ephemeral ports.
 * Then DashboardPlugin decided "Vite is down", served some files from dist/dashboard instead, and the
 * page broke. Pre-bundling these libraries cuts a page load to a few hundred requests.
 *
 * Every entry point the Dashboard imports must be listed (not just the package root), otherwise a
 * library loads twice (bundled + raw files) and its React contexts stop matching.
 */
const dashboardLibraries = [
  ...packageEntryPoints("@base-ui/react"),
  "date-fns",
  "date-fns/locale",
  "motion/react",
  "react-day-picker",
  "react-day-picker/locale",
  "graphql",
  "graphql/language/ast.js",
  "zod",
  "zod/v3",
  // Imported by @hookform/resolvers (zodResolver), which checks `error instanceof $ZodError` from it:
  // it must be the same zod instance as the schemas', i.e. bundled together with "zod".
  "zod/v4/core",
];

export default defineConfig({
  base: "/dashboard",
  optimizeDeps: {
    // vendureDashboardPlugin appends its own entries to this list.
    include: dashboardLibraries,
  },
  // Our own public dir (instead of the package's) so the Dashboard uses the ARIA favicon.
  publicDir: join(__dirname, "dashboard-public"),
  build: {
    outDir: join(__dirname, "dist/dashboard"),
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") return;
        defaultHandler(warning);
      },
    },
  },
  plugins: [
    vendureDashboardPlugin({
      // The vendureDashboardPlugin will scan your configuration in order
      // to find any plugins which have dashboard extensions, as well as
      // to introspect the GraphQL schema based on any API extensions
      // and custom fields that are configured.
      vendureConfigPath: pathToFileURL("./src/vendure-config.ts"),
      // Points to the location of your Vendure server.
      api: { host: "auto", port: "auto" },
      // When you start the Vite server, your Admin API schema will
      // be introspected and the types will be generated in this location.
      // These types can be used in your dashboard extensions to provide
      // type safety when writing queries and mutations.
      gqlOutputPath: "./src/gql",
      // Enable Greek (el) in the Dashboard UI language selector
      i18n: {
        availableLanguages: [
          LanguageCode.en,
          LanguageCode.de,
          LanguageCode.es,
          LanguageCode.fr,
          LanguageCode.it,
          LanguageCode.el,
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // This allows all plugins to reference a shared set of
      // GraphQL types.
      "@/gql": resolve(__dirname, "./src/gql/graphql.ts"),
    },
  },
});
