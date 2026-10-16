"use client";

import { useActionState, useEffect } from "react";
import { requestEmailUpdateAction } from "@/features/account/services/profile.actions";
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

interface EditEmailFormProps {
  currentEmail: string;
}

export function EditEmailForm({ currentEmail }: EditEmailFormProps) {
  const [state, formAction, isPending] = useActionState(requestEmailUpdateAction, undefined);
  const { account, common } = useT();
  const t = account.profile;

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("edit-email-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state?.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.emailTitle}</CardTitle>
        <CardDescription>{t.emailText}</CardDescription>
      </CardHeader>
      <form id="edit-email-form" action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail">{t.currentEmail}</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEmailAddress">{t.newEmail}</Label>
            <Input
              id="newEmailAddress"
              name="newEmailAddress"
              type="email"
              placeholder={t.newEmailPlaceholder}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.currentPassword}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">{t.confirmWithPassword}</p>
          </div>
          {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
          {state?.success && <div className="text-sm text-success">{t.emailSent}</div>}
          <Button type="submit" disabled={isPending}>
            {isPending ? common.sending : t.updateEmail}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
