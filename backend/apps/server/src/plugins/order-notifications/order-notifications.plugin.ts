import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";

import { adminApiExtensions } from "./api/api-extensions";
import { OrderNotificationsResolver } from "./api/order-notifications.resolver";
import { OrderNotificationsService } from "./services/order-notifications.service";
import "./types";

/**
 * New-order notification in the Dashboard (bell alert, like the new-registration one).
 *
 * A placed order counts as new until an administrator opens it or marks it as seen
 * (Order.customFields.adminSeenAt, internal). Shared by all administrators of the channel.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  compatibility: "^3.0.0",
  providers: [OrderNotificationsService],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [OrderNotificationsResolver],
  },
  dashboard: "./dashboard/index.tsx",
  configuration: (config) => {
    config.customFields.Order.push({
      name: "adminSeenAt",
      type: "datetime",
      nullable: true,
      internal: true,
      label: [
        { languageCode: LanguageCode.en, value: "Seen by an administrator" },
        { languageCode: LanguageCode.el, value: "Το είδε διαχειριστής" },
      ],
    });
    return config;
  },
})
export class OrderNotificationsPlugin {}
