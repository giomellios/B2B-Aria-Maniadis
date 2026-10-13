import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.reset.metaTitle };
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/[locale]/reset-password">) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ResetPasswordForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
