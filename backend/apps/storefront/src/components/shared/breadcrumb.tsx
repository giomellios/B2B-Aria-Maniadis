import { Fragment } from "react";
import { Link } from "@/lib/i18n/navigation";
import { ChevronRight } from "@/design-system/icons";

export interface BreadcrumbItem {
  label: string;
  /** Omitted for the current page. */
  href?: string;
}

/** "Αρχική › Καπέλα › Τζόκεϊ" */
export function Breadcrumb({ items, label }: { items: BreadcrumbItem[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <li aria-hidden>
                <ChevronRight className="size-3" />
              </li>
            )}
            <li>
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
