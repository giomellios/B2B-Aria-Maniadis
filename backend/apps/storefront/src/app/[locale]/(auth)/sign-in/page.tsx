import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { PhotoPlaceholder } from "@/components/shared/photo-placeholder";
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
    <div className="frame mt-header grid gap-10 pt-8 pb-20 lg:grid-cols-12 lg:gap-5">
      <div className="lg:col-span-5 lg:pr-10 lg:pt-10">
        <h1 className="display text-[1.75rem] md:text-[2rem]">{t.auth.signIn.title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{t.auth.signIn.subtitle}</p>
        <div className="mt-8">
          <Suspense fallback={<LoginFormSkeleton />}>
            <SignInContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <div className="relative hidden lg:col-span-7 lg:block">
        <PhotoPlaceholder
          label={t.common.photoPlaceholder}
          className="h-[calc(100svh-var(--spacing-header)-5rem)] min-h-[32rem] w-full"
        />
        <p className="absolute bottom-3 left-3 max-w-sm rounded-lg bg-background p-5 text-base">
          {t.auth.signIn.photoCaption}
        </p>
      </div>
    </div>
  );
}
