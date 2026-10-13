"use server";

import { mutate } from "@/lib/api/client";
import { ResetPasswordMutation } from "@/features/auth/services/mutations";
import { setAuthToken } from "@/lib/api/auth-token";
import { getRequestT } from "@/lib/i18n/server";
import { localeRedirect } from "@/lib/i18n/redirect";

export async function resetPasswordAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const t = await getRequestT();

  if (!token || !password || !confirmPassword) {
    return { error: t.auth.validation.allFieldsRequired };
  }

  if (password !== confirmPassword) {
    return { error: t.auth.validation.passwordsDontMatch };
  }

  const result = await mutate(ResetPasswordMutation, {
    token,
    password,
  });

  const resetResult = result.data.resetPassword;

  if (resetResult.__typename !== "CurrentUser") {
    return { error: resetResult.message };
  }

  // Store the token in a cookie if returned
  if (result.token) {
    await setAuthToken(result.token);
  }

  await localeRedirect("/");
}
