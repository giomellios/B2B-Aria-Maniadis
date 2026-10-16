"use client";

import { useActionState, useEffect } from "react";
import { updatePasswordAction } from "@/features/account/services/profile.actions";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { useT } from "@/lib/i18n/provider";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, undefined);
  const { account, auth, common } = useT();
  const t = account.profile;

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("change-password-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state?.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.passwordTitle}</CardTitle>
        <CardDescription>{t.passwordText}</CardDescription>
      </CardHeader>
      <form id="change-password-form" action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{auth.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmNewPassword}</Label>
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
          {state?.success && <div className="text-sm text-success">{t.passwordUpdated}</div>}
          <Button type="submit" disabled={isPending}>
            {isPending ? common.updating : t.updatePassword}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
