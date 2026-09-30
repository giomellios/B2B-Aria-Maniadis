import type { CustomCustomerFields } from "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomCustomerFields {
    /** Set only by an administrator (approveCustomer / revokeCustomerApproval). */
    approved: boolean;
    vatNumber: string;
    company: string;
  }
}

export type { CustomCustomerFields };
