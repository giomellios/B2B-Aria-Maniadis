import { defineDashboardExtension } from "@vendure/dashboard";
import type { PageContextValue } from "@vendure/dashboard";
import { MessageSquareText } from "lucide-react";

type OrderLineWithComment = {
  id: string;
  quantity: number;
  productVariant?: { name?: string; sku?: string } | null;
  customFields?: { comment?: string | null } | null;
};

/** The order's lines that carry a customer comment (OrderLine.customFields.comment). */
function commentedLines(context: PageContextValue): OrderLineWithComment[] {
  const lines: OrderLineWithComment[] = context.entity?.lines ?? [];
  return lines.filter((line) => line.customFields?.comment?.trim());
}

function OrderLineComments({ context }: { context: PageContextValue }) {
  const lines = commentedLines(context);
  return (
    <ul className="divide-y">
      {lines.map((line) => (
        <li key={line.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">
              {line.quantity} × {line.productVariant?.name}
              {line.productVariant?.sku && (
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {line.productVariant.sku}
                </span>
              )}
            </p>
            <p className="whitespace-pre-wrap text-sm">{line.customFields?.comment}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

defineDashboardExtension({
  pageBlocks: [
    {
      id: "order-line-customer-comments",
      title: "Σχόλια πελάτη",
      location: {
        pageId: "order-detail",
        column: "main",
        position: { blockId: "order-table", order: "after" },
      },
      component: OrderLineComments,
      shouldRender: (context) => commentedLines(context).length > 0,
    },
  ],
});
