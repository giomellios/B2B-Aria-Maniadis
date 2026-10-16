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
import { ArrowRight } from "@/design-system/icons";
import { Price } from "@/components/shared/price";
import { OrderStatusBadge } from "@/features/account";
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
      <h1 className="display text-3xl md:text-4xl mb-6">{t.title}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>{t.orderNumber}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.items}</TableHead>
                  <TableHead className="text-right">{t.total}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Button asChild variant="outline">
                        <Link href={`/account/orders/${order.code}`}>
                          {order.code} <ArrowRight />
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt, "short", locale)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge state={order.state} />
                    </TableCell>
                    <TableCell>{t.itemCount(order.lines.length)}</TableCell>
                    <TableCell className="text-right">
                      <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
