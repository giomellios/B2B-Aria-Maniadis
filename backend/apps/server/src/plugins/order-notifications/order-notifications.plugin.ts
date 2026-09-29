import { PluginCommonModule, VendurePlugin } from '@vendure/core';

@VendurePlugin({
    imports: [PluginCommonModule],
    dashboard: './dashboard',
})
export class OrderNotificationsPlugin {}
