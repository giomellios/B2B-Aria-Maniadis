import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import Image from "next/image";
import { localeRedirect } from "@/lib/i18n/redirect";
import { LoginForm } from "@/features/auth";
import { Card, CardContent, CardFooter, Skeleton } from "@/design-system";
import { getActiveCustomer } from "@/features/auth/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.signIn.metaTitle, description: t.auth.signIn.metaDescription };
}

function LoginFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-4 w-40" />
        </div>
      </CardFooter>
    </Card>
  );
}

async function SignInContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [customer, resolvedParams] = await Promise.all([getActiveCustomer(), searchParams]);
  if (customer) {
    await localeRedirect("/");
  }
  const redirectTo = resolvedParams?.redirectTo as string | undefined;

  return <LoginForm redirectTo={redirectTo} />;
}

export default async function SignInPage({ searchParams }: PageProps<"/[locale]/sign-in">) {
  const t = await getT();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md space-y-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
        <div className="space-y-2 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={169}
            height={210}
            className="mx-auto mb-4 h-16 w-auto dark:brightness-0 dark:invert"
          />
          <h1 className="display text-4xl">{t.auth.signIn.title}</h1>
          <p className="text-muted-foreground">{t.auth.signIn.subtitle}</p>
        </div>
        <Suspense fallback={<LoginFormSkeleton />}>
          <SignInContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
