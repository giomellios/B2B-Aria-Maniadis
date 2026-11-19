import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-field min-h-20 w-full min-w-0 rounded-md border border-transparent px-3 py-2 text-base transition-[color,background-color,border-color,box-shadow] duration-200 outline-none hover:bg-field-hover disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:bg-field-hover focus-visible:ring-ring/60 focus-visible:ring-2",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
