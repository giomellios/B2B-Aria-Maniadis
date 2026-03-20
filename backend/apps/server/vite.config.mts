import { vendureDashboardPlugin } from "@vendure/dashboard/vite";
import { LanguageCode } from "@vendure/core";
import { join, resolve } from "path";
import { pathToFileURL } from "url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/dashboard",
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
