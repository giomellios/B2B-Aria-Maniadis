import "server-only";

// Server-only public API of the auth feature: data loaders and
// async server components. Import from server components / pages only.
export {
  getActiveCustomer,
  getActiveCustomerCustomFields,
  requireActiveCustomer,
} from "@/features/auth/services/customer.service";
