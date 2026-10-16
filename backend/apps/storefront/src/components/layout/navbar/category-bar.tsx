import { Link } from "@/lib/i18n/navigation";
import { CategoryLink } from "@/components/layout/navbar/category-link";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { getCategoryTree, type Category } from "@/lib/queries/cached";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";
import { ArrowUpRight, ChevronDown } from "@/design-system/icons";

const itemClass =
  "inline-flex h-11 shrink-0 items-center gap-1 border-b-2 border-transparent px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground/75 transition-colors duration-200 hover:text-primary";

/**
 * Second header row: "All products" + the categories (top-level Collections created in the
 * Dashboard). On desktop, hovering a category opens a full-width panel with its sub-categories;
 * on mobile the row scrolls sideways and sub-categories are listed on the category page.
 */
export async function CategoryBar() {
  const [categories, t] = await Promise.all([getCategoryTree(await getLocale()), getT()]);

  return (
    <nav aria-label={t.nav.categories} className="relative border-t border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <ul className="flex items-center overflow-x-auto [scrollbar-width:none] md:overflow-visible">
          <li>
            <CategoryLink href="/search" className={itemClass}>
              {t.nav.allProducts}
            </CategoryLink>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="group/category">
              <CategoryLink
                href={`/collection/${category.slug}`}
                className={`${itemClass} group-hover/category:border-primary group-hover/category:text-primary`}
              >
                {category.name}
                {category.children.length > 0 && (
                  <ChevronDown className="hidden size-3 transition-transform duration-200 group-hover/category:rotate-180 md:block" />
                )}
              </CategoryLink>
              {category.children.length > 0 && (
                <CategoryPanel category={category} viewAllLabel={t.nav.viewAllIn} />
              )}
            </li>
          ))}
          <li className="ml-auto pl-4">
            <a
              href={DIGITAL_CATALOGUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${itemClass} text-primary`}
            >
              {t.nav.digitalCatalogue}
              <ArrowUpRight className="size-3" />
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function CategoryPanel({ category, viewAllLabel }: { category: Category; viewAllLabel: string }) {
  return (
    <div className="invisible absolute inset-x-0 top-full hidden border-y border-border bg-background opacity-0 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.18)] transition-[opacity,visibility] duration-200 group-focus-within/category:visible group-focus-within/category:opacity-100 group-hover/category:visible group-hover/category:opacity-100 md:block">
      <div className="container mx-auto grid grid-cols-4 gap-x-10 gap-y-8 px-4 py-8">
        {category.children.map((child) => (
          <div key={child.id} className="space-y-3">
            <Link
              href={`/collection/${child.slug}`}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {child.name}
            </Link>
            {child.children.length > 0 && (
              <ul className="space-y-2">
                {child.children.map((grandchild) => (
                  <li key={grandchild.id}>
                    <Link
                      href={`/collection/${grandchild.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {grandchild.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div className="col-span-full border-t border-border pt-5">
          <Link
            href={`/collection/${category.slug}`}
            className="link-underline text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            {format(viewAllLabel, { name: category.name })}
          </Link>
        </div>
      </div>
    </div>
  );
}
