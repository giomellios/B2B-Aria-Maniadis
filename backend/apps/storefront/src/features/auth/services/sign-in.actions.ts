"use server";

import { mutate } from "@/lib/api/client";
import { LoginMutation, LogoutMutation } from "@/features/auth/services/mutations";
import { removeAuthToken, setAuthToken } from "@/lib/api/auth-token";
import { getRequestT } from "@/lib/i18n/server";
import { localeRedirect } from "@/lib/i18n/redirect";
import { revalidatePath } from "next/cache";

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;
  const t = await getRequestT();

  const result = await mutate(
    LoginMutation,
    {
      username,
      password,
    },
    { useAuthToken: true }
  );

  const loginResult = result.data.login;

  if (loginResult.__typename !== "CurrentUser") {
    // EMAIL VERIFICATION DISABLED
    if (loginResult.__typename === "NotVerifiedError") {
      return { error: t.auth.errors.notVerified };
    }
    return { error: t.auth.errors.invalidCredentials };
  }

  // Store the token in a cookie if returned
  if (result.token) {
    await setAuthToken(result.token);
  }

  revalidatePath("/[locale]", "layout");

  // Validate redirectTo is a safe internal path
  const safeRedirect =
    redirectTo?.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";

  await localeRedirect(safeRedirect);
}

export async function logoutAction() {
  await mutate(LogoutMutation);
  await removeAuthToken();

  await localeRedirect("/");
}
