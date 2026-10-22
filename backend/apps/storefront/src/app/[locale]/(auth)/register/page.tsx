import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { PhotoPlaceholder } from "@/components/shared/photo-placeholder";
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
  const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 200) : undefined);

  return (
    <RegistrationForm
      redirectTo={redirectTo}
      initial={{
        company: text(resolvedParams?.company),
        emailAddress: text(resolvedParams?.email),
      }}
    />
  );
}

export default async function RegisterPage({ searchParams }: PageProps<"/[locale]/register">) {
  const t = await getT();
  const r = t.auth.register;
  return (
    <div className="frame mt-header grid gap-10 pt-8 pb-20 lg:grid-cols-12 lg:gap-5">
      <div className="lg:col-span-7 lg:pr-10">
        <h1 className="display text-[1.75rem] md:text-[2rem]">{r.title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{r.subtitle}</p>
        <div className="mt-8">
          <Suspense fallback={<RegistrationFormSkeleton />}>
            <RegisterContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <aside className="lg:col-span-5">
        <div className="space-y-2 lg:sticky lg:top-sticky">
          <PhotoPlaceholder
            label={t.common.photoPlaceholder}
            className="hidden aspect-[4/3] w-full lg:flex"
          />
          <div className="rounded-xl bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">{r.nextTitle}</h2>
            <ol className="mt-4 space-y-4">
              {r.next.map((step, i) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] gap-2 text-base">
                  <span aria-hidden className="font-semibold tabular-nums text-gold">
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
}
