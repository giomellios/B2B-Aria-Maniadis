"use server";

import { mutate } from "@/lib/api/client";
import { RequestPasswordResetMutation } from "@/features/auth/services/mutations";
import { getRequestT } from "@/lib/i18n/server";

export async function requestPasswordResetAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const emailAddress = formData.get("emailAddress") as string;
  const t = await getRequestT();

  if (!emailAddress) {
    return { error: t.auth.validation.emailRequired };
  }

  try {
    const result = await mutate(RequestPasswordResetMutation, {
      emailAddress,
    });

    const resetResult = result.data.requestPasswordReset;

    if (resetResult?.__typename !== "Success") {
      return { error: resetResult?.message || t.auth.errors.resetRequestFailed };
    }

    return { success: true };
  } catch {
    return { error: t.common.unexpectedError };
  }
}
