import { VendurePlugin } from "@vendure/core";

/**
 * @description
 * This plugin adds Greek (el) translations to the Vendure Dashboard UI.
 * It provides a dashboard extension directory containing the el.po
 * translation file, which is automatically picked up by the Vendure
 * Dashboard's Lingui-based translation pipeline.
 *
 * To make Greek selectable in the Dashboard UI, also configure
 * `i18n.availableLanguages` in your vite.config.mts vendureDashboardPlugin options.
 */
@VendurePlugin({
  dashboard: "./dashboard",
})
export class GreekTranslationsPlugin {}
