"use client";

import { use, useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/services/reset-password.actions";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

interface ResetPasswordFormProps {
  searchParams: Promise<{ token?: string }>;
}

export function ResetPasswordForm({ searchParams }: ResetPasswordFormProps) {
  const params = use(searchParams);
  const token = params.token || null;

  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);
  const t = useT().auth;

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.reset.invalidTitle}</CardTitle>
          <CardDescription>{t.reset.invalidText}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              {t.reset.requestNew}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.reset.title}</CardTitle>
        <CardDescription>{t.reset.text}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t.newPassword}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t.reset.submitting : t.reset.submit}
          </Button>
          <Link
            href="/sign-in"
            className="text-sm text-center text-muted-foreground hover:text-primary"
          >
            {t.backToSignIn}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
