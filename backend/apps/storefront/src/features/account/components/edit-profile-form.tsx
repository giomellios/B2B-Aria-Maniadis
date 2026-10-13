"use client";

import { useActionState, useEffect } from "react";
import { updateCustomerAction } from "@/features/account/services/profile.actions";
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

interface EditProfileFormProps {
  customer: {
    firstName: string;
    lastName: string;
  } | null;
  customFields: {
    vatNumber: string;
    company: string;
  };
}

export function EditProfileForm({ customer, customFields }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateCustomerAction, undefined);
  const { account, auth, common } = useT();
  const t = account.profile;

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("edit-profile-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state?.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.personal}</CardTitle>
        <CardDescription>{t.personalText}</CardDescription>
      </CardHeader>
      <form id="edit-profile-form" action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{auth.firstName}</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder={auth.firstNamePlaceholder}
              defaultValue={customer?.firstName || ""}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{auth.lastName}</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder={auth.lastNamePlaceholder}
              defaultValue={customer?.lastName || ""}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">{auth.vatNumber}</Label>
            <Input
              id="vatNumber"
              name="vatNumber"
              type="text"
              defaultValue={customFields.vatNumber}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{auth.company}</Label>
            <Input
              id="company"
              name="company"
              type="text"
              defaultValue={customFields.company}
              required
              disabled={isPending}
            />
          </div>
          {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
          {state?.success && <div className="text-sm text-success">{t.profileUpdated}</div>}
          <Button type="submit" disabled={isPending}>
            {isPending ? common.updating : t.updateProfile}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
