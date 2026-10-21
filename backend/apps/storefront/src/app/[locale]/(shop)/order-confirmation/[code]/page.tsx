import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/features/checkout/server";
import { noIndexRobots } from "@/lib/utils";
import { Skeleton } from "@/design-system";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.orderConfirmation.metaTitle, robots: noIndexRobots() };
}

export default async function OrderConfirmationPage(
  props: PageProps<"/[locale]/order-confirmation/[code]">
) {
  return (
    <Suspense
      fallback={
        <div className="frame mt-header max-w-3xl space-y-6 pt-12">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-12 w-80" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <OrderConfirmation {...props} />
    </Suspense>
  );
}
