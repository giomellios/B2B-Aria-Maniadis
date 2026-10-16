import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import Image from "next/image";
import { localeRedirect } from "@/lib/i18n/redirect";
import { RegistrationForm } from "@/features/auth";
import { Card, CardContent, CardFooter, Skeleton } from "@/design-system";
import { getActiveCustomer } from "@/features/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.register.metaTitle, description: t.auth.register.metaDescription };
}

function RegistrationFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 mt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-44 mx-auto" />
      </CardFooter>
    </Card>
  );
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [customer, resolvedParams] = await Promise.all([getActiveCustomer(), searchParams]);
  if (customer) {
    await localeRedirect("/");
  }
  const redirectTo = resolvedParams?.redirectTo as string | undefined;

  return <RegistrationForm redirectTo={redirectTo} />;
}

export default async function RegisterPage({ searchParams }: PageProps<"/[locale]/register">) {
  const t = await getT();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-sticky pb-16">
      <div className="w-full max-w-md space-y-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
        <div className="space-y-2 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={169}
            height={210}
            className="mx-auto mb-4 h-16 w-auto dark:brightness-0 dark:invert"
          />
          <h1 className="display text-4xl">{t.auth.register.title}</h1>
          <p className="text-muted-foreground">{t.auth.register.subtitle}</p>
        </div>
        <Suspense fallback={<RegistrationFormSkeleton />}>
          <RegisterContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
