import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { Card, CardContent, CardFooter, Button } from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { Clock } from "@/design-system/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t.auth.verifyPending.metaTitle,
    description: t.auth.verifyPending.metaDescription,
  };
}

async function VerifyPendingContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedParams, t] = await Promise.all([searchParams, getT()]);
  const redirectTo = resolvedParams?.redirectTo as string | undefined;

  const signInHref = redirectTo
    ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/sign-in";

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-accent text-primary">
            <Clock className="size-6" />
          </span>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="display text-3xl">{t.auth.verifyPending.title}</h1>
          <p className="text-muted-foreground">{t.auth.verifyPending.text}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link href={signInHref} className="w-full">
          <Button className="w-full">{t.auth.verifyPending.goToSignIn}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default async function VerifyPendingPage({
  searchParams,
}: PageProps<"/[locale]/verify-pending">) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-sticky pb-16">
      <div className="w-full max-w-md space-y-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
        <Suspense fallback={null}>
          <VerifyPendingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
