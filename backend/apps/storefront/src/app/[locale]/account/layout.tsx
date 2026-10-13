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
    <div className="container mx-auto mt-16 px-4 pt-12 pb-20 md:pt-16">
      <p className="eyebrow mb-8">{t.account.eyebrow}</p>
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <aside className="md:w-52 md:shrink-0">
          <Suspense fallback={<AccountNavList pathname={null} />}>
            <AccountNav />
          </Suspense>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
