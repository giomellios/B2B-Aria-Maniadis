import type { Metadata } from "next";
import { connection } from "next/server";
import { getT } from "@/lib/i18n/server";
import { getActiveCustomer, getActiveCustomerCustomFields } from "@/features/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.account.profile.title };
}
import { ChangePasswordForm, EditProfileForm, EditEmailForm } from "@/features/account";

export default async function ProfilePage() {
  await connection();
  const [customer, customFields, dict] = await Promise.all([
    getActiveCustomer(),
    getActiveCustomerCustomFields(),
    getT(),
  ]);
  const t = dict.account.profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <EditProfileForm customer={customer} customFields={customFields} />

      <EditEmailForm currentEmail={customer?.emailAddress || ""} />

      <ChangePasswordForm />
    </div>
  );
}
