import { api, DashboardAlertDefinition, defineDashboardExtension, graphql } from '@vendure/dashboard';

// Show orders placed within this rolling window in the notifications bell.
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

const recentOrdersDocument = graphql(`
    query GetRecentOrders($after: DateTime!) {
        orders(
            options: {
                filter: { orderPlacedAt: { after: $after } }
                sort: { orderPlacedAt: DESC }
                take: 10
            }
        ) {
            items {
                id
                code
                orderPlacedAt
                totalWithTax
                currencyCode
                customer {
                    firstName
                    lastName
                }
            }
            totalItems
        }
    }
`);

interface RecentOrdersAlertData {
    totalItems: number;
    items: Array<{
        code: string;
        totalWithTax: number;
        currencyCode: string;
        customer?: { firstName: string; lastName: string } | null;
    }>;
}

const recentOrdersAlert: DashboardAlertDefinition<RecentOrdersAlertData> = {
    id: 'new-orders-alert',
    check: async () => {
        const after = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
        const result = await api.query(recentOrdersDocument, { after });
        return {
            totalItems: result.orders.totalItems,
            items: result.orders.items,
        };
    },
    shouldShow: data => (data?.totalItems ?? 0) > 0,
    severity: 'info',
    title: data => `${data?.totalItems ?? 0} new order${data?.totalItems === 1 ? '' : 's'} (last 24h)`,
    description: data =>
        (data?.items ?? [])
            .map(item => {
                const customerName = item.customer
                    ? `${item.customer.firstName} ${item.customer.lastName}`.trim() || 'Guest'
                    : 'Guest';
                const total = (item.totalWithTax / 100).toFixed(2);
                return `${item.code} — ${customerName} (${total} ${item.currencyCode})`;
            })
            .join('\n'),
    recheckInterval: 30_000,
    actions: [
        {
            label: 'View orders',
            onClick: ({ dismiss }) => {
                dismiss();
                window.location.href = '/orders';
            },
        },
    ],
};

defineDashboardExtension({
    alerts: [recentOrdersAlert],
});
