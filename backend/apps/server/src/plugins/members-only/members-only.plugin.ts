import { APP_INTERCEPTOR } from "@nestjs/core";
import { PluginCommonModule, VendurePlugin } from "@vendure/core";

import { MembersOnlyInterceptor } from "./api/members-only.interceptor";

/**
 * Members-only catalogue: the Shop API only answers signed-in customers. Callers without a session
 * (or with an expired / revoked one) get a FORBIDDEN error for everything except signing in,
 * registering and resetting a password (see PUBLIC_SHOP_OPERATIONS). Only approved customers can
 * sign in (customer-approval plugin), so products and prices are visible to approved customers only.
 *
 * The Admin API is not affected. The storefront sends the customer's token with every catalogue
 * query and hides its catalogue pages from visitors who are not signed in.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: MembersOnlyInterceptor }],
  compatibility: "^3.0.0",
})
export class MembersOnlyPlugin {}
