import {
  api,
  Button,
  DataTableBulkActionItem,
  defineDashboardExtension,
  toast,
  useMutation,
  usePaginatedList,
  useQueryClient,
} from "@vendure/dashboard";
import type { BulkActionComponent, PageContextValue } from "@vendure/dashboard";
import { CheckCircle, ShieldOff } from "lucide-react";

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
