import type { CustomOrderFields } from "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomOrderFields {
    /** When an administrator first saw this placed order (opened it, or marked it as seen). */
    adminSeenAt: Date | null;
  }
}

export type { CustomOrderFields };
