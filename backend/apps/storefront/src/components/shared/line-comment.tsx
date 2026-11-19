import { cn } from "@/lib/utils";

/** The customer's comment on an order line (OrderLine.customFields.comment), if any. */
export function LineComment({
  comment,
  label,
  className,
}: {
  comment?: string | null;
  label: string;
  className?: string;
}) {
  if (!comment?.trim()) return null;
  return (
    <p className={cn("whitespace-pre-wrap break-words text-sm text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{label}:</span> {comment}
    </p>
  );
}
