import { Suspense } from "react";
import { confirmEmailAddressChange } from "@/features/account/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedParams, dict] = await Promise.all([searchParams, getT()]);
  const t = dict.account.verifyEmail;
  const tokenParam = resolvedParams.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  if (!token) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t.invalidTitle}</CardTitle>
          <CardDescription>{t.invalidText}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.invalidHelp}</p>
          <Button asChild>
            <Link href="/account/profile">{t.goToProfile}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  let updateResult;
  try {
    updateResult = await confirmEmailAddressChange(token);
  } catch {
    updateResult = null;
  }

  if (!updateResult) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t.errorTitle}</CardTitle>
          <CardDescription>{t.errorText}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.errorHelp}</p>
          <Button asChild>
            <Link href="/account/profile">{t.goToProfile}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (updateResult.__typename === "Success") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t.successTitle}</CardTitle>
          <CardDescription>{t.successText}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.successHelp}</p>
          <Button asChild>
            <Link href="/account/profile">{t.goToProfile}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t.failedTitle}</CardTitle>
        <CardDescription>{updateResult.message || t.failedText}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{t.failedHelp}</p>
        <Button asChild>
          <Link href="/account/profile">{t.goToProfile}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

async function VerifyingCard() {
  const t = (await getT()).account.verifyEmail;
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t.verifying}</CardTitle>
        <CardDescription>{t.verifyingText}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/[locale]/account/verify-email">) {
  return (
    <div>
      <Suspense fallback={<VerifyingCard />}>
        <VerifyEmailContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
