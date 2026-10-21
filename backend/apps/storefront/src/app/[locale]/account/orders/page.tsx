import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getT } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { localeRedirect } from "@/lib/i18n/redirect";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.account.orders.title };
}
import { getCustomerOrders } from "@/features/account/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Button,
} from "@/design-system";
import { Price } from "@/components/shared/price";
import { OrderStatusBadge, ReorderButton } from "@/features/account";
import { formatDate } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage(props: PageProps<"/[locale]/account/orders">) {
  await connection();
  const searchParams = await props.searchParams;
  const pageParam = searchParams.page;
  const currentPage = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [activeCustomer, locale, dict] = await Promise.all([
    getCustomerOrders({ take: ITEMS_PER_PAGE, skip }),
    getLocale(),
    getT(),
  ]);
  const t = dict.account.orders;
  const pageHref = (page: number) => localizePath(`/account/orders?page=${page}`, locale);

  if (!activeCustomer) {
    return localeRedirect("/sign-in");
  }

  const orders = activeCustomer.orders.items;
  const totalItems = activeCustomer.orders.totalItems;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="display text-2xl">{t.title}</h1>
        {totalItems > 0 && (
          <p className="text-sm text-muted-foreground tabular-nums">{t.orderCount(totalItems)}</p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl bg-card px-5 py-8">
          <p className="text-base">{t.empty}</p>
          <Button className="mt-5" asChild>
            <Link href="/search">{dict.cart.browse}</Link>
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="text-sm font-normal text-muted-foreground">
                  {t.orderNumber}
                </TableHead>
                <TableHead className="text-sm font-normal text-muted-foreground">
                  {t.date}
                </TableHead>
                <TableHead className="text-sm font-normal text-muted-foreground">
                  {t.status}
                </TableHead>
                <TableHead className="text-right text-sm font-normal text-muted-foreground">
                  {t.items}
                </TableHead>
                <TableHead className="text-right text-sm font-normal text-muted-foreground">
                  {t.total}
                </TableHead>
                <TableHead className="w-0">
                  <span className="sr-only">{t.again}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const pieces = order.lines.reduce((sum, line) => sum + line.quantity, 0);
                return (
                  <TableRow key={order.id} className="h-14">
                    <TableCell>
                      <Link
                        href={`/account/orders/${order.code}`}
                        className="font-medium tabular-nums hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4"
                      >
                        {order.code}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatDate(order.createdAt, "short", locale)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge state={order.state} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {t.pieces(pieces)}
                      <span className="block text-sm text-muted-foreground">
                        {t.lines(order.lines.length)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ReorderButton
                        lines={order.lines.map((line) => ({
                          variantId: line.productVariant.id,
                          quantity: line.quantity,
                        }))}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={currentPage > 1 ? pageHref(currentPage - 1) : "#"}
                      label={dict.a11y.previous}
                      ariaLabel={dict.a11y.previousPage}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink href={pageHref(page)} isActive={page === currentPage}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis label={dict.a11y.morePages} />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href={currentPage < totalPages ? pageHref(currentPage + 1) : "#"}
                      label={dict.a11y.next}
                      ariaLabel={dict.a11y.nextPage}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
