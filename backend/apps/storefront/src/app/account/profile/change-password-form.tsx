"use client";

import { useActionState, useEffect } from "react";
import { updatePasswordAction } from "./actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, undefined);

  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("change-password-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state?.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <form id="change-password-form" action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
          {state?.success && (
            <div className="text-sm text-green-600">Password updated successfully!</div>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
