import { api, DashboardAlertDefinition, defineDashboardExtension, graphql } from '@vendure/dashboard';

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ORDERS = 8;
const FETCH_TAKE = 50;
const CACHE_TTL_MS = 15_000;
const DISMISSED_KEY = 'order-notifications:dismissed-order-ids';

function getDismissedIds(): Set<string> {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set<string>();
    }
}

function saveDismissedIds(ids: Iterable<string>) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

function addDismissedId(id: string) {
    const ids = getDismissedIds();
    ids.add(id);
    saveDismissedIds(ids);
    cache = null;
}

const recentOrdersDocument = graphql(`
    query GetRecentOrders($after: DateTime!, $take: Int!) {
        orders(
            options: {
                filter: { orderPlacedAt: { after: $after } }
                sort: { orderPlacedAt: DESC }
                take: $take
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

interface OrderItem {
    id: string;
    code: string;
    orderPlacedAt?: string | null;
    totalWithTax: number;
    currencyCode: string;
    customer?: { firstName: string; lastName: string } | null;
}

// The bell renders one alert definition per slot, and each slot's check() would
// otherwise fire its own network request. Share a single batch across all slots
// via a short-lived cache so we make one request per refresh cycle.
let cache: { at: number; orders: OrderItem[] } | null = null;
let inflight: Promise<OrderItem[]> | null = null;

async function fetchRecentOrders(): Promise<OrderItem[]> {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) {
        return cache.orders;
    }
    if (inflight) {
        return inflight;
    }
    inflight = (async () => {
        try {
            const after = new Date(now - RECENT_WINDOW_MS).toISOString();
            const result = await api.query(recentOrdersDocument, { after, take: FETCH_TAKE });
            const raw = (result.orders.items ?? []) as OrderItem[];
            // Prune remembered ids down to orders still in the recent window so the
            // dismissed set can't grow unbounded over time.
            const recentIds = new Set(raw.map(o => o.id));
            const dismissed = new Set([...getDismissedIds()].filter(id => recentIds.has(id)));
            saveDismissedIds(dismissed);
            const orders = raw.filter(o => !dismissed.has(o.id)).slice(0, MAX_ORDERS);
            cache = { at: Date.now(), orders };
            return orders;
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}

function customerName(order: OrderItem): string {
    if (!order.customer) {
        return 'Guest';
    }
    return `${order.customer.firstName} ${order.customer.lastName}`.trim() || 'Guest';
}

function formatTotal(order: OrderItem): string {
    return `${(order.totalWithTax / 100).toFixed(2)} ${order.currencyCode}`;
}

function navigateToOrder(id: string) {
    const baseUrl = ((import.meta as any).env?.BASE_URL ?? '/').replace(/\/$/, '');
    window.location.href = `${baseUrl}/orders/${id}`;
}

// Register a fixed pool of "slots". Slot i is responsible for rendering the
// i-th most recent order (if one exists) as its own row in the bell dropdown.
const orderAlerts: Array<DashboardAlertDefinition<OrderItem | null>> = Array.from(
    { length: MAX_ORDERS },
    (_unused, index): DashboardAlertDefinition<OrderItem | null> => ({
        id: `new-order-slot-${index}`,
        check: async () => {
            const orders = await fetchRecentOrders();
            return orders[index] ?? null;
        },
        shouldShow: data => data != null,
        severity: 'info',
        title: data => (data ? `Order ${data.code} — ${customerName(data)}` : ''),
        description: data => (data ? formatTotal(data) : ''),
        recheckInterval: 30_000,
        actions: [
            {
                label: 'View order',
                onClick: ({ data, dismiss }) => {
                    if (data) {
                        addDismissedId(data.id);
                        dismiss();
                        navigateToOrder(data.id);
                    }
                },
            },
            {
                label: '✕',
                onClick: ({ data, dismiss }) => {
                    if (data) {
                        addDismissedId(data.id);
                    }
                    dismiss();
                },
            },
        ],
    }),
);

defineDashboardExtension({
    alerts: orderAlerts,
});
