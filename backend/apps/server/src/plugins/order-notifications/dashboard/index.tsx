import {
  api,
  Button,
  defineDashboardExtension,
  useMutation,
  useNavigate,
  useQueryClient,
} from "@vendure/dashboard";
import type {
  AlertActionContext,
  DashboardAlertDefinition,
  PageContextValue,
} from "@vendure/dashboard";
import { CheckCheck, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

import { graphql } from "@/gql";

const unseenOrdersDocument = graphql(`
  query UnseenOrders($take: Int) {
    unseenOrders(take: $take) {
      totalItems
      items {
        id
        code
        orderPlacedAt
        totalWithTax
        currencyCode
        customer {
          id
          firstName
          lastName
          customFields {
            company
          }
        }
      }
    }
  }
`);

const markOrdersSeenDocument = graphql(`
  mutation MarkOrdersSeen($ids: [ID!], $placedUpTo: DateTime) {
    markOrdersSeen(ids: $ids, placedUpTo: $placedUpTo)
  }
`);

type UnseenOrders = {
  totalItems: number;
  items: Array<{
    id: string;
    code: string;
    orderPlacedAt?: string | null;
    totalWithTax: number;
    currencyCode: string;
    customer?: {
      firstName: string;
      lastName: string;
      customFields?: { company?: string | null } | null;
    } | null;
  }>;
};

const NEW_ORDERS_ALERT_ID = "new-orders";
/** The AlertsProvider keys each alert's query as ["alert", id]. */
const NEW_ORDERS_ALERT_QUERY_KEY = ["alert", NEW_ORDERS_ALERT_ID];

/** How many of the newest orders the alert names. */
const NAMED_IN_ALERT = 3;

function formatMoney(minorUnits: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: currencyCode }).format(
      minorUnits / 100
    );
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${currencyCode}`;
  }
}

function describeOrders(data: UnseenOrders | null | undefined): string {
  if (!data?.items.length) {
    return "";
  }
  const lines = data.items.slice(0, NAMED_IN_ALERT).map((order) => {
    const who =
      order.customer?.customFields?.company?.trim() ||
      `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim();
    return [order.code, who, formatMoney(order.totalWithTax, order.currencyCode)]
      .filter(Boolean)
      .join(" · ");
  });
  const more = data.totalItems - lines.length;
  return `${lines.join(", ")}${more > 0 ? ` και ${more} ακόμη` : ""}`;
}

/** Opens the order itself when there is one, otherwise the order list. */
function ViewOrdersAction({ data, dismiss }: AlertActionContext<UnseenOrders | null>) {
  const navigate = useNavigate();
  const only = data?.totalItems === 1 ? data.items[0] : undefined;
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        dismiss();
        void navigate({ to: only ? `/orders/${only.id}` : "/orders" });
      }}
    >
      <ShoppingBag className="mr-1 h-4 w-4" />
      {only ? "Άνοιγμα" : "Παραγγελίες"}
    </Button>
  );
}

/** Marks what the alert showed as seen: every unseen order placed up to the newest one listed. */
function MarkSeenAction({ data }: AlertActionContext<UnseenOrders | null>) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.mutate(markOrdersSeenDocument, {
        placedUpTo: data?.items[0]?.orderPlacedAt ?? new Date().toISOString(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NEW_ORDERS_ALERT_QUERY_KEY });
    },
  });
  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={() => mutate()}>
      <CheckCheck className="mr-1 h-4 w-4" />
      Τις είδα
    </Button>
  );
}

/**
 * Bell notification in the Dashboard header while placed orders wait to be seen by an admin.
 * Rechecked every minute; an order stops counting as new once someone opens it or clicks "Τις είδα".
 * (Dismissing hides it only until the next recheck, so a new order is never missed.)
 */
const newOrdersAlert: DashboardAlertDefinition<UnseenOrders | null> = {
  id: NEW_ORDERS_ALERT_ID,
  severity: "info",
  recheckInterval: 60_000,
  check: async () => {
    try {
      const result = await api.query(unseenOrdersDocument, { take: NAMED_IN_ALERT });
      return result.unseenOrders as UnseenOrders;
    } catch {
      // e.g. an administrator without the ReadOrder permission: just show no alert.
      // (null, not undefined: TanStack Query rejects undefined query data.)
      return null;
    }
  },
  shouldShow: (data) => (data?.totalItems ?? 0) > 0,
  title: (data) =>
    data?.totalItems === 1 ? "Νέα παραγγελία" : `${data?.totalItems ?? 0} νέες παραγγελίες`,
  description: describeOrders,
  actions: [{ component: ViewOrdersAction }, { component: MarkSeenAction }],
};

/**
 * Renders nothing: opening an order's page marks it as seen, so it leaves the new-order alert.
 * (Mounted as an invisible action-bar item, the only per-page hook that has no visible frame.)
 */
function MarkOrderSeenOnOpen({ context }: { context: PageContextValue }) {
  const queryClient = useQueryClient();
  const orderId = context.entity?.id as string | undefined;
  useEffect(() => {
    // The server only marks placed, unseen orders, so drafts and seen orders are a no-op.
    if (!orderId) {
      return;
    }
    api
      .mutate(markOrdersSeenDocument, { ids: [orderId] })
      .then((result) => {
        if (result.markOrdersSeen > 0) {
          void queryClient.invalidateQueries({ queryKey: NEW_ORDERS_ALERT_QUERY_KEY });
        }
      })
      .catch(() => {
        // Not being able to mark it (e.g. no permission) must never disturb the order page.
      });
  }, [orderId, queryClient]);
  return null;
}

defineDashboardExtension({
  alerts: [newOrdersAlert],
  actionBarItems: [
    {
      pageId: "order-detail",
      requiresPermission: ["ReadOrder"],
      component: MarkOrderSeenOnOpen,
    },
  ],
});
