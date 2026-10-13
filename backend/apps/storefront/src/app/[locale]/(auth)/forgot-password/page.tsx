import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { ForgotPasswordForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.forgot.metaTitle };
}

export default async function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
