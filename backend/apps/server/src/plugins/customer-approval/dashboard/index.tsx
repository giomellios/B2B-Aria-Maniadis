import {
  api,
  Button,
  DataTableBulkActionItem,
  defineDashboardExtension,
  toast,
  useMutation,
  usePaginatedList,
  useNavigate,
  useQueryClient,
} from "@vendure/dashboard";
import type {
  AlertActionContext,
  BulkActionComponent,
  DashboardAlertDefinition,
  PageContextValue,
} from "@vendure/dashboard";
import { CheckCircle, ShieldOff, UserPlus } from "lucide-react";

import { graphql } from "@/gql";

const approveCustomerDocument = graphql(`
  mutation ApproveCustomer($id: ID!) {
    approveCustomer(id: $id) {
      id
      customFields {
        approved
      }
    }
  }
`);

const revokeCustomerApprovalDocument = graphql(`
  mutation RevokeCustomerApproval($id: ID!) {
    revokeCustomerApproval(id: $id) {
      id
      customFields {
        approved
      }
    }
  }
`);

const pendingCustomerApprovalsDocument = graphql(`
  query PendingCustomerApprovals($take: Int) {
    pendingCustomerApprovals(take: $take) {
      totalItems
      items {
        id
        firstName
        lastName
        customFields {
          company
        }
      }
    }
  }
`);

type PendingApprovals = {
  totalItems: number;
  items: Array<{
    id: string;
    firstName: string;
    lastName: string;
    customFields?: { company?: string | null } | null;
  }>;
};

const PENDING_ALERT_ID = "pending-customer-approvals";
/** The AlertsProvider keys each alert's query as ["alert", id]. */
const PENDING_ALERT_QUERY_KEY = ["alert", PENDING_ALERT_ID];

/** How many of the newest pending customers the alert names. */
const NAMED_IN_ALERT = 3;

function describePending(data: PendingApprovals | null | undefined): string {
  if (!data?.items.length) {
    return "";
  }
  const names = data.items
    .slice(0, NAMED_IN_ALERT)
    .map((c) => c.customFields?.company || `${c.firstName} ${c.lastName}`.trim());
  const more = data.totalItems - names.length;
  return `${names.join(", ")}${more > 0 ? ` και ${more} ακόμη` : ""} — περιμένουν έγκριση.`;
}

/** The alert's button: opens the customer list, where the admin approves the new accounts. */
function ViewPendingCustomersAction({ dismiss }: AlertActionContext<PendingApprovals>) {
  const navigate = useNavigate();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        dismiss();
        void navigate({ to: "/customers" });
      }}
    >
      <UserPlus className="mr-1 h-4 w-4" />
      Πελάτες
    </Button>
  );
}

/**
 * Bell notification in the Dashboard header while registered customers wait for approval.
 * Rechecked every minute; it disappears by itself once every pending customer is approved.
 * (Dismissing hides it only until the next recheck, so a pending registration is never lost.)
 */
const pendingCustomerApprovalsAlert: DashboardAlertDefinition<PendingApprovals | null> = {
  id: PENDING_ALERT_ID,
  severity: "warning",
  recheckInterval: 60_000,
  check: async () => {
    try {
      const result = await api.query(pendingCustomerApprovalsDocument, { take: NAMED_IN_ALERT });
      return result.pendingCustomerApprovals as PendingApprovals;
    } catch {
      // e.g. an administrator without the ReadCustomer permission: just show no alert.
      // (null, not undefined: TanStack Query rejects undefined query data.)
      return null;
    }
  },
  shouldShow: (data) => (data?.totalItems ?? 0) > 0,
  title: (data) =>
    data?.totalItems === 1
      ? "Νέα εγγραφή πελάτη"
      : `${data?.totalItems ?? 0} νέες εγγραφές πελατών`,
  description: describePending,
  actions: [{ component: ViewPendingCustomersAction }],
};

function CustomerApprovalButton({ context }: { context: PageContextValue }) {
  const queryClient = useQueryClient();
  const customer = context.entity;
  const approved = customer?.customFields?.approved === true;

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      if (approved) {
        await api.mutate(revokeCustomerApprovalDocument, { id });
      } else {
        await api.mutate(approveCustomerDocument, { id });
      }
    },
    onSuccess: () => {
      toast.success(approved ? "Η έγκριση ανακλήθηκε" : "Ο πελάτης εγκρίθηκε");
      // Refresh only detail pages (the customer detail query), not every query in the app.
      void queryClient.invalidateQueries({ queryKey: ["DetailPage"] });
      void queryClient.invalidateQueries({ queryKey: PENDING_ALERT_QUERY_KEY });
    },
    onError: (err: unknown) => {
      toast.error(approved ? "Αποτυχία ανάκλησης έγκρισης" : "Αποτυχία έγκρισης πελάτη", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  // Guests (no user account) cannot log in, so there is nothing to approve.
  if (!customer?.id || !customer.user) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={approved ? "outline" : "default"}
      onClick={() => mutate(String(customer.id))}
      disabled={isPending}
    >
      {approved ? <ShieldOff className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
      {isPending ? "…" : approved ? "Ανάκληση έγκρισης" : "Έγκριση πελάτη"}
    </Button>
  );
}

const ApproveCustomersBulkAction: BulkActionComponent<{ id: string }> = ({ selection, table }) => {
  const queryClient = useQueryClient();
  const { refetchPaginatedList } = usePaginatedList();
  const { mutate, isPending } = useMutation({
    mutationFn: async (ids: string[]) => {
      // approveCustomer is idempotent, so already-approved customers are simply skipped.
      for (const id of ids) {
        await api.mutate(approveCustomerDocument, { id });
      }
    },
    onSuccess: (_data: unknown, ids: string[]) => {
      toast.success(`Εγκρίθηκαν ${ids.length} πελάτες`);
      table.resetRowSelection();
      refetchPaginatedList();
      void queryClient.invalidateQueries({ queryKey: PENDING_ALERT_QUERY_KEY });
    },
    onError: (err: unknown) => {
      toast.error("Αποτυχία έγκρισης πελατών", {
        description: err instanceof Error ? err.message : undefined,
      });
      refetchPaginatedList();
    },
  });

  return (
    <DataTableBulkActionItem
      onClick={() => mutate(selection.map((c) => String(c.id)))}
      label={isPending ? "Έγκριση…" : `Έγκριση (${selection.length})`}
      icon={CheckCircle}
      requiresPermission={["UpdateCustomer"]}
    />
  );
};

defineDashboardExtension({
  alerts: [pendingCustomerApprovalsAlert],
  actionBarItems: [
    {
      pageId: "customer-detail",
      requiresPermission: ["UpdateCustomer"],
      position: { itemId: "save-button", order: "before" },
      component: CustomerApprovalButton,
    },
  ],
  dataTables: [
    {
      pageId: "customer-list",
      bulkActions: [{ order: 100, component: ApproveCustomersBulkAction }],
    },
  ],
});
