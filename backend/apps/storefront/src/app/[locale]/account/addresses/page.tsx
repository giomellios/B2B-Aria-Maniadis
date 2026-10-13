import type { Metadata } from "next";
import { connection } from "next/server";
import { getAddressBook } from "@/features/account/server";

export const metadata: Metadata = {
  title: "Addresses",
};
import { AddressesClient } from "@/features/account";

export default async function AddressesPage() {
  await connection();

  const { addresses, countries } = await getAddressBook();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Addresses</h1>
        <p className="text-muted-foreground mt-2">
          Manage your saved shipping and billing addresses
        </p>
      </div>

      <AddressesClient addresses={addresses} countries={countries} />
    </div>
  );
}
