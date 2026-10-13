import { getT } from "@/lib/i18n/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from "@/design-system";

export default async function OrdersLoading() {
  const t = (await getT()).account.orders;
  return (
    <div>
      <h1 className="display text-3xl md:text-4xl mb-6">{t.title}</h1>

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
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-9 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
