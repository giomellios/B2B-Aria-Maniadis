import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountNav, AccountNavList } from "@/features/account";
import { noIndexRobots } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  robots: noIndexRobots(),
};

export default async function AccountLayout({ children }: LayoutProps<"/[locale]/account">) {
  const t = await getT();
  return (
    <div className="frame mt-header pt-8 pb-20">
      <p className="mb-6 text-base text-muted-foreground">{t.account.eyebrow}</p>
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <aside className="md:w-56 md:shrink-0">
          <Suspense fallback={<AccountNavList pathname={null} />}>
            <AccountNav />
          </Suspense>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
