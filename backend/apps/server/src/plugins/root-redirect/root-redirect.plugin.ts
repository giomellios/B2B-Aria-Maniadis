import type { NextFunction, Request, Response } from "express";
import { PluginCommonModule, VendurePlugin } from "@vendure/core";

export interface RootRedirectPluginOptions {
  /** Where `/` sends the browser. Defaults to the admin Dashboard. */
  to: string;
}

/**
 * Sends visitors of the server's bare root URL (`/`, otherwise a 404) to the admin Dashboard.
 * Only `GET`/`HEAD /` exactly is redirected; every other path (APIs, assets, /dashboard…) is untouched.
 * A temporary (302) redirect, so browsers don't cache it if the root ever gets its own page.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  configuration: (config) => {
    config.apiOptions.middleware.push({
      route: "/",
      // Registered on Express before Vendure's routes, so it sees `/` even though no controller does.
      beforeListen: true,
      handler: (req: Request, res: Response, next: NextFunction) => {
        if ((req.method === "GET" || req.method === "HEAD") && req.path === "/") {
          res.redirect(302, RootRedirectPlugin.options.to);
          return;
        }
        next();
      },
    });
    return config;
  },
  compatibility: "^3.0.0",
})
export class RootRedirectPlugin {
  static options: RootRedirectPluginOptions = { to: "/dashboard/" };

  static init(options: Partial<RootRedirectPluginOptions> = {}) {
    this.options = { ...this.options, ...options };
    return RootRedirectPlugin;
  }
}
