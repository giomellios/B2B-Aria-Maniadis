import type { Metadata } from "next";
import { connection } from "next/server";
import { getActiveCustomer, getActiveCustomerCustomFields } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Profile",
};
import { ChangePasswordForm, EditProfileForm, EditEmailForm } from "@/features/account";

export default async function ProfilePage() {
  await connection();
  const [customer, customFields] = await Promise.all([
    getActiveCustomer(),
    getActiveCustomerCustomFields(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information</p>
      </div>

      <EditProfileForm customer={customer} customFields={customFields} />

      <EditEmailForm currentEmail={customer?.emailAddress || ""} />

      <ChangePasswordForm />
    </div>
  );
}
