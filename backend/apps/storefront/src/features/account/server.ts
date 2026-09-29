import "server-only";

// Server-only public API of the account feature: data loaders and
// async server components. Import from server components / pages only.
export {
  confirmEmailAddressChange,
  getAddressBook,
  getCustomerOrders,
  getOrderDetail,
} from "@/features/account/services/account.service";
export { CreateCustomerAddressMutation } from "@/features/account/services/mutations";
export { GetCustomerAddressesQuery } from "@/features/account/services/queries";
