import type { Metadata } from "next";
import { connection } from "next/server";
import { getT } from "@/lib/i18n/server";
import { getAddressBook } from "@/features/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.account.addresses.title };
}
import { AddressesClient } from "@/features/account";

export default async function AddressesPage() {
  await connection();

  const [{ addresses, countries }, dict] = await Promise.all([getAddressBook(), getT()]);
  const t = dict.account.addresses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <AddressesClient addresses={addresses} countries={countries} />
    </div>
  );
}
